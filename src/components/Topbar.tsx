import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import { stringifyBackup } from "../store/playerProgressBackup";
import { DataBackupModal } from "./DataBackupModal";
import styles from "./Topbar.module.css";

const NAV_ITEMS = [
  { to: "/", label: "主页", exact: true },
  { to: "/fish", label: "鱼类图鉴" },
  { to: "/recipes", label: "食谱图鉴" },
  { to: "/staff", label: "员工图鉴" },
  { to: "/weapons", label: "武器图鉴" },
  { to: "/map", label: "地图" },
  { to: "/quests", label: "任务" },
];

export function Topbar() {
  const [importOpen, setImportOpen] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const handleExport = useCallback(async () => {
    const json = stringifyBackup();
    try {
      await navigator.clipboard.writeText(json);
      setExportDone(true);
      window.setTimeout(() => setExportDone(false), 2000);
    } catch {
      // 非 HTTPS 或权限被拒时降级为 prompt
      window.prompt("复制以下内容为备份（Ctrl+C）：", json);
    }
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🤿</span>
          <span className={styles.brandText}>DAVE HELPER</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.dataTools}>
          <button
            type="button"
            className={styles.dataBtn}
            onClick={handleExport}
            title="将本地进度复制为 JSON 到剪贴板"
          >
            {exportDone ? "✓ 已复制" : "导出数据"}
          </button>
          <button
            type="button"
            className={styles.dataBtn}
            onClick={() => setImportOpen(true)}
            title="从剪贴板粘贴的 JSON 恢复进度"
          >
            导入数据
          </button>
        </div>
      </div>
      <DataBackupModal open={importOpen} onClose={() => setImportOpen(false)} />
    </header>
  );
}
