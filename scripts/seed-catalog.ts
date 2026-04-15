import { db } from "../src/db";
import { catalogProducts } from "../src/db/schema";
import { count } from "drizzle-orm";

const products: {
  brand: string;
  model: string;
  categorySuggestion: string;
}[] = [
  // ── Shelters / Tents ──
  { brand: "MSR", model: "Hubba Hubba 2", categorySuggestion: "Shelter" },
  { brand: "MSR", model: "FreeLite 2", categorySuggestion: "Shelter" },
  { brand: "MSR", model: "Zoic 2", categorySuggestion: "Shelter" },
  { brand: "Big Agnes", model: "Copper Spur HV UL2", categorySuggestion: "Shelter" },
  { brand: "Big Agnes", model: "Tiger Wall UL2", categorySuggestion: "Shelter" },
  { brand: "Big Agnes", model: "Fly Creek HV UL2", categorySuggestion: "Shelter" },
  { brand: "Nemo", model: "Dagger 2P", categorySuggestion: "Shelter" },
  { brand: "Nemo", model: "Hornet 2P", categorySuggestion: "Shelter" },
  { brand: "Nemo", model: "Dragonfly 2P", categorySuggestion: "Shelter" },
  { brand: "Zpacks", model: "Duplex", categorySuggestion: "Shelter" },
  { brand: "Zpacks", model: "Triplex", categorySuggestion: "Shelter" },
  { brand: "Zpacks", model: "Plexamid", categorySuggestion: "Shelter" },
  { brand: "Gossamer Gear", model: "The One", categorySuggestion: "Shelter" },
  { brand: "Gossamer Gear", model: "The Two", categorySuggestion: "Shelter" },
  { brand: "Kelty", model: "Late Start 2", categorySuggestion: "Shelter" },
  { brand: "REI", model: "Half Dome SL 2+", categorySuggestion: "Shelter" },
  { brand: "REI", model: "Flash Air 2", categorySuggestion: "Shelter" },
  { brand: "Sea to Summit", model: "Telos TR2", categorySuggestion: "Shelter" },

  // ── Sleeping Bags & Quilts ──
  { brand: "Enlightened Equipment", model: "Enigma 20", categorySuggestion: "Sleep" },
  { brand: "Enlightened Equipment", model: "Enigma 30", categorySuggestion: "Sleep" },
  { brand: "Enlightened Equipment", model: "Revelation 20", categorySuggestion: "Sleep" },
  { brand: "Kelty", model: "Cosmic 20", categorySuggestion: "Sleep" },
  { brand: "Kelty", model: "Cosmic 40", categorySuggestion: "Sleep" },
  { brand: "Big Agnes", model: "Anthracite 20", categorySuggestion: "Sleep" },
  { brand: "Nemo", model: "Disco 15", categorySuggestion: "Sleep" },
  { brand: "Nemo", model: "Forte 20", categorySuggestion: "Sleep" },
  { brand: "REI", model: "Magma 15", categorySuggestion: "Sleep" },
  { brand: "Sea to Summit", model: "Spark SP III", categorySuggestion: "Sleep" },
  { brand: "Zpacks", model: "20F Classic Sleeping Bag", categorySuggestion: "Sleep" },

  // ── Sleeping Pads ──
  { brand: "Therm-a-Rest", model: "NeoAir XTherm", categorySuggestion: "Sleep" },
  { brand: "Therm-a-Rest", model: "NeoAir XLite NXT", categorySuggestion: "Sleep" },
  { brand: "Therm-a-Rest", model: "Z Lite Sol", categorySuggestion: "Sleep" },
  { brand: "Therm-a-Rest", model: "ProLite Plus", categorySuggestion: "Sleep" },
  { brand: "Nemo", model: "Tensor Insulated", categorySuggestion: "Sleep" },
  { brand: "Nemo", model: "Switchback", categorySuggestion: "Sleep" },
  { brand: "Big Agnes", model: "Rapide SL Insulated", categorySuggestion: "Sleep" },
  { brand: "Sea to Summit", model: "Ether Light XT", categorySuggestion: "Sleep" },
  { brand: "REI", model: "Flash Insulated", categorySuggestion: "Sleep" },

  // ── Packs ──
  { brand: "ULA", model: "Circuit", categorySuggestion: "Big Four" },
  { brand: "ULA", model: "Catalyst", categorySuggestion: "Big Four" },
  { brand: "ULA", model: "Ohm 2.0", categorySuggestion: "Big Four" },
  { brand: "Granite Gear", model: "Crown2 60", categorySuggestion: "Big Four" },
  { brand: "Granite Gear", model: "Blaze 60", categorySuggestion: "Big Four" },
  { brand: "Gossamer Gear", model: "Mariposa 60", categorySuggestion: "Big Four" },
  { brand: "Gossamer Gear", model: "Gorilla 50", categorySuggestion: "Big Four" },
  { brand: "Zpacks", model: "Arc Blast", categorySuggestion: "Big Four" },
  { brand: "Zpacks", model: "Nero", categorySuggestion: "Big Four" },
  { brand: "REI", model: "Flash 55", categorySuggestion: "Big Four" },
  { brand: "Kelty", model: "Asher 65", categorySuggestion: "Big Four" },

  // ── Kitchen & Cooking ──
  { brand: "Jetboil", model: "Flash", categorySuggestion: "Kitchen & Food" },
  { brand: "Jetboil", model: "MiniMo", categorySuggestion: "Kitchen & Food" },
  { brand: "Jetboil", model: "Stash", categorySuggestion: "Kitchen & Food" },
  { brand: "MSR", model: "PocketRocket 2", categorySuggestion: "Kitchen & Food" },
  { brand: "MSR", model: "WindBurner", categorySuggestion: "Kitchen & Food" },
  { brand: "Snow Peak", model: "LiteMax", categorySuggestion: "Kitchen & Food" },
  { brand: "Snow Peak", model: "Trek 900 Titanium", categorySuggestion: "Kitchen & Food" },
  { brand: "Snow Peak", model: "Mini Solo Cookset", categorySuggestion: "Kitchen & Food" },
  { brand: "Sea to Summit", model: "Alpha Pot 1.2L", categorySuggestion: "Kitchen & Food" },
  { brand: "Sea to Summit", model: "Delta Spork", categorySuggestion: "Kitchen & Food" },

  // ── Water ──
  { brand: "Sawyer", model: "Squeeze", categorySuggestion: "Water" },
  { brand: "Sawyer", model: "Micro Squeeze", categorySuggestion: "Water" },
  { brand: "Sawyer", model: "Mini", categorySuggestion: "Water" },
  { brand: "Katadyn", model: "BeFree 1.0L", categorySuggestion: "Water" },
  { brand: "Katadyn", model: "Steripen Ultra", categorySuggestion: "Water" },
  { brand: "Katadyn", model: "Hiker Pro", categorySuggestion: "Water" },

  // ── Lighting / Tools ──
  { brand: "Black Diamond", model: "Spot 400", categorySuggestion: "Tools & Utility" },
  { brand: "Black Diamond", model: "Storm 500-R", categorySuggestion: "Tools & Utility" },
  { brand: "Black Diamond", model: "Distance Z Poles", categorySuggestion: "Tools & Utility" },
  { brand: "Black Diamond", model: "Trail Ergo Cork Poles", categorySuggestion: "Tools & Utility" },
  { brand: "Petzl", model: "Actik Core", categorySuggestion: "Tools & Utility" },
  { brand: "Petzl", model: "Swift RL", categorySuggestion: "Tools & Utility" },
  { brand: "Petzl", model: "Bindi", categorySuggestion: "Tools & Utility" },

  // ── Clothing ──
  { brand: "Arc'teryx", model: "Atom Hoody", categorySuggestion: "Clothing" },
  { brand: "Arc'teryx", model: "Beta LT Jacket", categorySuggestion: "Clothing" },
  { brand: "Arc'teryx", model: "Cerium Hoody", categorySuggestion: "Clothing" },
  { brand: "Patagonia", model: "Nano Puff", categorySuggestion: "Clothing" },
  { brand: "Patagonia", model: "Torrentshell 3L", categorySuggestion: "Clothing" },
  { brand: "Patagonia", model: "R1 Air Full-Zip", categorySuggestion: "Clothing" },
  { brand: "Patagonia", model: "Capilene Cool Daily", categorySuggestion: "Clothing" },
  { brand: "Outdoor Research", model: "Helium Rain Jacket", categorySuggestion: "Clothing" },
  { brand: "Outdoor Research", model: "Ferrosi Pants", categorySuggestion: "Clothing" },
  { brand: "Outdoor Research", model: "ActiveIce Spectrum Sun Hoody", categorySuggestion: "Clothing" },
  { brand: "Smartwool", model: "Merino 150 Base Layer", categorySuggestion: "Clothing" },
  { brand: "Smartwool", model: "Classic Thermal Merino Base", categorySuggestion: "Clothing" },
  { brand: "Darn Tough", model: "Hiker Micro Crew Midweight", categorySuggestion: "Clothing" },
  { brand: "Darn Tough", model: "Hiker Quarter Midweight", categorySuggestion: "Clothing" },
  { brand: "Darn Tough", model: "Light Hiker No Show", categorySuggestion: "Clothing" },

  // ── Dog / Pet Gear ──
  { brand: "Ruffwear", model: "Palisades Pack", categorySuggestion: "Pet Gear" },
  { brand: "Ruffwear", model: "Approach Pack", categorySuggestion: "Pet Gear" },
  { brand: "Ruffwear", model: "Front Range Harness", categorySuggestion: "Pet Gear" },
  { brand: "Ruffwear", model: "Trail Runner Bowl", categorySuggestion: "Pet Gear" },
  { brand: "Ruffwear", model: "Highlands Sleeping Bag", categorySuggestion: "Pet Gear" },
  { brand: "Ruffwear", model: "Climate Changer Fleece", categorySuggestion: "Pet Gear" },

  // ── Misc ──
  { brand: "Sea to Summit", model: "Ultra-Sil Dry Sack 8L", categorySuggestion: "Tools & Utility" },
  { brand: "Sea to Summit", model: "Aeros Ultralight Pillow", categorySuggestion: "Sleep" },
  { brand: "Black Diamond", model: "Cosmo 350", categorySuggestion: "Tools & Utility" },
  { brand: "Granite Gear", model: "Air Grocery Bag", categorySuggestion: "Kitchen & Food" },
  { brand: "MSR", model: "TrailShot", categorySuggestion: "Water" },
];

async function main() {
  console.log("Checking catalog_product table...");

  const [{ value: existing }] = await db
    .select({ value: count() })
    .from(catalogProducts);

  if (existing > 0) {
    console.log(
      `Catalog already has ${existing} entries — skipping seed.`
    );
    process.exit(0);
  }

  const rows = products.map((p) => ({
    brand: p.brand,
    model: p.model,
    searchText: `${p.brand} ${p.model}`.toLowerCase(),
    categorySuggestion: p.categorySuggestion,
    source: "seed" as const,
  }));

  console.log(`Inserting ${rows.length} catalog products...`);
  await db.insert(catalogProducts).values(rows);
  console.log("Done — catalog seeded.");

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
