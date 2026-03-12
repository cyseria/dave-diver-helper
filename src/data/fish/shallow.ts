import type { Fish } from "../types";
import { fish } from "./helpers";

export const shallowFish: Fish[] = [
  // ── Blue Hole Shallows (0–50m)，由 scripts/fish-list.tsv 生成 ─────────────
  fish({
    id: "clownfish",
    name: "小丑鱼",
    image: "/scripts/images/fish/小丑鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    recipeIds: ["clownfish_sushi"],
    weight: 0.2,
    meatByStar: [1, 2, 3]
  }),
  fish({
    id: "serranid",
    name: "鮨鱼",
    image: "/scripts/images/fish/鮨鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "mediterranean_cardinal",
    name: "地中海天竺鲷",
    image: "/scripts/images/fish/地中海天竺鲷1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "golden_bass",
    name: "金拟花鮨",
    image: "/scripts/images/fish/金拟花鮨1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "butterflyfish",
    name: "霞蝶鱼",
    image: "/scripts/images/fish/霞蝶鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "yellow_tang",
    name: "黄高鳍刺尾鱼",
    image: "/scripts/images/fish/黄高鳍刺尾鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "hallucinogenic_fish",
    name: "致幻鱼",
    image: "/scripts/images/fish/致幻鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "round_wing_fish",
    name: "圆翅燕鱼",
    image: "/scripts/images/fish/圆翅燕鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "blue_tang",
    name: "蓝倒吊",
    image: "/scripts/images/fish/蓝倒吊1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    recipeIds: ["blue_tang_salad"]
  }),
  fish({
    id: "wrasse",
    name: "杂斑盔鱼",
    image: "/scripts/images/fish/杂斑盔鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "triggerfish",
    name: "叉斑锉鳞鲀",
    image: "/scripts/images/fish/叉斑锉鳞鲀1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "pompano",
    name: "鲳鲹",
    image: "/scripts/images/fish/鲳鲹1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "yellowback_fusilier",
    name: "黄背若梅鲷",
    image: "/scripts/images/fish/黄背若梅鲷1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "peacock_wrasse",
    name: "孔雀锦鱼",
    image: "/scripts/images/fish/孔雀锦鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "sharp_wing_fish",
    name: "尖翅燕鱼",
    image: "/scripts/images/fish/尖翅燕鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "mediterranean_parrotfish",
    name: "地中海鹦嘴鱼",
    image: "/scripts/images/fish/地中海鹦嘴鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "redtoothed_triggerfish",
    name: "红牙鳞鲀",
    image: "/scripts/images/fish/红牙鳞鲀1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "black_seabream",
    name: "黑鲷鱼",
    image: "/scripts/images/fish/黑鲷鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "parrotfish",
    name: "鹦嘴鱼",
    image: "/scripts/images/fish/鹦嘴鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    emoji: "🪼",
    id: "barrel_jellyfish",
    name: "桶水母",
    image: "/scripts/images/fish/桶水母1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "用鱼叉只能打出1星，必须用网枪或者睡眠枪"
  }),
  fish({
    emoji: "🪼",
    id: "fried_egg_jellyfish",
    name: "蛋黄水母",
    image: "/scripts/images/fish/蛋黄水母1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "用鱼叉只能打出1星，必须用网枪或者睡眠枪"
  }),
  fish({
    id: "sand_tiger_shark",
    name: "三齿鲨",
    image: "/scripts/images/fish/三齿鲨1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "用鱼叉和枪支只能击杀，3星需要用网或睡眠配合无人机捕获"
  }),
  fish({
    id: "starry_puffer",
    name: "星斑叉鼻鲀",
    image: "/scripts/images/fish/星斑叉鼻鲀1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "膨胀时免疫子弹"
  }),
  fish({
    emoji: "🐍",
    id: "moray_eel",
    name: "海鳝",
    image: "/scripts/images/fish/海鳝1.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "白天躲在洞穴时无敌，只有夜晚会出没",
    recipeIds: ["eel_rice_bowl"]
  }),
  fish({
    id: "red_lionfish",
    name: "狮子鱼",
    image: "/scripts/images/fish/狮子鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "titan_triggerfish",
    name: "泰坦扳机鱼",
    image: "/scripts/images/fish/泰坦扳机鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day_night",
    zones: ["蓝洞入口"]
  }),
  fish({
    emoji: "🦈",
    id: "blacktip_reef_shark",
    name: "黑鳍鲨",
    image: "/scripts/images/fish/黑鳍鲨1.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "用鱼叉和枪支只能击杀，3星需要用网或睡眠配合无人机捕获",
    weight: 2.5,
    meatByStar: [2, 5, 8]
  }),
  fish({
    emoji: "🦈",
    id: "shortfin_mako",
    name: "短尾真鲨",
    image: "/scripts/images/fish/短尾真鲨1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "用鱼叉和枪支只能击杀，3星需要用睡眠配合无人机捕获"
  }),
  fish({
    emoji: "🪼",
    id: "box_jellyfish",
    name: "箱水母",
    image: "/scripts/images/fish/箱水母1.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "用鱼叉只能打出1星，必须用网枪或者睡眠枪"
  }),
  fish({
    id: "bluefin_tuna",
    name: "蓝鳍金枪鱼",
    image: "/scripts/images/fish/蓝鳍金枪鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "只在触发金枪鱼节活动时出现 用鱼叉和枪支只能击杀，3星需要用网或睡眠配合无人机捕获",
    weight: 8,
    meatByStar: [5, 10, 15]
  }),
  fish({
    id: "yellowfin_tuna",
    name: "黄鳍金枪鱼",
    image: "/scripts/images/fish/黄鳍金枪鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "只在触发金枪鱼节活动时出现 用鱼叉和枪支只能击杀，3星需要用网或睡眠配合无人机捕获"
  }),
  fish({
    id: "lamarck_angelfish",
    name: "拉马神仙鱼",
    image: "/scripts/images/fish/拉马神仙鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "lumpfish",
    name: "瘤鲷",
    image: "/scripts/images/fish/瘤鲷1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "用鱼叉和枪支只能击杀，3星需要用网或睡眠捕获"
  }),
  fish({
    id: "emperor_angelfish",
    name: "皇帝神仙鱼",
    image: "/scripts/images/fish/皇帝神仙鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "yellow_ray",
    name: "黄鳐",
    image: "/scripts/images/fish/黄鳐1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "主线推进后才会出现 用鱼叉和枪支只能击杀，3星需要用网或睡眠配合无人机捕获"
  }),
  fish({
    id: "marbled_electric_ray",
    name: "石纹电鳐",
    image: "/scripts/images/fish/石纹电鳐1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "主线推进后才会出现 用鱼叉和枪支只能击杀，3星需要用网或睡眠配合无人机捕获"
  }),
  fish({
    emoji: "🦐",
    id: "whiteleg_shrimp",
    name: "白对虾",
    image: "/scripts/images/fish/白对虾1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "推进主线解锁网兜后可以捕获"
  }),
  fish({
    id: "striped_catfish",
    name: "鳗鲶",
    image: "/scripts/images/fish/鳗鲶1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"]
  }),
  fish({
    id: "purple_sea_urchin",
    name: "紫海胆",
    image: "/scripts/images/fish/紫海胆1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "推进主线解锁手套后可以捕获"
  }),
  fish({
    id: "mako_shark",
    name: "灰鲭鲨",
    image: "/scripts/images/fish/灰鲭鲨1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "只在触发鲨鱼节活动时出现 用鱼叉和枪支只能击杀，3星需要用睡眠配合无人机捕获"
  }),
  fish({
    emoji: "🦈",
    id: "zebra_shark",
    name: "斑马鲨",
    image: "/scripts/images/fish/斑马鲨1.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "只在触发鲨鱼节活动时出现 用鱼叉和枪支只能击杀，3星需要用睡眠配合无人机捕获"
  }),
  fish({
    id: "marlin",
    name: "条纹四鳍旗鱼",
    image: "/scripts/images/fish/条纹四鳍旗鱼1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "只在触发旗鱼节活动时出现 用鱼叉和枪支只能击杀，3星需要用网或睡眠配合无人机捕获"
  }),
  fish({
    emoji: "🦈",
    id: "thresher_shark",
    name: "长尾鲨",
    image: "/scripts/images/fish/长尾鲨1.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "用鱼叉和枪支只能击杀，3星需要用睡眠配合无人机捕获"
  }),
  fish({
    id: "baby_humpback_whale",
    name: "幼崽座头鲸",
    image: "/scripts/images/fish/幼崽座头鲸.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "完成帮助座头鲸母子支线后拍照解锁"
  }),
  fish({
    emoji: "🐬",
    id: "pink_dolphin",
    name: "粉海豚",
    image: "/scripts/images/fish/粉海豚.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "完成数次帮助海豚支线后拍照解锁",
    category: "photo"
  }),
  fish({
    id: "manta_ray",
    name: "鬼蝠鲼",
    image: "/scripts/images/fish/鬼蝠鲼.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "触发记者的夜潜拍照事件后拍照解锁",
    category: "photo"
  }),
  fish({
    emoji: "🐢",
    id: "loggerhead_turtle",
    name: "红海龟",
    image: "/scripts/images/fish/红海龟.png",
    depthMin: 0,
    depthMax: 50,
    time: "day",
    zones: ["蓝洞入口"],
    note: "拍照后解锁，随机出现",
    category: "photo"
  }),
  fish({
    id: "red_lipped_batfish",
    name: "红唇蝙蝠鱼",
    image: "/scripts/images/fish/红唇蝙蝠鱼.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "触发记者的夜潜拍照事件后拍照解锁，随机出现",
    category: "photo"
  }),
  fish({
    emoji: "🦀",
    id: "truck_hermit_crab",
    name: "卡车寄居蟹",
    image: "/scripts/images/fish/卡车寄居蟹1.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "雷暴天时触发小智的boss战支线 需要搬炸药桶破坏背壳",
    category: "boss"
  }),
  fish({
    emoji: "🦐",
    id: "mantis_shrimp",
    name: "雀尾螳螂虾",
    image: "/scripts/images/fish/雀尾螳螂虾1.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "雷暴天时触发小智的boss战支线 只有眼睛有受击判定，释放大招蓄力时可以拉起场景中的摆锤弹反",
    category: "boss"
  }),
  fish({
    emoji: "🦈",
    id: "great_white_shark_klaus",
    name: "大白鲨克劳斯",
    image: "/scripts/images/fish/大白鲨克劳斯1.png",
    depthMin: 0,
    depthMax: 50,
    time: "night",
    zones: ["蓝洞入口", "夜行性"],
    note: "雷暴天时触发老奶奶的boss战支线 正常战斗打掉一定血量即可进入剧情 更多相关内容请关注：潜水员戴夫专区 责任编辑：Wioud",
    category: "boss"
  })
];
