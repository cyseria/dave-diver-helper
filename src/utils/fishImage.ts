/**
 * 鱼类图片：数据里多为 /scripts/images/fish/xxx.png，实际文件在 src/images/fish/shallow|mid|... 下。
 * 通过 glob 在构建时收集 src 下所有 png，再按文件名解析出正确 URL。
 */
const fishImageModules = import.meta.glob<string>(
  "../images/fish/**/*.png",
  { as: "url", eager: true }
);

const byBasename = (() => {
  const map = new Map<string, string>();
  for (const [path, url] of Object.entries(fishImageModules)) {
    const name = path.replace(/^.*\//, "");
    if (!map.has(name)) map.set(name, url);
  }
  return map;
})();

/** 根据数据里的 image 路径（如 /scripts/images/fish/小丑鱼1.png）解析为可用的图片 URL */
export function getFishImageUrl(imagePath: string): string | null {
  if (!imagePath || typeof imagePath !== "string") return null;
  const name = imagePath.replace(/^.*\//, "");
  return byBasename.get(name) ?? null;
}
