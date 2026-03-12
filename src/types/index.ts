export type WeaponType = "harpoon" | "spear_gun" | "net" | "rifle" | "none";

// ── Weapon Encyclopedia types ──────────────────────────────────────────────
export type WeaponCategory =
  | "rifle"
  | "triple"
  | "sniper"
  | "grenade"
  | "sticky"
  | "net_gun"
  | "dart"
  | "ice";
export type WeaponElement =
  | "none"
  | "fire"
  | "poison"
  | "lightning"
  | "shock"
  | "sleep"
  | "freeze"
  | "thunder";

export interface WeaponMaterial {
  name: string;
  qty: number;
  tip?: string; // how/where to obtain this material
}

export interface Weapon {
  id: string;
  name: string;
  emoji: string;
  category: WeaponCategory;
  tier: number; // 0=base, 1/2/3=upgrade level
  damage: string; // e.g. "15" or "11~33"
  range: number;
  ammo: number | null; // null = ∞
  element: WeaponElement;
  effect: string; // description / special effect
  parentId: string | null; // upgrade-from weapon id
  materials: WeaponMaterial[];
  goldCost: number;
  tips?: string[]; // tips for rare material acquisition
}
export type Rarity = "common" | "uncommon" | "rare" | "legendary";
export type MarkerType = "fish" | "treasure" | "boss";
export type FishTime = "day" | "night" | "day_night";
export type FishCategory =
  | "normal"
  | "photo"
  | "boss"
  | "seahorse"
  | "trap";

export interface Fish {
  id: string;
  name: string;
  emoji: string;
  /** 展示图，当前可用 emoji；后续可改为图片路径供页面读取 */
  image: string;
  stars: number; // 1–5 stars
  depthMin?: number;
  depthMax?: number;
  hp?: number;
  attack?: number;
  recommendedWeapon?: WeaponType;
  rarity?: Rarity;
  recipeIds: string[];
  description?: string;
  rank?: number; // Marinca rank
  time?: FishTime;
  zones?: string[]; // module ids
  habitat?: string; // sub-area note
  category?: FishCategory;
  note?: string; // special note / capture tip
  /** 重量（kg） */
  weight?: number;
  /** 按星级掉落肉量 [1星, 2星, 3星]，-1 表示该星级无数据，前端展示为 — */
  meatByStar?: [number, number, number];
}

export interface FishGuideModule {
  id: string;
  name: string;
  description: string;
  tips?: string[];
  fishIds: string[];
  sources?: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  quantity: number;
  location: string; // e.g. "0–50m", "遭难船内部", "张戈"
  fishId?: string; // if it's a fish ingredient, link to fish page
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  level: number; // required restaurant level
  sellPrice: number;
  tastiness: number; // 美味度
  servings: number; // 出餐量
  artisanFlameCost?: number; // 工匠之火（用于研究/解锁新食谱的消耗）
  obtainMethod: string; // 获取方式
  description: string;
  ingredients: Ingredient[];
}

export type StaffRole = "kitchen" | "hall" | "dispatch";
export type StaffTier = "S" | "A" | "B";

export interface StaffSkill {
  level: 3 | 5 | 7 | 10 | 15;
  name: string;
  description: string;
  isDish?: boolean; // true = unlocks a recipe, false = passive skill
}

export interface Staff {
  id: string;
  name: string;
  emoji: string;
  role: StaffRole;
  tier: StaffTier;
  hiringFee: number;
  dailyWage: number; // per night at Lv.1
  skills: StaffSkill[];
  maxStats: {
    cooking: number;
    serving: number;
    procure: number;
    appeal: number;
  };
  description: string;
  recommendTip?: string; // shown for S/A tier staff
}

export interface RestaurantTier {
  id: string;
  name: string;
  emoji: string;
  color: string;
  normalSeats: number;
  nightSeats: number | null;
  hallStaff: number;
  kitchenStaff: number;
}

// ── Quest types ────────────────────────────────────────────────────────────
export type QuestType = "main" | "sub" | "vip";

export interface QuestBoss {
  name: string;
  tips: string[];
}

export interface Quest {
  id: string;
  chapterId: string;
  name: string;
  emoji: string;
  type: QuestType;
  description: string;
  objectives: string[];
  tips: string[];
  reward?: string;
  boss?: QuestBoss;
}

export interface QuestChapter {
  id: string;
  order: number; // 0 = prologue, 1–7 = chapters, 99 = epilogue
  name: string;
  emoji: string;
  summary: string;
}

export interface MapLocation {
  id: string;
  name: string;
  type: MarkerType;
  depth: number;
  x: number;
  relatedFishIds: string[];
  description: string;
}
