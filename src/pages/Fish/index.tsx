import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EncyclopediaLayout } from "../../components/EncyclopediaLayout";
import { TabBar } from "../../components/TabBar";
import { fishData } from "../../data/fish";
import { fishGuideModules } from "../../data/fishGuideModules";
import { recipeData } from "../../data/recipes";
import { useIsMobile } from "../../hooks/useIsMobile";
import { usePlayerProgress } from "../../store/usePlayerProgress";
import { getFishImageUrl } from "../../utils/fishImage";
import { getRecipeImageUrl } from "../../utils/recipeImage";
import styles from "./Fish.module.css";

// Used by tab bar (keyed by module id)
const FISH_MODULE_EMOJI: Record<string, string> = {
  "blue-hole-entrance": "🌊",
  "blue-hole-mid": "🛳️",
  "blue-hole-depths": "🐙",
  "night-only": "🌙",
  "glacier-passage": "🧊",
  "glacial-area": "❄️",
  "hydrothermal-vents": "🌋",
  seahorses: "🐴",
  "fish-trap": "🦞",
};

// Used by zone chips in detail panel (keyed by Chinese zone name)
const ZONE_EMOJI: Record<string, string> = {
  蓝洞入口: "🌊",
  蓝洞中层: "🛳️",
  蓝洞深海: "🐙",
  夜行性: "🌙",
  冰河通道: "🧊",
  冰河地区: "❄️",
  热泉喷出区域: "🌋",
  海马: "🐴",
  鱼笼: "🦞",
};

const FISH_MODULE_THEME: Record<
  string,
  {
    activeBg: string;
    activeBorder: string;
    activeColor: string;
    hoverBg: string;
  }
> = {
  "blue-hole-entrance": {
    activeBg: "#e6f5ff",
    activeBorder: "#3b82f6",
    activeColor: "#1e3a8a",
    hoverBg: "rgba(59, 130, 246, 0.08)",
  },
  "blue-hole-mid": {
    activeBg: "#eafaf0",
    activeBorder: "#22c55e",
    activeColor: "#14532d",
    hoverBg: "rgba(34, 197, 94, 0.10)",
  },
  "blue-hole-depths": {
    activeBg: "#e0f2fe",
    activeBorder: "#0ea5e9",
    activeColor: "#0c4a6e",
    hoverBg: "rgba(14, 165, 233, 0.10)",
  },
  "night-only": {
    activeBg: "#f5f3ff",
    activeBorder: "#8b5cf6",
    activeColor: "#3730a3",
    hoverBg: "rgba(139, 92, 246, 0.10)",
  },
  "glacier-passage": {
    activeBg: "#eff6ff",
    activeBorder: "#60a5fa",
    activeColor: "#1e3a8a",
    hoverBg: "rgba(96, 165, 250, 0.10)",
  },
  "glacial-area": {
    activeBg: "#ecfeff",
    activeBorder: "#06b6d4",
    activeColor: "#155e75",
    hoverBg: "rgba(6, 182, 212, 0.10)",
  },
  "hydrothermal-vents": {
    activeBg: "#fff7ed",
    activeBorder: "#f97316",
    activeColor: "#9a3412",
    hoverBg: "rgba(249, 115, 22, 0.10)",
  },
  seahorses: {
    activeBg: "#fef9c3",
    activeBorder: "#f59e0b",
    activeColor: "#92400e",
    hoverBg: "rgba(245, 158, 11, 0.12)",
  },
  "fish-trap": {
    activeBg: "#fef2f2",
    activeBorder: "#ef4444",
    activeColor: "#991b1b",
    hoverBg: "rgba(239, 68, 68, 0.10)",
  },
};

const STAR_POSITIONS = [1, 2, 3] as const;

const CAPTURE_HINT_PATTERNS = [
  /三星|3星|捕获|捕捉|鱼叉|网枪|渔网|睡眠|麻醉|无人机/u,
  /受击判定|弱点|蓄力|弹反|击杀|打法|武器|硬直|破壳|自爆|子弹时间|导弹/u,
] as const;

const REMARK_PATTERNS = [
  /雷暴|节日|活动|剧情|支线|任务|触发|解锁/u,
  /白天|夜间|夜晚|天气|出现|刷新|限时|仅在|随机|洞窟|路牌|概率|别名/u,
] as const;

const NOTE_SPLIT_MARKERS =
  /\s+(?=(只在|主线|推进主线|完成|触发记者|触发|雷暴天时|出现于|位于|白天|用鱼叉|3星需要|膨胀时|解锁手套|解锁网兜))/gu;

const NOTE_CLEANUP_REPLACEMENTS: Array<[RegExp, string]> = [
  [/更多相关内容请关注[:：]?潜水员戴夫专区/gu, ""],
  [/责任编辑[:：]?\s*\S+/gu, ""],
  [/以上就是热泉喷出区域的全部图鉴。?/gu, ""],
  [
    /中后期的深海、冰河和热泉区域基本都是固定地形，没有浅海那样的随机性，生物种类也相对没那么丰富，算是美中不足。?/gu,
    "",
  ],
  [/顺带一提，作为boss的幻影水母，体型其实不如狮鬃水母。?/gu, ""],
  [/如果仅论体长的话，狮鬃水母甚至比蓝鲸更长哦。?/gu, ""],
  [/实际上除了腔棘鱼之外，此区域的所有物种现实中都已灭绝。?/gu, ""],
  [/（话说[^）]*）/gu, ""],
  [/\(话说[^)]*\)/gu, ""],
  [/可以可以/gu, "可以"],
  [/横板/gu, "横版"],
  [/stg/giu, "STG"],
  [/\s+/gu, " "],
];

