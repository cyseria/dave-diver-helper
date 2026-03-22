import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EncyclopediaLayout } from "../../components/EncyclopediaLayout";
import { fishData } from "../../data/fish";
import { recipeData } from "../../data/recipes";
import { useIsMobile } from "../../hooks/useIsMobile";
import { usePlayerProgress } from "../../store/usePlayerProgress";
import type { Fish, Recipe } from "../../types";
import { getFishImageUrl } from "../../utils/fishImage";
import { resolveIngredientFishIdFromName } from "../../utils/ingredientFishResolve";
import styles from "./Recipes.module.css";

type RecipeSortKey = "sellPrice" | "tastiness";

type PartyFoodKey = "all" | NonNullable<Recipe["partyFood"]>;
const PARTY_FOOD_OPTIONS: Array<{ value: PartyFoodKey; label: string }> = [
  { value: "all", label: "全部" },
  { value: "水母", label: "水母派对" },
  { value: "金枪鱼", label: "金枪鱼派对" },
  { value: "旗鱼", label: "旗鱼派对" },
  { value: "鲨鱼", label: "鲨鱼派对" },
  { value: "黄瓜", label: "黄瓜派对" },
  { value: "虾", label: "虾派对" },
  { value: "龙虾", label: "龙虾派对" },
  { value: "咖喱", label: "咖喱派对" },
];

const PARTY_FOOD_EMOJI: Record<NonNullable<Recipe["partyFood"]>, string> = {
  水母: "🪼",
  金枪鱼: "🐟",
  旗鱼: "⚔️",
  鲨鱼: "🦈",
  黄瓜: "🥒",
  虾: "🦐",
  龙虾: "🦞",
  咖喱: "🍛",
};

// ── Component ─────────────────────────────────────────────────────────────────

const fishById = (() => {
  const m = new Map<string, Fish>();
  for (const f of fishData) m.set(f.id, f);
  return m;
})();

