import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, primaryKey, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").default(""),
  displayName: text("display_name").notNull(),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url").default(""),
  headerUrl: text("header_url").default(""),
  state: text("state").default(""),
  languagePreference: text("language_preference").default("English"),
  gmail: text("gmail").default(""),
  linkedin: text("linkedin").default(""),
  whatsapp: text("whatsapp").default(""),
  verified: boolean("verified").default(false),
  role: text("role").default("user"),
  badgeType: text("badge_type").default("none"),
  verificationExpiry: timestamp("verification_expiry"),
  kycStatus: text("kyc_status").default("none"),
  studentStatus: text("student_status").default("none"),
  studentCollegeName: text("student_college_name").default(""),
  subscriptionStatus: text("subscription_status").default("none"),
  isPrivate: boolean("is_private").default(false),
  allowMessagesFrom: text("allow_messages_from").default("everyone"),
  allowCommentsFrom: text("allow_comments_from").default("everyone"),
  storyVisibility: text("story_visibility").default("everyone"),
  hideOnlineStatus: boolean("hide_online_status").default(false),
  notifPush: boolean("notif_push").default(true),
  notifEmail: boolean("notif_email").default(false),
  notifMentions: boolean("notif_mentions").default(true),
  notifMessages: boolean("notif_messages").default(true),
  notifTrending: boolean("notif_trending").default(true),
  notifStateAlerts: boolean("notif_state_alerts").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationOrders = pgTable("verification_orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR"),
  status: text("status").default("created"),
  razorpayPaymentId: text("razorpay_payment_id").default(""),
  razorpaySignature: text("razorpay_signature").default(""),
  badgeType: text("badge_type").default("verified"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blockedUsers = pgTable("blocked_users", {
  blockerId: varchar("blocker_id", { length: 36 }).notNull().references(() => users.id),
  blockedId: varchar("blocked_id", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })]);

export const posts = pgTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  postType: text("post_type").default("text"),
  imageUrl: text("image_url").default(""),
  videoUrl: text("video_url").default(""),
  audioUrl: text("audio_url").default(""),
  pollQuestion: text("poll_question").default(""),
  pollOptions: text("poll_options").array().default(sql`'{}'::text[]`),
  pollVotes: integer("poll_votes").array().default(sql`'{}'::int[]`),
  commentsEnabled: boolean("comments_enabled").default(true),
  likesCount: integer("likes_count").default(0),
  dislikesCount: integer("dislikes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  repostCount: integer("repost_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pollVotes = pgTable("poll_votes", {
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
  optionIndex: integer("option_index").notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.postId] })]);

export const hashtags = pgTable("hashtags", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  tag: text("tag").notNull().unique(),
  postCount: integer("post_count").default(0),
  state: text("state").default(""),
});

export const postHashtags = pgTable("post_hashtags", {
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
  hashtagId: varchar("hashtag_id", { length: 36 }).notNull().references(() => hashtags.id),
}, (t) => [primaryKey({ columns: [t.postId, t.hashtagId] })]);

export const likes = pgTable("likes", {
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
  type: text("type").notNull().default("like"),
}, (t) => [primaryKey({ columns: [t.userId, t.postId] })]);

export const comments = pgTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
}, (t) => [primaryKey({ columns: [t.userId, t.postId] })]);

export const follows = pgTable("follows", {
  followerId: varchar("follower_id", { length: 36 }).notNull().references(() => users.id),
  followingId: varchar("following_id", { length: 36 }).notNull().references(() => users.id),
}, (t) => [primaryKey({ columns: [t.followerId, t.followingId] })]);

export const reposts = pgTable("reposts", {
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.postId] })]);

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  fromUserId: varchar("from_user_id", { length: 36 }).notNull().references(() => users.id),
  type: text("type").notNull().default("impressive"),
  postId: varchar("post_id", { length: 36 }).references(() => posts.id),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  mediaUrl: text("media_url").default(""),
  mediaType: text("media_type").default("image"),
  content: text("content").default(""),
  visibility: text("visibility").default("public"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyViews = pgTable("story_views", {
  storyId: varchar("story_id", { length: 36 }).notNull().references(() => stories.id),
  viewerId: varchar("viewer_id", { length: 36 }).notNull().references(() => users.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
}, (t) => [primaryKey({ columns: [t.storyId, t.viewerId] })]);

export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
  receiverId: varchar("receiver_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").default(""),
  messageType: text("message_type").default("text"),
  mediaUrl: text("media_url").default(""),
  fileName: text("file_name").default(""),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followRequests = pgTable("follow_requests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id", { length: 36 }).notNull().references(() => users.id),
  targetId: varchar("target_id", { length: 36 }).notNull().references(() => users.id),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, verified: true, role: true, badgeType: true, verificationExpiry: true });
export const loginSchema = z.object({ username: z.string().min(3), password: z.string().min(6) });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, userId: true, likesCount: true, dislikesCount: true, commentsCount: true, repostCount: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, userId: true, postId: true, createdAt: true });
export const insertStorySchema = createInsertSchema(stories).omit({ id: true, userId: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, senderId: true, read: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Hashtag = typeof hashtags.$inferSelect;
export type VerificationOrder = typeof verificationOrders.$inferSelect;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Repost = typeof reposts.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type StoryView = typeof storyViews.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type FollowRequest = typeof followRequests.$inferSelect;

export type BadgeType = 'none' | 'blue' | 'gold' | 'emerald' | 'purple' | 'indigo' | 'verified' | 'creator' | 'official' | 'partner';

export type PostWithUser = Post & {
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>,
  liked: boolean, disliked: boolean, bookmarked: boolean, hashtags: string[], votedOption?: number | null
};
export type UserProfile = User & { followersCount: number, followingCount: number, postsCount: number, isFollowing: boolean, followRequestPending?: boolean };
