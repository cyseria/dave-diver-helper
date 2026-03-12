import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EncyclopediaLayout } from "../components/EncyclopediaLayout";
import { TabBar } from "../components/TabBar";
import { fishData } from "../data/fish";
import { fishGuideModules } from "../data/fishGuideModules";
import { recipeData } from "../data/recipes";
import { usePlayerProgress } from "../store/usePlayerProgress";
import { getFishImageUrl } from "../utils/fishImage";
import styles from "./Fish.module.css";


// Used by tab bar (keyed by module id)
const FISH_MODULE_EMOJI: Record<string, string> = {
  "blue-hole-entrance": "🌊",
  "blue-hole-mid": "🛳️",
  "blue-hole-depths": "🐙",
  "night-only": "🌙",
  "glacier-passage": "🧊",
  "glacial-area": "❄️",
  "hydrothermal-vents": "🌋",
  seahorses: "🐴",
  "fish-trap": "🦞",
};

// Used by zone chips in detail panel (keyed by Chinese zone name)
const ZONE_EMOJI: Record<string, string> = {
  蓝洞入口: "🌊",
  蓝洞中层: "🛳️",
  蓝洞深海: "🐙",
  夜行性: "🌙",
  冰河通道: "🧊",
  冰河地区: "❄️",
  热泉喷出区域: "🌋",
  海马: "🐴",
  鱼笼: "🦞",
};

const FISH_MODULE_THEME: Record<
  string,
  { activeBg: string; activeBorder: string; activeColor: string; hoverBg: string }
> = {
  "blue-hole-entrance": {
    activeBg: "#e6f5ff",
    activeBorder: "#3b82f6",
    activeColor: "#1e3a8a",
    hoverBg: "rgba(59, 130, 246, 0.08)",
  },
  "blue-hole-mid": {
    activeBg: "#eafaf0",
    activeBorder: "#22c55e",
    activeColor: "#14532d",
    hoverBg: "rgba(34, 197, 94, 0.10)",
  },
  "blue-hole-depths": {
    activeBg: "#e0f2fe",
    activeBorder: "#0ea5e9",
    activeColor: "#0c4a6e",
    hoverBg: "rgba(14, 165, 233, 0.10)",
  },
  "night-only": {
    activeBg: "#f5f3ff",
    activeBorder: "#8b5cf6",
    activeColor: "#3730a3",
    hoverBg: "rgba(139, 92, 246, 0.10)",
  },
  "glacier-passage": {
    activeBg: "#eff6ff",
    activeBorder: "#60a5fa",
    activeColor: "#1e3a8a",
    hoverBg: "rgba(96, 165, 250, 0.10)",
  },
  "glacial-area": {
    activeBg: "#ecfeff",
    activeBorder: "#06b6d4",
    activeColor: "#155e75",
    hoverBg: "rgba(6, 182, 212, 0.10)",
  },
  "hydrothermal-vents": {
    activeBg: "#fff7ed",
    activeBorder: "#f97316",
    activeColor: "#9a3412",
    hoverBg: "rgba(249, 115, 22, 0.10)",
  },
  seahorses: {
    activeBg: "#fef9c3",
    activeBorder: "#f59e0b",
    activeColor: "#92400e",
    hoverBg: "rgba(245, 158, 11, 0.12)",
  },
  "fish-trap": {
    activeBg: "#fef2f2",
    activeBorder: "#ef4444",
    activeColor: "#991b1b",
    hoverBg: "rgba(239, 68, 68, 0.10)",
  },
};

const STAR_POSITIONS = [1, 2, 3] as const;

function zoneToMapZone(zoneName: string): "shallow" | "deep" | "binghe" {
  if (zoneName === "冰河通道" || zoneName === "冰河地区") return "binghe";
  if (zoneName === "热泉喷出区域") return "deep";
  return "shallow";
}

