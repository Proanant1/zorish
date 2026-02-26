import { eq, desc, and, like, sql, ilike, inArray, or, ne, gt } from "drizzle-orm";
import { db } from "./db";
import {
  users, posts, hashtags, postHashtags, likes, comments, bookmarks, follows, blockedUsers, pollVotes, verificationOrders, reposts, notifications,
  stories, storyViews, messages, followRequests,
  type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment,
  type Hashtag, type PostWithUser, type UserProfile, type VerificationOrder, type BadgeType, type Notification,
  type Story, type Message, type FollowRequest,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { password: string }): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  getUserProfile(username: string, currentUserId?: string): Promise<UserProfile | null>;

  createPost(userId: string, data: InsertPost): Promise<Post>;
  getPosts(currentUserId?: string, options?: { userId?: string; hashtag?: string; sort?: string }): Promise<PostWithUser[]>;
  getFollowingPosts(currentUserId: string): Promise<PostWithUser[]>;
  getBookmarkedPosts(userId: string): Promise<PostWithUser[]>;
  getPost(postId: string): Promise<Post | undefined>;
  getVideoPosts(currentUserId: string, limit?: number, offset?: number): Promise<PostWithUser[]>;

  toggleLike(userId: string, postId: string): Promise<{ liked: boolean }>;
  toggleDislike(userId: string, postId: string): Promise<void>;
  toggleBookmark(userId: string, postId: string): Promise<void>;

  createComment(userId: string, postId: string, content: string): Promise<Comment>;
  getComments(postId: string): Promise<(Comment & { user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified'> })[]>;

  toggleFollow(followerId: string, followingId: string): Promise<{ followed: boolean; requested?: boolean }>;
  getFollowers(userId: string): Promise<Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>[]>;
  getFollowing(userId: string): Promise<Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>[]>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  getBlockedUsers(userId: string): Promise<(User & { blockedAt: Date | null })[]>;
  toggleBlock(blockerId: string, blockedId: string): Promise<{ blocked: boolean }>;
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;

  votePoll(userId: string, postId: string, optionIndex: number): Promise<void>;
  getTrendingHashtags(): Promise<Hashtag[]>;

  createVerificationOrder(userId: string, razorpayOrderId: string, amount: number, badgeType: string): Promise<VerificationOrder>;
  getVerificationOrder(razorpayOrderId: string): Promise<VerificationOrder | undefined>;
  confirmVerification(razorpayOrderId: string, paymentId: string, signature: string): Promise<void>;
  setBadgeType(userId: string, badgeType: BadgeType): Promise<void>;

  toggleRepost(userId: string, postId: string): Promise<{ reposted: boolean }>;
  createNotification(userId: string, fromUserId: string, type: string, postId?: string): Promise<void>;
  getNotifications(userId: string): Promise<(Notification & { fromUser: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'> })[]>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  createStory(userId: string, data: { mediaUrl?: string; mediaType?: string; content?: string; visibility?: string }): Promise<Story>;
  getFeedStories(currentUserId: string): Promise<{ user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>; stories: Story[]; hasUnviewed: boolean }[]>;
  getUserStories(userId: string, viewerId?: string): Promise<(Story & { viewed: boolean })[]>;
  viewStory(storyId: string, viewerId: string): Promise<void>;
  deleteExpiredStories(): Promise<void>;

  sendMessage(senderId: string, receiverId: string, data: { content?: string; messageType?: string; mediaUrl?: string; fileName?: string; latitude?: number; longitude?: number }): Promise<Message>;
  getConversations(userId: string): Promise<{ user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>; lastMessage: Message; unreadCount: number }[]>;
  getConversationMessages(userId: string, otherUserId: string): Promise<Message[]>;
  markMessagesRead(userId: string, senderId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  createFollowRequest(requesterId: string, targetId: string): Promise<FollowRequest>;
  getPendingFollowRequests(userId: string): Promise<(FollowRequest & { requester: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'> })[]>;
  acceptFollowRequest(requestId: string, userId: string): Promise<void>;
  rejectFollowRequest(requestId: string, userId: string): Promise<void>;
  getFollowRequestStatus(requesterId: string, targetId: string): Promise<string | null>;
  cancelFollowRequest(requesterId: string, targetId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${username})`).limit(1);
    return user;
  }

  async createUser(userData: InsertUser & { password: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    return db.select().from(users)
      .where(
        sql`${users.username} ILIKE ${'%' + query + '%'} OR ${users.displayName} ILIKE ${'%' + query + '%'}`
      )
      .limit(20);
  }

  async getUserProfile(username: string, currentUserId?: string): Promise<UserProfile | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user) return null;

    const [followersResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(follows).where(eq(follows.followingId, user.id));
    const [followingResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(follows).where(eq(follows.followerId, user.id));
    const [postsResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(posts).where(eq(posts.userId, user.id));

    let isFollowing = false;
    let followRequestPending = false;
    if (currentUserId && currentUserId !== user.id) {
      const [follow] = await db.select().from(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)));
      isFollowing = !!follow;

      if (!isFollowing) {
        const [req] = await db.select().from(followRequests)
          .where(and(
            eq(followRequests.requesterId, currentUserId),
            eq(followRequests.targetId, user.id),
            eq(followRequests.status, "pending")
          ));
        followRequestPending = !!req;
      }
    }

    return {
      ...user,
      followersCount: followersResult?.count || 0,
      followingCount: followingResult?.count || 0,
      postsCount: postsResult?.count || 0,
      isFollowing,
      followRequestPending,
    };
  }

  async createPost(userId: string, data: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values({
      ...data,
      userId,
    }).returning();

    const hashtagMatches = data.content.match(/#(\w+)/g) || [];
    for (const match of hashtagMatches) {
      const tag = match.slice(1).toLowerCase();
      let [existing] = await db.select().from(hashtags).where(eq(hashtags.tag, tag));
      if (!existing) {
        [existing] = await db.insert(hashtags).values({ tag, postCount: 1 }).returning();
      } else {
        await db.update(hashtags).set({ postCount: (existing.postCount || 0) + 1 }).where(eq(hashtags.id, existing.id));
      }
      await db.insert(postHashtags).values({ postId: post.id, hashtagId: existing.id }).onConflictDoNothing();
    }

    return post;
  }

  async getPost(postId: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    return post;
  }

  async getPosts(currentUserId?: string, options?: { userId?: string; hashtag?: string; sort?: string }): Promise<PostWithUser[]> {
    let query = db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      imageUrl: posts.imageUrl,
      videoUrl: posts.videoUrl,
      audioUrl: posts.audioUrl,
      pollQuestion: posts.pollQuestion,
      pollOptions: posts.pollOptions,
      pollVotesArr: posts.pollVotes,
      commentsEnabled: posts.commentsEnabled,
      likesCount: posts.likesCount,
      dislikesCount: posts.dislikesCount,
      commentsCount: posts.commentsCount,
      repostCount: posts.repostCount,
      createdAt: posts.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
        badgeType: users.badgeType,
    }).from(posts).innerJoin(users, eq(posts.userId, users.id));

    const conditions = [];
    if (options?.userId) {
      conditions.push(eq(posts.userId, options.userId));
    }

    if (options?.hashtag) {
      const [tag] = await db.select().from(hashtags).where(eq(hashtags.tag, options.hashtag.toLowerCase()));
      if (tag) {
        const tagPosts = await db.select({ postId: postHashtags.postId }).from(postHashtags).where(eq(postHashtags.hashtagId, tag.id));
        const postIds = tagPosts.map(p => p.postId);
        if (postIds.length > 0) {
          conditions.push(inArray(posts.id, postIds));
        } else {
          return [];
        }
      } else {
        return [];
      }
    }

    let results;
    const orderBy = options?.sort === "trending"
      ? desc(posts.likesCount)
      : desc(posts.createdAt);

    if (conditions.length > 0) {
      results = await (query as any).where(and(...conditions)).orderBy(orderBy).limit(50);
    } else {
      results = await (query as any).orderBy(orderBy).limit(50);
    }

    const postsWithUsers: PostWithUser[] = [];
    for (const row of results) {
      const postTags = await db.select({ tag: hashtags.tag })
        .from(postHashtags)
        .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
        .where(eq(postHashtags.postId, row.id));

      let liked = false, disliked = false, bookmarked = false;
      let votedOption: number | null = null;
      if (currentUserId) {
        const [likeRow] = await db.select().from(likes)
          .where(and(eq(likes.userId, currentUserId), eq(likes.postId, row.id)));
        liked = likeRow?.type === "like";
        disliked = likeRow?.type === "dislike";

        const [bm] = await db.select().from(bookmarks)
          .where(and(eq(bookmarks.userId, currentUserId), eq(bookmarks.postId, row.id)));
        bookmarked = !!bm;

        if (row.postType === "poll") {
          const [pv] = await db.select().from(pollVotes)
            .where(and(eq(pollVotes.userId, currentUserId), eq(pollVotes.postId, row.id)));
          if (pv) votedOption = pv.optionIndex;
        }
      }

      postsWithUsers.push({
        id: row.id,
        userId: row.userId,
        content: row.content,
        postType: row.postType,
        imageUrl: row.imageUrl,
        videoUrl: row.videoUrl,
        audioUrl: row.audioUrl,
        pollQuestion: row.pollQuestion,
        pollOptions: row.pollOptions,
        pollVotes: row.pollVotesArr,
        commentsEnabled: row.commentsEnabled,
        likesCount: row.likesCount,
        dislikesCount: row.dislikesCount,
        commentsCount: row.commentsCount,
        repostCount: row.repostCount,
        createdAt: row.createdAt,
        user: {
          id: row.userId,
          username: row.username,
          displayName: row.displayName,
          avatarUrl: row.avatarUrl,
          verified: row.verified,
          badgeType: row.badgeType,
        },
        liked,
        disliked,
        bookmarked,
        hashtags: postTags.map(t => t.tag),
        votedOption,
      });
    }

    return postsWithUsers;
  }

  async getFollowingPosts(currentUserId: string): Promise<PostWithUser[]> {
    const followingList = await db.select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, currentUserId));

    if (followingList.length === 0) return [];

    const followingIds = followingList.map(f => f.followingId);

    const results = await db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      imageUrl: posts.imageUrl,
      videoUrl: posts.videoUrl,
      audioUrl: posts.audioUrl,
      pollQuestion: posts.pollQuestion,
      pollOptions: posts.pollOptions,
      pollVotesArr: posts.pollVotes,
      commentsEnabled: posts.commentsEnabled,
      likesCount: posts.likesCount,
      dislikesCount: posts.dislikesCount,
      commentsCount: posts.commentsCount,
      repostCount: posts.repostCount,
      createdAt: posts.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
        badgeType: users.badgeType,
    }).from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(inArray(posts.userId, followingIds))
      .orderBy(desc(posts.createdAt))
      .limit(50);

    const postsWithUsers: PostWithUser[] = [];
    for (const row of results) {
      const postTags = await db.select({ tag: hashtags.tag })
        .from(postHashtags)
        .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
        .where(eq(postHashtags.postId, row.id));

      const [likeRow] = await db.select().from(likes)
        .where(and(eq(likes.userId, currentUserId), eq(likes.postId, row.id)));
      const liked = likeRow?.type === "like";
      const disliked = likeRow?.type === "dislike";

      const [bm] = await db.select().from(bookmarks)
        .where(and(eq(bookmarks.userId, currentUserId), eq(bookmarks.postId, row.id)));
      const bookmarked = !!bm;

      let votedOption: number | null = null;
      const [vote] = await db.select().from(pollVotes)
        .where(and(eq(pollVotes.userId, currentUserId), eq(pollVotes.postId, row.id)));
      if (vote) votedOption = vote.optionIndex;

      postsWithUsers.push({
        id: row.id,
        userId: row.userId,
        content: row.content,
        postType: row.postType,
        imageUrl: row.imageUrl,
        videoUrl: row.videoUrl,
        audioUrl: row.audioUrl,
        pollQuestion: row.pollQuestion,
        pollOptions: row.pollOptions,
        pollVotes: row.pollVotesArr,
        commentsEnabled: row.commentsEnabled,
        likesCount: row.likesCount,
        dislikesCount: row.dislikesCount,
        commentsCount: row.commentsCount,
        repostCount: row.repostCount,
        createdAt: row.createdAt,
        user: {
          id: row.userId,
          username: row.username,
          displayName: row.displayName,
          avatarUrl: row.avatarUrl,
          verified: row.verified,
          badgeType: row.badgeType,
        },
        liked,
        disliked,
        bookmarked,
        hashtags: postTags.map(t => t.tag),
        votedOption,
      });
    }

    return postsWithUsers;
  }

  async getBookmarkedPosts(userId: string): Promise<PostWithUser[]> {
    const bms = await db.select({ postId: bookmarks.postId }).from(bookmarks).where(eq(bookmarks.userId, userId));
    if (bms.length === 0) return [];
    const postIds = bms.map(b => b.postId);

    const results = await db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      imageUrl: posts.imageUrl,
      videoUrl: posts.videoUrl,
      audioUrl: posts.audioUrl,
      pollQuestion: posts.pollQuestion,
      pollOptions: posts.pollOptions,
      pollVotesArr: posts.pollVotes,
      commentsEnabled: posts.commentsEnabled,
      likesCount: posts.likesCount,
      dislikesCount: posts.dislikesCount,
      commentsCount: posts.commentsCount,
      repostCount: posts.repostCount,
      createdAt: posts.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
        badgeType: users.badgeType,
    }).from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(inArray(posts.id, postIds))
      .orderBy(desc(posts.createdAt));

    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      content: row.content,
      postType: row.postType,
      imageUrl: row.imageUrl,
      videoUrl: row.videoUrl,
      audioUrl: row.audioUrl,
      pollQuestion: row.pollQuestion,
      pollOptions: row.pollOptions,
      pollVotes: row.pollVotesArr,
      commentsEnabled: row.commentsEnabled,
      likesCount: row.likesCount,
      dislikesCount: row.dislikesCount,
      commentsCount: row.commentsCount,
      repostCount: row.repostCount,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        username: row.username,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl,
        verified: row.verified,
          badgeType: row.badgeType,
      },
      liked: false,
      disliked: false,
      bookmarked: true,
      hashtags: [],
      votedOption: null,
    }));
  }

  async getVideoPosts(currentUserId: string, limit = 20, offset = 0): Promise<PostWithUser[]> {
    const results = await db.select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      imageUrl: posts.imageUrl,
      videoUrl: posts.videoUrl,
      audioUrl: posts.audioUrl,
      commentsEnabled: posts.commentsEnabled,
      likesCount: posts.likesCount,
      dislikesCount: posts.dislikesCount,
      commentsCount: posts.commentsCount,
      repostCount: posts.repostCount,
      createdAt: posts.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
      badgeType: users.badgeType,
    })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.postType, "video"), sql`${posts.videoUrl} != ''`))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const postsWithUsers: PostWithUser[] = [];
    for (const row of results) {
      const [likeRow] = await db.select().from(likes)
        .where(and(eq(likes.userId, currentUserId), eq(likes.postId, row.id)));
      const liked = likeRow?.type === "like";
      const disliked = likeRow?.type === "dislike";

      postsWithUsers.push({
        id: row.id,
        userId: row.userId,
        content: row.content,
        postType: row.postType,
        imageUrl: row.imageUrl ?? "",
        videoUrl: row.videoUrl ?? "",
        audioUrl: row.audioUrl ?? "",
        pollQuestion: "",
        pollOptions: [],
        pollVotes: [],
        commentsEnabled: row.commentsEnabled,
        likesCount: row.likesCount,
        dislikesCount: row.dislikesCount,
        commentsCount: row.commentsCount,
        repostCount: row.repostCount,
        createdAt: row.createdAt,
        user: {
          id: row.userId,
          username: row.username,
          displayName: row.displayName,
          avatarUrl: row.avatarUrl,
          verified: row.verified,
          badgeType: row.badgeType,
        },
        liked,
        disliked,
        bookmarked: false,
        hashtags: [],
        votedOption: null,
      });
    }
    return postsWithUsers;
  }

  async toggleLike(userId: string, postId: string): Promise<{ liked: boolean }> {
    const [existing] = await db.select().from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

    if (existing) {
      if (existing.type === "like") {
        await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
        await db.update(posts).set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` }).where(eq(posts.id, postId));
        return { liked: false };
      } else {
        await db.update(likes).set({ type: "like" }).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
        await db.update(posts).set({
          likesCount: sql`${posts.likesCount} + 1`,
          dislikesCount: sql`GREATEST(${posts.dislikesCount} - 1, 0)`,
        }).where(eq(posts.id, postId));
        return { liked: true };
      }
    } else {
      await db.insert(likes).values({ userId, postId, type: "like" });
      await db.update(posts).set({ likesCount: sql`${posts.likesCount} + 1` }).where(eq(posts.id, postId));
      return { liked: true };
    }
  }

  async toggleDislike(userId: string, postId: string): Promise<void> {
    const [existing] = await db.select().from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

    if (existing) {
      if (existing.type === "dislike") {
        await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
        await db.update(posts).set({ dislikesCount: sql`GREATEST(${posts.dislikesCount} - 1, 0)` }).where(eq(posts.id, postId));
      } else {
        await db.update(likes).set({ type: "dislike" }).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
        await db.update(posts).set({
          dislikesCount: sql`${posts.dislikesCount} + 1`,
          likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)`,
        }).where(eq(posts.id, postId));
      }
    } else {
      await db.insert(likes).values({ userId, postId, type: "dislike" });
      await db.update(posts).set({ dislikesCount: sql`${posts.dislikesCount} + 1` }).where(eq(posts.id, postId));
    }
  }

  async toggleBookmark(userId: string, postId: string): Promise<void> {
    const [existing] = await db.select().from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));

    if (existing) {
      await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
    } else {
      await db.insert(bookmarks).values({ userId, postId });
    }
  }

  async createComment(userId: string, postId: string, content: string): Promise<Comment> {
    const [comment] = await db.insert(comments).values({ userId, postId, content }).returning();
    await db.update(posts).set({ commentsCount: sql`${posts.commentsCount} + 1` }).where(eq(posts.id, postId));
    return comment;
  }

  async getComments(postId: string) {
    return db.select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
        badgeType: users.badgeType,
    }).from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt)) as any;
  }

  async toggleFollow(followerId: string, followingId: string): Promise<{ followed: boolean; requested?: boolean }> {
    if (followerId === followingId) return { followed: false };

    const [existing] = await db.select().from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));

    if (existing) {
      await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
      return { followed: false };
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, followingId)).limit(1);
    if (targetUser?.isPrivate) {
      const [existingReq] = await db.select().from(followRequests)
        .where(and(
          eq(followRequests.requesterId, followerId),
          eq(followRequests.targetId, followingId),
          eq(followRequests.status, "pending")
        ));

      if (existingReq) {
        await db.delete(followRequests).where(eq(followRequests.id, existingReq.id));
        return { followed: false, requested: false };
      }

      await db.insert(followRequests).values({ requesterId: followerId, targetId: followingId });
      return { followed: false, requested: true };
    }

    await db.insert(follows).values({ followerId, followingId });
    return { followed: true };
  }

  async getFollowers(userId: string): Promise<Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>[]> {
    return db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
      badgeType: users.badgeType,
    }).from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: string): Promise<Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>[]> {
    return db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
      badgeType: users.badgeType,
    }).from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getBlockedUsers(userId: string): Promise<(User & { blockedAt: Date | null })[]> {
    const results = await db.select({
      id: users.id,
      username: users.username,
      password: users.password,
      displayName: users.displayName,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      headerUrl: users.headerUrl,
      state: users.state,
      languagePreference: users.languagePreference,
      gmail: users.gmail,
      linkedin: users.linkedin,
      whatsapp: users.whatsapp,
      verified: users.verified,
        badgeType: users.badgeType,
      role: users.role,
      isPrivate: users.isPrivate,
      allowMessagesFrom: users.allowMessagesFrom,
      allowCommentsFrom: users.allowCommentsFrom,
      hideOnlineStatus: users.hideOnlineStatus,
      notifPush: users.notifPush,
      notifEmail: users.notifEmail,
      notifMentions: users.notifMentions,
      notifMessages: users.notifMessages,
      notifTrending: users.notifTrending,
      notifStateAlerts: users.notifStateAlerts,
      createdAt: users.createdAt,
      blockedAt: blockedUsers.createdAt,
    })
      .from(blockedUsers)
      .innerJoin(users, eq(blockedUsers.blockedId, users.id))
      .where(eq(blockedUsers.blockerId, userId))
      .orderBy(desc(blockedUsers.createdAt));
    return results as any;
  }

  async toggleBlock(blockerId: string, blockedId: string): Promise<{ blocked: boolean }> {
    if (blockerId === blockedId) return { blocked: false };
    const [existing] = await db.select().from(blockedUsers)
      .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)));

    if (existing) {
      await db.delete(blockedUsers).where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)));
      return { blocked: false };
    } else {
      await db.insert(blockedUsers).values({ blockerId, blockedId });
      await db.delete(follows).where(and(eq(follows.followerId, blockerId), eq(follows.followingId, blockedId)));
      await db.delete(follows).where(and(eq(follows.followerId, blockedId), eq(follows.followingId, blockerId)));
      return { blocked: true };
    }
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const [existing] = await db.select().from(blockedUsers)
      .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)));
    return !!existing;
  }

  async votePoll(userId: string, postId: string, optionIndex: number): Promise<void> {
    const [existing] = await db.select().from(pollVotes)
      .where(and(eq(pollVotes.userId, userId), eq(pollVotes.postId, postId)));
    if (existing) return;

    await db.insert(pollVotes).values({ userId, postId, optionIndex });
    await db.execute(sql`UPDATE posts SET poll_votes[${optionIndex + 1}] = COALESCE(poll_votes[${optionIndex + 1}], 0) + 1 WHERE id = ${postId}`);
  }

  async getTrendingHashtags(): Promise<Hashtag[]> {
    return db.select().from(hashtags).orderBy(desc(hashtags.postCount)).limit(20);
  }

  async createVerificationOrder(userId: string, razorpayOrderId: string, amount: number, badgeType: string): Promise<VerificationOrder> {
    const [order] = await db.insert(verificationOrders).values({
      userId,
      razorpayOrderId,
      amount,
      badgeType,
      status: "created",
    }).returning();
    return order;
  }

  async getVerificationOrder(razorpayOrderId: string): Promise<VerificationOrder | undefined> {
    const [order] = await db.select().from(verificationOrders)
      .where(eq(verificationOrders.razorpayOrderId, razorpayOrderId));
    return order;
  }

  async confirmVerification(razorpayOrderId: string, paymentId: string, signature: string): Promise<void> {
    const [order] = await db.select().from(verificationOrders)
      .where(eq(verificationOrders.razorpayOrderId, razorpayOrderId));
    if (!order) throw new Error("Order not found");

    await db.update(verificationOrders)
      .set({ status: "paid", razorpayPaymentId: paymentId, razorpaySignature: signature })
      .where(eq(verificationOrders.razorpayOrderId, razorpayOrderId));

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    await db.update(users)
      .set({ badgeType: order.badgeType, verified: true, verificationExpiry: expiry })
      .where(eq(users.id, order.userId));
  }

  async setBadgeType(userId: string, badgeType: BadgeType): Promise<void> {
    const updates: Partial<User> = { badgeType };
    if (badgeType === 'none') {
      updates.verified = false;
      updates.verificationExpiry = null;
    } else {
      updates.verified = true;
    }
    await db.update(users).set(updates).where(eq(users.id, userId));
  }

  async toggleRepost(userId: string, postId: string): Promise<{ reposted: boolean }> {
    const [existing] = await db.select().from(reposts)
      .where(and(eq(reposts.userId, userId), eq(reposts.postId, postId)));
    if (existing) {
      await db.delete(reposts).where(and(eq(reposts.userId, userId), eq(reposts.postId, postId)));
      await db.update(posts).set({ repostCount: sql`GREATEST(${posts.repostCount} - 1, 0)` }).where(eq(posts.id, postId));
      return { reposted: false };
    } else {
      await db.insert(reposts).values({ userId, postId });
      await db.update(posts).set({ repostCount: sql`${posts.repostCount} + 1` }).where(eq(posts.id, postId));
      return { reposted: true };
    }
  }

  async createNotification(userId: string, fromUserId: string, type: string, postId?: string): Promise<void> {
    if (userId === fromUserId) return;
    await db.insert(notifications).values({ userId, fromUserId, type, postId: postId ?? null });
  }

  async getNotifications(userId: string) {
    const rows = await db.select({
      id: notifications.id,
      userId: notifications.userId,
      fromUserId: notifications.fromUserId,
      type: notifications.type,
      postId: notifications.postId,
      read: notifications.read,
      createdAt: notifications.createdAt,
      fromUsername: users.username,
      fromDisplayName: users.displayName,
      fromAvatarUrl: users.avatarUrl,
    }).from(notifications)
      .innerJoin(users, eq(notifications.fromUserId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      fromUserId: r.fromUserId,
      type: r.type,
      postId: r.postId,
      read: r.read,
      createdAt: r.createdAt,
      fromUser: {
        id: r.fromUserId,
        username: r.fromUsername,
        displayName: r.fromDisplayName,
        avatarUrl: r.fromAvatarUrl,
      },
    }));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return Number(row?.count ?? 0);
  }

  async createStory(userId: string, data: { mediaUrl?: string; mediaType?: string; content?: string; visibility?: string }): Promise<Story> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const [story] = await db.insert(stories).values({
      userId,
      mediaUrl: data.mediaUrl || "",
      mediaType: data.mediaType || "image",
      content: data.content || "",
      visibility: data.visibility || "public",
      expiresAt,
    }).returning();
    return story;
  }

  async getFeedStories(currentUserId: string): Promise<{ user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>; stories: Story[]; hasUnviewed: boolean }[]> {
    const now = new Date();
    const activeStories = await db.select({
      id: stories.id,
      userId: stories.userId,
      mediaUrl: stories.mediaUrl,
      mediaType: stories.mediaType,
      content: stories.content,
      visibility: stories.visibility,
      expiresAt: stories.expiresAt,
      createdAt: stories.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    }).from(stories)
      .innerJoin(users, eq(stories.userId, users.id))
      .where(gt(stories.expiresAt, now))
      .orderBy(desc(stories.createdAt));

    const followingList = await db.select({ followingId: follows.followingId })
      .from(follows).where(eq(follows.followerId, currentUserId));
    const followingIds = new Set(followingList.map(f => f.followingId));

    const viewedStories = await db.select({ storyId: storyViews.storyId })
      .from(storyViews).where(eq(storyViews.viewerId, currentUserId));
    const viewedSet = new Set(viewedStories.map(v => v.storyId));

    const userMap = new Map<string, { user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>; stories: Story[]; hasUnviewed: boolean }>();

    for (const row of activeStories) {
      const canView =
        row.userId === currentUserId ||
        row.visibility === "public" ||
        (row.visibility === "followers" && followingIds.has(row.userId));

      if (!canView) continue;

      if (!userMap.has(row.userId)) {
        userMap.set(row.userId, {
          user: { id: row.userId, username: row.username, displayName: row.displayName, avatarUrl: row.avatarUrl },
          stories: [],
          hasUnviewed: false,
        });
      }
      const entry = userMap.get(row.userId)!;
      entry.stories.push({
        id: row.id,
        userId: row.userId,
        mediaUrl: row.mediaUrl,
        mediaType: row.mediaType,
        content: row.content,
        visibility: row.visibility,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
      });
      if (!viewedSet.has(row.id)) entry.hasUnviewed = true;
    }

    const result = Array.from(userMap.values());
    const ownStory = result.find(r => r.user.id === currentUserId);
    const others = result.filter(r => r.user.id !== currentUserId);
    others.sort((a, b) => (a.hasUnviewed === b.hasUnviewed ? 0 : a.hasUnviewed ? -1 : 1));
    return ownStory ? [ownStory, ...others] : others;
  }

  async getUserStories(userId: string, viewerId?: string): Promise<(Story & { viewed: boolean })[]> {
    const now = new Date();
    const activeStories = await db.select().from(stories)
      .where(and(eq(stories.userId, userId), gt(stories.expiresAt, now)))
      .orderBy(stories.createdAt);

    if (!viewerId) return activeStories.map(s => ({ ...s, viewed: false }));

    const viewedRows = await db.select({ storyId: storyViews.storyId })
      .from(storyViews).where(eq(storyViews.viewerId, viewerId));
    const viewedSet = new Set(viewedRows.map(v => v.storyId));

    return activeStories.map(s => ({ ...s, viewed: viewedSet.has(s.id) }));
  }

  async viewStory(storyId: string, viewerId: string): Promise<void> {
    await db.insert(storyViews).values({ storyId, viewerId }).onConflictDoNothing();
  }

  async deleteExpiredStories(): Promise<void> {
    const now = new Date();
    const expired = await db.select({ id: stories.id }).from(stories).where(sql`${stories.expiresAt} <= ${now}`);
    if (expired.length > 0) {
      const ids = expired.map(e => e.id);
      await db.delete(storyViews).where(inArray(storyViews.storyId, ids));
      await db.delete(stories).where(inArray(stories.id, ids));
    }
  }

  async sendMessage(senderId: string, receiverId: string, data: { content?: string; messageType?: string; mediaUrl?: string; fileName?: string; latitude?: number; longitude?: number }): Promise<Message> {
    const [message] = await db.insert(messages).values({
      senderId,
      receiverId,
      content: data.content || "",
      messageType: data.messageType || "text",
      mediaUrl: data.mediaUrl || "",
      fileName: data.fileName || "",
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    }).returning();
    return message;
  }

  async getConversations(userId: string): Promise<{ user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>; lastMessage: Message; unreadCount: number }[]> {
    const allMessages = await db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const convMap = new Map<string, { otherUserId: string; lastMessage: Message; unreadCount: number }>();

    for (const msg of allMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, { otherUserId, lastMessage: msg, unreadCount: 0 });
      }
      if (msg.receiverId === userId && !msg.read) {
        convMap.get(otherUserId)!.unreadCount++;
      }
    }

    const result = [];
    for (const conv of convMap.values()) {
      const [otherUser] = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        verified: users.verified,
        badgeType: users.badgeType,
      }).from(users).where(eq(users.id, conv.otherUserId)).limit(1);

      if (otherUser) {
        result.push({
          user: otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        });
      }
    }

    return result;
  }

  async getConversationMessages(userId: string, otherUserId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
        and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
      ))
      .orderBy(messages.createdAt)
      .limit(200);
  }

  async markMessagesRead(userId: string, senderId: string): Promise<void> {
    await db.update(messages)
      .set({ read: true })
      .where(and(eq(messages.senderId, senderId), eq(messages.receiverId, userId), eq(messages.read, false)));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.read, false)));
    return Number(row?.count ?? 0);
  }

  async createFollowRequest(requesterId: string, targetId: string): Promise<FollowRequest> {
    const [req] = await db.insert(followRequests).values({ requesterId, targetId }).returning();
    return req;
  }

  async getPendingFollowRequests(userId: string): Promise<(FollowRequest & { requester: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'> })[]> {
    const rows = await db.select({
      id: followRequests.id,
      requesterId: followRequests.requesterId,
      targetId: followRequests.targetId,
      status: followRequests.status,
      createdAt: followRequests.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      verified: users.verified,
      badgeType: users.badgeType,
    }).from(followRequests)
      .innerJoin(users, eq(followRequests.requesterId, users.id))
      .where(and(eq(followRequests.targetId, userId), eq(followRequests.status, "pending")))
      .orderBy(desc(followRequests.createdAt));

    return rows.map(r => ({
      id: r.id,
      requesterId: r.requesterId,
      targetId: r.targetId,
      status: r.status,
      createdAt: r.createdAt,
      requester: {
        id: r.requesterId,
        username: r.username,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl,
        verified: r.verified,
        badgeType: r.badgeType,
      },
    }));
  }

  async acceptFollowRequest(requestId: string, userId: string): Promise<void> {
    const [req] = await db.select().from(followRequests)
      .where(and(eq(followRequests.id, requestId), eq(followRequests.targetId, userId)));
    if (!req) throw new Error("Request not found");

    await db.update(followRequests).set({ status: "accepted" }).where(eq(followRequests.id, requestId));
    await db.insert(follows).values({ followerId: req.requesterId, followingId: userId }).onConflictDoNothing();
    await this.createNotification(req.requesterId, userId, "follow_accepted");
  }

  async rejectFollowRequest(requestId: string, userId: string): Promise<void> {
    await db.update(followRequests)
      .set({ status: "rejected" })
      .where(and(eq(followRequests.id, requestId), eq(followRequests.targetId, userId)));
  }

  async getFollowRequestStatus(requesterId: string, targetId: string): Promise<string | null> {
    const [req] = await db.select().from(followRequests)
      .where(and(
        eq(followRequests.requesterId, requesterId),
        eq(followRequests.targetId, targetId),
        eq(followRequests.status, "pending")
      ));
    return req ? req.status : null;
  }

  async cancelFollowRequest(requesterId: string, targetId: string): Promise<void> {
    await db.delete(followRequests)
      .where(and(
        eq(followRequests.requesterId, requesterId),
        eq(followRequests.targetId, targetId),
        eq(followRequests.status, "pending")
      ));
  }
}

export const storage = new DatabaseStorage();
