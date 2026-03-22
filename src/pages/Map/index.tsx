import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TabBar } from "../../components/TabBar";
import type { TabItem } from "../../components/TabBar";
import { useIsMobile } from "../../hooks/useIsMobile";

/* ── Image imports ───────────────────────────────────────── */
// Shallow sea – 圆角悬崖
import yuanjiao1 from "../../images/maps/shallow-sea/圆角悬崖/1.jpeg";
import yuanjiao2 from "../../images/maps/shallow-sea/圆角悬崖/2.jpeg";
// Shallow sea – 海草
import haicao1 from "../../images/maps/shallow-sea/海草/1.jpeg";
import haicao2 from "../../images/maps/shallow-sea/海草/2.jpeg";
import haicao3 from "../../images/maps/shallow-sea/海草/3.jpeg";
// Shallow sea – 海葵
import haikui1 from "../../images/maps/shallow-sea/海葵/1.jpeg";
import haikui2 from "../../images/maps/shallow-sea/海葵/2.jpeg";
import haikui3 from "../../images/maps/shallow-sea/海葵/3.jpeg";
// Shallow sea – 珊瑚
import shanhu1 from "../../images/maps/shallow-sea/珊瑚/1.jpeg";
import shanhu2 from "../../images/maps/shallow-sea/珊瑚/2.jpeg";
import shanhu3 from "../../images/maps/shallow-sea/珊瑚/3.jpeg";
// Shallow sea – 直角悬崖
import zhijiao1 from "../../images/maps/shallow-sea/直角悬崖/1.jpeg";
import zhijiao2 from "../../images/maps/shallow-sea/直角悬崖/2.jpeg";
import zhijiao3 from "../../images/maps/shallow-sea/直角悬崖/3.jpeg";
import zhijiao4 from "../../images/maps/shallow-sea/直角悬崖/4.jpeg";
// Deep sea
import deepSea1 from "../../images/maps/deepsea/IMG_2119.jpg";
import deepSea2 from "../../images/maps/deepsea/IMG_2120.jpg";
// Glacier
import binghe from "../../images/maps/binghe.jpeg";

import styles from "./Map.module.css";

/* ── Data types ─────────────────────────────────────────── */
interface ZoneCreature {
  emoji: string;
  name: string;
  note: string;
}

interface ZoneResource {
  emoji: string;
  name: string;
}

interface ZoneImage {
  src: string;
  label: string;
}

interface ShallowModule {
  id: string;
  name: string;
  emoji: string;
  note: string; // short terrain description
  images: ZoneImage[];
}

interface Zone {
  id: string;
  label: string;
  emoji: string;
  depthRange: string;
  description: string;
  accentColor: string;
  bgColor: string;
  // shallow only
  modules?: ShallowModule[];
  // deep / binghe
  images?: ZoneImage[];
  creatures: ZoneCreature[];
  resources: ZoneResource[];
  tips: string[];
}

