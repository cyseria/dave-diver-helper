import { useEffect, useState } from "react";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  WEAPON_CATEGORIES,
  weaponsData,
} from "../data/weapons";
import { TabBar } from "../components/TabBar";
import { usePlayerProgress } from "../store/usePlayerProgress";
import type { Weapon, WeaponCategory, WeaponElement } from "../types";
import styles from "./Weapons.module.css";

// ── Element config ────────────────────────────────────────────────────────
const ELEMENT_LABEL: Record<WeaponElement, string> = {
  none: "无属性",
  fire: "🔥 火焰",
  poison: "☠️ 毒液",
  lightning: "⚡ 闪电",
  shock: "⚡ 震荡",
  sleep: "😴 麻醉",
  freeze: "❄️ 冰冻",
  thunder: "🌩️ 雷霆",
};

const ELEMENT_CLASS: Record<WeaponElement, string> = {
  none: "elemNone",
  fire: "elemFire",
  poison: "elemPoison",
  lightning: "elemLightning",
  shock: "elemShock",
  sleep: "elemSleep",
  freeze: "elemFreeze",
  thunder: "elemThunder",
};

// ── Tree layout ───────────────────────────────────────────────────────────
const CARD_W = 158;
const CARD_H = 66;
const GAP_V = 10;
const COL_GAP = 46;

interface LayoutNode {
  weapon: Weapon;
  x: number;
  y: number;
  children: LayoutNode[];
}

function buildLayout(
  weaponId: string,
  all: Weapon[],
  col: number,
): { node: LayoutNode; height: number } {
  const weapon = all.find((w) => w.id === weaponId);
  if (!weapon)
    return {
      node: { weapon: all[0], x: 0, y: 0, children: [] },
      height: CARD_H,
    };

  const children = all.filter((w) => w.parentId === weaponId);
  const x = col * (CARD_W + COL_GAP);

  if (children.length === 0) {
    return { node: { weapon, x, y: 0, children: [] }, height: CARD_H };
  }

  let currentY = 0;
  const childNodes: LayoutNode[] = [];

  for (const child of children) {
    const { node: childNode, height } = buildLayout(child.id, all, col + 1);
    childNodes.push(shiftNode(childNode, 0, currentY));
    currentY += height + GAP_V;
  }

  const totalHeight = currentY - GAP_V;
  const centerY = (totalHeight - CARD_H) / 2;

  return {
    node: { weapon, x, y: centerY, children: childNodes },
    height: Math.max(CARD_H, totalHeight),
  };
}

function shiftNode(node: LayoutNode, dx: number, dy: number): LayoutNode {
  return {
    ...node,
    x: node.x + dx,
    y: node.y + dy,
    children: node.children.map((c) => shiftNode(c, dx, dy)),
  };
}

function flattenNodes(node: LayoutNode): LayoutNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