function StarRating({
  stars,
  captured,
  size = "sm",
  onRate,
  rootClassName,
  onRootClick,
  onRootKeyDown,
}: {
  stars: number;
  captured: boolean;
  size?: "sm" | "lg";
  onRate?: (n: number) => void;
  rootClassName?: string;
  onRootClick?: (e: React.MouseEvent) => void;
  onRootKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [animStar, setAnimStar] = useState<number | null>(null);
  const [hoverStar, setHoverStar] = useState<number | null>(null);

  const isUncaptureHint = captured && hoverStar === stars;

  const getSpanClass = (pos: number): string => {
    if (animStar === pos) return styles.starFilled;
    if (isUncaptureHint) {
      return pos <= stars ? styles.starWarning : styles.starGray;
    }
    if (hoverStar !== null) {
      return pos <= hoverStar ? styles.starPreview : styles.starGray;
    }
    return captured && pos <= stars ? styles.starFilled : styles.starGray;
  };

  const getTitle = (pos: number): string => {
    if (!captured) return `捕获并评为 ${pos} 星`;
    if (pos === stars) return "再次点击 → 取消捕获";
    return `改为 ${pos} 星`;
  };

  const handleClick = (pos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimStar(pos);
    onRate?.(pos);
    setTimeout(() => setAnimStar(null), 500);
  };

  const sizeClass = size === "lg" ? styles.starLg : styles.starSm;

  return (
    <div
      className={`${styles.starsTrack} ${size === "lg" ? styles.starsTrackLg : ""} ${rootClassName ?? ""}`.trim()}
      onMouseLeave={() => setHoverStar(null)}
      onClick={onRootClick}
      onKeyDown={onRootKeyDown as React.KeyboardEventHandler<HTMLDivElement>}
    >
      {STAR_POSITIONS.map((pos) => (
        <button
          key={pos}
          type="button"
          className={`${styles.starBtn} ${sizeClass} ${hoverStar !== null && pos <= hoverStar ? styles.starBtnHovered : ""} ${isUncaptureHint && pos <= stars ? styles.starBtnWarn : ""}`}
          onClick={(e) => handleClick(pos, e)}
          onMouseEnter={() => setHoverStar(pos)}
          title={getTitle(pos)}
        >
          <span
            className={`${getSpanClass(pos)} ${animStar === pos ? styles.starAnim : ""}`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function Fish() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    fishGuideModules[0]?.id ?? "blue-hole-entrance",
  );
  const {
    capturedFishIds,
    fishStarRatings,
    toggleFishCaptured,
    setFishStarRating,
  } = usePlayerProgress();

  const selected = id ? fishData.find((f) => f.id === id) : null;
  const relatedRecipes = selected
    ? recipeData.filter((r) => selected.recipeIds.includes(r.id))
    : [];

  const selectedModule =
    fishGuideModules.find((m) => m.id === selectedModuleId) ??
    fishGuideModules[0];

  // 顺序严格按 fishData（即 shallow / mid / depths 等文件中的书写顺序）
  const moduleFish = selectedModule
    ? fishData.filter((f) => f.zones?.includes(selectedModule.name))
    : fishData;

  // Default select first fish in current module (entering page or switching module)
  useEffect(() => {
    const first = moduleFish[0];
    if (!first) return;
    const inModule = id ? moduleFish.some((f) => f.id === id) : false;
    if (!id || !inModule) {
      navigate(`/fish/${first.id}`, { replace: true });
    }
  }, [id, navigate, moduleFish]);

  const getStars = (fishId: string, defaultStars: number) =>
    fishStarRatings[fishId] || defaultStars;

  const getTimeLabel = (time?: string) =>
    time === "night" ? "夜" : time === "day_night" ? "昼夜" : "昼";

  const habitatZones = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ id: string; name: string; emoji: string; mapZone: "shallow" | "deep" | "binghe" }> = [];
    for (const name of selected?.zones ?? []) {
      if (seen.has(name)) continue;
      seen.add(name);
      out.push({ id: name, name, emoji: ZONE_EMOJI[name] ?? "🗺️", mapZone: zoneToMapZone(name) });
    }
    return out;
  }, [selected?.zones]);

  const getCaptureTip = () => {
    if (!selected) return null;
    if (selected.note) return selected.note;
    if (selected.category === "seahorse") return "需要虫网捕捉";
    if (selected.category === "trap") return "只能使用鱼笼/蟹笼捕获";
    if (selected.category === "boss")
      return "建议先麻醉或用渔网捕获，避免损伤提升三星率";
    return selectedModule?.tips?.[0] ?? null;
  };

  const listPanel = (
    <div className={styles.listWrap}>
      <div className={styles.grid}>
        {moduleFish.map((fish) => {
          const captured = capturedFishIds.includes(fish.id);
          const isSelected = fish.id === id;
          const depthText =
            fish.depthMin !== undefined && fish.depthMax !== undefined
              ? `${fish.depthMin}-${fish.depthMax}m`
              : "—";
          return (
            <div
              key={fish.id}
              className={`${styles.card} ${captured ? styles.cardCaptured : ""} ${isSelected ? styles.cardSelected : ""}`}
              onClick={() => navigate(`/fish/${fish.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/fish/${fish.id}`)
              }
              title={fish.name}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: card with nested toggle button
              tabIndex={0}
            >
              <div className={styles.cardImg}>
                {(() => {
                  const src = getFishImageUrl(fish.image);
                  return src ? (
                    <div className={styles.cardImgCrop}>
                      <img src={src} alt="" className={styles.cardEmoji} />
                    </div>
                  ) : (
                    <span className={styles.cardEmoji}>{fish.image ?? fish.emoji}</span>
                  );
                })()}
                <StarRating
                  stars={getStars(fish.id, fish.stars)}
                  captured={captured}
                  size="sm"
                  rootClassName={styles.cardStarsPosition}
                  onRootClick={(e) => e.stopPropagation()}
                  onRootKeyDown={(e) => e.stopPropagation()}
                  onRate={(n) => {
                      const currentStars = getStars(fish.id, fish.stars);
                      if (!captured) {
                        toggleFishCaptured(fish.id);
                        setFishStarRating(fish.id, n);
                      } else if (currentStars === n) {
                        toggleFishCaptured(fish.id);
                        setFishStarRating(fish.id, 0);
                      } else {
                        setFishStarRating(fish.id, n);
                      }
                    }}
                />
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardName}>{fish.name}</span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardMetaItem}>{depthText}</span>
                  <span className={styles.cardMetaItem}>
                    {fish.time ? getTimeLabel(fish.time) : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const detailPanel = selected ? (
    <div className={styles.detail}>
      <div className={styles.detailTop}>
        <div className={styles.detailImgBox}>
          {(() => {
            const src = getFishImageUrl(selected.image);
            return src ? (
              <img src={src} alt="" className={styles.detailEmoji} />
            ) : (
              <span className={styles.detailEmoji}>{selected.image ?? selected.emoji}</span>
            );
          })()}
        </div>
        <div className={styles.detailInfo}>
          <StarRating
            stars={getStars(selected.id, selected.stars)}
            captured={capturedFishIds.includes(selected.id)}
            size="lg"
            onRate={(n) => {
              const isCaptured = capturedFishIds.includes(selected.id);
              const curStars = getStars(selected.id, selected.stars);
              if (!isCaptured) {
                toggleFishCaptured(selected.id);
                setFishStarRating(selected.id, n);
              } else if (curStars === n) {
                toggleFishCaptured(selected.id);
                setFishStarRating(selected.id, 0);
              } else {
                setFishStarRating(selected.id, n);
              }
            }}
          />
          <div className={styles.detailNameRow}>
            <h1 className={styles.detailName}>{selected.name}</h1>
            {selected.time && (
              <span className={`${styles.timeTag} ${styles[`timeTag_${selected.time}`]}`}>
                {getTimeLabel(selected.time)}
              </span>
            )}
          </div>
          <p className={styles.detailDesc}>
            {selected.description ?? "—"}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.captureBtn} ${capturedFishIds.includes(selected.id) ? styles.captureBtnOn : ""}`}
          onClick={() => toggleFishCaptured(selected.id)}
        >
          {capturedFishIds.includes(selected.id) ? "✓ 已捕获" : "标记已捕获"}
        </button>
      </div>

      <div className={styles.statsBlock}>
        {/* Row 1: HP + ATK（仅真实数据，无则显示 —，不做估算） */}
        <div className={styles.statPairRow}>
          <div className={styles.statCell}>
            <span className={styles.statEm}>❤️</span>
            <span className={styles.statLbl}>生命值</span>
            <span className={styles.statVal}>
              {selected.hp !== undefined ? selected.hp : "—"}
            </span>
          </div>
          <div className={styles.statCellDivider} />
          <div className={styles.statCell}>
            <span className={styles.statEm}>⚔️</span>
            <span className={styles.statLbl}>攻击力</span>
            <span className={styles.statVal}>
              {selected.attack !== undefined ? selected.attack : "—"}
            </span>
          </div>
        </div>
        <div className={styles.statDivider} />
        {/* Row 2: Region + Depth */}
        <div className={styles.statPairRow}>
          <div className={styles.statCell}>
            <span className={styles.statEm}>🗺️</span>
            <span className={styles.statLbl}>区域</span>
            <div className={styles.statChips}>
              {habitatZones.length > 0 ? (
                habitatZones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    className={styles.zoneChip}
                    onClick={() => navigate(`/map?zone=${z.mapZone}`)}
                    title="前往地图"
                  >
                    {z.emoji} {z.name} ↗
                  </button>
                ))
              ) : (
                <span className={styles.statValMuted}>—</span>
              )}
            </div>
          </div>
          <div className={styles.statCellDivider} />
          <div className={styles.statCell}>
            <span className={styles.statEm}>📏</span>
            <span className={styles.statLbl}>深度</span>
            <span className={styles.statVal}>
              {selected.depthMin !== undefined && selected.depthMax !== undefined
                ? `${selected.depthMin}–${selected.depthMax} m`
                : "—"}
            </span>
          </div>
        </div>
        <div className={styles.statDivider} />
        {/* Row 3: Weight + Meat by star（仅在有 meatByStar 时展示肉量） */}
        <div className={styles.statPairRow}>
          <div className={styles.statCell}>
            <span className={styles.statEm}>⚖️</span>
            <span className={styles.statLbl}>重量</span>
            <span className={styles.statVal}>
              {selected.weight != null ? `${selected.weight} kg` : "—"}
            </span>
          </div>
          {selected.meatByStar ? (
            <>
              <div className={styles.statCellDivider} />
              <div className={styles.statCell}>
                <span className={styles.statEm}>🥩</span>
                <span className={styles.statLbl}>掉落肉量</span>
                <div className={styles.meatByStar}>
                  <span className={styles.meatChip}>
                    <span className={styles.meatStar}>★</span>
                    <span className={styles.meatVal}>
                      {selected.meatByStar[0] === -1 ? "—" : selected.meatByStar[0]}
                    </span>
                  </span>
                  <span className={styles.meatChip}>
                    <span className={styles.meatStar}>★★</span>
                    <span className={styles.meatVal}>
                      {selected.meatByStar[1] === -1 ? "—" : selected.meatByStar[1]}
                    </span>
                  </span>
                  <span className={styles.meatChip}>
                    <span className={styles.meatStar}>★★★</span>
                    <span className={styles.meatVal}>
                      {selected.meatByStar[2] === -1 ? "—" : selected.meatByStar[2]}
                    </span>
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {getCaptureTip() ? (
        <div className={styles.tipCard}>
          <span className={styles.tipTitle}>⭐⭐⭐ 捕获技巧</span>
          <span className={styles.tipText}>{getCaptureTip()}</span>
        </div>
      ) : null}

      {relatedRecipes.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🍽️ 关联食谱</h3>
          <div className={styles.recipeRow}>
            {relatedRecipes.map((r) => (
              <button
                type="button"
                key={r.id}
                className={styles.recipeChip}
                onClick={() => navigate(`/recipes/${r.id}`)}
              >
                <span>{r.emoji}</span>
                <span>{r.name}</span>
                <span className={styles.recipePrice}>{r.sellPrice}金</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(selected.note || selected.habitat) && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📝 备注</h3>
          <div className={styles.notesList}>
            {selected.note && <span>• {selected.note}</span>}
            {selected.habitat && <span>• {selected.habitat}</span>}
          </div>
        </div>
      )}

    </div>
  ) : null;

  const fishTabs = fishGuideModules.map((module) => {
    const moduleFishList = fishData.filter((f) =>
      f.zones?.includes(module.name),
    );
    const capturedCount = moduleFishList.filter((f) =>
      capturedFishIds.includes(f.id),
    ).length;
    return {
      id: module.id,
      label: module.name,
      emoji: FISH_MODULE_EMOJI[module.id] ?? "🐟",
      count: `${capturedCount}/${moduleFishList.length}`,
    };
  });

  return (
    <div className={styles.page}>
      <div
        className={styles.fishTabWrap}
        style={
          {
            "--tab-active-bg":
              (FISH_MODULE_THEME[selectedModuleId] ?? FISH_MODULE_THEME["blue-hole-entrance"]).activeBg,
            "--tab-active-border":
              (FISH_MODULE_THEME[selectedModuleId] ?? FISH_MODULE_THEME["blue-hole-entrance"]).activeBorder,
            "--tab-active-color":
              (FISH_MODULE_THEME[selectedModuleId] ?? FISH_MODULE_THEME["blue-hole-entrance"]).activeColor,
            "--tab-hover-bg":
              (FISH_MODULE_THEME[selectedModuleId] ?? FISH_MODULE_THEME["blue-hole-entrance"]).hoverBg,
          } as React.CSSProperties
        }
      >
        <TabBar
          tabs={fishTabs}
          value={selectedModuleId}
          onChange={setSelectedModuleId}
          aria-label="鱼类图鉴区域"
        />
      </div>
      <EncyclopediaLayout
        listPanel={listPanel}
        detailPanel={detailPanel}
        hasSelection={!!selected}
        emptyMessage="← 从左侧选择一条鱼查看详情"
      />
    </div>
  );
}