/* ── Zone data ──────────────────────────────────────────── */
const ZONES: Zone[] = [
  {
    id: "shallow",
    label: "浅海",
    emoji: "🌊",
    depthRange: "0 – 130 m",
    description:
      "每次潜水，游戏随机从5种浅海地形中选取一个，与随机深海段拼接成完整地图。熟悉各地形布局，能快速判断当前局的资源分布。",
    accentColor: "#2b7cb8",
    bgColor: "#e0f2ff",
    modules: [
      {
        id: "yuanjiao",
        name: "圆角悬崖",
        emoji: "🪨",
        note: "圆弧状悬崖地形，通道宽阔，中层空间大",
        images: [
          { src: yuanjiao1, label: "变体 A" },
          { src: yuanjiao2, label: "变体 B" },
        ],
      },
      {
        id: "haicao",
        name: "海草",
        emoji: "🌿",
        note: "茂密海草丛，视野受限，小型鱼类聚集",
        images: [
          { src: haicao1, label: "变体 A" },
          { src: haicao2, label: "变体 B" },
          { src: haicao3, label: "变体 C" },
        ],
      },
      {
        id: "haikui",
        name: "海葵",
        emoji: "🌸",
        note: "海葵密布，接触有轻微伤害，珊瑚礁鱼种丰富",
        images: [
          { src: haikui1, label: "变体 A" },
          { src: haikui2, label: "变体 B" },
          { src: haikui3, label: "变体 C" },
        ],
      },
      {
        id: "shanhu",
        name: "珊瑚",
        emoji: "🪸",
        note: "珊瑚礁地形，缝隙多，补给点较集中",
        images: [
          { src: shanhu1, label: "变体 A" },
          { src: shanhu2, label: "变体 B" },
          { src: shanhu3, label: "变体 C" },
        ],
      },
      {
        id: "zhijiao",
        name: "直角悬崖",
        emoji: "🏔️",
        note: "垂直切割地形，上下层分明，左右通道狭窄",
        images: [
          { src: zhijiao1, label: "变体 A" },
          { src: zhijiao2, label: "变体 B" },
          { src: zhijiao3, label: "变体 C" },
          { src: zhijiao4, label: "变体 D" },
        ],
      },
    ],
    creatures: [
      { emoji: "🦈", name: "虎鲨",         note: "中下层，攻击性强，皮革珍贵" },
      { emoji: "🦈", name: "长吻锯鲨",     note: "中层漫游，触碰锯吻掉血" },
      { emoji: "🦈", name: "三齿鲨",       note: "上层，移速快，警惕性高" },
      { emoji: "🐍", name: "黄鳝",         note: "藏于礁缝，夜间活跃" },
      { emoji: "🪼", name: "澳洲盲点水母", note: "中层漂浮，接触有毒" },
    ],
    resources: [
      { emoji: "💚", name: "氧气罐（O₂）" },
      { emoji: "🧰", name: "补给箱" },
      { emoji: "🗿", name: "礁洞 / 沉船" },
    ],
    tips: [
      "进水后先观察当前地形类型，对应本页选择模块查看细节",
      "圆角悬崖 & 直角悬崖的悬壁下方常有隐藏补给箱",
      "海草 & 海葵地形中小型高价值鱼类密度更高，适合刷材料",
      "虎鲨出现在深层左侧区域，优先绕行，任务需要再处理",
      "补给点位置在同一地形变体中相对固定，熟悉后快速续氧",
    ],
  },
  {
    id: "deep",
    label: "深海",
    emoji: "🌑",
    depthRange: "130 m+（深渊）",
    description:
      "深渊段与浅海段随机拼接，共有两种变体地形。含鲛人村入口、鲸鱼骨标志物、稀有矿物与高阶 Boss 聚集地。",
    accentColor: "#1a4060",
    bgColor: "#dce8f0",
    images: [
      { src: deepSea1, label: "变体 A" },
      { src: deepSea2, label: "变体 B" },
    ],
    creatures: [
      { emoji: "🦈", name: "皱鳃鲨",       note: "上层入口附近，移速快" },
      { emoji: "🦈", name: "巨口鲨",       note: "下层中央，体型巨大" },
      { emoji: "🦈", name: "雷厉达摩鲨",   note: "下层 Boss 级，击杀可获稀有材料" },
      { emoji: "🐙", name: "大章鱼",       note: "沉船区域 Boss，仅枪械有效" },
    ],
    resources: [
      { emoji: "💜", name: "紫水晶" },
      { emoji: "🧪", name: "管状虫" },
      { emoji: "🚢", name: "沉船 / 救生舱" },
      { emoji: "👁️", name: "猫眼石" },
      { emoji: "🦴", name: "鲸鱼骨（地标）" },
    ],
    tips: [
      "下潜前务必备足弹药和医疗包，深海补给少",
      "鲛人村入口在下半区左侧，触发特定剧情后解锁",
      "深海资源刷新频率低，尽量一次携满再上浮",
      "上下半区分界线约 200m，注意潜水服深度上限",
    ],
  },
  {
    id: "binghe",
    label: "冰河",
    emoji: "🧊",
    depthRange: "特殊区域（需解锁）",
    description:
      "通过深海特定入口进入，地形独立于主蓝洞。含冰河通道与冰河地区两大分区，高阶鱼类与稀有矿物集中。",
    accentColor: "#0e7490",
    bgColor: "#e0f7fa",
    images: [
      { src: binghe, label: "冰河全图" },
    ],
    creatures: [
      { emoji: "🦈", name: "格陵兰鲨",   note: "多处刷新，食材珍贵，建议农场补充" },
      { emoji: "🐟", name: "冰鱼",       note: "下层出没，体型小速度快" },
      { emoji: "🦀", name: "隆角鲎",     note: "材料稀有，多处刷新热点" },
      { emoji: "🐳", name: "白鲸",       note: "剧情任务触发，仅拍照可获分" },
    ],
    resources: [
      { emoji: "🪨", name: "矿石（下层）" },
      { emoji: "💎", name: "冰晶宝石" },
      { emoji: "🏛️", name: "遗迹入口（右下角）" },
      { emoji: "🔑", name: "冰河通道钥匙（剧情道具）" },
    ],
    tips: [
      "冰河入口位于深海特定位置，第四章剧情后解锁",
      "格陵兰鲨固定刷新热点见全图标注，绕圈路线效率最高",
      "冰河洞窟内有 3 处隐藏补给箱，贴右侧墙壁下潜可全部找到",
      "右侧蓝色深水区为 Boss 区（古代控制室），建议满装备再挑战",
    ],
  },
];

