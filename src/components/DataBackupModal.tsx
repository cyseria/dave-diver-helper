import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  applyProgressSnapshot,
  parseBackupJson,
} from "../store/playerProgressBackup";
import styles from "./DataBackupModal.module.css";

interface DataBackupModalProps {
  open: boolean;
  onClose: () => void;
}

export function DataBackupModal({ open, onClose }: DataBackupModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setText("");
    setError(null);
    const t = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  const handleImport = () => {
    const result = parseBackupJson(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    applyProgressSnapshot(result.snapshot);
    setText("");
    // 必须同步父级 open=false；仅 close() 不会更新 state，useEffect 会再次 showModal
    onClose();
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <h2 id={titleId} className={styles.title}>
        导入数据
      </h2>
      <p className={styles.hint}>
        将此前通过「导出」复制到剪贴板的 JSON 粘贴到下方。确认后将
        <strong>覆盖</strong>当前浏览器中的本地进度（捕获、员工、任务等）。
      </p>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        placeholder='例如：{ "version": 1, "progress": { ... } }'
        rows={14}
        spellCheck={false}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => onClose()}
        >
          取消
        </button>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleImport}
        >
          导入并覆盖
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
