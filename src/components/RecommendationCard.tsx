import styles from "./RecommendationCard.module.css";

interface RecommendationCardProps {
  icon: string;
  category: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function RecommendationCard({
  icon,
  category,
  title,
  description,
  actionLabel,
  onAction,
}: RecommendationCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}>
        {icon && (icon.startsWith("http") || icon.startsWith("/") || icon.startsWith("data:")) ? (
          <img src={icon} alt="" className={styles.icon} />
        ) : (
          <span className={styles.icon}>{icon}</span>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{category}</span>
        <p className={styles.title}>{title}</p>
        <p className={styles.desc}>{description}</p>
      </div>
      {actionLabel && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel} →
        </button>
      )}
    </div>
  );
}