type NoteRule = {
  pattern: RegExp;
  text: string;
  target: "capture" | "remark";
};

const NOTE_RULES: NoteRule[] = [
  {
    pattern:
      /用鱼叉和枪支只能击杀.*(?:3星|三星)需要用网(?:枪|兜)?(?:或|或者).*(?:睡眠|麻醉).*无人机/u,
    text: "鱼叉/枪支只能击杀。想拿三星，先用网枪或睡眠控制，再立刻用无人机回收。",
    target: "capture",
  },
  {
    pattern: /用鱼叉和枪支只能击杀.*(?:3星|三星)需要用睡眠配合无人机捕获/u,
    text: "鱼叉/枪支只能击杀。想拿三星，先睡眠控制，再用无人机回收。",
    target: "capture",
  },
  {
    pattern:
      /用鱼叉和枪支只能击杀.*(?:3星|三星)需要用网(?:枪|兜)?(?:或|或者).*(?:睡眠|麻醉)捕获/u,
    text: "鱼叉/枪支只能击杀。想拿三星，建议网枪或睡眠控制后收取。",
    target: "capture",
  },
  {
    pattern: /用鱼叉只能(?:打出|得到)1星.*(?:网枪|网|睡眠枪|睡眠)/u,
    text: "鱼叉只能拿到 1 星，建议用网枪或睡眠枪直取三星。",
    target: "capture",
  },
  {
    pattern: /推进主线解锁网兜后可以捕获|解锁网兜后可以捕获/u,
    text: "推进主线解锁网兜后即可稳定捕获。",
    target: "capture",
  },
  {
    pattern: /推进主线解锁手套后可以捕获/u,
    text: "推进主线解锁手套后即可采集。",
    target: "capture",
  },
  {
    pattern: /膨胀时免疫子弹/u,
    text: "目标膨胀状态免疫子弹，建议等回缩后再控制捕获。",
    target: "capture",
  },
  {
    pattern: /完全防弹.*石头砸死/u,
    text: "外壳防弹，先搬石头破防；想拿三星需用满级网枪收取。",
    target: "capture",
  },
  {
    pattern: /(?:3星|三星)需要用满级网枪捕获/u,
    text: "三星建议使用满级网枪，避免直接击杀。",
    target: "capture",
  },
  {
    pattern: /埋地时网枪会被地面阻挡/u,
    text: "埋地时网枪会被地形挡住，先引它出招再补网。",
    target: "capture",
  },
  {
    pattern: /用鱼叉或枪支击杀会导致自爆/u,
    text: "鱼叉/枪支击杀会触发自爆，建议网枪或睡眠捕获。",
    target: "capture",
  },
  {
    pattern: /仇恨范围外射网|第一时间收获/u,
    text: "触发仇恨后会延时自爆，需在仇恨外开网或立刻回收。",
    target: "capture",
  },
  {
    pattern: /攻击眼睛即可造成伤害|只有眼睛有受击判定/u,
    text: "眼睛是核心弱点，优先瞄准眼部输出。",
    target: "capture",
  },
  {
    pattern: /嘴是弱点/u,
    text: "头部伸出的嘴是弱点，抓住露头窗口输出。",
    target: "capture",
  },
  {
    pattern: /尾巴尖端是弱点|暴露出尾巴/u,
    text: "尾巴尖端是弱点，躲招后趁硬直打尾部。",
    target: "capture",
  },
  {
    pattern: /搬炸药桶破坏背壳/u,
    text: "先搬炸药桶破壳，再集中火力输出。",
    target: "capture",
  },
  {
    pattern: /摆锤弹反/u,
    text: "Boss 蓄力时可触发场景摆锤弹反，形成爆发窗口。",
    target: "capture",
  },
  {
    pattern: /正常战斗打掉一定血量即可进入剧情/u,
    text: "稳步压血即可推进剧情，无需强行速杀。",
    target: "capture",
  },
  {
    pattern: /白鲸的冲撞攻击/u,
    text: "躲避阶段后瞄准红色弱点，用白鲸冲撞输出。",
    target: "capture",
  },
  {
    pattern: /建木果实/u,
    text: "控制鲛人击打建木果实制造硬直，再集中输出。",
    target: "capture",
  },
  {
    pattern: /导弹发射器/u,
    text: "优先使用机甲导弹发射器打爆发，装填时注意走位。",
    target: "capture",
  },
  {
    pattern: /横版STG|子弹时间|蓄力发射的激光/u,
    text: "战斗为横版 STG：子弹时间留给高压波次，蓄力激光用于清弹与斩杀。",
    target: "capture",
  },
  {
    pattern: /只在触发金枪鱼节活动时出现/u,
    text: "仅在金枪鱼节活动期间出现。",
    target: "remark",
  },
  {
    pattern: /只在触发旗鱼节活动时出现/u,
    text: "仅在旗鱼节活动期间出现。",
    target: "remark",
  },
  {
    pattern: /只在触发鲨鱼节活动时出现/u,
    text: "仅在鲨鱼节活动期间出现。",
    target: "remark",
  },
  {
    pattern: /主线推进后才会出现/u,
    text: "需主线推进到指定阶段后才会出现。",
    target: "remark",
  },
  {
    pattern: /出现于遇难船内部/u,
    text: "常见于遇难船内部区域。",
    target: "remark",
  },
  {
    pattern: /完成帮助座头鲸母子支线后拍照解锁/u,
    text: "完成座头鲸母子支线后，通过拍照收录。",
    target: "remark",
  },
  {
    pattern: /完成数次帮助海豚支线后拍照解锁/u,
    text: "完成多次海豚支线后，通过拍照收录。",
    target: "remark",
  },
  {
    pattern: /完成帮助棱皮龟的支线后随机出现/u,
    text: "完成棱皮龟支线后随机出现。",
    target: "remark",
  },
  {
    pattern: /触发记者的夜潜拍照事件后拍照解锁/u,
    text: "触发记者夜潜拍照事件后，通过拍照收录。",
    target: "remark",
  },
  {
    pattern: /拍照后解锁/u,
    text: "通过拍照即可收录图鉴。",
    target: "remark",
  },
  {
    pattern: /随机出现/u,
    text: "该目标为随机刷新。",
    target: "remark",
  },
  {
    pattern: /白天躲在洞穴时无敌.*夜晚会出没/u,
    text: "白天在洞穴内无敌，仅夜晚会出没。",
    target: "remark",
  },
  {
    pattern: /雷暴天时触发小智的boss战支线/u,
    text: "雷暴天气会触发小智支线 Boss 战。",
    target: "remark",
  },
  {
    pattern: /雷暴天时触发老奶奶的boss战支线/u,
    text: "雷暴天气会触发老奶奶支线 Boss 战。",
    target: "remark",
  },
  {
    pattern: /鲛人村小朋友们的支线boss/u,
    text: "鲛人村小朋友支线 Boss。",
    target: "remark",
  },
  {
    pattern: /任务地点深海湖位于深海区域的右侧，有路牌指引/u,
    text: "任务点在深海湖（深海区域右侧路牌处）。",
    target: "remark",
  },
  {
    pattern: /中层海域出现的巨型章鱼 boss/u,
    text: "中层海域剧情 Boss。",
    target: "remark",
  },
  {
    pattern: /位于第一个冰河洞窟内，金龙雕像右侧的区域/u,
    text: "位于第一冰河洞窟金龙雕像右侧区域。",
    target: "remark",
  },
  {
    pattern: /主线boss，解救白鲸后在第二个冰河洞窟深处遇到/u,
    text: "主线 Boss：解救白鲸后，在第二冰河洞窟深处触发。",
    target: "remark",
  },
  {
    pattern: /开启2个冰河洞窟的开关后方可进入/u,
    text: "需先开启 2 个冰河洞窟开关后才能进入。",
    target: "remark",
  },
  {
    pattern: /主线boss，位于第三个冰河洞窟/u,
    text: "主线 Boss，位于第三冰河洞窟。",
    target: "remark",
  },
  {
    pattern: /开启全部3个开关后前往建木控制室大门附近就会触发剧情/u,
    text: "开启 3 个开关后，在建木控制室大门附近触发剧情。",
    target: "remark",
  },
  {
    pattern: /主线最终boss/u,
    text: "主线最终 Boss。",
    target: "remark",
  },
  {
    pattern: /只在钟乳洞出现，出现概率也较低/u,
    text: "仅在钟乳洞刷新，出现概率较低。",
    target: "remark",
  },
  {
    pattern: /（即宽咽鳗\/吞鳗）|\(即宽咽鳗\/吞鳗\)/u,
    text: "别名：吞鳗。",
    target: "remark",
  },
];

