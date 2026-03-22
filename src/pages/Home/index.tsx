import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { ProgressBar } from "../../components/ProgressBar";
import { RecommendationCard } from "../../components/RecommendationCard";
import { fishData } from "../../data/fish";
import { recipeData } from "../../data/recipes";
import { staffData } from "../../data/staff";
import { weaponsData } from "../../data/weapons";
import { usePlayerProgress } from "../../store/usePlayerProgress";
import { getWeaponParentIds } from "../../utils/weaponParents";
import { getFishImageUrl } from "../../utils/fishImage";
import styles from "./Home.module.css";

export function Home() {
  const navigate = useNavigate();
  const {
    storyProgress,
    capturedFishIds,
    recipeEnhanceLevels,
    hiredStaffIds,
    ownedWeaponIds,
  } = usePlayerProgress();

  // Fish & recipe（食谱：强化等级 ≥1 视为已获得）
  const totalFish = fishData.length;
  const totalRecipes = recipeData.length;
  const capturedCount = capturedFishIds.length;
  const unlockedCount = recipeData.filter(
    (r) => (recipeEnhanceLevels[r.id] ?? 0) >= 1,
  ).length;

  // Staff
  const totalStaff = staffData.length;
  const hiredCount = hiredStaffIds.length;

  // Weapons
  const totalWeapons = weaponsData.length;
  const ownedWeaponsCount = ownedWeaponIds.length;

  // Overall completion (all 4 categories)
  const totalAll = totalFish + totalRecipes + totalStaff + totalWeapons;
  const doneAll =
    capturedCount + unlockedCount + hiredCount + ownedWeaponsCount;
  const overallPct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

  // Recommendations
  const nextFish = fishData.find((f) => !capturedFishIds.includes(f.id));
  const nextRecipe = recipeData.find(
    (r) => (recipeEnhanceLevels[r.id] ?? 0) < 1,
  );

  // Recommend highest-tier unhired staff
  const nextStaff =
    staffData.find((s) => s.tier === "S" && !hiredStaffIds.includes(s.id)) ??
    staffData.find((s) => s.tier === "A" && !hiredStaffIds.includes(s.id)) ??
    staffData.find((s) => !hiredStaffIds.includes(s.id));

  // Recommend next craftable weapon (parent owned, self not owned)
  const nextWeapon = weaponsData.find((w) => {
    if (ownedWeaponIds.includes(w.id)) return false;
    const parents = getWeaponParentIds(w);
    if (parents.length === 0) return false;
    return parents.every((id) => ownedWeaponIds.includes(id));
  });

  const ROLE_LABEL: Record<string, string> = {
    kitchen: "后厨",
    hall: "大堂",
    dispatch: "派遣",
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🤿 仪表盘</h1>
        <p className={styles.subtitle}>Dave 今天的潜水状态一览</p>
      </div>

      <div className={styles.grid}>
        {/* ── Left column ── */}
        <section className={styles.section}>
          <Card title="玩家进度">
            <ProgressBar label="主线剧情" value={storyProgress} max={100} />
            <ProgressBar
              label="🐟 已捕鱼类"
              value={capturedCount}
              max={totalFish}
              variant="success"
            />
            <ProgressBar
              label="🍣 已解锁食谱"
              value={unlockedCount}
              max={totalRecipes}
              variant="warning"
            />
            <ProgressBar
              label="👥 已雇用员工"
              value={hiredCount}
              max={totalStaff}
              variant="info"
            />
            <ProgressBar
              label="🔫 已拥有武器"
              value={ownedWeaponsCount}
              max={totalWeapons}
              variant="primary"
            />
          </Card>

          <Card title="整体完成度">
            <div className={styles.completionRing}>
              <div className={styles.ringOuter}>
                <div
                  className={styles.ringFill}
                  style={{
                    background: `conic-gradient(
                      var(--color-primary, #E87040) ${(doneAll / totalAll) * 360}deg,
                      var(--color-surface-alt, #EDE8DC) 0deg
                    )`,
                  }}
                />
                <div className={styles.ringInner}>
                  <span className={styles.ringPct}>{overallPct}%</span>
                </div>
              </div>
              <div className={styles.ringStats}>
                <div className={styles.ringStat}>
                  <span className={styles.ringStatNum}>
                    {capturedCount}/{totalFish}
                  </span>
                  <span className={styles.ringStatLabel}>🐟 鱼类</span>
                </div>
                <div className={styles.ringStat}>
                  <span className={styles.ringStatNum}>
                    {unlockedCount}/{totalRecipes}
                  </span>
                  <span className={styles.ringStatLabel}>🍣 食谱</span>
                </div>
                <div className={styles.ringStat}>
                  <span className={styles.ringStatNum}>
                    {hiredCount}/{totalStaff}
                  </span>
                  <span className={styles.ringStatLabel}>👥 员工</span>
                </div>
                <div className={styles.ringStat}>
                  <span className={styles.ringStatNum}>
                    {ownedWeaponsCount}/{totalWeapons}
                  </span>
                  <span className={styles.ringStatLabel}>🔫 武器</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ── Right column ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💡 今日推荐</h2>

          {nextFish && (
            <RecommendationCard
              icon={getFishImageUrl(nextFish.image) ?? ""}
              category="下一条鱼"
              title={nextFish.name}
              description={`${nextFish.depthMin !== undefined && nextFish.depthMax !== undefined ? `深度 ${nextFish.depthMin}–${nextFish.depthMax}m` : "深度未知"} | ${nextFish.description ?? "暂无描述"}`}
              actionLabel="查看图鉴"
              onAction={() => navigate(`/fish/${nextFish.id}`)}
            />
          )}

          {nextRecipe && (
            <RecommendationCard
              icon={nextRecipe.emoji}
              category="推荐解锁食谱"
              title={nextRecipe.name}
              description={`售价 ${nextRecipe.sellPrice} 金 | ${nextRecipe.description}`}
              actionLabel="查看食谱"
              onAction={() => navigate(`/recipes/${nextRecipe.id}`)}
            />
          )}

          {nextStaff && (
            <RecommendationCard
              icon={nextStaff.emoji}
              category={`推荐雇用员工 · ${nextStaff.tier} 级 · ${ROLE_LABEL[nextStaff.role] ?? nextStaff.role}`}
              title={nextStaff.name}
              description={
                nextStaff.recommendTip ??
                `雇用费 ${nextStaff.hiringFee === 0 ? "免费" : `${nextStaff.hiringFee} 金`} | 每日薪资 ${nextStaff.dailyWage} 金`
              }
              actionLabel="查看员工"
              onAction={() => navigate("/staff")}
            />
          )}

          {nextWeapon && (
            <RecommendationCard
              icon={nextWeapon.emoji}
              category={`可制作武器 · Tier ${nextWeapon.tier}`}
              title={nextWeapon.name}
              description={`前置武器：${getWeaponParentIds(nextWeapon)
                .map((id) => weaponsData.find((w) => w.id === id)?.name)
                .filter(Boolean)
                .join(" + ")} | 伤害 ${nextWeapon.damage} · 弹药 ${nextWeapon.ammo ?? "∞"}`}
              actionLabel="查看武器"
              onAction={() => navigate("/weapons")}
            />
          )}
        </section>
      </div>
    </div>
  );
}