export function Recipes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sortKey, setSortKey] = useState<RecipeSortKey>("sellPrice");
  const [partyFilter, setPartyFilter] = useState<PartyFoodKey>("all");
  const [starOnly, setFeaturedOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { capturedFishIds, recipeEnhanceLevels, setRecipeEnhanceLevel } =
    usePlayerProgress();

  /** 与首页一致：强化等级 ≥1 视为已解锁食谱 */
  const isRecipeUnlocked = useCallback(
    (r: Recipe) => (recipeEnhanceLevels[r.id] ?? 0) >= 1,
    [recipeEnhanceLevels],
  );

  const totalRecipes = recipeData.length;
  const unlockedCount = useMemo(
    () => recipeData.filter((r) => isRecipeUnlocked(r)).length,
    [isRecipeUnlocked],
  );

  const selected = id ? (recipeData.find((r) => r.id === id) ?? null) : null;
  const selectedUnlocked = selected ? isRecipeUnlocked(selected) : false;

  const sortedRecipes = useMemo<Recipe[]>(() => {
    const copy = [...recipeData];
    if (sortKey === "sellPrice") {
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
  }, [sortKey]);

  const visibleRecipes = useMemo<Recipe[]>(() => {
    return sortedRecipes.filter((r) => {
      const partyMatch = partyFilter === "all" || r.partyFood === partyFilter;
      const starMatch = !starOnly || r.star === true;
      return partyMatch && starMatch;
    });
  }, [partyFilter, starOnly, sortedRecipes]);

  // Default select first recipe
  useEffect(() => {
    if (isMobile) return;
    if (id) return;
    const first = visibleRecipes[0];
    if (!first) return;
    navigate(`/recipes/${first.id}`, { replace: true });
  }, [id, isMobile, visibleRecipes, navigate]);

  useEffect(() => {
    if (!isMobile) setShowMobileFilters(false);
  }, [isMobile]);

  // When party filter changes, keep the selected recipe in sync with visible list.
  useEffect(() => {
    if (!id) return;
    // Use `selected` (derived from URL id) for sync decision instead of relying
    // on `visibleRecipes` by id, because duplicate ids could cause mismatch.
    if (!selected) return;
    const partyMatch =
      partyFilter === "all" ? true : selected.partyFood === partyFilter;
    const starMatch = !starOnly || selected.star === true;
    const shouldMatch = partyMatch && starMatch;
    if (shouldMatch) return;
    const first = visibleRecipes[0];
    if (!first) return;
    navigate(`/recipes/${first.id}`, { replace: true });
  }, [id, partyFilter, starOnly, selected, visibleRecipes, navigate]);

  // ── List panel ──────────────────────────────────────────────────────────────
  const listPanel = (
    <div className={styles.listWrap}>
      <div className={styles.listHeader}>
        <div className={styles.listHeaderTop}>
          <div className={styles.listHeaderLeft}>
            <span className={styles.listTitle}>食谱图鉴</span>
            <span className={styles.listCount}>
              <span className={styles.countHighlight} title="与首页进度一致">
                🍣 {unlockedCount}/{totalRecipes}
              </span>
              {" · "}
              {visibleRecipes.length} 条
              {" · "}
              {partyFilter === "all" ? "全部" : `${partyFilter}派对`}
            </span>
          </div>
          {isMobile ? (
            <button
              type="button"
              className={styles.mobileFilterToggle}
              onClick={() => setShowMobileFilters((v) => !v)}
            >
              {showMobileFilters ? "收起筛选" : "筛选"}
            </button>
          ) : null}
        </div>
        <div
          className={`${styles.listHeaderRight} ${isMobile && !showMobileFilters ? styles.listHeaderRightCollapsed : ""}`}
        >
          <label className={styles.sortWrap}>
            <span className={styles.sortLabel}>排序</span>
            <select
              className={styles.sortSelect}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as RecipeSortKey)}
            >
              <option value="sellPrice">出售价格（高→低）</option>
              <option value="tastiness">美味度（高→低）</option>
            </select>
          </label>
          <label className={styles.sortWrap}>
            <span className={styles.sortLabel}>派对</span>
            <select
              className={styles.sortSelect}
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value as PartyFoodKey)}
            >
              {PARTY_FOOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={`${styles.featureToggle} ${starOnly ? styles.featureToggleActive : ""}`}
            onClick={() => setFeaturedOnly((v) => !v)}
            aria-pressed={starOnly}
            title="仅显示星标推荐菜谱"
          >
            ⭐ 星标
          </button>
        </div>
      </div>
      <div className={styles.grid}>
        {visibleRecipes.map((recipe, index) => {
          const isSelected = recipe.id === id;
          const unlocked = isRecipeUnlocked(recipe);
          return (
            <div
              key={`${recipe.id}-${index}`}
              className={`${styles.card} ${recipe.star ? styles.cardFeatured : ""} ${isSelected ? styles.cardSelected : ""} ${unlocked ? styles.cardRecipeUnlocked : ""}`}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/recipes/${recipe.id}`)
              }
              // biome-ignore lint/a11y/noNoninteractiveTabindex: card is a clickable list item
              tabIndex={0}
            >
              {recipe.partyFood ? (
                <div className={styles.partyEmojiTag} aria-hidden="true">
                  {PARTY_FOOD_EMOJI[recipe.partyFood]}
                </div>
              ) : null}
              <div className={styles.cardImg}>
                {(() => {
                  const imgUrl = recipe.imageUrl;
                  return imgUrl ? (
                    <img src={imgUrl} alt="" className={styles.cardImgPhoto} />
                  ) : // Party cards should show emoji only in the top-left tag.
                  recipe.partyFood ? null : (
                    <span className={styles.cardEmoji}>{recipe.emoji}</span>
                  );
                })()}
                <button
                  type="button"
                  className={`${styles.cardRecipeStamp} ${unlocked ? styles.cardRecipeStampOn : styles.cardRecipeStampOff}`}
                  title={unlocked ? "已解锁（点击取消）" : "点击标记已解锁"}
                  aria-label={unlocked ? "已解锁" : "未解锁"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecipeEnhanceLevel(recipe.id, unlocked ? 0 : 1);
                  }}
                >
                  {unlocked ? "✓" : "+"}
                </button>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardName}>{recipe.name}</span>
                <div className={styles.cardStatsRow}>
                  <span className={styles.cardStat}>
                    💰 {recipe.sellPrice}
                  </span>
                  <span className={styles.cardStat}>
                    😋 {recipe.tastiness}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Detail panel ────────────────────────────────────────────────────────────
  const detailPanel = selected ? (
    <div className={styles.detail}>
      {/* ── Header ── */}
      <div className={styles.detailTop}>
        <div className={styles.detailImgBox}>
          {(() => {
            const imgUrl = selected.imageUrl;
            return imgUrl ? (
              <img src={imgUrl} alt="" className={styles.detailImgPhoto} />
            ) : (
              <span className={styles.detailEmoji}>{selected.emoji}</span>
            );
          })()}
        </div>
        <div className={styles.detailMeta}>
          <h1 className={styles.detailName}>{selected.name}</h1>

          <div className={styles.detailBadges}>
            <span className={styles.priceBadge}>
              💰 {selected.sellPrice} 金
            </span>
            <span className={styles.tasteBadge}>
              😋 {selected.tastiness} 美味
            </span>
            <span className={styles.servingsBadge}>
              🍽️ {selected.servings} 碟子
            </span>
          </div>

          <p className={styles.detailDesc}>{selected.description}</p>
          {selected.obtainMethod?.trim() ? (
            <div className={styles.obtainRow}>
              <span className={styles.obtainIcon}>📖</span>
              <span className={styles.obtainVal}>{selected.obtainMethod}</span>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={`${styles.recipeMarkBtn} ${selectedUnlocked ? styles.recipeMarkBtnOn : ""}`}
          onClick={() =>
            setRecipeEnhanceLevel(selected.id, selectedUnlocked ? 0 : 1)
          }
        >
          {selectedUnlocked ? "✓ 已解锁" : "标记解锁"}
        </button>
      </div>

      <div className={styles.ingredSection}>
        <h3 className={styles.sectionTitle}>🥘 所需食材（每份）</h3>
        <div className={styles.ingredList}>
          {selected.ingredients.map((ing) => {
            const resolvedFishId =
              ing.fishId ?? resolveIngredientFishIdFromName(ing.name);
            const hasFish = resolvedFishId
              ? capturedFishIds.includes(resolvedFishId)
              : true;
            const linkedFish = resolvedFishId
              ? fishById.get(resolvedFishId)
              : undefined;
            const fishImgUrl = linkedFish
              ? getFishImageUrl(linkedFish.image)
              : null;
            return (
              <button
                type="button"
                key={`base-${ing.id}`}
                className={`${styles.ingredRow} ${!hasFish ? styles.ingredMissing : ""}`}
                onClick={() => {
                  if (resolvedFishId) navigate(`/fish/${resolvedFishId}`);
                }}
                disabled={!resolvedFishId}
              >
                <span className={styles.ingredThumb}>
                  {fishImgUrl ? (
                    <img
                      src={fishImgUrl}
                      alt=""
                      className={styles.ingredThumbImg}
                    />
                  ) : (
                    <span className={styles.ingredThumbEmoji}>{ing.emoji}</span>
                  )}
                </span>
                <div className={styles.ingredInfo}>
                  <span className={styles.ingredName}>{ing.name}</span>
                  <span className={styles.ingredLocation}>
                    📍 {ing.location}
                  </span>
                </div>
                <div className={styles.ingredRight}>
                  <span className={styles.ingredQty}>×{ing.quantity}</span>
                  {!hasFish && <span className={styles.missingTag}>缺</span>}
                </div>
              </button>
            );
          })}
        </div>
        {selected.ingredients.some((ing) => {
          const rid = ing.fishId ?? resolveIngredientFishIdFromName(ing.name);
          return rid && !capturedFishIds.includes(rid);
        }) && (
          <div className={styles.missingAlert}>
            ⚠️ 有食材尚未捕获，点击食材行可前往对应鱼类图鉴查看。
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className={styles.recipesPage}>
      <EncyclopediaLayout
        listPanel={listPanel}
        detailPanel={detailPanel}
        hasSelection={!!selected}
        emptyMessage="← 从左侧选择一个食谱查看详情"
        onRequestClose={() => navigate("/recipes", { replace: true })}
      />
    </div>
  );
}