type FishHintOverride = {
  captureTips?: string[];
  remarks?: string[];
};

const FISH_HINT_OVERRIDES: Record<string, FishHintOverride> = {
  barrel_jellyfish: {
    captureTips: ["鱼叉仅能拿到 1 星，建议用网枪或睡眠枪直接收 3 星。"],
  },
  fried_egg_jellyfish: {
    captureTips: ["鱼叉仅能拿到 1 星，建议用网枪或睡眠枪直接收 3 星。"],
  },
  box_jellyfish: {
    captureTips: ["鱼叉仅能拿到 1 星，建议用网枪或睡眠枪直接收 3 星。"],
  },
  australian_spotted_jellyfish: {
    captureTips: ["鱼叉仅能拿到 1 星，建议用网枪或睡眠枪直接收 3 星。"],
  },
  starry_puffer: {
    captureTips: ["等其解除膨胀后再网枪/睡眠，膨胀状态下子弹无效。"],
  },
  bluefin_tuna: {
    captureTips: ["活动期间建议先睡眠控制，再用无人机回收以保三星。"],
    remarks: ["仅在金枪鱼节活动期间出现。"],
  },
  yellowfin_tuna: {
    captureTips: ["活动期间建议先睡眠控制，再用无人机回收以保三星。"],
    remarks: ["仅在金枪鱼节活动期间出现。"],
  },
  marlin: {
    captureTips: ["先睡眠或网住后立刻无人机回收，避免掉星。"],
    remarks: ["仅在旗鱼节活动期间出现。"],
  },
  sailfish: {
    captureTips: ["先睡眠或网住后立刻无人机回收，避免掉星。"],
    remarks: ["仅在旗鱼节活动期间出现，常见于遇难船内部。"],
  },
  mako_shark: {
    captureTips: ["建议睡眠后无人机回收，直接硬打通常只能拿低星。"],
    remarks: ["仅在鲨鱼节活动期间出现。"],
  },
  zebra_shark: {
    captureTips: ["建议睡眠后无人机回收，直接硬打通常只能拿低星。"],
    remarks: ["仅在鲨鱼节活动期间出现。"],
  },
  manta_ray: {
    captureTips: ["该条目为拍照收录，不存在三星捕获。"],
    remarks: ["触发记者夜潜拍照支线后可拍照解锁。"],
  },
  red_lipped_batfish: {
    captureTips: ["该条目为拍照收录，不存在三星捕获。"],
    remarks: ["触发记者夜潜拍照支线后可拍照解锁，且为随机出现。"],
  },
  baby_humpback_whale: {
    captureTips: ["该条目为拍照收录，不存在三星捕获。"],
    remarks: ["完成座头鲸母子支线后可拍照解锁。"],
  },
  pink_dolphin: {
    captureTips: ["该条目为拍照收录，不存在三星捕获。"],
    remarks: ["完成数次海豚相关支线后可拍照解锁。"],
  },
  loggerhead_turtle: {
    captureTips: ["该条目为拍照收录，不存在三星捕获。"],
    remarks: ["随机出现，拍照后解锁。"],
  },
  truck_hermit_crab: {
    captureTips: ["优先搬运炸药桶破背壳，破甲后再集中输出。"],
    remarks: ["雷暴天气触发小智支线 Boss 战。"],
  },
  mantis_shrimp: {
    captureTips: [
      "眼睛是主要弱点，Boss 蓄力时可利用场景摆锤弹反制造输出窗口。",
    ],
    remarks: ["雷暴天气触发小智支线 Boss 战。"],
  },
  great_white_shark_klaus: {
    captureTips: ["稳扎稳打压血即可推进剧情，不必贪刀。"],
    remarks: ["雷暴天气触发老奶奶支线 Boss 战。"],
  },
  giant_squid: {
    captureTips: ["优先瞄准眼睛输出，规避触手前摇后再反打。"],
    remarks: ["主线早期 Boss。"],
  },
  goblin_shark: {
    captureTips: ["进入战斗前先补满氧气与弹药，战场在深海湖区域。"],
    remarks: ["鲛人村儿童支线 Boss，位置在深海区域右侧路牌附近。"],
  },
  phantom_jellyfish: {
    captureTips: ["躲避阶段后会露出红色弱点，再用白鲸冲撞输出。"],
    remarks: ["解救白鲸后于第二冰河洞窟深处触发主线 Boss 战。"],
  },
  helicoprion: {
    captureTips: ["控制鲛人击打建木果实打出硬直，再集中输出。"],
    remarks: ["主线 Boss，位于第三冰河洞窟。"],
  },
  anomalocaris: {
    captureTips: [
      "战斗为横版 STG：优先清弹，子弹时间留给高压波次再开。蓄力激光用于关键消弹。",
    ],
    remarks: ["主线最终 Boss。"],
  },
};

