import type { Category, Product } from "./types";

/**
 * Launch catalog. Once Supabase is configured this file is only used as a
 * fallback for local development — the shop manages the live catalog from
 * the admin panel.
 */

export const seedCategories: Category[] = [
  {
    id: "cat-cookware",
    name: "Cookware",
    slug: "cookware",
    description: "Pots, pans, dutch ovens and everything that touches the flame.",
    intro:
      "Buy quality cookware in Kigali — enamelled dutch ovens, stainless steel woks, cast-iron cocottes and stovetop kettles, hand-picked for Rwandan kitchens. Every piece is available at our City Plaza store or delivered across Kigali.",
    image: "/images/cat-cookware.webp",
    sortOrder: 1,
  },
  {
    id: "cat-dinnerware",
    name: "Dinnerware",
    slug: "dinnerware",
    description: "Stoneware, porcelain and ceramics for the table you gather around.",
    intro:
      "Shop dinnerware in Kigali — artisan stoneware dinner sets, ceramic serving bowls and porcelain mugs that turn everyday meals into occasions. See the full range at City Plaza or order for delivery anywhere in Kigali.",
    image: "/images/cat-dinnerware.webp",
    sortOrder: 2,
  },
  {
    id: "cat-cutlery",
    name: "Cutlery & Tools",
    slug: "cutlery",
    description: "Forged knives, boards and the tools that do the real work.",
    intro:
      "Find professional kitchen knives and prep tools in Kigali — forged knife sets, acacia chopping boards and heat-resistant silicone utensils. The tools chefs actually reach for, now available in Rwanda.",
    image: "/images/cat-cutlery.webp",
    sortOrder: 3,
  },
  {
    id: "cat-serveware",
    name: "Serveware & Glassware",
    slug: "serveware",
    description: "Carafes, glasses and trays made for hosting.",
    intro:
      "Serveware and glassware in Kigali — glass carafes, wine glasses, whiskey tumblers and acacia serving trays for hosts who take their table seriously. Visit us at City Plaza or order online for Kigali delivery.",
    image: "/images/cat-serveware.webp",
    sortOrder: 4,
  },
  {
    id: "cat-storage",
    name: "Storage & Organisation",
    slug: "storage",
    description: "Airtight jars and canisters that keep the pantry beautiful.",
    intro:
      "Kitchen storage solutions in Kigali — airtight glass jars and ceramic canister sets that keep ingredients fresh and shelves worth looking at. Available in-store at City Plaza and for delivery across Kigali.",
    image: "/images/cat-storage.webp",
    sortOrder: 5,
  },
  {
    id: "cat-small-appliances",
    name: "Small Appliances",
    slug: "small-appliances",
    description: "Blenders, pressure cookers and coffee gear that earn their counter space.",
    intro:
      "Shop small kitchen appliances in Kigali — countertop blenders, electric pressure cookers, drip coffee makers and burr grinders from trusted brands. Tested, warrantied and delivered across Kigali.",
    image: "/images/cat-small-appliances.webp",
    sortOrder: 6,
  },
];

