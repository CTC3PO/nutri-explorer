import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if(!supabaseUrl || !supabaseAnonKey) {
  console.log("Missing credentials. Please pass them as env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const baseImageUrls = [
    "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1566478989037-e506509fca03?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60"
];

async function run() {
  const mockProducts = Array.from({length: 40}).map((_, i) => ({
    name: `Infinite Scroll Test Item ${i + 1}`,
    brand: `Brand ${Math.floor(Math.random() * 10)}`,
    category: 'Test Category',
    nutri_score: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
    energy: Math.floor(Math.random() * 800) + 10,
    sugars: (Math.random() * 30).toFixed(1),
    sodium: (Math.random() * 5).toFixed(2),
    saturated_fat: (Math.random() * 20).toFixed(1),
    image_url: baseImageUrls[Math.floor(Math.random() * baseImageUrls.length)]
  }));

  const { error } = await supabase.from("products").insert(mockProducts);
  
  if (error) {
    console.error("Error inserting mock products:", error);
  } else {
    console.log("Successfully inserted 40 mock products.");
  }
}

run();
