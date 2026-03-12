import type { ReactNode } from "react";
import styles from "./TabBar.module.css";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  emoji?: string;
  count?: string | ReactNode;
}

interface TabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label"?: string;
  theme?: "light" | "dark";
}

export function TabBar<T extends string = string>({
  tabs,
  value,
  onChange,
  "aria-label": ariaLabel = "切换标签",
  theme = "light",
}: TabBarProps<T>) {
  return (
    <div
      className={`${styles.tabBar} ${theme === "dark" ? styles.tabBarDark : ""}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.emoji != null && (
              <span className={styles.tabEmoji}>{tab.emoji}</span>
            )}
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.count != null && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
