import { useState } from "react";
import { recipeData } from "../../data/recipes";
import styles from "./RecipeTips.module.css";

/* ─── Tag config ─────────────────────────────────────────── */

interface TagDef {
  id: string;
  label: string;
  emoji: string;
  themeKey: string;
}

const TAGS: TagDef[] = [
  { id: "mid",       label: "中期",     emoji: "🍱", themeKey: "mid"      },
  { id: "late",      label: "后期",     emoji: "💰", themeKey: "late"     },
  { id: "tuna",      label: "金枪鱼节", emoji: "🐟", themeKey: "tuna"     },
  { id: "sailfish",  label: "旗鱼节",   emoji: "⚔️", themeKey: "sailfish" },
  { id: "shrimp",    label: "黄瓜/虾节",emoji: "🦐", themeKey: "shrimp"   },
  { id: "shark",     label: "鲨鱼节",   emoji: "🦈", themeKey: "shark"    },
  { id: "lobster",   label: "龙虾节",   emoji: "🦞", themeKey: "lobster"  },
  { id: "jellyfish", label: "水母节",   emoji: "🪼", themeKey: "jellyfish"},
];

const TAG_MAP = Object.fromEntries(TAGS.map((t) => [t.id, t]));

const recipeImageByName = (() => {
  const map = new Map<string, string | null>();
  for (const r of recipeData) {
    map.set(r.name, r.imageUrl ?? null);
  }
  return map;
})();

/* ─── Unified card data ──────────────────────────────────── */

interface TipEntry {
  id: string;
  emoji: string;
  name: string;
  tags: string[];
  badge?: string;
  unlock?: string;
  highlight?: string;
  tip?: string;
  stats?: { price: number; tastiness: number; servings: number };
  ingredients: string;
}

const ENTRIES: TipEntry[] = [
  /* ── 日常 ── */
  {
    id: "daily-mid",
    emoji: "🍣",
    name: "华美特级寿司套餐",
    tags: ["mid"],
    badge: "👑 性价比之王",
    highlight: "升到 5 级就够用！大米直接从农场薅，食材成本近乎为零。",
    tip: "解锁后立刻升到 5 级，性价比远超同期其他食谱 💡",
    ingredients: "大米（农场） · 食材成本极低",
  },
  {
    id: "daily-crimson",
    emoji: "🍣",
    name: "绯红鱼卷",
    tags: ["late", "shark"],
    badge: "💰 财富密码 No.1",
    unlock: "比利 Lv.15 解锁",
    highlight: "分店开业后直接当镇店之宝！",
    tip: "渔场备齐就能躺赚！🎣",
    stats: { price: 1480, tastiness: 285, servings: 9 },
    ingredients: "银蛟×40 · 大斑鱼×30 · 红眼鲷×20（渔场养殖）",
  },
  {
    id: "daily-squid",
    emoji: "🦑",
    name: "烤三色鱿鱼",
    tags: ["late"],
    badge: "💰 财富密码 No.2",
    unlock: "小刘 Lv.15 解锁",
    highlight: "满级 12 份/盘！连海都不用下！",
    tip: "渔场养好鱿鱼全家就行 🌊",
    ingredients: "乌贼 · 吸血鱿鱼 · 孔雀鱿鱼 · 盐（渔场养殖 + 派送）",
  },

  /* ── 金枪鱼节 ── */
  {
    id: "tuna-rice",
    emoji: "🍱",
    name: "金枪鱼生鱼片盖饭",
    tags: ["tuna"],
    stats: { price: 1332, tastiness: 400, servings: 9 },
    ingredients: "大西洋蓝鳍金枪鱼×3 · 白米×3 · 鸡蛋×1 · 芝麻×1",
  },
  {
    id: "tuna-pepper",
    emoji: "🌶️",
    name: "辣椒金枪鱼",
    tags: ["tuna"],
    stats: { price: 1461, tastiness: 350, servings: 7 },
    ingredients: "大西洋蓝鳍金枪鱼×3 · 金枪鱼中肥×3 · 哈瓦那辣椒×2 · 海葡萄×2 · 芝麻×1",
  },

  /* ── 旗鱼节 ── */
  {
    id: "sailfish-seaweed",
    emoji: "🍲",
    name: "平鳍旗鱼炖海藻",
    tags: ["sailfish"],
    stats: { price: 1572, tastiness: 300, servings: 9 },
    ingredients: "平鳍旗鱼肉片×3 · 南部黄牛昆布×2 · 甘苔×2 · 酱油×1",
  },
  {
    id: "sailfish-truffle",
    emoji: "🍣",
    name: "鞑靼松露平鳍旗鱼",
    tags: ["sailfish"],
    stats: { price: 1461, tastiness: 350, servings: 7 },
    ingredients: "平鳍旗鱼肉片×3 · 紫海胆×2 · 松露×2",
  },

  /* ── 黄瓜/虾节 ── */
  {
    id: "shrimp-salad",
    emoji: "🥗",
    name: "醋拌菲尔德瓦普塔虾",
    tags: ["shrimp"],
    stats: { price: 1572, tastiness: 420, servings: 7 },
    ingredients: "菲尔德瓦普塔虾×3 · 黄瓜×2 · 黑角珊瑚×2 · 黑醋×1",
  },

  /* ── 鲨鱼节 ── */
  {
    id: "shark-miso",
    emoji: "🍜",
    name: "镰鳍鲳鲹味增汤",
    tags: ["shark"],
    stats: { price: 1554, tastiness: 382, servings: 7 },
    ingredients: "镰鳍鲳鲹×3 · 海带×3 · 海珊瑚×3 · 大酱×1",
  },
  {
    id: "shark-sandwich",
    emoji: "🥪",
    name: "松露鲨鱼三明治",
    tags: ["shark"],
    stats: { price: 1705, tastiness: 273, servings: 2 },
    ingredients: "皱鳃鲨肉片×3 · 巨口鲨肉片×3 · 松露×1",
  },

  /* ── 龙虾节 ── */
  {
    id: "lobster-platter",
    emoji: "🦞",
    name: "龙虾拼盘",
    tags: ["lobster"],
    stats: { price: 1609, tastiness: 375, servings: 6 },
    ingredients: "美洲龙虾×2 · 锦绣龙虾×2 · 抓都昆虫×2",
  },
  {
    id: "lobster-sashimi",
    emoji: "🍣",
    name: "松露蓝色龙虾尾生鱼片",
    tags: ["lobster"],
    stats: { price: 1716, tastiness: 282, servings: 2 },
    ingredients: "蓝色龙虾×2 · 松露×1",
  },
  {
    id: "lobster-egg",
    emoji: "🥚",
    name: "东部岩石龙虾鸡蛋羹",
    tags: ["lobster"],
    stats: { price: 1406, tastiness: 455, servings: 7 },
    ingredients: "东部岩石龙虾×2 · 鸡蛋×2 · 昆布×2",
  },

  /* ── 水母节 ── */
  {
    id: "jellyfish-salad",
    emoji: "🥗",
    name: "凉拌水母",
    tags: ["jellyfish"],
    stats: { price: 1480, tastiness: 298, servings: 6 },
    ingredients: "桶水母×5 · 蛋黄水母×5 · 大蒜×2 · 黑角珊瑚×2",
  },
];

