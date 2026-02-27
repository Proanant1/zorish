export interface AdItem {
  id: string;
  brandName: string;
  brandHandle: string;
  brandInitials: string;
  brandColor: string;
  content: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export const FEED_ADS: AdItem[] = [
  {
    id: "ad-1",
    brandName: "Zomato",
    brandHandle: "zomato",
    brandInitials: "ZO",
    brandColor: "#E23744",
    content: "Craving something delicious? Order now and get 30% off your first order with code ZORISH30. Fast delivery to your doorstep. 🍕🍛",
    ctaLabel: "Order Now",
    ctaUrl: "https://zomato.com",
  },
  {
    id: "ad-2",
    brandName: "Razorpay",
    brandHandle: "razorpay",
    brandInitials: "RP",
    brandColor: "#2B6CB0",
    content: "Accept payments in seconds. Razorpay powers 10 million+ businesses across India. Set up your payment gateway today — no technical skills needed.",
    ctaLabel: "Get Started Free",
    ctaUrl: "https://razorpay.com",
  },
  {
    id: "ad-3",
    brandName: "BYJU'S",
    brandHandle: "byjus",
    brandInitials: "BY",
    brandColor: "#7C3AED",
    content: "Learn from India's best teachers. BYJU'S interactive courses for Class 6–12 and competitive exams. First month free for Zorish users. 📚✨",
    ctaLabel: "Start Learning",
    ctaUrl: "https://byjus.com",
  },
  {
    id: "ad-4",
    brandName: "boAt Lifestyle",
    brandHandle: "boat_lifestyle",
    brandInitials: "bL",
    brandColor: "#D97706",
    content: "Unleash your sound. boAt Airdopes 141 — 42hr playtime, legendary bass, IPX4 water resistant. ₹1,299 only. Limited stock remaining.",
    ctaLabel: "Shop Now",
    ctaUrl: "https://boat-lifestyle.com",
  },
  {
    id: "ad-5",
    brandName: "Nykaa",
    brandHandle: "nykaa",
    brandInitials: "NK",
    brandColor: "#E91E8C",
    content: "Beauty that speaks for you. Explore 2,000+ brands, authentic products, and exclusive deals. Free delivery on orders above ₹399.",
    ctaLabel: "Explore Deals",
    ctaUrl: "https://nykaa.com",
  },
  {
    id: "ad-6",
    brandName: "MakeMyTrip",
    brandHandle: "makemytrip",
    brandInitials: "MT",
    brandColor: "#006EE5",
    content: "Explore incredible India. Book flights, hotels & holiday packages at the best prices. Use code ZORISH to save ₹1,000 on your next trip. ✈️",
    ctaLabel: "Book Now",
    ctaUrl: "https://makemytrip.com",
  },
];

export const EXPLORE_ADS: AdItem[] = [
  {
    id: "exp-ad-1",
    brandName: "PhonePe",
    brandHandle: "phonepe",
    brandInitials: "PP",
    brandColor: "#6739B7",
    content: "Send money, recharge, pay bills — all in one tap. PhonePe is trusted by 500M+ Indians. Secure. Instant. Free.",
    ctaLabel: "Download App",
    ctaUrl: "https://phonepe.com",
  },
  {
    id: "exp-ad-2",
    brandName: "Meesho",
    brandHandle: "meesho",
    brandInitials: "ME",
    brandColor: "#9B59B6",
    content: "Start your business from home. Sell on Meesho with zero investment, zero commission. Join 15 million+ entrepreneurs across India.",
    ctaLabel: "Start Selling",
    ctaUrl: "https://meesho.com",
  },
];

export function getAdForIndex(index: number, pool: AdItem[]): AdItem {
  return pool[index % pool.length];
}
