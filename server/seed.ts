import { db } from "./db";
import { users, posts, hashtags, postHashtags, follows } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  const [existingUser] = await db.select().from(users).where(eq(users.username, "priya_sharma")).limit(1);
  if (existingUser) return;

  console.log("Seeding database with sample data...");

  const hashedPw = await hashPassword("password123");

  const seedUsers = [
    { username: "priya_sharma", password: hashedPw, displayName: "Priya Sharma", bio: "Tech enthusiast from Mumbai. Building the future of India's digital landscape.", state: "Maharashtra", languagePreference: "Hindi", verified: true, avatarUrl: "" },
    { username: "rahul_dev", password: hashedPw, displayName: "Rahul Dev", bio: "Software developer. Cricket lover. Chai over coffee.", state: "Karnataka", languagePreference: "English", verified: true, avatarUrl: "" },
    { username: "ananya_gupta", password: hashedPw, displayName: "Ananya Gupta", bio: "Artist and storyteller from Kolkata. Exploring India through art.", state: "West Bengal", languagePreference: "Bengali", verified: false, avatarUrl: "" },
    { username: "vikram_tamil", password: hashedPw, displayName: "Vikram Rajesh", bio: "Chennai based entrepreneur. Tamil cinema enthusiast.", state: "Tamil Nadu", languagePreference: "Tamil", verified: false, avatarUrl: "" },
    { username: "deepa_nair", password: hashedPw, displayName: "Deepa Nair", bio: "Kerala food blogger. Sharing recipes from God's own country.", state: "Kerala", languagePreference: "Malayalam", verified: true, avatarUrl: "" },
  ];

  const createdUsers: any[] = [];
  for (const u of seedUsers) {
    const [created] = await db.insert(users).values(u).returning();
    createdUsers.push(created);
  }

  const seedPosts = [
    { userId: createdUsers[0].id, content: "Just launched my new startup in Mumbai! The Indian tech ecosystem is booming and I'm so excited to be part of it. #StartupIndia #TechIndia #Mumbai" },
    { userId: createdUsers[1].id, content: "Beautiful sunrise at Cubbon Park today. Bangalore weather never disappoints! The garden city truly lives up to its name. #Bangalore #Karnataka #Nature" },
    { userId: createdUsers[2].id, content: "Finished my new painting inspired by Durga Puja celebrations. Art and culture are the soul of Kolkata. #DurgaPuja #Art #Kolkata #Bengali" },
    { userId: createdUsers[3].id, content: "Tamil cinema is going global! So proud to see our films reaching international audiences. Ponniyin Selvan showed the world what Tamil storytelling can do. #Tamil #Cinema #Kollywood" },
    { userId: createdUsers[4].id, content: "Today's recipe: Traditional Kerala Sadya. 26 dishes on a banana leaf! Nothing beats the taste of home. #Kerala #Food #Sadya #IndianCuisine" },
    { userId: createdUsers[0].id, content: "India's digital payment revolution is incredible. UPI transactions crossed 10 billion this month! We're leading the world in fintech innovation. #UPI #DigitalIndia #Fintech" },
    { userId: createdUsers[1].id, content: "Weekend cricket with friends at Maidan. Some things never change! Who else grew up playing gully cricket? #Cricket #IndianCricket #WeekendVibes" },
    { userId: createdUsers[2].id, content: "Explored the historic Victoria Memorial today. Every corner of Kolkata tells a story. This city has so much history and character. #Heritage #Kolkata #Travel" },
    { userId: createdUsers[3].id, content: "Chennai's Marina Beach at sunset is pure magic. The longest urban beach in India and one of the most beautiful. #Chennai #MarinaBeach #TamilNadu" },
    { userId: createdUsers[4].id, content: "Backwaters of Alleppey are a must-visit. House boat ride with fresh fish curry - paradise on earth! #Kerala #Backwaters #Travel #IncredibleIndia" },
  ];

  for (const p of seedPosts) {
    const [post] = await db.insert(posts).values(p).returning();

    const hashtagMatches = p.content.match(/#(\w+)/g) || [];
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
  }

  for (let i = 0; i < createdUsers.length; i++) {
    for (let j = i + 1; j < createdUsers.length; j++) {
      await db.insert(follows).values({ followerId: createdUsers[i].id, followingId: createdUsers[j].id }).onConflictDoNothing();
    }
  }

  console.log("Seed data inserted successfully!");
}