function splitNoteSegments(note: string): string[] {
  const injected = note.replace(NOTE_SPLIT_MARKERS, "。");
  return injected
    .split(/[。！？!\?\n]/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function normalizeFishNote(note: string): string {
  let out = note;
  for (const [pattern, replacement] of NOTE_CLEANUP_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out
    .replace(/3星/gu, "三星")
    .replace(/[，,。；;!?！？]+$/u, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizeNoteSegment(segment: string): string {
  return segment
    .replace(/^主线boss/u, "主线 Boss")
    .replace(/^boss/u, "Boss")
    .replace(/boss/gu, "Boss")
    .replace(/3星/gu, "三星")
    .replace(/\s+/gu, " ")
    .trim();
}

function buildHintSemanticKey(text: string, target: "capture" | "remark"): string {
  const normalized = text
    .replace(/3星/gu, "三星")
    .replace(/鱼叉\/枪支/gu, "鱼叉和枪支")
    .replace(/渔网|网兜/gu, "网")
    .replace(/睡眠枪/gu, "睡眠")
    .replace(/捕捉/gu, "捕获")
    .replace(/\s+/gu, " ")
    .trim();

  const flags: string[] = [];
  const pushIf = (token: string, re: RegExp) => {
    if (re.test(normalized)) flags.push(token);
  };

  if (target === "capture") {
    pushIf("kill_only", /只能击杀|只能打出1星|只能得到1星/u);
    pushIf("three_star", /三星/u);
    pushIf("need_net", /网枪|网|网捕/u);
    pushIf("need_sleep", /睡眠|麻醉/u);
    pushIf("need_drone", /无人机/u);
    pushIf("self_destruct", /自爆/u);
    pushIf("weak_eye", /眼睛.*弱点|眼睛有受击判定/u);
    pushIf("weak_tail", /尾巴.*弱点|尾巴尖端/u);
    pushIf("weak_mouth", /嘴.*弱点/u);
    pushIf("counter", /弹反|摆锤/u);
    pushIf("stg", /STG|子弹时间|清弹/u);
    pushIf("drill_opening", /硬直|破壳|破防/u);
    pushIf("photo_only", /拍照收录|拍照解锁/u);
  } else {
    pushIf("festival_tuna", /金枪鱼节/u);
    pushIf("festival_marlin", /旗鱼节/u);
    pushIf("festival_shark", /鲨鱼节/u);
    pushIf("thunderstorm", /雷暴/u);
    pushIf("mainline_gate", /主线推进|主线|剧情/u);
    pushIf("sidequest", /支线|任务/u);
    pushIf("photo_unlock", /拍照收录|拍照解锁/u);
    pushIf("random_spawn", /随机/u);
    pushIf("night_only", /夜晚|夜间|夜潜/u);
    pushIf("shipwreck", /遇难船/u);
    pushIf("cave", /洞窟|钟乳洞/u);
    pushIf("location_hint", /路牌|右侧|区域|位于/u);
    pushIf("alias", /别名/u);
  }

  if (flags.length > 0) return `${target}:${flags.sort().join("|")}`;
  return `${target}:${normalized.replace(/[，,。；;！!？?\s]/gu, "")}`;
}

function uniqueTextList(list: string[], target: "capture" | "remark" = "remark"): string[] {
  const normalizeOutput = (text: string) =>
    text.replace(/3星/gu, "三星").replace(/\s+/gu, " ").trim();

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const clean = normalizeOutput(item);
    if (!clean) continue;
    const key = buildHintSemanticKey(clean, target);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

function classifyFishNote(note?: string): {
  captureTips: string[];
  remarks: string[];
} {
  if (!note) return { captureTips: [], remarks: [] };
  const normalizedNote = normalizeFishNote(note);
  if (!normalizedNote) return { captureTips: [], remarks: [] };

  const captureTips: string[] = [];
  const remarks: string[] = [];

  for (const rule of NOTE_RULES) {
    if (!rule.pattern.test(normalizedNote)) continue;
    if (rule.target === "capture") captureTips.push(rule.text);
    else remarks.push(rule.text);
  }

  const segments = splitNoteSegments(normalizedNote);

  for (const seg of segments) {
    const normalizedSeg = normalizeNoteSegment(seg);
    if (!normalizedSeg) continue;

    const coveredByRule = NOTE_RULES.some((rule) => rule.pattern.test(normalizedSeg));
    if (coveredByRule) continue;

    const isCapture = CAPTURE_HINT_PATTERNS.some((re) => re.test(normalizedSeg));
    const isRemark = REMARK_PATTERNS.some((re) => re.test(normalizedSeg));

    if (isCapture) {
      captureTips.push(normalizedSeg);
      continue;
    }
    if (isRemark) {
      remarks.push(normalizedSeg);
      continue;
    }
    // 未识别语义的 note 片段默认归入备注，避免信息丢失
    remarks.push(normalizedSeg);
  }

  return {
    captureTips: uniqueTextList(captureTips, "capture"),
    remarks: uniqueTextList(remarks, "remark"),
  };
}

function zoneToMapZone(zoneName: string): "shallow" | "deep" | "binghe" {
  if (zoneName === "冰河通道" || zoneName === "冰河地区") return "binghe";
  if (zoneName === "热泉喷出区域") return "deep";
  return "shallow";
}

function StarRating({
  stars,
  captured,
  size = "sm",
  onRate,
  rootClassName,
  onRootClick,
  onRootKeyDown,
}: {
  stars: number;
  captured: boolean;
  size?: "sm" | "lg";
  onRate?: (n: number) => void;
  rootClassName?: string;
  onRootClick?: (e: React.MouseEvent) => void;
  onRootKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [animStar, setAnimStar] = useState<number | null>(null);
  const [hoverStar, setHoverStar] = useState<number | null>(null);

  const isUncaptureHint = captured && hoverStar === stars;

  const getSpanClass = (pos: number): string => {
    if (animStar === pos) return styles.starFilled;
    if (isUncaptureHint) {
      return pos <= stars ? styles.starWarning : styles.starGray;
    }
    if (hoverStar !== null) {
      return pos <= hoverStar ? styles.starPreview : styles.starGray;
    }
    return captured && pos <= stars ? styles.starFilled : styles.starGray;
  };

  const getTitle = (pos: number): string => {
    if (!captured) return `捕获并评为 ${pos} 星`;
    if (pos === stars) return "再次点击 → 取消捕获";
    return `改为 ${pos} 星`;
  };

  const handleClick = (pos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimStar(pos);
    onRate?.(pos);
    setTimeout(() => setAnimStar(null), 500);
  };

  const sizeClass = size === "lg" ? styles.starLg : styles.starSm;

  return (
    <div
      className={`${styles.starsTrack} ${size === "lg" ? styles.starsTrackLg : ""} ${rootClassName ?? ""}`.trim()}
      onMouseLeave={() => setHoverStar(null)}
      onClick={onRootClick}
      onKeyDown={onRootKeyDown as React.KeyboardEventHandler<HTMLDivElement>}
    >
      {STAR_POSITIONS.map((pos) => (
        <button
          key={pos}
          type="button"
          className={`${styles.starBtn} ${sizeClass} ${hoverStar !== null && pos <= hoverStar ? styles.starBtnHovered : ""} ${isUncaptureHint && pos <= stars ? styles.starBtnWarn : ""}`}
          onClick={(e) => handleClick(pos, e)}
          onMouseEnter={() => setHoverStar(pos)}
          title={getTitle(pos)}
        >
          <span
            className={`${getSpanClass(pos)} ${animStar === pos ? styles.starAnim : ""}`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function Fish() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    fishGuideModules[0]?.id ?? "blue-hole-entrance",
  );
  const {
    capturedFishIds,
    fishStarRatings,
    toggleFishCaptured,
    setFishStarRating,
  } = usePlayerProgress();

  const selected = id ? fishData.find((f) => f.id === id) : null;
  const relatedRecipes = useMemo(() => {
    if (!selected) return [];
    const byIngredient = recipeData.filter((r) =>
      r.ingredients.some((ing) => ing.fishId === selected.id),
    );
    const byLegacy = recipeData.filter((r) => selected.recipeIds.includes(r.id));
    const unique = new Map<string, (typeof recipeData)[number]>();
    for (const recipe of [...byIngredient, ...byLegacy]) {
      unique.set(recipe.id, recipe);
    }
    return [...unique.values()];
  }, [selected]);

  const selectedModule =
    fishGuideModules.find((m) => m.id === selectedModuleId) ??
    fishGuideModules[0];

  // 顺序严格按 fishData（即 shallow / mid / depths 等文件中的书写顺序）
  const moduleFish = selectedModule
    ? fishData.filter((f) => f.zones?.includes(selectedModule.name))
    : fishData;

  // 无 id / 无效 id：默认当前 Tab 第一条；有效 id 但不在当前 Tab 列表：切换 Tab（从食谱跳入时常见），勿误跳到别的鱼
  useEffect(() => {
    const first = moduleFish[0];
    if (!first) return;

    if (!id) {
      if (isMobile) return;
      navigate(`/fish/${first.id}`, { replace: true });
      return;
    }

    const fish = fishData.find((f) => f.id === id);
    if (!fish) {
      navigate(`/fish/${first.id}`, { replace: true });
      return;
    }

    const inModule = moduleFish.some((f) => f.id === id);
    if (!inModule) {
      const mod =
        fishGuideModules.find((m) => fish.zones?.includes(m.name)) ??
        fishGuideModules.find((m) => m.fishIds.includes(id));
      if (mod) setSelectedModuleId(mod.id);
      else navigate(`/fish/${first.id}`, { replace: true });
      return;
    }
  }, [id, isMobile, navigate, moduleFish]);

  // 选中鱼在左侧列表中滚入可视区域（URL 带 id 或 Tab 切换后需等列表重绘）
  // biome-ignore lint/correctness/useExhaustiveDependencies: 需与 selectedModuleId 同步，从食谱跳入会先切 Tab 再滚
  useEffect(() => {
    if (!id) return;
    const raf = requestAnimationFrame(() => {
      const safe =
        typeof CSS !== "undefined" && typeof CSS.escape === "function"
          ? CSS.escape(id)
          : id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const el = document.querySelector(`[data-fish-card-id="${safe}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [id, selectedModuleId]);

  const getStars = (fishId: string, defaultStars: number) =>
    fishStarRatings[fishId] || defaultStars;

  /** 切换区域 Tab 时同步路由到该分区第一条鱼，否则 useEffect 会因「当前鱼不在新列表」把 Tab 弹回原区 */
  const handleFishModuleTabChange = useCallback(
    (moduleId: string) => {
      const mod = fishGuideModules.find((m) => m.id === moduleId);
      if (!mod) return;
      const list = fishData.filter((f) => f.zones?.includes(mod.name));
      const first = list[0];
      if (isMobile && !id) {
        setSelectedModuleId(moduleId);
        return;
      }
      if (first) navigate(`/fish/${first.id}`, { replace: true });
    },
    [id, isMobile, navigate],
  );

  const habitatZones = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{
      id: string;
      name: string;
      emoji: string;
      mapZone: "shallow" | "deep" | "binghe";
    }> = [];
    for (const name of selected?.zones ?? []) {
      if (seen.has(name)) continue;
      seen.add(name);
      out.push({
        id: name,
        name,
        emoji: ZONE_EMOJI[name] ?? "🗺️",
        mapZone: zoneToMapZone(name),
      });
    }
    return out;
  }, [selected?.zones]);

  const detailHints = useMemo(() => {
    if (!selected) return { captureTips: [], remarks: [] };

    const parsed = classifyFishNote(selected.note);
    const override = FISH_HINT_OVERRIDES[selected.id];
    const captureTips = override?.captureTips
      ? [...override.captureTips]
      : [...parsed.captureTips];
    const remarks = override?.remarks ? [...override.remarks] : [...parsed.remarks];

    if (captureTips.length === 0) {
      if (selected.category === "photo") {
        captureTips.push("该条目通过拍照收录，不存在三星捕获。");
      } else if (selected.category === "seahorse") {
        captureTips.push("需要虫网捕捉，优先贴近后再出手。");
      } else if (selected.category === "trap") {
        captureTips.push("只能使用鱼笼/蟹笼获取，无法直接鱼叉捕获。");
      } else if (selected.category === "boss") {
        captureTips.push("Boss 目标建议先控制/规避技能，再抓输出窗口。");
      } else if (selectedModule?.tips?.[0]) {
        captureTips.push(selectedModule.tips[0]);
      }
    }

    if (selected.habitat) {
      remarks.unshift(`常见栖息位置：${selected.habitat}`);
    }

    return {
      captureTips: uniqueTextList(captureTips, "capture"),
      remarks: uniqueTextList(remarks, "remark"),
    };
  }, [selected, selectedModule?.tips]);

  const listPanel = (
    <div className={styles.listWrap}>
      <div className={styles.grid}>
        {moduleFish.map((fish) => {
          const captured = capturedFishIds.includes(fish.id);
          const stars = getStars(fish.id, fish.stars);
          const isTwoStar = captured && stars === 2;
          const isBossFish = fish.category === "boss";
          const isBossThreeStar = captured && stars >= 3 && isBossFish;
          const isThreeStarGold = captured && stars >= 3 && !isBossFish;
          const isSelected = fish.id === id;
          const depthText =
            fish.depthMin !== undefined && fish.depthMax !== undefined
              ? `${fish.depthMin}-${fish.depthMax}m`
              : "—";
          const cardImgSrc = getFishImageUrl(fish.image);
          const handleCardRate = (n: number) => {
            const currentStars = getStars(fish.id, fish.stars);
            if (!captured) {
              toggleFishCaptured(fish.id);
              setFishStarRating(fish.id, n);
            } else if (currentStars === n) {
              toggleFishCaptured(fish.id);
              setFishStarRating(fish.id, 0);
            } else {
              setFishStarRating(fish.id, n);
            }
          };
          return (
            <div
              key={fish.id}
              data-fish-card-id={fish.id}
              className={`${styles.card} ${captured ? styles.cardCaptured : ""} ${isTwoStar ? styles.cardTwoStar : ""} ${isBossThreeStar ? styles.cardBossThreeStar : ""} ${isThreeStarGold ? styles.cardThreeStar : ""} ${isSelected ? styles.cardSelected : ""} ${isBossFish && !isBossThreeStar ? styles.cardBoss : ""}`}
              onClick={() => navigate(`/fish/${fish.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/fish/${fish.id}`)
              }
              title={fish.name}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: card with nested toggle button
              tabIndex={0}
            >
              <div className={styles.cardImg}>
                {fish.category === "photo" ? (
                  <span className={styles.cardPhotoIcon} aria-hidden>
                    📷
                  </span>
                ) : null}
                {cardImgSrc ? (
                  <div className={styles.cardImgCrop}>
                    <img src={cardImgSrc} alt="" className={styles.cardEmoji} />
                    <div className={styles.cardImgStarMask} aria-hidden />
                    <StarRating
                      stars={stars}
                      captured={captured}
                      size="sm"
                      rootClassName={styles.cardStarsInCrop}
                      onRootClick={(e) => e.stopPropagation()}
                      onRootKeyDown={(e) => e.stopPropagation()}
                      onRate={handleCardRate}
                    />
                  </div>
                ) : (
                  <>
                    <span className={styles.cardEmoji} aria-hidden>
                      {fish.name || "—"}
                    </span>
                    <StarRating
                      stars={stars}
                      captured={captured}
                      size="sm"
                      rootClassName={styles.cardStarsPosition}
                      onRootClick={(e) => e.stopPropagation()}
                      onRootKeyDown={(e) => e.stopPropagation()}
                      onRate={handleCardRate}
                    />
                  </>
                )}
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardName}>{fish.name}</span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardMetaItem}>{depthText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const detailPanel = selected ? (
    <div className={styles.detail}>
      <div className={styles.detailTop}>
        <div className={styles.detailImgBox}>
          {(() => {
            const src = getFishImageUrl(selected.image);
            return src ? (
              <img src={src} alt="" className={styles.detailEmoji} />
            ) : (
              <span className={styles.detailEmoji} aria-hidden>
                {selected.name || "—"}
              </span>
            );
          })()}
        </div>
        <div className={styles.detailInfo}>
          <StarRating
            stars={getStars(selected.id, selected.stars)}
            captured={capturedFishIds.includes(selected.id)}
            size="lg"
            onRate={(n) => {
              const isCaptured = capturedFishIds.includes(selected.id);
              const curStars = getStars(selected.id, selected.stars);
              if (!isCaptured) {
                toggleFishCaptured(selected.id);
                setFishStarRating(selected.id, n);
              } else if (curStars === n) {
                toggleFishCaptured(selected.id);
                setFishStarRating(selected.id, 0);
              } else {
                setFishStarRating(selected.id, n);
              }
            }}
          />
          <div className={styles.detailNameRow}>
            <h1 className={styles.detailName}>{selected.name}</h1>
          </div>
          <p className={styles.detailDesc}>{selected.description ?? "—"}</p>
        </div>
        <button
          type="button"
          className={`${styles.captureBtn} ${capturedFishIds.includes(selected.id) ? styles.captureBtnOn : ""}`}
          onClick={() => toggleFishCaptured(selected.id)}
        >
          {capturedFishIds.includes(selected.id) ? "✓ 已捕获" : "标记已捕获"}
        </button>
      </div>

      <div className={styles.statsBlock}>
        {/* Row 1: Region + Depth */}
        <div className={styles.statPairRow}>
          <div className={styles.statCell}>
            <span className={styles.statEm}>🗺️</span>
            <span className={styles.statLbl}>区域</span>
            <div className={styles.statChips}>
              {habitatZones.length > 0 ? (
                habitatZones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    className={styles.zoneChip}
                    onClick={() => navigate(`/map?zone=${z.mapZone}`)}
                    title="前往地图"
                  >
                    {z.emoji} {z.name} ↗
                  </button>
                ))
              ) : (
                <span className={styles.statValMuted}>—</span>
              )}
            </div>
          </div>
          <div className={styles.statCellDivider} />
          <div className={styles.statCell}>
            <span className={styles.statEm}>📏</span>
            <span className={styles.statLbl}>深度</span>
            <span className={styles.statVal}>
              {selected.depthMin !== undefined &&
              selected.depthMax !== undefined
                ? `${selected.depthMin}–${selected.depthMax} m`
                : "—"}
            </span>
          </div>
        </div>
        <div className={styles.statDivider} />
        {/* Row 2: Weight + Meat by star（仅在有 meatByStar 时展示肉量） */}
        <div className={styles.statPairRow}>
          <div className={styles.statCell}>
            <span className={styles.statEm}>⚖️</span>
            <span className={styles.statLbl}>重量</span>
            <span className={styles.statVal}>
              {selected.weight != null ? `${selected.weight} kg` : "—"}
            </span>
          </div>
          {selected.meatByStar ? (
            <>
              <div className={styles.statCellDivider} />
              <div className={styles.statCell}>
                <span className={styles.statEm}>🥩</span>
                <span className={styles.statLbl}>掉落肉量</span>
                <div className={styles.meatByStar}>
                  <span className={styles.meatChip}>
                    <span className={styles.meatStar}>★</span>
                    <span className={styles.meatVal}>
                      {selected.meatByStar[0] === -1
                        ? "—"
                        : selected.meatByStar[0]}
                    </span>
                  </span>
                  <span className={styles.meatChip}>
                    <span className={styles.meatStar}>★★</span>
                    <span className={styles.meatVal}>
                      {selected.meatByStar[1] === -1
                        ? "—"
                        : selected.meatByStar[1]}
                    </span>
                  </span>
                  <span className={styles.meatChip}>
                    <span className={styles.meatStar}>★★★</span>
                    <span className={styles.meatVal}>
                      {selected.meatByStar[2] === -1
                        ? "—"
                        : selected.meatByStar[2]}
                    </span>
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {detailHints.captureTips.length > 0 ? (
        <div className={styles.tipCard}>
          <span className={styles.tipTitle}>🎯 捕获技巧（含三星思路）</span>
          <ul className={styles.tipList}>
            {detailHints.captureTips.map((tip, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static derived list
              <li key={idx} className={styles.tipListItem}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {relatedRecipes.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🍽️ 可制作菜单</h3>
          <p className={styles.menuHint}>用这条鱼可以做出这些菜单：</p>
          <div className={styles.menuGrid}>
            {relatedRecipes.map((r) => (
              <button
                type="button"
                key={r.id}
                className={styles.menuCard}
                onClick={() => navigate(`/recipes/${r.id}`)}
              >
                <span className={styles.menuThumb}>
                  {(() => {
                    const recipeImg = r.imageUrl ?? getRecipeImageUrl(r.name);
                    return recipeImg ? (
                      <img src={recipeImg} alt="" className={styles.menuThumbImg} />
                    ) : (
                      <span className={styles.menuThumbEmoji}>{r.emoji}</span>
                    );
                  })()}
                </span>
                <span className={styles.menuInfo}>
                  <span className={styles.menuName}>{r.name}</span>
                  <span className={styles.menuMeta}>
                    💰 {r.sellPrice} 金 · 😋 {r.tastiness}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {detailHints.remarks.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📝 备注</h3>
          <div className={styles.notesList}>
            {detailHints.remarks.map((item, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static derived list
              <span key={idx}>• {item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : null;

  const fishTabs = fishGuideModules.map((module) => {
    const moduleFishList = fishData.filter((f) =>
      f.zones?.includes(module.name),
    );
    const capturedCount = moduleFishList.filter((f) =>
      capturedFishIds.includes(f.id),
    ).length;
    return {
      id: module.id,
      label: module.name,
      emoji: FISH_MODULE_EMOJI[module.id] ?? "🐟",
      count: `${capturedCount}/${moduleFishList.length}`,
    };
  });

  return (
    <div className={styles.page}>
      <div
        className={styles.fishTabWrap}
        style={
          {
            "--tab-active-bg": (
              FISH_MODULE_THEME[selectedModuleId] ??
              FISH_MODULE_THEME["blue-hole-entrance"]
            ).activeBg,
            "--tab-active-border": (
              FISH_MODULE_THEME[selectedModuleId] ??
              FISH_MODULE_THEME["blue-hole-entrance"]
            ).activeBorder,
            "--tab-active-color": (
              FISH_MODULE_THEME[selectedModuleId] ??
              FISH_MODULE_THEME["blue-hole-entrance"]
            ).activeColor,
            "--tab-hover-bg": (
              FISH_MODULE_THEME[selectedModuleId] ??
              FISH_MODULE_THEME["blue-hole-entrance"]
            ).hoverBg,
          } as React.CSSProperties
        }
      >
        <TabBar
          tabs={fishTabs}
          value={selectedModuleId}
          onChange={handleFishModuleTabChange}
          aria-label="鱼类图鉴区域"
        />
      </div>
      <EncyclopediaLayout
        listPanel={listPanel}
        detailPanel={detailPanel}
        hasSelection={!!selected}
        emptyMessage="← 从左侧选择一条鱼查看详情"
        onRequestClose={() => navigate("/fish", { replace: true })}
      />
    </div>
  );
}
