/**
 * 鱼类图片：数据中引用为 images/fish/{folder}/{filename}，与 src/images/fish 下子目录一致。
 * 通过 glob 在构建时收集图片，按 folder/filename 解析出 URL。
 */
const fishImageModules = import.meta.glob<string>(
  "../images/fish/**/*.{png,jpg,jpeg}",
  { as: "url", eager: true }
);

/** key: "folder/filename"（如 shallow/小丑鱼.png），value: 构建后的 URL */
const byPath = (() => {
  const map = new Map<string, string>();
  for (const [path, url] of Object.entries(fishImageModules)) {
    const afterFish = path.replace(/^.*fish[/\\]/, "");
    const key = afterFish.replace(/\\/g, "/");
    if (!map.has(key)) map.set(key, url);
  }
  return map;
})();

/** 根据数据里的 image 路径（如 images/fish/shallow/小丑鱼.png 或 shallow/小丑鱼.png）解析为可用的图片 URL */
export function getFishImageUrl(imagePath: string): string | null {
  if (!imagePath || typeof imagePath !== "string") return null;
  const key = imagePath.includes("images/fish/")
    ? imagePath.replace(/^.*images\/fish\//, "")
    : imagePath;
  return byPath.get(key) ?? null;
}