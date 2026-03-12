import type { Fish } from "../types";
import { fish } from "./helpers";

export const glacialPassageFish: Fish[] = [
  // ── Glacial Passage，由 scripts/fish-list.tsv 生成，图片在 src/images/fish/glacialPassage ──
  fish({
    id: "peacock_squid",
    name: "孔雀鱿鱼",
    image: "images/fish/glacialPassage/孔雀鱿鱼.png",
    zones: ["冰河通道"],
    weight: 3.5,
    meatByStar: [1, 2, 3],
  }),
  fish({
    id: "dumbo_octopus",
    name: "小飞象章鱼",
    image: "images/fish/glacialPassage/小飞象章鱼.png",
    zones: ["冰河通道"],
    weight: 4,
    meatByStar: [1, 2, 3],
  }),
  fish({
    id: "barreleye",
    name: "桶眼鱼",
    image: "images/fish/glacialPassage/桶眼鱼.png",
    zones: ["冰河通道"],
    weight: 3,
    meatByStar: [1, 2, 3],
  }),
  fish({
    id: "soft_sculpin",
    name: "软隐棘杜父鱼",
    image: "images/fish/glacialPassage/软隐棘杜父鱼.png",
    zones: ["冰河通道"],
    weight: 2,
    meatByStar: [1, 2, 3],
  }),
  fish({
    id: "vampire_squid",
    name: "吸血鱿鱼",
    image: "images/fish/glacialPassage/吸血鱿鱼.png",
    zones: ["冰河通道"],
    weight: 6,
    meatByStar: [2, 3, 5],
  }),
  fish({
    id: "pelican_eel",
    name: "鹈鹕鳗",
    image: "images/fish/glacialPassage/鹈鹕鳗.png",
    zones: ["冰河通道"],
    note: "（即宽咽鳗/吞鳗）",
    weight: 8,
    meatByStar: [2, 3, 5],
  }),
];
