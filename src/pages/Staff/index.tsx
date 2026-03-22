import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EncyclopediaLayout } from "../../components/EncyclopediaLayout";
import { TabBar } from "../../components/TabBar";
import { restaurantTiers, staffData } from "../../data/staff";
import { useIsMobile } from "../../hooks/useIsMobile";
import { usePlayerProgress } from "../../store/usePlayerProgress";
import { StaffTips } from "./StaffTips";
import type { StaffRole } from "../../types";
import styles from "./Staff.module.css";

const ROLE_LABELS: Record<StaffRole, string> = {
  kitchen: "后厨",
  hall: "大堂",
  dispatch: "派遣",
};

const STAT_MAX = 1100;

const staffImages = import.meta.glob("../../images/staff/*.{png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function getStaffImageUrl(staffName: string): string | null {
  return (
    staffImages[`../../images/staff/${staffName}.png`] ??
    staffImages[`../../images/staff/${staffName}.webp`] ??
    null
  );
}

function StatBar({
  label,
  icon,
  value,
}: { label: string; icon: string; value: number }) {
  const pct = Math.min(100, Math.round((value / STAT_MAX) * 100));
  const tier =
    pct >= 80
      ? styles.statBarHigh
      : pct >= 50
        ? styles.statBarMid
        : styles.statBarLow;
  return (
    <div className={styles.statRow}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statLabel}>{label}</span>
      <div className={styles.statBarTrack}>
        <div
          className={`${styles.statBar} ${tier}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.statVal}>{value}</span>
    </div>
  );
}

export function Staff() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<"staff" | "levels" | "tips">("tips");
  const { hiredStaffIds, toggleStaffHired } = usePlayerProgress();

  const selected = id ? staffData.find((s) => s.id === id) : null;

  // 仅在 id 从无→有 的那次，自动切回员工图鉴页（用于从推荐页点击员工时展示详情）。
  // 避免“id 存在时永远强制切回”，导致 tips/levels tab 无法切换。
  const prevIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prevId = prevIdRef.current;
    prevIdRef.current = id;
    if (!id) return;
    if (tab === "staff") return;
    if (prevId) return; // id 本来就存在：通常是用户在 staff 里选过人，不应强制切 tab
    setTab("staff");
  }, [id, tab]);

  function handleTabChange(next: "staff" | "levels" | "tips") {
    setTab(next);
    // 进入员工图鉴且当前没有选中员工时，默认选中第一个员工
    if (next === "staff" && !id && !isMobile) {
      const first = staffData[0];
      if (first) navigate(`/staff/${first.id}`, { replace: true });
      return;
    }
    // 离开员工图鉴时，清理 URL 中的 /staff/:id
    // 否则 id 存在会触发“自动切回员工图鉴”，导致其它 tab 看起来失效。
    if (next !== "staff" && id) {
      navigate("/staff", { replace: true });
    }
  }

  // ── Grid list panel ───────────────────────────────────────────────────────
  const listPanel = (
    <div className={styles.listWrap}>
      <div className={styles.grid}>
        {staffData.map((staff) => {
          const hired = hiredStaffIds.includes(staff.id);
          const isSelected = staff.id === id;
          return (
            <div
              key={staff.id}
              className={`${styles.card} ${styles[`cardRole_${staff.role}`]} ${hired ? styles.cardHired : styles.cardUnhired} ${isSelected ? styles.cardSelected : ""}`}
              onClick={() => navigate(`/staff/${staff.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/staff/${staff.id}`)
              }
              // biome-ignore lint/a11y/noNoninteractiveTabindex: card with nested interactive elements
              tabIndex={0}
            >
              <div className={styles.cardImg}>
                {/* Hire toggle — top left */}
                <button
                  type="button"
                  className={`${styles.cardCornerToggle} ${hired ? styles.cardCornerToggleOn : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStaffHired(staff.id);
                  }}
                  title={hired ? "取消雇用" : "标记已雇用"}
                >
                  {hired ? "✓" : ""}
                </button>

                {(() => {
                  const url = getStaffImageUrl(staff.name);
                  return url ? (
                    <img
                      className={styles.cardSprite}
                      src={url}
                      alt={staff.name}
                      draggable={false}
                    />
                  ) : null;
                })()}
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardName}>{staff.name}</span>
                <span
                  className={`${styles.roleTag} ${styles[`roleTag_${staff.role}`]}`}
                >
                  {ROLE_LABELS[staff.role]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Detail panel ──────────────────────────────────────────────────────────
  const detailPanel = selected ? (
    <div className={styles.detail}>
      <div
        className={`${styles.detailHeader} ${styles[`detailHeader_${selected.role}`]}`}
      >
        <div className={styles.detailAvatarBox}>
          {(() => {
            const url = getStaffImageUrl(selected.name);
            return url ? (
              <img
                className={styles.detailSprite}
                src={url}
                alt={selected.name}
                draggable={false}
              />
            ) : null;
          })()}
        </div>
        <div className={styles.detailMeta}>
          <div className={styles.detailNameRow}>
            <h1 className={styles.detailName}>{selected.name}</h1>
            <span
              className={`${styles.roleBadge} ${styles[`roleBadge_${selected.role}`]}`}
            >
              {ROLE_LABELS[selected.role]}
            </span>
          </div>
          <div className={styles.detailCostRow}>
            <div className={styles.costItem}>
              <span className={styles.costLabel}>雇佣费</span>
              <span className={styles.costVal}>
                💰{" "}
                {selected.hiringFee === 0 ? "免费" : `${selected.hiringFee} 金`}
              </span>
            </div>
            <div className={styles.costItem}>
              <span className={styles.costLabel}>每晚工资</span>
              <span className={styles.costVal}>
                📅 {selected.dailyWage} 金 / 晚
              </span>
            </div>
          </div>
          <p className={styles.detailDesc}>{selected.description}</p>
        </div>
      </div>

      {/* Recommend tip for S/A */}
      {selected.recommendTip && (
        <div
          className={`${styles.recommendBox} ${styles[`recommendBox_${selected.tier}`]}`}
        >
          <span
            className={`${styles.recommendIcon} ${styles[`recommendIcon_${selected.tier}`]}`}
          >
            {selected.tier}
          </span>
          <p className={styles.recommendText}>{selected.recommendTip}</p>
        </div>
      )}

      {/* 技能与菜系（每个一项一块） */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>⚡ 技能与解锁菜系</h3>
        <div className={styles.skillLines}>
          <div className={styles.skillGroup}>
            <span className={styles.skillGroupLabel}>技能</span>
            <div className={styles.skillBlocks}>
              {selected.skills
                .filter((s) => !s.isDish)
                .map((s) => (
                  <span
                    key={`${s.level}-${s.name}`}
                    className={`${styles.skillBlock} ${styles.skillBlockAbility}`}
                  >
                    【{s.level}级】{s.name}
                  </span>
                ))}
              {selected.skills.filter((s) => !s.isDish).length === 0 && (
                <span className={styles.skillBlockEmpty}>—</span>
              )}
            </div>
          </div>
          <div className={styles.skillGroup}>
            <span className={styles.skillGroupLabel}>菜系</span>
            <div className={styles.skillBlocks}>
              {selected.skills
                .filter((s) => s.isDish)
                .map((s) => (
                  <span
                    key={`${s.level}-${s.name}`}
                    className={`${styles.skillBlock} ${styles.skillBlockDish}`}
                  >
                    【{s.level}级】{s.name}
                  </span>
                ))}
              {selected.skills.filter((s) => s.isDish).length === 0 && (
                <span className={styles.skillBlockEmpty}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 满级能力值</h3>
        <div className={styles.statsBlock}>
          <StatBar label="料理" icon="🍳" value={selected.maxStats.cooking} />
          <StatBar label="服务" icon="🛎️" value={selected.maxStats.serving} />
          <StatBar label="筹备" icon="📦" value={selected.maxStats.procure} />
          <StatBar label="魅力" icon="✨" value={selected.maxStats.appeal} />
        </div>
        <div className={styles.statsTotal}>
          总计：
          <strong>
            {selected.maxStats.cooking +
              selected.maxStats.serving +
              selected.maxStats.procure +
              selected.maxStats.appeal}
          </strong>
        </div>
      </div>
    </div>
  ) : null;

  const staffTabs = [
    { id: "tips" as const, label: "推荐", emoji: "⭐" },
    {
      id: "staff" as const,
      label: "员工图鉴",
      emoji: "👥",
      count: `${hiredStaffIds.length}/${staffData.length}`,
    },
    { id: "levels" as const, label: "餐厅等级", emoji: "🏮" },
  ];

  return (
    <div className={styles.staffPage}>
      <TabBar
        tabs={staffTabs}
        value={tab}
        onChange={(id) => handleTabChange(id)}
        aria-label="员工与餐厅"
      />

      {tab === "staff" ? (
        <EncyclopediaLayout
          listPanel={listPanel}
          detailPanel={detailPanel}
          hasSelection={!!selected}
          emptyMessage="← 从左侧选择一名员工查看详情"
          onRequestClose={() => navigate("/staff", { replace: true })}
        />
      ) : tab === "levels" ? (
        <RestaurantLevelsPage />
      ) : (
        <StaffTips />
      )}
    </div>
  );
}

// ── Full-width restaurant levels page ─────────────────────────────────────
function RestaurantLevelsPage() {
  return (
    <div className={styles.levelsPage}>
      <div className={styles.levelsInner}>
        <p className={styles.levelsTip}>
          餐厅等级决定每晚最大客流量与人员配置需求。建议至少3名员工解锁第二技能后再升至白金。
        </p>

        {/* Tier cards */}
        <div className={styles.tiersRow}>
          {restaurantTiers.map((tier) => (
            <div
              key={tier.id}
              className={styles.tierCard}
              style={{
                borderColor: tier.color,
                boxShadow: `3px 3px 0 ${tier.color}`,
              }}
            >
              <div
                className={styles.tierTop}
                style={{ background: `${tier.color}28` }}
              >
                <span className={styles.tierEmoji}>{tier.emoji}</span>
                <span className={styles.tierName} style={{ color: tier.color }}>
                  {tier.name}
                </span>
              </div>
              <div className={styles.tierBody}>
                <div className={styles.tierStat}>
                  <span className={styles.tierStatLabel}>正常</span>
                  <span
                    className={styles.tierStatVal}
                    style={{ color: tier.color }}
                  >
                    {tier.normalSeats}
                  </span>
                  <span className={styles.tierStatUnit}>席</span>
                </div>
                <div className={styles.tierStat}>
                  <span className={styles.tierStatLabel}>夜潜</span>
                  <span className={styles.tierStatVal}>
                    {tier.nightSeats !== null ? tier.nightSeats : "—"}
                  </span>
                  {tier.nightSeats !== null && (
                    <span className={styles.tierStatUnit}>席</span>
                  )}
                </div>
                <div className={styles.tierDivider} />
                <div className={styles.tierStaff}>
                  <span
                    className={styles.tierStaffBadge}
                    style={{
                      background: "#dceaf8",
                      color: "#1a6aab",
                      borderColor: "#1a6aab",
                    }}
                  >
                    大堂 ×{tier.hallStaff}
                  </span>
                  <span
                    className={styles.tierStaffBadge}
                    style={{
                      background: "#fde8dc",
                      color: "#c84820",
                      borderColor: "#c84820",
                    }}
                  >
                    后厨 ×{tier.kitchenStaff}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Training costs */}
        <div className={styles.trainSection}>
          <h3 className={styles.trainTitle}>📈 员工升级费用一览</h3>
          <div className={styles.trainTable}>
            <div className={styles.trainHead}>
              <span>等级</span>
              <span>单次费用</span>
              <span>解锁内容</span>
            </div>
            {[
              { lv: 2, cost: 150, mark: "" },
              { lv: 3, cost: 215, mark: "解锁技能①" },
              { lv: 4, cost: 308, mark: "" },
              { lv: 5, cost: 442, mark: "（部分员工解锁菜谱）" },
              { lv: 6, cost: 635, mark: "" },
              { lv: 7, cost: 911, mark: "解锁技能②" },
              { lv: 8, cost: 1307, mark: "" },
              { lv: 9, cost: 1875, mark: "" },
              { lv: 10, cost: 2690, mark: "（部分员工解锁菜谱）" },
              { lv: 11, cost: 3859, mark: "" },
              { lv: 12, cost: 5537, mark: "" },
              { lv: 13, cost: 7943, mark: "" },
              { lv: 14, cost: 11395, mark: "" },
              { lv: 15, cost: 16348, mark: "解锁专属菜谱" },
              { lv: 20, cost: 99328, mark: "满级" },
            ].map(({ lv, cost, mark }) => {
              const isKey = lv === 3 || lv === 7 || lv === 15 || lv === 20;
              return (
                <div
                  key={lv}
                  className={`${styles.trainRow} ${isKey ? styles.trainRowKey : ""}`}
                >
                  <span className={styles.trainLv}>Lv.{lv}</span>
                  <span className={styles.trainCost}>
                    {cost.toLocaleString()} 金
                  </span>
                  <span className={styles.trainMark}>{mark}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
