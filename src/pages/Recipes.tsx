import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EncyclopediaLayout } from "../components/EncyclopediaLayout";
import { TabBar } from "../components/TabBar";
import type { TabItem } from "../components/TabBar";
import { recipeData } from "../data/recipes";
import { usePlayerProgress } from "../store/usePlayerProgress";
import type { Recipe, Ingredient } from "../types";
import { RecipeTips } from "./RecipeTips";
import styles from "./Recipes.module.css";

type RecipesPageTab = "guide" | "tips";
const PAGE_TABS: TabItem<RecipesPageTab>[] = [
  { id: "guide", label: "食谱图鉴", emoji: "📖" },
  { id: "tips", label: "推荐", emoji: "⭐" },
];

type RecipeSortKey = "level" | "sellPrice" | "tastiness";

// ── Enhancement helpers ────────────────────────────────────────────────────────

/** Per-level upgrade cost tables: key = ingredient per-serving quantity tier */
const UPGRADE_COSTS: Record<number, number[]> = {
  1: [3, 4, 6, 10, 15, 22, 34, 51, 76],
  2: [4, 6, 10, 15, 22, 34, 51, 76, 115],
  3: [6, 9, 13, 20, 30, 45, 68, 102, 153],
  5: [9, 13, 20, 30, 45, 68, 102, 153, 230],
};

function getUpgradeCostTable(qty: number): number[] {
  if (qty <= 1) return UPGRADE_COSTS[1];
  if (qty === 2) return UPGRADE_COSTS[2];
  if (qty <= 4) return UPGRADE_COSTS[3];
  return UPGRADE_COSTS[5];
}

/** How many of `ingredient` are needed to upgrade from `fromLevel` to `fromLevel+1` (fromLevel: 1–9) */
function getUpgradeCost(ing: Ingredient, fromLevel: number): number {
  const table = getUpgradeCostTable(ing.quantity);
  return table[fromLevel - 1] ?? 0;
}

/** Price at enhancement level N (1–10). Current sellPrice in data = max level (10). */
function getPriceAtLevel(maxPrice: number, level: number): number {
  const base = maxPrice / 3.7;
  return Math.round(base * (1 + 0.3 * (level - 1)));
}

/** Tastiness at enhancement level N (1–10). */
function getTastinessAtLevel(maxTastiness: number, level: number): number {
  const base = maxTastiness / 3.7;
  return Math.round(base * (1 + 0.3 * (level - 1)));
}

const MAX_ENHANCE = 10;

// ── Component ─────────────────────────────────────────────────────────────────

