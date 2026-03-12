import { NavLink } from "react-router-dom";
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
      </div>
    </header>
  );
}
