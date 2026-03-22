import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";
import styles from "./EncyclopediaLayout.module.css";

interface EncyclopediaLayoutProps {
  listPanel: ReactNode;
  detailPanel: ReactNode;
  emptyMessage?: string;
  hasSelection: boolean;
  onRequestClose?: () => void;
}

export function EncyclopediaLayout({
  listPanel,
  detailPanel,
  emptyMessage = "← 从左侧选择一项查看详情",
  hasSelection,
  onRequestClose,
}: EncyclopediaLayoutProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const prevHasSelection = useRef<boolean>(hasSelection);
  const prevPathname = useRef<string>(pathname);

  useEffect(() => {
    if (!isMobile) return;
    if (!hasSelection) {
      setMobileDetailOpen(false);
      prevHasSelection.current = hasSelection;
      return;
    }
    if (!prevHasSelection.current) setMobileDetailOpen(true);
    prevHasSelection.current = hasSelection;
  }, [hasSelection, isMobile]);

  useEffect(() => {
    if (!isMobile) setMobileDetailOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      prevPathname.current = pathname;
      return;
    }
    if (hasSelection && prevPathname.current !== pathname) {
      setMobileDetailOpen(true);
    }
    prevPathname.current = pathname;
  }, [hasSelection, isMobile, pathname]);

  useEffect(() => {
    if (!isMobile) return;
    if (!mobileDetailOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileDetailOpen(false);
      onRequestClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, mobileDetailOpen, onRequestClose]);

  const handleRequestClose = () => {
    setMobileDetailOpen(false);
    onRequestClose?.();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.layout}>
      <aside className={styles.list}>
        <div className={styles.listScroll}>{listPanel}</div>
      </aside>
      {!isMobile ? (
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
      ) : null}
      </div>
      {isMobile && hasSelection && mobileDetailOpen ? (
        <div className={styles.mobileOverlay}>
          <button
            type="button"
            className={styles.mobileBackdrop}
            aria-label="关闭详情"
            onClick={handleRequestClose}
          />
          <section className={styles.mobileSheet}>
            <header className={styles.mobileSheetHeader}>
              <span className={styles.mobileSheetTitle}>详情</span>
              <button
                type="button"
                className={styles.mobileCloseBtn}
                onClick={handleRequestClose}
              >
                关闭
              </button>
            </header>
            <div className={styles.mobileSheetBody}>{detailPanel}</div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
