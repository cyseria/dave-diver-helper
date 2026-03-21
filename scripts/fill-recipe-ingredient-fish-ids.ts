/**
 * 为食谱食材写入 fishId（规则见 src/utils/ingredientFishResolve.ts）。
 * 用法：npx tsx scripts/fill-recipe-ingredient-fish-ids.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fishData } from "../src/data/fish/index.ts";
import { resolveIngredientFishIdFromName } from "../src/utils/ingredientFishResolve.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const recipesPath = join(__dirname, "../src/data/recipes.ts");

let text = readFileSync(recipesPath, "utf8");

let exactTotal = 0;
for (const fish of fishData) {
  const name = fish.name;
  const needle = `        name: "${name}",\n        emoji:`;
  const insert = `        name: "${name}",\n        fishId: "${fish.id}",\n        emoji:`;

  if (!text.includes(needle)) continue;

  const before = text;
  text = text.split(needle).join(insert);
  exactTotal += before.split(needle).length - 1;
}

let ruleTotal = 0;
text = text.replace(
  / {8}name: "([^"]+)",\n {8}emoji:/g,
  (full, ingName: string) => {
    const id = resolveIngredientFishIdFromName(ingName);
    if (!id) return full;
    ruleTotal += 1;
    return `        name: "${ingName}",\n        fishId: "${id}",\n        emoji:`;
  },
);

writeFileSync(recipesPath, text, "utf8");
console.log(
  `已写入 fishId：完全匹配 ${exactTotal} 处；规则解析 ${ruleTotal} 处（金枪鱼部位、大西洋蓝鳍、肉片等，见 ingredientFishResolve）`,
);
