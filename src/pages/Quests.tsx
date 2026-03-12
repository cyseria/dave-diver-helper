import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EncyclopediaLayout } from "../components/EncyclopediaLayout";
import { TabBar } from "../components/TabBar";
import type { TabItem } from "../components/TabBar";
import { questChapters, questData } from "../data/quests";
import { usePlayerProgress } from "../store/usePlayerProgress";
import type { Quest, QuestType } from "../types";
import styles from "./Quests.module.css";

type QuestTab = "main" | "sub";

const TABS: TabItem<QuestTab>[] = [
  { id: "main", label: "主线任务", emoji: "📋" },
  { id: "sub", label: "支线任务", emoji: "📌" },
];

const TYPE_LABEL: Record<QuestType, string> = {
  main: "主线",
  sub: "支线",
  vip: "VIP",
};

const TYPE_COLOR: Record<QuestType, string> = {
  main: "#b8861a",
  sub: "#3b82f6",
  vip: "#9333ea",
};

export function Quests() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<QuestTab>("main");
  const { completedQuestIds, toggleQuestCompleted } = usePlayerProgress();

  const visibleQuests = useMemo<Quest[]>(() => {
    if (tab === "main") return questData.filter((q) => q.type === "main");
    return questData.filter((q) => q.type === "sub" || q.type === "vip");
  }, [tab]);

  const selected = id ? questData.find((q) => q.id === id) ?? null : null;

  // Default to first quest in tab
  useEffect(() => {
    if (id) return;
    const first = visibleQuests[0];
    if (!first) return;
    navigate(`/quests/${first.id}`, { replace: true });
  }, [id, visibleQuests, navigate]);

  // When switching tab, navigate to first quest of that tab
  const handleTabChange = (next: QuestTab) => {
    setTab(next);
    const first = questData.find((q) =>
      next === "main" ? q.type === "main" : q.type === "sub" || q.type === "vip",
    );
    if (first) navigate(`/quests/${first.id}`, { replace: true });
  };

  // Count completed per tab
  const completedCount = useMemo(
    () => visibleQuests.filter((q) => completedQuestIds.includes(q.id)).length,
    [visibleQuests, completedQuestIds],
  );

  // Group quests by chapter for display
  const groupedByChapter = useMemo(() => {
    const groups: { chapter: typeof questChapters[0]; quests: Quest[] }[] = [];
    for (const chapter of questChapters) {
      const qs = visibleQuests.filter((q) => q.chapterId === chapter.id);
      if (qs.length > 0) groups.push({ chapter, quests: qs });
    }
    return groups;
  }, [visibleQuests]);

  // ── List panel ───────────────────────────────────────────────────────────
  const listPanel = (
    <div className={styles.listWrap}>
      <div className={styles.listHeader}>
        <span className={styles.listTitle}>
          {tab === "main" ? "主线任务" : "支线任务"}
        </span>
        <span className={styles.listCount}>
          <span className={styles.countDone}>{completedCount}</span>
          {" / "}
          {visibleQuests.length}
        </span>
      </div>

      <div className={styles.questList}>
        {groupedByChapter.map(({ chapter, quests }) => (
          <div key={chapter.id} className={styles.chapterGroup}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterEmoji}>{chapter.emoji}</span>
              <span className={styles.chapterName}>{chapter.name}</span>
            </div>
            {quests.map((quest) => {
              const done = completedQuestIds.includes(quest.id);
              const isSelected = quest.id === id;
              return (
                <div
                  key={quest.id}
                  className={`${styles.questItem} ${isSelected ? styles.questItemSelected : ""} ${done ? styles.questItemDone : ""}`}
                  onClick={() => navigate(`/quests/${quest.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/quests/${quest.id}`)}
                  // biome-ignore lint/a11y/noNoninteractiveTabindex: list item
                  tabIndex={0}
                >
                  <span className={styles.questItemEmoji}>{quest.emoji}</span>
                  <span className={styles.questItemName}>{quest.name}</span>
                  <div className={styles.questItemRight}>
                    {quest.type === "vip" && (
                      <span className={styles.vipTag}>VIP</span>
                    )}
                    {quest.boss && <span className={styles.bossTag}>👾</span>}
                    {done && <span className={styles.doneCheck}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Detail panel ─────────────────────────────────────────────────────────
  const detailPanel = selected ? (() => {
    const done = completedQuestIds.includes(selected.id);
    const chapter = questChapters.find((c) => c.id === selected.chapterId);
    return (
      <div className={styles.detail}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <div className={styles.detailEmojiBadge}>{selected.emoji}</div>
          <div className={styles.detailMeta}>
            <div className={styles.detailTags}>
              {chapter && (
                <span className={styles.chapterTag}>
                  {chapter.emoji} {chapter.name}
                </span>
              )}
              <span
                className={styles.typeTag}
                style={{ "--tag-color": TYPE_COLOR[selected.type] } as React.CSSProperties}
              >
                {TYPE_LABEL[selected.type]}
              </span>
              {selected.boss && (
                <span className={styles.bossTagFull}>👾 含 Boss 战</span>
              )}
            </div>
            <h1 className={styles.detailName}>{selected.name}</h1>
            <p className={styles.detailDesc}>{selected.description}</p>
          </div>
          <button
            type="button"
            className={`${styles.completeBtn} ${done ? styles.completeBtnOn : ""}`}
            onClick={() => toggleQuestCompleted(selected.id)}
          >
            {done ? "✓ 已完成" : "标记完成"}
          </button>
        </div>

        {/* Objectives */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🎯 任务目标</h3>
          <ol className={styles.objectiveList}>
            {selected.objectives.map((obj, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <li key={i} className={styles.objectiveItem}>
                <span className={styles.objNum}>{i + 1}</span>
                <span>{obj}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>💡 通关技巧</h3>
          <ul className={styles.tipList}>
            {selected.tips.map((tip, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <li key={i} className={styles.tipItem}>
                <span className={styles.tipDot}>▶</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Boss tips */}
        {selected.boss && (
          <div className={styles.bossBlock}>
            <h3 className={styles.bossTitle}>
              👾 Boss 攻略：{selected.boss.name}
            </h3>
            <ul className={styles.tipList}>
              {selected.boss.tips.map((tip, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                <li key={i} className={styles.tipItem}>
                  <span className={styles.tipDot}>▸</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reward */}
        {selected.reward && (
          <div className={styles.rewardRow}>
            <span className={styles.rewardIcon}>🎁</span>
            <div>
              <span className={styles.rewardLabel}>任务奖励</span>
              <span className={styles.rewardVal}>{selected.reward}</span>
            </div>
          </div>
        )}
      </div>
    );
  })() : null;

  return (
    <div className={styles.page}>
      <TabBar
        tabs={TABS}
        value={tab}
        onChange={handleTabChange}
        aria-label="任务类型切换"
      />
      <EncyclopediaLayout
        listPanel={listPanel}
        detailPanel={detailPanel}
        hasSelection={!!selected}
        emptyMessage="← 选择一个任务查看详情"
      />
    </div>
  );
}
