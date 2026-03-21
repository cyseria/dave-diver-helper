import { usePlayerProgress } from "./usePlayerProgress";

/** 可序列化的进度快照（与 zustand persist 中的数据字段一致） */
export interface PlayerProgressSnapshot {
  storyProgress: number;
  weaponLevel: number;
  capturedFishIds: string[];
  recipeEnhanceLevels: Record<string, number>;
  hiredStaffIds: string[];
  ownedWeaponIds: string[];
  fishStarRatings: Record<string, number>;
  completedQuestIds: string[];
}

export const BACKUP_FORMAT_VERSION = 1;

export interface BackupPayload {
  version: number;
  exportedAt: string;
  app: "dave-diver-helper";
  progress: PlayerProgressSnapshot;
}

export function getProgressSnapshot(): PlayerProgressSnapshot {
  const s = usePlayerProgress.getState();
  return {
    storyProgress: s.storyProgress,
    weaponLevel: s.weaponLevel,
    capturedFishIds: [...s.capturedFishIds],
    recipeEnhanceLevels: { ...s.recipeEnhanceLevels },
    hiredStaffIds: [...s.hiredStaffIds],
    ownedWeaponIds: [...s.ownedWeaponIds],
    fishStarRatings: { ...s.fishStarRatings },
    completedQuestIds: [...s.completedQuestIds],
  };
}

/** 用快照完全覆盖当前本地进度 */
export function applyProgressSnapshot(snapshot: PlayerProgressSnapshot): void {
  usePlayerProgress.setState({
    storyProgress: snapshot.storyProgress,
    weaponLevel: snapshot.weaponLevel,
    capturedFishIds: [...snapshot.capturedFishIds],
    recipeEnhanceLevels: { ...snapshot.recipeEnhanceLevels },
    hiredStaffIds: [...snapshot.hiredStaffIds],
    ownedWeaponIds: [...snapshot.ownedWeaponIds],
    fishStarRatings: { ...snapshot.fishStarRatings },
    completedQuestIds: [...snapshot.completedQuestIds],
  });
}

export function stringifyBackup(): string {
  const payload: BackupPayload = {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    app: "dave-diver-helper",
    progress: getProgressSnapshot(),
  };
  return JSON.stringify(payload, null, 2);
}

function normalizeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function normalizeRecordNumber(v: unknown): Record<string, number> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "number" && Number.isFinite(val)) out[k] = val;
  }
  return out;
}

function coalesceSnapshot(raw: unknown): PlayerProgressSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  return {
    storyProgress:
      typeof o.storyProgress === "number" && Number.isFinite(o.storyProgress)
        ? o.storyProgress
        : 0,
    weaponLevel:
      typeof o.weaponLevel === "number" && Number.isFinite(o.weaponLevel)
        ? o.weaponLevel
        : 0,
    capturedFishIds: normalizeStringArray(o.capturedFishIds),
    recipeEnhanceLevels: normalizeRecordNumber(o.recipeEnhanceLevels),
    hiredStaffIds: normalizeStringArray(o.hiredStaffIds),
    ownedWeaponIds: normalizeStringArray(o.ownedWeaponIds),
    fishStarRatings: normalizeRecordNumber(o.fishStarRatings),
    completedQuestIds: normalizeStringArray(o.completedQuestIds),
  };
}

export function parseBackupJson(
  text: string,
):
  | { ok: true; snapshot: PlayerProgressSnapshot }
  | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    return { ok: false, error: "无法解析 JSON，请检查是否完整粘贴。" };
  }

  const root = parsed;
  const version =
    root &&
    typeof root === "object" &&
    !Array.isArray(root) &&
    "version" in root
      ? (root as { version?: unknown }).version
      : undefined;

  if (
    typeof version === "number" &&
    Number.isFinite(version) &&
    version > BACKUP_FORMAT_VERSION
  ) {
    return { ok: false, error: "备份版本过新，请更新本站后再试。" };
  }

  const progressRaw =
    root &&
    typeof root === "object" &&
    !Array.isArray(root) &&
    "progress" in root
      ? (root as { progress: unknown }).progress
      : root;

  const snapshot = coalesceSnapshot(progressRaw);
  if (!snapshot) {
    return { ok: false, error: "数据格式不正确，缺少进度对象。" };
  }

  return { ok: true, snapshot };
}