export const seedProducts: Product[] = [
  // ── Cookware ────────────────────────────────────────────────
  {
    id: "p-ember-dutch-oven",
    name: "Ember Enamelled Dutch Oven — 5.2 L",
    slug: "ember-enamelled-dutch-oven",
    categorySlug: "cookware",
    priceRwf: 145_000,
    shortDescription:
      "Heavy cast iron under a flame-orange enamel — sears, braises and bakes, then goes straight to the table.",
    description:
      "The one pot that outlives trends. Ember's cast-iron core holds heat evenly for deep, patient braises, while the enamelled interior needs no seasoning and cleans up with warm water. From slow-cooked isombe to Sunday bread, this is the workhorse your kitchen has been missing — and the enamel finish means it doubles as serveware.",
    specs: {
      Capacity: "5.2 litres",
      Material: "Enamelled cast iron",
      Compatibility: "Gas, electric, induction, oven-safe to 250°C",
      Care: "Hand wash; no seasoning required",
    },
    images: ["/products/ember-dutch-oven.webp", "/products/ember-dutch-oven-2.webp"],
    featured: true,
    inStock: true,
    createdAt: "2026-07-01T08:00:00Z",
  },
  {
    id: "p-meridian-wok",
    name: "Meridian Stainless Wok — 32 cm",
    slug: "meridian-stainless-wok",
    categorySlug: "cookware",
    priceRwf: 89_000,
    shortDescription:
      "Tri-ply stainless steel with a fitted lid — high-heat stir-fries without the sticking.",
    description:
      "A serious wok for serious heat. Meridian's tri-ply construction sandwiches an aluminium core between stainless layers, so the base heats fast and even while the sides stay responsive. The fitted stainless lid turns it into a steamer or braiser, and riveted twin handles make the trip from stove to table a safe one.",
    specs: {
      Diameter: "32 cm",
      Material: "Tri-ply stainless steel",
      Lid: "Fitted stainless steel",
      Compatibility: "All stovetops including induction",
    },
    images: ["/products/meridian-stainless-wok.webp", "/products/meridian-stainless-wok-2.webp"],
    featured: true,
    inStock: true,
    createdAt: "2026-07-01T08:05:00Z",
  },
  {
    id: "p-noir-cocotte",
    name: "Noir Cast-Iron Mini Cocotte — 0.6 L",
    slug: "noir-mini-cocotte",
    categorySlug: "cookware",
    priceRwf: 48_000,
    shortDescription:
      "Single-serve cast iron for soups, baked eggs and desserts — oven to table in one piece.",
    description:
      "Small pot, big presence. The Noir mini cocotte bakes, braises and serves individual portions with the same heat retention as a full dutch oven. Line up a row of them for dinner parties — soups stay hot at the table for twenty minutes, and the matte black finish looks the part.",
    specs: {
      Capacity: "0.6 litres",
      Material: "Cast iron, matte enamel",
      "Oven safe": "Up to 250°C",
      Serving: "Single portion",
    },
    images: ["/products/noir-mini-cocotte.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:10:00Z",
  },
  {
    id: "p-stovetop-kettle",
    name: "Classic Stovetop Kettle — 2.5 L",
    slug: "classic-stovetop-kettle",
    categorySlug: "cookware",
    priceRwf: 42_000,
    shortDescription:
      "Polished stainless kettle with a heat-shielded handle — icyayi the traditional way.",
    description:
      "Some rituals deserve better hardware. This 2.5-litre stainless kettle brings water to a rolling boil on any stovetop and pours clean without dribbling. The wide base maximises contact with the flame, the handle stays cool, and the polished body will still look right in your kitchen a decade from now.",
    specs: {
      Capacity: "2.5 litres",
      Material: "Polished stainless steel",
      Handle: "Heat-shielded steel",
      Compatibility: "Gas, electric, induction",
    },
    images: ["/products/classic-stovetop-kettle.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:15:00Z",
  },
  {
    id: "p-bamboo-steamer",
    name: "Bamboo Steamer — 2 Tier, 25 cm",
    slug: "bamboo-steamer",
    categorySlug: "cookware",
    priceRwf: 28_000,
    shortDescription:
      "Two-tier natural bamboo — steam vegetables, fish and dumplings without losing a single nutrient.",
    description:
      "Steaming is the most honest way to cook, and bamboo does it best — it absorbs excess moisture so nothing turns soggy. Two stackable tiers let you steam a full meal at once over any pot or wok. Ideal for vegetables, sweet potatoes, fish and dumplings.",
    specs: {
      Diameter: "25 cm",
      Tiers: "2 + lid",
      Material: "Natural bamboo",
      Care: "Rinse and air-dry; do not soak",
    },
    images: ["/products/bamboo-steamer.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:20:00Z",
  },

  // ── Dinnerware ──────────────────────────────────────────────
  {
    id: "p-artisan-dinner-set",
    name: "Artisan Stoneware Dinner Set — 12 Piece",
    slug: "artisan-stoneware-dinner-set",
    categorySlug: "dinnerware",
    priceRwf: 185_000,
    shortDescription:
      "Hand-glazed stoneware for four — dinner plates, side plates and bowls with quietly imperfect edges.",
    description:
      "Mass-produced plates all look the same because they are the same. This set is hand-glazed stoneware — each rim carries a slightly different pool of glaze, which is exactly the point. Four dinner plates, four side plates and four bowls, sturdy enough for daily use and considered enough for guests. Microwave and dishwasher safe.",
    specs: {
      Pieces: "12 (serves 4)",
      Material: "Hand-glazed stoneware",
      "Dinner plate": "27 cm",
      Care: "Dishwasher and microwave safe",
    },
    images: ["/products/artisan-stoneware-dinner-set.webp"],
    featured: true,
    inStock: true,
    createdAt: "2026-07-01T08:25:00Z",
  },
  {
    id: "p-duo-serving-bowls",
    name: "Duo Ceramic Serving Bowls",
    slug: "duo-ceramic-serving-bowls",
    categorySlug: "dinnerware",
    priceRwf: 34_000,
    shortDescription:
      "A nesting pair of glazed ceramic bowls — patterned outside, food-safe glaze inside.",
    description:
      "Two bowls that earn their shelf space. The smaller nests inside the larger, the hand-applied patterns make them serving pieces rather than just containers, and the interior glaze is food-safe and stain-resistant. Salads, fruit, ibirayi — they carry it all with some style.",
    specs: {
      Set: "2 nesting bowls",
      Material: "Glazed ceramic",
      Sizes: "18 cm + 14 cm",
      Care: "Dishwasher safe",
    },
    images: ["/products/duo-ceramic-serving-bowls.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:30:00Z",
  },
  {
    id: "p-everyday-mug",
    name: "Everyday Porcelain Mug — 350 ml",
    slug: "everyday-porcelain-mug",
    categorySlug: "dinnerware",
    priceRwf: 12_000,
    shortDescription:
      "Clean white porcelain with a balanced handle — the mug you'll reach for every single morning.",
    description:
      "There's always one mug everyone in the house fights over. This is that mug: 350 ml of bright white porcelain, walls thin enough to feel refined but thick enough to keep coffee hot, and a handle that fits actual fingers. Stackable, chip-resistant, endlessly replaceable — buy two.",
    specs: {
      Capacity: "350 ml",
      Material: "White porcelain",
      Stackable: "Yes",
      Care: "Dishwasher and microwave safe",
    },
    images: ["/products/everyday-porcelain-mug.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:35:00Z",
  },
  {
    id: "p-barista-mug",
    name: "Barista Stoneware Mug — 300 ml",
    slug: "barista-stoneware-mug",
    categorySlug: "dinnerware",
    priceRwf: 15_000,
    shortDescription:
      "Weighted stoneware with a matte glaze — built for slow coffee and strong Rwandan beans.",
    description:
      "Made for coffee taken seriously. The thick stoneware walls hold temperature far longer than porcelain, the wide mouth lets espresso-based drinks breathe, and the matte glaze feels substantial in hand. If your beans come from Huye or Rulindo, they deserve this landing.",
    specs: {
      Capacity: "300 ml",
      Material: "Matte-glazed stoneware",
      "Heat retention": "High — thick walls",
      Care: "Dishwasher safe",
    },
    images: ["/products/barista-stoneware-mug.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:40:00Z",
  },

  // ── Cutlery & Tools ─────────────────────────────────────────
  {
    id: "p-forged-knife-set",
    name: "Forged 5-Piece Knife Set with Leather Roll",
    slug: "forged-knife-set",
    categorySlug: "cutlery",
    priceRwf: 165_000,
    shortDescription:
      "High-carbon forged blades with pakkawood handles — chef's, santoku, utility, carving fork and steel, in a leather roll.",
    description:
      "The last knives you'll buy for a long time. Each blade is forged from high-carbon stainless steel, hardened for edge retention and balanced against a full-tang pakkawood handle. The set covers every real job in a kitchen — chef's knife, santoku, utility blade, carving fork and honing steel — and travels in a stitched leather roll that gets better with age.",
    specs: {
      Pieces: "5 + leather roll",
      Steel: "High-carbon stainless, forged",
      Handles: "Full-tang pakkawood",
      Care: "Hand wash, hone weekly",
    },
    images: ["/products/forged-knife-set.webp"],
    featured: true,
    inStock: true,
    createdAt: "2026-07-01T08:45:00Z",
  },
  {
    id: "p-silicone-utensil-trio",
    name: "Silicone Utensil Trio",
    slug: "silicone-utensil-trio",
    categorySlug: "cutlery",
    priceRwf: 22_000,
    shortDescription:
      "Three heat-resistant silicone spoons that won't scratch your non-stick pans — ever.",
    description:
      "Metal utensils are how non-stick pans die. This trio of solid-core silicone spoons is heat-resistant to 230°C, gentle on every coating you own, and rigid enough to actually stir a thick pot of ibihaza. Dishwasher safe, stain-resistant, and the colours survive years of use.",
    specs: {
      Pieces: "3 spoons",
      Material: "Solid-core food-grade silicone",
      "Heat resistance": "230°C",
      Care: "Dishwasher safe",
    },
    images: ["/products/silicone-utensil-trio.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:50:00Z",
  },
  {
    id: "p-acacia-board-set",
    name: "Acacia Board Set — 2 Boards + Crock",
    slug: "acacia-board-set",
    categorySlug: "cutlery",
    priceRwf: 38_000,
    shortDescription:
      "Two solid acacia boards and a ceramic utensil crock — the prep station, sorted.",
    description:
      "Acacia is dense enough to shrug off knife marks and handsome enough to serve from. This set pairs a large prep board with a smaller bar board, plus a ceramic crock to keep your most-used utensils standing by the stove. Oil them every few months and they'll outlast the kitchen.",
    specs: {
      Set: "2 boards + ceramic crock",
      Material: "Solid acacia wood",
      "Large board": "40 × 28 cm",
      Care: "Hand wash, oil monthly",
    },
    images: ["/products/acacia-board-set.webp", "/products/acacia-board-set-2.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T08:55:00Z",
  },

  // ── Serveware & Glassware ───────────────────────────────────
  {
    id: "p-glass-carafe",
    name: "Glass Carafe & Tumbler Set",
    slug: "glass-carafe-set",
    categorySlug: "serveware",
    priceRwf: 45_000,
    shortDescription:
      "A 1.2 L pouring carafe with matching tumblers — water, juice or milk, served properly.",
    description:
      "The difference between putting a plastic bottle on the table and pouring from glass is the difference between feeding people and hosting them. This carafe pours clean from a precision lip, the tumblers stack, and everything is dishwasher safe. Breakfast juice to bedside water — one set, every occasion.",
    specs: {
      Carafe: "1.2 litres",
      Tumblers: "4 × 300 ml",
      Material: "Lead-free glass",
      Care: "Dishwasher safe",
    },
    images: ["/products/glass-carafe-set.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "p-highball-glasses",
    name: "Highball Glasses — Set of 6",
    slug: "highball-glasses",
    categorySlug: "serveware",
    priceRwf: 32_000,
    shortDescription:
      "Six tall, heavy-based highballs — for iced tea, juice and long drinks that need room for ice.",
    description:
      "A proper highball is tall enough for ice to do its job and heavy enough at the base to feel like it belongs in your hand. These six are made from clarified glass that stays brilliant through hundreds of dishwasher cycles. The everyday glass, upgraded.",
    specs: {
      Set: "6 glasses",
      Capacity: "350 ml each",
      Material: "Clarified glass, weighted base",
      Care: "Dishwasher safe",
    },
    images: ["/products/highball-glasses.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:05:00Z",
  },
  {
    id: "p-whiskey-tumblers",
    name: "Whiskey Tumblers — Set of 4",
    slug: "whiskey-tumblers",
    categorySlug: "serveware",
    priceRwf: 38_000,
    shortDescription:
      "Four heavy-bottomed rocks glasses with a faceted base that catches the light.",
    description:
      "For the drinks you don't rush. These rocks glasses carry serious weight in the base — faceted so they throw light across the table — with a wide mouth that lets whatever you're pouring open up. Equally at home with a single large ice cube or a strong tonic.",
    specs: {
      Set: "4 glasses",
      Capacity: "300 ml each",
      Material: "Heavy-bottomed clarified glass",
      Care: "Dishwasher safe",
    },
    images: ["/products/whiskey-tumblers.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:10:00Z",
  },
  {
    id: "p-wine-glasses",
    name: "Stemmed Wine Glasses — Set of 6",
    slug: "stemmed-wine-glasses",
    categorySlug: "serveware",
    priceRwf: 54_000,
    shortDescription:
      "Six fine-rimmed, laser-cut stemmed glasses — the universal shape that flatters every bottle.",
    description:
      "One shape, every wine. These universal glasses have a laser-cut rim with no rolled lip — wine flows onto the palate instead of dropping — and a bowl proportioned to concentrate aromas whether you're pouring red, white or rosé. The stems are pulled, not joined, so there's no weak seam.",
    specs: {
      Set: "6 glasses",
      Capacity: "450 ml each",
      Rim: "Laser-cut, no rolled lip",
      Care: "Hand wash recommended",
    },
    images: ["/products/stemmed-wine-glasses.webp", "/products/stemmed-wine-glasses-2.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:15:00Z",
  },
  {
    id: "p-acacia-tray",
    name: "Acacia Serving Tray & Bowl Set",
    slug: "acacia-serving-tray",
    categorySlug: "serveware",
    priceRwf: 58_000,
    shortDescription:
      "A carved acacia tray with two matching bowls — fruit, snacks or the full grazing spread.",
    description:
      "Carved from single pieces of acacia, this tray-and-bowls set does the quiet work of making everything placed on it look intentional. Deep enough for fruit, wide enough for a full spread of snacks when guests arrive. The grain on every piece is one of one.",
    specs: {
      Set: "1 tray + 2 bowls",
      Material: "Solid carved acacia",
      Tray: "45 × 25 cm",
      Care: "Wipe clean, oil occasionally",
    },
    images: ["/products/acacia-serving-tray.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:20:00Z",
  },

  // ── Storage & Organisation ──────────────────────────────────
  {
    id: "p-airtight-jar",
    name: "Airtight Glass Jar — 1 L",
    slug: "airtight-glass-jar",
    categorySlug: "storage",
    priceRwf: 9_500,
    shortDescription:
      "Screw-top clarity for rice, beans, spices and flour — see what you have, keep it fresh.",
    description:
      "The pantry upgrade that costs less than lunch. A silicone-sealed screw lid keeps moisture and weevils out of rice, beans, flour and sugar, while the clear glass means you never buy a third bag of something you already had two of. Buy several — they line up beautifully.",
    specs: {
      Capacity: "1 litre",
      Material: "Glass, steel lid, silicone seal",
      Seal: "Airtight screw-top",
      Care: "Dishwasher safe (lid hand wash)",
    },
    images: ["/products/airtight-glass-jar.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:25:00Z",
  },
  {
    id: "p-atelier-canisters",
    name: "Atelier Ceramic Canister Set",
    slug: "atelier-canister-set",
    categorySlug: "storage",
    priceRwf: 65_000,
    shortDescription:
      "Speckled two-tone ceramic canisters — coffee, sugar and tea storage that deserves the counter.",
    description:
      "Storage you don't have to hide. Each Atelier canister is glazed in a two-tone speckled finish with an unglazed base band — the kind of piece that usually lives in design stores at triple the price. Keep coffee, sugar and tea within arm's reach and on display.",
    specs: {
      Set: "4 canisters, mixed sizes",
      Material: "Two-tone glazed ceramic",
      Finish: "Speckled, unglazed base band",
      Care: "Wipe clean",
    },
    images: ["/products/atelier-canister-set.webp"],
    featured: true,
    inStock: true,
    createdAt: "2026-07-01T09:30:00Z",
  },

  // ── Small Appliances ────────────────────────────────────────
  {
    id: "p-pro-blender",
    name: "Pro Countertop Blender — 1.5 L",
    slug: "pro-countertop-blender",
    categorySlug: "small-appliances",
    priceRwf: 95_000,
    shortDescription:
      "1000 W motor, hardened blades and a 1.5 L glass jug — smoothies, sauces and ibinyomoro juice in seconds.",
    description:
      "A blender either powers through or it doesn't. This one does: a 1000-watt motor spins hardened stainless blades fast enough to turn whole fruit, ice and greens into a genuinely smooth blend — no chunks, no stalling. The glass jug won't stain or hold odours like plastic, and the base wipes clean in seconds.",
    specs: {
      Motor: "1000 W",
      Jug: "1.5 L glass",
      Blades: "6-point hardened stainless",
      Speeds: "3 + pulse",
    },
    images: ["/products/pro-countertop-blender.webp"],
    featured: true,
    inStock: true,
    createdAt: "2026-07-01T09:35:00Z",
  },
  {
    id: "p-pressure-cooker",
    name: "8-in-1 Electric Pressure Cooker — 6 L",
    slug: "electric-pressure-cooker",
    categorySlug: "small-appliances",
    priceRwf: 135_000,
    shortDescription:
      "Pressure cook, slow cook, steam, sauté and more — beans in 30 minutes instead of 3 hours.",
    description:
      "The appliance that changes how a Rwandan kitchen runs. Dry beans go from bag to table in half an hour. Rice cooks itself while you handle everything else. Eight programmes cover pressure cooking, slow cooking, steaming, sautéing and warming, with ten safety mechanisms standing guard. Less charcoal, less gas, less waiting.",
    specs: {
      Capacity: "6 litres",
      Programmes: "8 cooking modes",
      Safety: "10 protection mechanisms",
      Power: "1000 W",
    },
    images: ["/products/electric-pressure-cooker.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:40:00Z",
  },
  {
    id: "p-drip-coffee-maker",
    name: "Drip Coffee Maker — 10 Cup",
    slug: "drip-coffee-maker",
    categorySlug: "small-appliances",
    priceRwf: 78_000,
    shortDescription:
      "Precision-temperature brewing with a glass carafe — do justice to Rwandan coffee at home.",
    description:
      "Rwanda grows some of the best coffee on earth; most of it gets brewed badly. This machine holds water at the correct extraction temperature and showers it evenly over the grounds — the two things cheap coffee makers never do. Ten cups per brew, a warming plate that doesn't scorch, and a carafe that pours clean.",
    specs: {
      Capacity: "10 cups / 1.25 L",
      "Brew temp": "92–96°C regulated",
      Carafe: "Glass with warming plate",
      Filter: "Reusable + paper compatible",
    },
    images: ["/products/drip-coffee-maker.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-07-01T09:45:00Z",
  },
  {
    id: "p-burr-grinder",
    name: "Precision Burr Coffee Grinder",
    slug: "burr-coffee-grinder",
    categorySlug: "small-appliances",
    priceRwf: 88_000,
    shortDescription:
      "Conical steel burrs with 40 grind settings — from French press to espresso-fine.",
    description:
      "Ground coffee starts dying the moment it's ground — which is why serious coffee people grind at home. Conical steel burrs crush beans uniformly instead of shattering them like blade grinders do, and 40 settings take you from coarse French press to espresso-fine. Pairs with our drip machine for the full home-café setup.",
    specs: {
      Burrs: "Conical hardened steel",
      Settings: "40 grind sizes",
      Hopper: "250 g beans",
      Timer: "Dose-by-seconds dial",
    },
    images: ["/products/burr-coffee-grinder.webp"],
    featured: false,
    inStock: false,
    createdAt: "2026-07-01T09:50:00Z",
  },
];