/* ── Component ──────────────────────────────────────────── */
export function MapPage() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [zoneId, setZoneId]     = useState<string>("shallow");
  const [moduleId, setModuleId] = useState<string>("yuanjiao");
  const [imgIndex, setImgIndex] = useState<number>(0);
  const [mobilePane, setMobilePane] = useState<"menu" | "viewer">("menu");

  const zone = ZONES.find((z) => z.id === zoneId) ?? ZONES[0];

  // Resolve current images (shallow: from module; others: from zone.images)
  const currentModule =
    zone.modules ? (zone.modules.find((m) => m.id === moduleId) ?? zone.modules[0]) : null;
  const images = currentModule ? currentModule.images : (zone.images ?? []);
  const currentImg = images[imgIndex] ?? images[0];

  // Deep-link support: /map?zone=shallow|deep|binghe
  useEffect(() => {
    const qp = searchParams.get("zone");
    if (!qp || !ZONES.some((z) => z.id === qp)) return;
    if (qp === zoneId) return;
    setZoneId(qp);
    setModuleId(ZONES.find((z) => z.id === qp)?.modules?.[0]?.id ?? "");
    setImgIndex(0);
  }, [searchParams, zoneId]);

  useEffect(() => {
    if (!isMobile) setMobilePane("menu");
  }, [isMobile]);

  function handleZoneChange(id: string) {
    setZoneId(id);
    const z = ZONES.find((z) => z.id === id);
    setModuleId(z?.modules?.[0]?.id ?? "");
    setImgIndex(0);
    if (isMobile) setMobilePane("viewer");
  }

  function handleModuleChange(id: string) {
    setModuleId(id);
    setImgIndex(0);
    if (isMobile) setMobilePane("viewer");
  }

  function handleImgChange(i: number) {
    setImgIndex(i);
  }

  function openInNewTab() {
    if (currentImg) window.open(currentImg.src, "_blank");
  }

  const zoneTabs: TabItem<string>[] = ZONES.map((z) => ({
    id: z.id,
    label: z.label,
    emoji: z.emoji,
  }));

  return (
    <div className={styles.page}>
      {/* ── Top zone TabBar ── */}
      <TabBar
        tabs={zoneTabs}
        value={zoneId}
        onChange={handleZoneChange}
        aria-label="地图区域"
      />
      {isMobile ? (
        <div className={styles.mobilePaneSwitch}>
          <button
            type="button"
            className={`${styles.mobilePaneBtn} ${mobilePane === "menu" ? styles.mobilePaneBtnActive : ""}`}
            onClick={() => setMobilePane("menu")}
          >
            菜单
          </button>
          <button
            type="button"
            className={`${styles.mobilePaneBtn} ${mobilePane === "viewer" ? styles.mobilePaneBtnActive : ""}`}
            onClick={() => setMobilePane("viewer")}
          >
            地图
          </button>
        </div>
      ) : null}

      <div className={styles.body} data-mobile-pane={mobilePane}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div
            className={styles.zoneHeader}
            style={{ background: zone.bgColor, borderColor: zone.accentColor }}
          >
            <span className={styles.zoneEmoji}>{zone.emoji}</span>
            <div>
              <div className={styles.zoneName} style={{ color: zone.accentColor }}>
                {zone.label}
              </div>
              <div className={styles.zoneDepth}>{zone.depthRange}</div>
            </div>
          </div>

          {/* Random combination notice for shallow */}
          {zone.id === "shallow" && (
            <div className={styles.combineNotice}>
              <span className={styles.combineIcon}>🎲</span>
              <span>每次潜水从 5 种地形随机选取，并与深海随机段拼接</span>
            </div>
          )}

          <p className={styles.zoneDesc}>{zone.description}</p>

          {/* Shallow module list */}
          {zone.modules && (
            <div className={styles.sideSection}>
              <div className={styles.sideSectionTitle}>🗺️ 地形模块</div>
              {zone.modules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.moduleListItem} ${m.id === moduleId ? styles.moduleListItemActive : ""}`}
                  style={m.id === moduleId ? { borderColor: zone.accentColor, color: zone.accentColor } as React.CSSProperties : {}}
                  onClick={() => handleModuleChange(m.id)}
                >
                  <span className={styles.moduleItemEmoji}>{m.emoji}</span>
                  <div className={styles.moduleItemText}>
                    <span className={styles.moduleItemName}>{m.name}</span>
                    <span className={styles.moduleItemNote}>{m.note}</span>
                  </div>
                  <span className={styles.moduleItemCount}>{m.images.length}张</span>
                </button>
              ))}
            </div>
          )}

          {/* Creatures */}
          <div className={styles.sideSection}>
            <div className={styles.sideSectionTitle}>🐠 主要生物</div>
            {zone.creatures.map((c) => (
              <div key={c.name} className={styles.creatureRow}>
                <span className={styles.creatureEmoji}>{c.emoji}</span>
                <div className={styles.creatureInfo}>
                  <span className={styles.creatureName}>{c.name}</span>
                  <span className={styles.creatureNote}>{c.note}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className={styles.sideSection}>
            <div className={styles.sideSectionTitle}>🎁 资源 & 地标</div>
            <div className={styles.resourceList}>
              {zone.resources.map((r) => (
                <div key={r.name} className={styles.resourceChip}>
                  {r.emoji} {r.name}
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className={styles.sideSection}>
            <div className={styles.sideSectionTitle}>💡 潜水小贴士</div>
            {zone.tips.map((tip) => (
              <div key={tip} className={styles.tipRow}>
                <span className={styles.tipDot} style={{ background: zone.accentColor }} />
                <span className={styles.tipText}>{tip}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Image viewer ── */}
        <main className={styles.viewer}>
          <div className={styles.imgContainer}>
            {currentImg && (
              <img
                key={currentImg.src}
                src={currentImg.src}
                alt={`${zone.label}${currentModule ? ` · ${currentModule.name}` : ""} - ${currentImg?.label}`}
                className={styles.mapImg}
                draggable={false}
              />
            )}
            <button
              type="button"
              className={styles.openOriginalBtn}
              onClick={openInNewTab}
              title="在新标签页中查看原图"
            >
              🔗 查看原图
            </button>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className={styles.thumbStrip}>
              {images.map((img, i) => (
                <button
                  key={img.label}
                  type="button"
                  className={`${styles.thumb} ${i === imgIndex ? styles.thumbActive : ""}`}
                  style={i === imgIndex ? { borderColor: zone.accentColor } : {}}
                  onClick={() => handleImgChange(i)}
                >
                  <img src={img.src} alt={img.label} className={styles.thumbImg} />
                  <span className={styles.thumbLabel}>{img.label}</span>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