/* ─── Sub-components ─────────────────────────────────────── */

function StatBadge({
  icon,
  value,
  label,
  variant,
}: {
  icon: string;
  value: number;
  label: string;
  variant: "price" | "taste" | "servings";
}) {
  return (
    <div className={`${styles.statBadge} ${styles[`stat_${variant}`]}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statBody}>
        <span className={styles.statVal}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: TipEntry }) {
  /* Primary theme comes from the first tag */
  const primaryTheme = entry.tags[0] ? TAG_MAP[entry.tags[0]]?.themeKey ?? "" : "";
  const imgUrl = recipeImageByName.get(entry.name) ?? null;

  return (
    <div className={`${styles.card} ${styles[`cardTheme_${primaryTheme}`]}`}>
      {/* Tag strip */}
      <div className={styles.cardTagStrip}>
        {entry.tags.map((tid) => {
          const t = TAG_MAP[tid];
          if (!t) return null;
          return (
            <span
              key={tid}
              className={`${styles.cardTag} ${styles[`tag_${t.themeKey}`]}`}
            >
              {t.emoji} {t.label}
            </span>
          );
        })}
      </div>

      {/* Main body */}
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          {imgUrl ? (
            <div className={styles.cardImgBox}>
              <img src={imgUrl} alt="" className={styles.cardImgPhoto} />
            </div>
          ) : (
            <span className={styles.cardEmoji}>{entry.emoji}</span>
          )}
          <div className={styles.cardNameWrap}>
            {entry.badge && (
              <span className={styles.cardBadge}>{entry.badge}</span>
            )}
            <span className={styles.cardName}>{entry.name}</span>
            {entry.unlock && (
              <span className={styles.cardUnlock}>🔓 {entry.unlock}</span>
            )}
          </div>
        </div>

        {entry.stats && (
          <div className={styles.cardStats}>
            <StatBadge icon="💰" value={entry.stats.price}     label="金"  variant="price"    />
            <StatBadge icon="😋" value={entry.stats.tastiness} label="美味" variant="taste"    />
            <StatBadge icon="🍽️" value={entry.stats.servings}  label="份"  variant="servings" />
          </div>
        )}

        {entry.highlight && (
          <p className={styles.cardHighlight}>⭐ {entry.highlight}</p>
        )}

        <div className={styles.cardIngredients}>{entry.ingredients}</div>

        {entry.tip && (
          <div className={styles.cardTip}>💡 {entry.tip}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */

export function RecipeTips() {
  const [activeTag, setActiveTag] = useState<string>("all");

  const filtered =
    activeTag === "all"
      ? ENTRIES
      : ENTRIES.filter((e) => e.tags.includes(activeTag));

  return (
    <div className={styles.outerPage}>
      <div className={styles.inner}>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <button
            type="button"
            className={`${styles.filterChip} ${activeTag === "all" ? styles.filterChipActive : ""}`}
            onClick={() => setActiveTag("all")}
          >
            🍽️ 全部
            <span className={styles.filterCount}>{ENTRIES.length}</span>
          </button>
          {TAGS.map((t) => {
            const count = ENTRIES.filter((e) => e.tags.includes(t.id)).length;
            if (count === 0) return null;
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.filterChip} ${styles[`filterChip_${t.themeKey}`]} ${activeTag === t.id ? styles.filterChipActive : ""}`}
                onClick={() => setActiveTag(t.id)}
              >
                {t.emoji} {t.label}
                <span className={styles.filterCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        <div className={styles.grid}>
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>

      </div>
    </div>
  );
}
