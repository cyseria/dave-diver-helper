import { fishData } from "../data/fish";
import { usePlayerProgress } from "../store/usePlayerProgress";
import styles from "./IngredientTag.module.css";

interface IngredientTagProps {
  fishId: string;
  quantity: number;
  onFishClick?: (fishId: string) => void;
}

export function IngredientTag({
  fishId,
  quantity,
  onFishClick,
}: IngredientTagProps) {
  const fish = fishData.find((f) => f.id === fishId);
  const capturedFishIds = usePlayerProgress((s) => s.capturedFishIds);
  const hasFish = capturedFishIds.includes(fishId);

  if (!fish) return null;

  return (
    <button
      type="button"
      className={`${styles.tag} ${hasFish ? styles.owned : styles.missing}`}
      onClick={() => onFishClick?.(fishId)}
      title={hasFish ? "已捕获" : "未捕获，点击查看"}
    >
      <span className={styles.emoji}>{fish.image ?? fish.emoji}</span>
      <span className={styles.name}>{fish.name}</span>
      <span className={styles.qty}>×{quantity}</span>
      {!hasFish && <span className={styles.missingBadge}>缺</span>}
    </button>
  );
}