export function Recipes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pageTab, setPageTab] = useState<RecipesPageTab>("guide");
  const [sortKey, setSortKey] = useState<RecipeSortKey>("level");
  const { recipeEnhanceLevels, setRecipeEnhanceLevel, capturedFishIds } =
    usePlayerProgress();

  const selected = id ? recipeData.find((r) => r.id === id) ?? null : null;

  // Current enhancement level for the selected recipe (defaults to 0 = not obtained)
  const currentEnhanceLevel = selected
    ? (recipeEnhanceLevels[selected.id] ?? 0)
    : 0;

  const sortedRecipes = useMemo<Recipe[]>(() => {
    const copy = [...recipeData];
    if (sortKey === "level") {
      copy.sort((a, b) => {
        const la = recipeEnhanceLevels[a.id] ?? 0;
        const lb = recipeEnhanceLevels[b.id] ?? 0;
        if (lb !== la) return lb - la;
        return a.name.localeCompare(b.name, "zh-Hans-CN");
      });
    } else if (sortKey === "sellPrice") {
      copy.sort((a, b) => {
        if (b.sellPrice !== a.sellPrice) return b.sellPrice - a.sellPrice;
        return a.name.localeCompare(b.name, "zh-Hans-CN");
      });
    } else {
      copy.sort((a, b) => {
        if (b.tastiness !== a.tastiness) return b.tastiness - a.tastiness;
        return a.name.localeCompare(b.name, "zh-Hans-CN");
      });
    }
    return copy;
  }, [sortKey, recipeEnhanceLevels]);

  // Default select first recipe when entering guide tab
  useEffect(() => {
    if (pageTab !== "guide") return;
    if (id) return;
    const first = sortedRecipes[0];
    if (!first) return;
    navigate(`/recipes/${first.id}`, { replace: true });
  }, [pageTab, id, sortedRecipes, navigate]);

  // Summary: how many obtained (level >= 1)
  const obtainedCount = useMemo(
    () => recipeData.filter((r) => (recipeEnhanceLevels[r.id] ?? 0) >= 1).length,
    [recipeEnhanceLevels],
  );

  // ── List panel ──────────────────────────────────────────────────────────────
  const listPanel = (
    <div className={styles.listWrap}>
      <div className={styles.listHeader}>
        <div className={styles.listHeaderLeft}>
          <span className={styles.listTitle}>食谱图鉴</span>
          <span className={styles.listCount}>
            <span className={styles.countHighlight}>{obtainedCount}</span>
            {" / "}
            {recipeData.length}
          </span>
        </div>
        <label className={styles.sortWrap}>
          <span className={styles.sortLabel}>排序</span>
          <select
            className={styles.sortSelect}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as RecipeSortKey)}
          >
            <option value="level">当前等级（高→低）</option>
            <option value="sellPrice">出售价格（高→低）</option>
            <option value="tastiness">美味度（高→低）</option>
          </select>
        </label>
      </div>
      <div className={styles.grid}>
        {sortedRecipes.map((recipe) => {
          const enhLv = recipeEnhanceLevels[recipe.id] ?? 0;
          const isSelected = recipe.id === id;
          const hasIt = enhLv >= 1;
          return (
            <div
              key={recipe.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ""} ${hasIt ? styles.cardOwned : ""}`}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/recipes/${recipe.id}`)
              }
              // biome-ignore lint/a11y/noNoninteractiveTabindex: card is a clickable list item
              tabIndex={0}
            >
              <div className={styles.cardImg}>
                <span className={styles.cardEmoji}>{recipe.emoji}</span>
                {enhLv === 0 && <span className={styles.lockOverlay}>🔒</span>}
                {enhLv >= 1 && (
                  <span className={styles.enhBadge}>Lv.{enhLv}</span>
                )}
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardName}>{recipe.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Detail panel ────────────────────────────────────────────────────────────
  const currentPrice =
    currentEnhanceLevel >= 1
      ? getPriceAtLevel(selected.sellPrice, currentEnhanceLevel)
      : null;

  const detailPanel = selected ? (
    <div className={styles.detail}>
      {/* ── Header ── */}
      <div className={styles.detailTop}>
        <div className={styles.detailImgBox}>
          <span className={styles.detailEmoji}>{selected.emoji}</span>
        </div>
        <div className={styles.detailMeta}>
          <h1 className={styles.detailName}>{selected.name}</h1>

          {/* Info badges: artisan flame + current price */}
          <div className={styles.detailBadges}>
            {selected.artisanFlameCost !== undefined && (
              <span className={styles.flameBadge}>
                🔥 {selected.artisanFlameCost} 工匠之火
              </span>
            )}
            {currentPrice !== null && (
              <span className={styles.priceBadge}>
                💰 {currentPrice} 金 · Lv.{currentEnhanceLevel}
              </span>
            )}
          </div>

          <p className={styles.detailDesc}>{selected.description}</p>
          <div className={styles.obtainRow}>
            <span className={styles.obtainIcon}>📖</span>
            <span className={styles.obtainVal}>{selected.obtainMethod}</span>
          </div>
        </div>

        {/* ── Level stepper (no border box) ── */}
        <div className={styles.levelWidget}>
          <div className={styles.levelWidgetRow}>
            <button
              type="button"
              className={styles.levelWidgetBtn}
              disabled={currentEnhanceLevel <= 0}
              onClick={() => setRecipeEnhanceLevel(selected.id, currentEnhanceLevel - 1)}
            >−</button>
            <span className={styles.levelWidgetVal}>
              {currentEnhanceLevel === 0 ? <span className={styles.levelWidgetNA}>未获得</span> : `Lv.${currentEnhanceLevel}`}
            </span>
            <button
              type="button"
              className={styles.levelWidgetBtn}
              disabled={currentEnhanceLevel >= MAX_ENHANCE}
              onClick={() => setRecipeEnhanceLevel(selected.id, currentEnhanceLevel + 1)}
            >＋</button>
          </div>
          <div className={styles.levelWidgetBar}>
            {Array.from({ length: MAX_ENHANCE }).map((_, i) => (
              <div
                key={`seg-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed array
                  i
                }`}
                className={`${styles.levelWidgetSeg} ${i < currentEnhanceLevel ? styles.levelWidgetSegFilled : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Ingredients first ── */}
      <div className={styles.ingredSection}>
        <h3 className={styles.sectionTitle}>🥘 所需食材（每份）</h3>
        <div className={styles.ingredList}>
          {selected.ingredients.map((ing) => {
            const hasFish = ing.fishId
              ? capturedFishIds.includes(ing.fishId)
              : true;
            return (
              <button
                type="button"
                key={`base-${ing.id}`}
                className={`${styles.ingredRow} ${!hasFish ? styles.ingredMissing : ""}`}
                onClick={() => {
                  if (ing.fishId) navigate(`/fish/${ing.fishId}`);
                }}
                disabled={!ing.fishId}
              >
                <span className={styles.ingredEmoji}>{ing.emoji}</span>
                <div className={styles.ingredInfo}>
                  <span className={styles.ingredName}>{ing.name}</span>
                  <span className={styles.ingredLocation}>📍 {ing.location}</span>
                </div>
                <div className={styles.ingredRight}>
                  <span className={styles.ingredQty}>×{ing.quantity}</span>
                  {!hasFish && <span className={styles.missingTag}>缺</span>}
                </div>
              </button>
            );
          })}
        </div>
        {selected.ingredients.some(
          (ing) => ing.fishId && !capturedFishIds.includes(ing.fishId),
        ) && (
          <div className={styles.missingAlert}>
            ⚠️ 有食材尚未捕获，点击食材行可前往对应鱼类图鉴查看。
          </div>
        )}
      </div>

      {/* ── Combined table: level | price | tastiness | upgrade costs ── */}
      <div className={styles.upgradeMatrixBlock}>
        <h3 className={styles.sectionTitle}>📊 各级别属性 & 升级消耗</h3>
        <div className={styles.upgradeMatrix}>
          <div className={`${styles.matrixRow} ${styles.matrixHead}`}>
            <span className={styles.matrixLvCell}>等级</span>
            <span className={styles.matrixNumCell}>💰 售价</span>
            <span className={styles.matrixNumCell}>😋 美味</span>
            {selected.ingredients.map((ing) => (
              <span key={ing.id} className={styles.matrixIngCell}>
                {ing.emoji}&nbsp;{ing.name}
              </span>
            ))}
          </div>
          {Array.from({ length: MAX_ENHANCE }).map((_, i) => {
            const lv = i + 1;
            const isCurrent = lv === currentEnhanceLevel;
            const isDone = lv < currentEnhanceLevel;
            return (
              <div
                key={`row-lv${lv}`}
                className={`${styles.matrixRow} ${isCurrent ? styles.matrixRowCurrent : ""} ${isDone ? styles.matrixRowDone : ""}`}
              >
                <span className={styles.matrixLvCell}>
                  Lv.{lv}{lv === MAX_ENHANCE ? " ★" : ""}
                </span>
                <span className={styles.matrixNumCell}>
                  {getPriceAtLevel(selected.sellPrice, lv)}
                </span>
                <span className={styles.matrixNumCell}>
                  {getTastinessAtLevel(selected.tastiness, lv)}
                </span>
                {selected.ingredients.map((ing) => (
                  <span key={ing.id} className={styles.matrixIngValCell}>
                    {lv === 1 ? "—" : getUpgradeCost(ing, lv - 1)}
                  </span>
                ))}
              </div>
            );
          })}
          <div className={`${styles.matrixRow} ${styles.matrixTotal}`}>
            <span className={styles.matrixLvCell}>满级累计</span>
            <span className={styles.matrixNumCell}>—</span>
            <span className={styles.matrixNumCell}>—</span>
            {selected.ingredients.map((ing) => {
              const table = getUpgradeCostTable(ing.quantity);
              const total = table.reduce((s, v) => s + v, 0);
              return (
                <span key={ing.id} className={styles.matrixIngValCell}>
                  {total}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={styles.recipesPage}>
      <TabBar
        tabs={PAGE_TABS}
        value={pageTab}
        onChange={setPageTab}
        aria-label="食谱页面切换"
      />
      {pageTab === "guide" ? (
        <EncyclopediaLayout
          listPanel={listPanel}
          detailPanel={detailPanel}
          hasSelection={!!selected}
          emptyMessage="← 从左侧选择一个食谱查看详情"
        />
      ) : (
        <RecipeTips />
      )}
    </div>
  );
}
