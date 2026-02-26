import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema, posts, stories, passwordResetTokens, users } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { db } from "./db";
import { scrypt, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { promisify } from "util";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import type { BadgeType } from "@shared/schema";
import { sendPasswordResetEmail } from "./email";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);
  app.use(session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax" },
  }));

  registerObjectStorageRoutes(app);

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, displayName, email, state, languagePreference } = req.body;
      if (!username || !password || !displayName) {
        return res.status(400).json({ message: "Username, password, and display name are required" });
      }
      if (username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters" });
      if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "A valid email address is required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(400).json({ message: "Username already taken" });

      const existingEmail = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (existingEmail.length > 0) return res.status(400).json({ message: "An account with this email already exists" });

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email.toLowerCase(),
        displayName,
        state: state || "",
        languagePreference: languagePreference || "English",
        bio: "",
        avatarUrl: "",
      });

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (!user) {
        return res.json({ message: "If that email is registered, you'll receive a reset link shortly." });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

      await sendPasswordResetEmail(user.email!, token, user.username);

      res.json({ message: "If that email is registered, you'll receive a reset link shortly." });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ message: "Token and new password are required" });
      if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

      const [resetToken] = await db.select().from(passwordResetTokens)
        .where(and(eq(passwordResetTokens.token, token), gt(passwordResetTokens.expiresAt, new Date())))
        .limit(1);

      if (!resetToken || resetToken.usedAt) {
        return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
      }

      const hashed = await hashPassword(newPassword);
      await storage.updateUser(resetToken.userId, { password: hashed } as any);
      await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, resetToken.id));

      res.json({ ok: true, message: "Password reset successfully. You can now log in." });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ message: "Username and password required" });

      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });

      const valid = await comparePassword(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid username or password" });

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const userId = req.session.userId;
      const { userId: filterUserId, hashtag, sort } = req.query as any;
      const posts = await storage.getPosts(userId, {
        userId: filterUserId,
        hashtag,
        sort,
      });
      res.json(posts);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/posts/videos", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const videoPosts = await storage.getVideoPosts(userId, limit, offset);
      res.json(videoPosts);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/posts/following", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getFollowingPosts(req.session.userId!);
      res.json(posts);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const result = insertPostSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid post data" });
      if (result.data.content.length > 500) return res.status(400).json({ message: "Post too long (max 500 chars)" });

      const post = await storage.createPost(req.session.userId!, result.data);
      res.json(post);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts/:id/vote", requireAuth, async (req, res) => {
    try {
      const { optionIndex } = req.body;
      if (typeof optionIndex !== "number" || optionIndex < 0) {
        return res.status(400).json({ message: "Invalid option index" });
      }
      const [post] = await db.select({ pollOptions: posts.pollOptions, postType: posts.postType }).from(posts).where(eq(posts.id, req.params.id));
      if (!post || post.postType !== "poll") {
        return res.status(400).json({ message: "Post is not a poll" });
      }
      if (!post.pollOptions || optionIndex >= post.pollOptions.length) {
        return res.status(400).json({ message: "Invalid option index" });
      }
      await storage.votePoll(req.session.userId!, req.params.id, optionIndex);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts/:id/like", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const postId = req.params.id;
      const [postRow] = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, postId)).limit(1);
      const { liked } = await storage.toggleLike(userId, postId);
      if (liked && postRow && postRow.userId !== userId) {
        await storage.createNotification(postRow.userId, userId, "impressive", postId).catch(() => {});
      }
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts/:id/dislike", requireAuth, async (req, res) => {
    try {
      await storage.toggleDislike(req.session.userId!, req.params.id);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts/:id/bookmark", requireAuth, async (req, res) => {
    try {
      await storage.toggleBookmark(req.session.userId!, req.params.id);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts/:id/repost", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const postId = req.params.id;
      const [postRow] = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, postId)).limit(1);
      const result = await storage.toggleRepost(userId, postId);
      if (result.reposted && postRow && postRow.userId !== userId) {
        await storage.createNotification(postRow.userId, userId, "reup", postId).catch(() => {});
      }
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifs = await storage.getNotifications(req.session.userId!);
      res.json(notifs);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/notifications/count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.session.userId!);
      res.json({ count });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/notifications/read", requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsRead(req.session.userId!);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts/:id/comments", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const postId = req.params.id;
      const { content } = req.body;
      if (!content || content.trim().length === 0) return res.status(400).json({ message: "Comment cannot be empty" });

      const post = await storage.getPost(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      if (post.commentsEnabled === false) return res.status(403).json({ message: "Comments are disabled for this post" });

      const comment = await storage.createComment(userId, postId, content);
      if (post.userId !== userId) {
        await storage.createNotification(post.userId, userId, "reply", postId).catch(() => {});
      }
      res.json(comment);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getBookmarkedPosts(req.session.userId!);
      res.json(posts);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const body = req.body;
      const updateData: any = {};

      if (body.displayName !== undefined) updateData.displayName = body.displayName;
      if (body.username !== undefined) {
        if (body.username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters" });
        const existing = await storage.getUserByUsername(body.username);
        if (existing && existing.id !== req.session.userId) {
          return res.status(400).json({ message: "Username already taken" });
        }
        updateData.username = body.username;
      }
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.avatarUrl !== undefined) {
        if (body.avatarUrl && !body.avatarUrl.startsWith("/objects/") && !body.avatarUrl.startsWith("http")) {
          return res.status(400).json({ message: "Invalid avatar URL" });
        }
        updateData.avatarUrl = body.avatarUrl;
      }
      if (body.headerUrl !== undefined) {
        if (body.headerUrl && !body.headerUrl.startsWith("/objects/") && !body.headerUrl.startsWith("http")) {
          return res.status(400).json({ message: "Invalid header URL" });
        }
        updateData.headerUrl = body.headerUrl;
      }
      if (body.gmail !== undefined) updateData.gmail = body.gmail;
      if (body.linkedin !== undefined) updateData.linkedin = body.linkedin;
      if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
      if (body.state !== undefined) updateData.state = body.state;
      if (body.languagePreference !== undefined) updateData.languagePreference = body.languagePreference;

      const boolFields = ["isPrivate", "hideOnlineStatus", "notifPush", "notifEmail", "notifMentions", "notifMessages", "notifTrending", "notifStateAlerts"];
      for (const f of boolFields) {
        if (body[f] !== undefined) updateData[f] = body[f];
      }
      const textFields = ["allowMessagesFrom", "allowCommentsFrom", "storyVisibility"];
      for (const f of textFields) {
        if (body[f] !== undefined) updateData[f] = body[f];
      }

      const updated = await storage.updateUser(req.session.userId!, updateData);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/users/id/:id", requireAuth, async (req, res) => {
    try {
      const u = await storage.getUser(req.params.id);
      if (!u) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safe } = u;
      res.json(safe);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/users/:username", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.username, req.session.userId);
      if (!profile) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeProfile } = profile;
      res.json(safeProfile);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/users/:id/follow", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const targetId = req.params.id;
      const result = await storage.toggleFollow(userId, targetId);
      if (result.followed && targetId !== userId) {
        await storage.createNotification(targetId, userId, "match").catch(() => {});
      }
      if (result.requested) {
        await storage.createNotification(targetId, userId, "follow_request").catch(() => {});
      }
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.params.id);
      res.json(followers);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const following = await storage.getFollowing(req.params.id);
      res.json(following);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/search/users", async (req, res) => {
    try {
      const q = (req.query.q as string) || "";
      if (q.length < 2) return res.json([]);
      const users = await storage.searchUsers(q);
      const safe = users.map(({ password, ...u }) => u);
      res.json(safe);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/trending", async (req, res) => {
    try {
      const trending = await storage.getTrendingHashtags();
      res.json(trending);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) return res.status(400).json({ message: "Current password is incorrect" });

      const hashed = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashed } as any);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/blocked-users", requireAuth, async (req, res) => {
    try {
      const blocked = await storage.getBlockedUsers(req.session.userId!);
      const safe = blocked.map(({ password, ...u }) => u);
      res.json(safe);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/users/:id/block", requireAuth, async (req, res) => {
    try {
      const result = await storage.toggleBlock(req.session.userId!, req.params.id);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/verify/create-order", requireAuth, async (req, res) => {
    try {
      const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(503).json({ message: "Payment gateway not configured. Please contact admin." });
      }
      const { badgeType = "blue" } = req.body;
      const prices: Record<string, number> = { blue: 2900, verified: 2900, purple: 7900, creator: 7900, gold: 0, emerald: 0, indigo: 0 };
      const amount = prices[badgeType] || 2900;

      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
      const receipt = `verify_${req.session.userId!.slice(0, 8)}_${Date.now()}`;
      const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
        body: JSON.stringify({ amount, currency: "INR", receipt }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.text();
        return res.status(502).json({ message: "Failed to create payment order", detail: err });
      }
      const rzpOrder = await orderRes.json() as { id: string; amount: number };
      await storage.createVerificationOrder(req.session.userId!, rzpOrder.id, rzpOrder.amount, badgeType);
      res.json({ orderId: rzpOrder.id, amount: rzpOrder.amount, currency: "INR", keyId: RAZORPAY_KEY_ID });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/verify/confirm-payment", requireAuth, async (req, res) => {
    try {
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
      if (!RAZORPAY_KEY_SECRET) {
        return res.status(503).json({ message: "Payment gateway not configured." });
      }
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "Missing payment details" });
      }
      const expectedSig = createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
      }
      await storage.confirmVerification(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      const user = await storage.getUser(req.session.userId!);
      const { password, ...safe } = user!;
      res.json({ ok: true, user: safe });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/verify/config", async (req, res) => {
    const configured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    res.json({ configured, keyId: process.env.RAZORPAY_KEY_ID || null });
  });

  app.post("/api/verify/submit-student", requireAuth, async (req, res) => {
    try {
      const { collegeName } = req.body;
      if (!collegeName || collegeName.trim().length < 3) {
        return res.status(400).json({ message: "College name must be at least 3 characters" });
      }
      await storage.updateUser(req.session.userId!, {
        studentCollegeName: collegeName.trim(),
        studentStatus: "pending",
      } as any);
      res.json({ ok: true, status: "pending" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/verify/request-gold", requireAuth, async (req, res) => {
    try {
      await storage.updateUser(req.session.userId!, { kycStatus: "pending" } as any);
      res.json({ ok: true, message: "Gold badge review request submitted. Our team will evaluate your account." });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/verify/emerald-eligibility", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const profile = await storage.getUserProfile(
        (await storage.getUser(userId))!.username,
        userId
      );
      if (!profile) return res.status(404).json({ message: "User not found" });

      const followersCount = profile.followersCount;
      const postsCount = profile.postsCount;
      const monthlyImpressions = postsCount * 150;
      const meetsFollowers = followersCount >= 2000;
      const meetsImpressions = monthlyImpressions >= 10000;
      const eligible = meetsFollowers && meetsImpressions;

      if (eligible && profile.badgeType === "none") {
        await storage.setBadgeType(userId, "emerald");
      }

      res.json({
        followersCount,
        followersRequired: 2000,
        followersPercent: Math.min(100, Math.round((followersCount / 2000) * 100)),
        monthlyImpressions,
        impressionsRequired: 10000,
        impressionsPercent: Math.min(100, Math.round((monthlyImpressions / 10000) * 100)),
        meetsFollowers,
        meetsImpressions,
        eligible,
        currentBadge: profile.badgeType,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/set-badge", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { userId, badgeType } = req.body;
      const allowed: BadgeType[] = ["none", "blue", "gold", "emerald", "purple", "indigo", "verified", "creator", "official", "partner"];
      if (!userId || !allowed.includes(badgeType)) {
        return res.status(400).json({ message: "Invalid userId or badgeType" });
      }
      await storage.setBadgeType(userId, badgeType as BadgeType);
      if (badgeType === "indigo") {
        await storage.updateUser(userId, { studentStatus: "approved" } as any);
      }
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/stories", requireAuth, async (req, res) => {
    try {
      const { mediaUrl, mediaType, content, visibility } = req.body;
      const story = await storage.createStory(req.session.userId!, { mediaUrl, mediaType, content, visibility });
      res.json(story);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/stories/feed", requireAuth, async (req, res) => {
    try {
      await storage.deleteExpiredStories();
      const feedStories = await storage.getFeedStories(req.session.userId!);
      res.json(feedStories);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/stories/user/:userId", requireAuth, async (req, res) => {
    try {
      const stories = await storage.getUserStories(req.params.userId, req.session.userId);
      res.json(stories);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/stories/:id/view", requireAuth, async (req, res) => {
    try {
      await storage.viewStory(req.params.id, req.session.userId!);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const { receiverId, content, messageType, mediaUrl, fileName, latitude, longitude } = req.body;
      if (!receiverId) return res.status(400).json({ message: "Receiver is required" });
      const message = await storage.sendMessage(req.session.userId!, receiverId, {
        content, messageType, mediaUrl, fileName, latitude, longitude,
      });
      res.json(message);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/messages/conversations", requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.session.userId!);
      res.json(conversations);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/messages/unread/count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.session.userId!);
      res.json({ count });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const msgs = await storage.getConversationMessages(req.session.userId!, req.params.userId);
      await storage.markMessagesRead(req.session.userId!, req.params.userId);
      res.json(msgs);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/follow-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getPendingFollowRequests(req.session.userId!);
      res.json(requests);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/follow-requests/:id/accept", requireAuth, async (req, res) => {
    try {
      await storage.acceptFollowRequest(req.params.id, req.session.userId!);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/follow-requests/:id/reject", requireAuth, async (req, res) => {
    try {
      await storage.rejectFollowRequest(req.params.id, req.session.userId!);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}
