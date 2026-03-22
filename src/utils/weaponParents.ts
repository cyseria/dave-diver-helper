import type { Weapon } from "../types";

/** 全部合成父级 id（主线 parentId + 合并 extraParentIds） */
export function getWeaponParentIds(w: Weapon): string[] {
  const ids: string[] = [];
  if (w.parentId) ids.push(w.parentId);
  if (w.extraParentIds?.length) ids.push(...w.extraParentIds);
  return ids;
}

/** 仅统计「本分类内」的父级，用于画树与判断根节点 */
export function parentsInCategory(
  w: Weapon,
  categoryWeapons: Weapon[],
): string[] {
  const allowed = new Set(categoryWeapons.map((x) => x.id));
  return getWeaponParentIds(w).filter((id) => allowed.has(id));
}

export function isRootInCategory(
  w: Weapon,
  categoryWeapons: Weapon[],
): boolean {
  return parentsInCategory(w, categoryWeapons).length === 0;
}

/** 作为「直接前置」指向该武器的子武器：主线子节点 + 合并线中的子节点 */
export function getDirectChildWeapons(
  weapon: Weapon,
  all: Weapon[],
): Weapon[] {
  return all.filter(
    (w) =>
      w.parentId === weapon.id ||
      (w.extraParentIds?.includes(weapon.id) ?? false),
  );
}
