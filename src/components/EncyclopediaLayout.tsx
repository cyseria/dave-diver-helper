import type { ReactNode } from "react";
import styles from "./EncyclopediaLayout.module.css";

interface EncyclopediaLayoutProps {
  listPanel: ReactNode;
  detailPanel: ReactNode;
  emptyMessage?: string;
  hasSelection: boolean;
}

export function EncyclopediaLayout({
  listPanel,
  detailPanel,
  emptyMessage = "← 从左侧选择一项查看详情",
  hasSelection,
}: EncyclopediaLayoutProps) {
  return (
    <div className={styles.layout}>
      <aside className={styles.list}>
        <div className={styles.listScroll}>{listPanel}</div>
      </aside>
      <main className={styles.detail}>
        <div className={styles.detailScroll}>
          {hasSelection ? (
            detailPanel
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🌊</span>
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
