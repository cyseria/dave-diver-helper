import type { Fish } from "../types";
import { fish } from "./helpers";

export const legacyFish: Fish[] = [
// ── Legacy fish with recipes ─────────────────────────────────────────────
  fish({
    id: "pufferfish",
    name: "河豚",
    depthMin: 10,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    recipeIds: ["puffer_sashimi"],
    weight: 1.2,
    meatByStar: [1, 3, 5],
  }),
  fish({
    id: "salmon",
    name: "三文鱼",
    depthMin: 20,
    depthMax: 70,
    time: "day",
    zones: ["蓝洞中层"],
    recipeIds: ["salmon_bowl", "salmon_sushi"],
  }),
  fish({
    id: "red_snapper",
    name: "红鲷鱼",
    depthMin: 20,
    depthMax: 80,
    time: "day",
    zones: ["蓝洞中层"],
    recipeIds: ["red_snapper_soup"],
  }),
  fish({
    id: "grouper",
    name: "石斑鱼",
    depthMin: 10,
    depthMax: 80,
    time: "day",
    zones: ["蓝洞中层"],
    recipeIds: ["red_snapper_soup"],
  }),
  fish({
    id: "tuna",
    name: "金枪鱼",
    depthMin: 30,
    depthMax: 130,
    time: "day",
    zones: ["蓝洞中层"],
    recipeIds: ["tuna_sashimi", "tuna_sushi"],
  }),
  fish({
    id: "lionfish",
    name: "狮子鱼",
    depthMin: 30,
    depthMax: 100,
    time: "day",
    zones: ["蓝洞中层"],
    recipeIds: ["lionfish_fillet"],
  }),
];
