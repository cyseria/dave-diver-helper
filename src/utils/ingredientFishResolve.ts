/**
 * 食谱食材名 → 鱼类图鉴 id（与 scripts/fill-recipe-ingredient-fish-ids.ts 规则一致）。
 * 用于有 fishId 时直接用；无 fishId 时按名称规则解析展示鱼图。
 */
import { fishData } from "../data/fish";

const NAME_SUFFIX = "肉片";

const ATLANTIC_BLUEFIN_PREFIX = "大西洋蓝鳍金枪鱼";
const BLUEFIN_CANON = "蓝鳍金枪鱼";

const TUNA_CUT_SUFFIXES = ["中腹肉", "大腹肉", "红肉", "大腹"] as const;

const NAME_ALIASES: Record<string, string> = {
  长尾鲨: "浅海长尾鲨",
  /** 食谱旧称 → 图鉴 fish.name */
  鹦鹉鱼: "驼峰大鹦嘴鱼",
  鹦嘴鱼: "驼峰大鹦嘴鱼",
  鮨鱼: "九带鮨",
  地中海天竺鲷: "欧洲天竺鲷",
  金拟花鮨: "侧带拟花鮨",
  霞蝶鱼: "多鳞霞蝶鱼",
  致幻鱼: "叉牙鲷",
  圆翅燕鱼: "圆眼燕鱼",
  蓝倒吊: "黄尾副刺尾鱼",
  叉斑锉鳞鲀: "黄带锉鳞鲀",
  鲳鲹: "斐氏鲳鲹",
  黄背若梅鲷: "黄背梅鲷",
  地中海鹦嘴鱼: "异齿鹦鲷",
  狮子鱼: "翱翔蓑鲉",
  拉马神仙鱼: "胄刺尻鱼",
  瘤鲷: "金黄突额隆头鱼",
  皇帝神仙鱼: "主刺盖鱼",
  黄鳐: "赤半魟",
  白对虾: "凡纳对虾",
  鳗鲶: "线纹鳗鲶",
  /** 中层图鉴更名后旧称 → 现 fish.name */
  蓝面鸳鸯鱼: "斯氏似弱棘鱼",
  脂眼鲹: "脂眼凹肩鲹",
  青条鳃棘鲈: "波伦氏九棘鲈",
  大梭鱼: "大魣",
  锯鲨: "长吻锯鲨",
  大西洋鮟鱇鱼: "大西洋安康鱼",
  红石蟹: "真方蟹",
};

const nameToId = (() => {
  const m = new Map<string, string>();
  for (const f of fishData) m.set(f.name, f.id);
  return m;
})();

function normalizeIngredientName(raw: string): string {
  return raw.replace(/（boss）$/u, "").trimEnd();
}

function normalizeAtlanticBluefin(n: string): string {
  if (n.startsWith(ATLANTIC_BLUEFIN_PREFIX)) {
    return BLUEFIN_CANON + n.slice(ATLANTIC_BLUEFIN_PREFIX.length);
  }
  return n;
}

function stripOneTunaCutSuffix(n: string): string {
  if (!n.includes("金枪鱼")) return n;
  for (const suf of TUNA_CUT_SUFFIXES) {
    if (n.endsWith(suf)) return n.slice(0, -suf.length);
  }
  return n;
}

function stripMeatSliceSuffix(n: string): string {
  if (!n.endsWith(NAME_SUFFIX)) return n;
  return n.slice(0, -NAME_SUFFIX.length);
}

function resolveFishIdFromBase(base: string): string | undefined {
  const official = NAME_ALIASES[base] ?? base;
  return nameToId.get(official);
}

/** 按与数据脚本相同的规则解析出 fish id；无法匹配则 undefined */
export function resolveIngredientFishIdFromName(
  ingredientName: string,
): string | undefined {
  let n = normalizeIngredientName(ingredientName);
  n = normalizeAtlanticBluefin(n);
  n = stripOneTunaCutSuffix(n);
  n = stripMeatSliceSuffix(n);
  if (n.length === 0) return undefined;
  return resolveFishIdFromBase(n);
}
