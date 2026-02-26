import { pool } from "./db";

export async function pushSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        header_url TEXT DEFAULT '',
        state TEXT DEFAULT '',
        language_preference TEXT DEFAULT 'English',
        gmail TEXT DEFAULT '',
        linkedin TEXT DEFAULT '',
        whatsapp TEXT DEFAULT '',
        verified BOOLEAN DEFAULT false,
        role TEXT DEFAULT 'user',
        is_private BOOLEAN DEFAULT false,
        allow_messages_from TEXT DEFAULT 'everyone',
        allow_comments_from TEXT DEFAULT 'everyone',
        hide_online_status BOOLEAN DEFAULT false,
        notif_push BOOLEAN DEFAULT true,
        notif_email BOOLEAN DEFAULT false,
        notif_mentions BOOLEAN DEFAULT true,
        notif_messages BOOLEAN DEFAULT true,
        notif_trending BOOLEAN DEFAULT true,
        notif_state_alerts BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        image_url TEXT DEFAULT '',
        likes_count INTEGER DEFAULT 0,
        dislikes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hashtags (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        tag TEXT NOT NULL UNIQUE,
        post_count INTEGER DEFAULT 0,
        state TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS post_hashtags (
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id),
        hashtag_id VARCHAR(36) NOT NULL REFERENCES hashtags(id),
        PRIMARY KEY (post_id, hashtag_id)
      );

      CREATE TABLE IF NOT EXISTS likes (
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id),
        type TEXT NOT NULL DEFAULT 'like',
        PRIMARY KEY (user_id, post_id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id),
        PRIMARY KEY (user_id, post_id)
      );

      CREATE TABLE IF NOT EXISTS follows (
        follower_id VARCHAR(36) NOT NULL REFERENCES users(id),
        following_id VARCHAR(36) NOT NULL REFERENCES users(id),
        PRIMARY KEY (follower_id, following_id)
      );

      CREATE TABLE IF NOT EXISTS blocked_users (
        blocker_id VARCHAR(36) NOT NULL REFERENCES users(id),
        blocked_id VARCHAR(36) NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (blocker_id, blocked_id)
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS header_url TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_messages_from TEXT DEFAULT 'everyone';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_comments_from TEXT DEFAULT 'everyone';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS hide_online_status BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_push BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_email BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_mentions BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_messages BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_trending BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_state_alerts BOOLEAN DEFAULT false;

      ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'text';
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT '';
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS poll_question TEXT DEFAULT '';
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS poll_options TEXT[] DEFAULT '{}';
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS poll_votes INT[] DEFAULT '{}';

      CREATE TABLE IF NOT EXISTS poll_votes (
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id),
        option_index INTEGER NOT NULL,
        PRIMARY KEY (user_id, post_id)
      );

      CREATE TABLE IF NOT EXISTS verification_orders (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        razorpay_order_id TEXT NOT NULL UNIQUE,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'created',
        razorpay_payment_id TEXT DEFAULT '',
        razorpay_signature TEXT DEFAULT '',
        badge_type TEXT DEFAULT 'verified',
        created_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_type TEXT DEFAULT 'none';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expiry TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'none';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS student_status TEXT DEFAULT 'none';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS student_college_name TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS story_visibility TEXT DEFAULT 'everyone';

      ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT true;
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';

      CREATE TABLE IF NOT EXISTS stories (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        media_url TEXT DEFAULT '',
        media_type TEXT DEFAULT 'image',
        content TEXT DEFAULT '',
        visibility TEXT DEFAULT 'public',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS story_views (
        story_id VARCHAR(36) NOT NULL REFERENCES stories(id),
        viewer_id VARCHAR(36) NOT NULL REFERENCES users(id),
        viewed_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (story_id, viewer_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id VARCHAR(36) NOT NULL REFERENCES users(id),
        receiver_id VARCHAR(36) NOT NULL REFERENCES users(id),
        content TEXT DEFAULT '',
        message_type TEXT DEFAULT 'text',
        media_url TEXT DEFAULT '',
        file_name TEXT DEFAULT '',
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reposts (
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id),
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, post_id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        from_user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        type TEXT NOT NULL DEFAULT 'impressive',
        post_id VARCHAR(36) REFERENCES posts(id),
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS follow_requests (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        requester_id VARCHAR(36) NOT NULL REFERENCES users(id),
        target_id VARCHAR(36) NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
    `);
    console.log("Database schema created successfully");
  } finally {
    client.release();
  }
}