function connectorPath(from: LayoutNode, to: LayoutNode): string {
  const x1 = from.x + CARD_W;
  const y1 = from.y + CARD_H / 2;
  const x2 = to.x;
  const y2 = to.y + CARD_H / 2;
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`;
}

function collectConnectors(node: LayoutNode): { path: string; key: string }[] {
  const result: { path: string; key: string }[] = [];
  for (const child of node.children) {
    result.push({
      path: connectorPath(node, child),
      key: `${node.weapon.id}-${child.weapon.id}`,
    });
    result.push(...collectConnectors(child));
  }
  return result;
}

// ── Weapon Tree Component ─────────────────────────────────────────────────
interface WeaponTreeProps {
  category: WeaponCategory;
  selectedId: string | null;
  ownedIds: string[];
  onSelect: (w: Weapon) => void;
  onToggle: (id: string) => void;
}

function WeaponTree({
  category,
  selectedId,
  ownedIds,
  onSelect,
  onToggle,
}: WeaponTreeProps) {
  const inCat = weaponsData.filter((w) => w.category === category);
  const inCatIds = new Set(inCat.map((w) => w.id));
  const root = inCat.find(
    (w) => w.parentId === null || !inCatIds.has(w.parentId ?? ""),
  );

  if (!root) return <div className={styles.emptyTree}>暂无数据</div>;

  const { node: rootNode, height } = buildLayout(root.id, inCat, 0);
  const allNodes = flattenNodes(rootNode);
  const connectors = collectConnectors(rootNode);
  const maxX = Math.max(...allNodes.map((n) => n.x + CARD_W));
  const totalH = height + 24;
  const totalW = maxX + 16;

  return (
    <div
      className={styles.treeScroll}
      style={{ minWidth: totalW, minHeight: totalH }}
    >
      {/* SVG connector lines */}
      <svg
        className={styles.treeSvg}
        width={totalW}
        height={totalH}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {connectors.map(({ path, key }) => (
          <path
            key={key}
            d={path}
            stroke="#c8b090"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5 3"
          />
        ))}
      </svg>

      {/* Weapon cards */}
      {allNodes.map((n) => {
        const owned = ownedIds.includes(n.weapon.id);
        const isSelected = n.weapon.id === selectedId;
        const elemCls = ELEMENT_CLASS[n.weapon.element];

        return (
          <div
            key={n.weapon.id}
            className={`${styles.treeCard} ${owned ? styles.treeCardOwned : styles.treeCardUnowned} ${isSelected ? styles.treeCardSelected : ""}`}
            style={{ left: n.x, top: n.y, width: CARD_W, height: CARD_H }}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard-accessible tree node
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(n.weapon)}
            onClick={() => onSelect(n.weapon)}
          >
            {/* Owned toggle */}
            <button
              type="button"
              className={`${styles.treeCardCheck} ${owned ? styles.treeCardCheckOn : ""}`}
              title={owned ? "取消拥有" : "标记已拥有"}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(n.weapon.id);
              }}
            >
              {owned ? "✓" : ""}
            </button>

            {/* Emoji + info */}
            <span className={styles.treeCardEmoji}>{n.weapon.emoji}</span>
            <div className={styles.treeCardInfo}>
              <span className={styles.treeCardName}>{n.weapon.name}</span>
              <div className={styles.treeCardMeta}>
                {n.weapon.element !== "none" && (
                  <span className={`${styles.treeCardElem} ${styles[elemCls]}`}>
                    {ELEMENT_LABEL[n.weapon.element].split(" ")[0]}
                  </span>
                )}
                <span className={styles.treeCardDmg}>⚔️{n.weapon.damage}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────
interface DetailPanelProps {
  weapon: Weapon;
  ownedIds: string[];
  onToggle: (id: string) => void;
}

function buildChain(weapon: Weapon, all: Weapon[]): Weapon[] {
  const chain: Weapon[] = [];
  let cur: Weapon | undefined = weapon;
  while (cur) {
    chain.unshift(cur);
    const pid = cur.parentId;
    cur = pid ? all.find((w) => w.id === pid) : undefined;
  }
  return chain;
}

function DetailPanel({ weapon, ownedIds, onToggle }: DetailPanelProps) {
  const owned = ownedIds.includes(weapon.id);
  const chain = buildChain(weapon, weaponsData);
  const children = weaponsData.filter((w) => w.parentId === weapon.id);
  const elemClass = ELEMENT_CLASS[weapon.element];

  return (
    <div className={styles.detail}>
      {/* Header */}
      <div className={styles.detailHeader}>
        <span className={styles.detailEmoji}>{weapon.emoji}</span>
        <div className={styles.detailMeta}>
          <h2 className={styles.detailName}>{weapon.name}</h2>
          <div className={styles.detailBadges}>
            <span className={`${styles.elemBadge} ${styles[elemClass]}`}>
              {ELEMENT_LABEL[weapon.element]}
            </span>
            <span className={styles.tierBadge}>Tier {weapon.tier}</span>
          </div>
        </div>
        <button
          type="button"
          className={`${styles.ownedToggle} ${owned ? styles.ownedToggleOn : ""}`}
          onClick={() => onToggle(weapon.id)}
        >
          {owned ? "✓ 已拥有" : "+ 标记拥有"}
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>⚔️ 伤害</span>
          <span className={styles.statValue}>{weapon.damage}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>📏 射程</span>
          <span className={styles.statValue}>{weapon.range}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>🔋 弹药</span>
          <span className={styles.statValue}>
            {weapon.ammo === null ? "∞" : weapon.ammo}
          </span>
        </div>
      </div>

      {/* Effect */}
      <div className={styles.effectBox}>
        <span className={styles.sectionLabel}>武器效果</span>
        <p className={styles.effectText}>{weapon.effect}</p>
      </div>

      {/* Upgrade chain */}
      <div className={styles.chainBox}>
        <span className={styles.sectionLabel}>升级路线</span>
        <div className={styles.chainRow}>
          {chain.map((w, i) => (
            <span key={w.id} className={styles.chainItem}>
              {i > 0 && <span className={styles.chainArrow}>→</span>}
              <span
                className={
                  w.id === weapon.id
                    ? styles.chainCurrent
                    : styles.chainAncestor
                }
              >
                {w.name}
              </span>
            </span>
          ))}
          {children.length > 0 && (
            <>
              <span className={styles.chainArrow}>→</span>
              <span className={styles.chainNext}>
                {children.map((c) => c.name).join(" / ")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Materials */}
      {weapon.goldCost > 0 && (
        <div className={styles.materialsBox}>
          <span className={styles.sectionLabel}>制作素材</span>
          <div className={styles.materialList}>
            {weapon.materials.map((mat) => (
              <div key={mat.name} className={styles.materialRow}>
                <span className={styles.matName}>{mat.name}</span>
                <span className={styles.matQty}>×{mat.qty}</span>
                {mat.tip && (
                  <span className={styles.matTipIcon} title={mat.tip}>
                    💡
                  </span>
                )}
              </div>
            ))}
            <div className={`${styles.materialRow} ${styles.goldRow}`}>
              <span className={styles.matName}>💰 金币</span>
              <span className={styles.matQty}>
                {weapon.goldCost.toLocaleString()}
              </span>
            </div>
          </div>

          {weapon.materials.some((m) => m.tip) && (
            <div className={styles.matTipsExpanded}>
              {weapon.materials
                .filter((m) => m.tip)
                .map((m) => (
                  <div key={m.name} className={styles.matTipRow}>
                    <span className={styles.matTipName}>📍 {m.name}</span>
                    <span className={styles.matTipText}>{m.tip}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {weapon.goldCost === 0 && (
        <div className={styles.freeBox}>🎁 初始武器，游戏开始时自动获得</div>
      )}

      {weapon.tips && weapon.tips.length > 0 && (
        <div className={styles.tipsBox}>
          <span className={styles.sectionLabel}>💡 技巧与提示</span>
          <ul className={styles.tipsList}>
            {weapon.tips.map((tip) => (
              <li key={tip} className={styles.tipItem}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export function Weapons() {
  const [category, setCategory] = useState<WeaponCategory>("rifle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { ownedWeaponIds, toggleWeaponOwned } = usePlayerProgress();

  const selected = selectedId
    ? (weaponsData.find((w) => w.id === selectedId) ?? null)
    : null;
  const inCat = weaponsData.filter((w) => w.category === category);
  const ownedInCat = inCat.filter((w) => ownedWeaponIds.includes(w.id)).length;
  const ownedByCat: Record<WeaponCategory, { owned: number; total: number }> =
    WEAPON_CATEGORIES.reduce(
      (acc, cat) => {
        const list = weaponsData.filter((w) => w.category === cat);
        acc[cat] = {
          total: list.length,
          owned: list.filter((w) => ownedWeaponIds.includes(w.id)).length,
        };
        return acc;
      },
      {} as Record<WeaponCategory, { owned: number; total: number }>,
    );

  function handleCategoryChange(cat: WeaponCategory) {
    setCategory(cat);
    setSelectedId(null);
  }

  // Default select the first root weapon in category
  useEffect(() => {
    if (selectedId) return;
    const roots = inCat.filter((w) => w.parentId === null);
    const first = roots[0] ?? inCat[0];
    if (!first) return;
    setSelectedId(first.id);
  }, [category, selectedId, inCat]);

  const weaponTabs = WEAPON_CATEGORIES.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    emoji: CATEGORY_EMOJI[cat],
    count: `${ownedByCat[cat].owned}/${ownedByCat[cat].total}`,
  }));

  return (
    <div className={styles.page}>
      <TabBar
        tabs={weaponTabs}
        value={category}
        onChange={handleCategoryChange}
        aria-label="武器分类"
      />

      {/* Main area */}
      <div className={styles.mainArea}>
        {/* Tree panel */}
        <div className={styles.treePanel}>
          <div className={styles.treePanelHeader}>
            <span className={styles.treePanelTitle}>
              {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category]} 升级路线
            </span>
            <span className={styles.treePanelCount}>已拥有</span>
          </div>
          <div className={styles.treeScrollOuter}>
            <WeaponTree
              category={category}
              selectedId={selectedId}
              ownedIds={ownedWeaponIds}
              onSelect={(w) => setSelectedId(w.id)}
              onToggle={toggleWeaponOwned}
            />
          </div>
        </div>

        {/* Detail panel */}
        <div className={styles.detailPanel}>
          {selected ? (
            <DetailPanel
              weapon={selected}
              ownedIds={ownedWeaponIds}
              onToggle={toggleWeaponOwned}
            />
          ) : (
            <div className={styles.emptyDetail}>
              <span className={styles.emptyIcon}>🔫</span>
              <p>
                点击左侧树状图中的武器
                <br />
                查看详细信息
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
