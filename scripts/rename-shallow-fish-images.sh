#!/usr/bin/env bash
# 将「旧文件名（右侧俗称）」重命名为 shallow.ts 中使用的「图鉴正式名」。
# 在 shallow 目录下执行：cd src/images/fish/shallow && bash ../../../../scripts/rename-shallow-fish-images.sh
# （若已从右侧俗称重命名过，源文件不存在则跳过。）
set -euo pipefail
rename_if_src() {
  local src="$1" dst="$2"
  if [[ -f "$src" ]]; then
    mv -v "$src" "$dst"
  fi
}

# p1
rename_if_src "鮨鱼.png" "九带鮨.png"
rename_if_src "地中海天竺鲷.png" "欧洲天竺鲷.png"
# p2
rename_if_src "金拟花鮨.png" "侧带拟花鮨.png"
rename_if_src "霞蝶鱼.png" "多鳞霞蝶鱼.png"
# p3
rename_if_src "致幻鱼.png" "叉牙鲷.png"
rename_if_src "圆翅燕鱼.png" "圆眼燕鱼.png"
rename_if_src "蓝倒吊.png" "黄尾副刺尾鱼.png"
# p4
rename_if_src "叉斑锉鳞鲀.png" "黄带锉鳞鲀.png"
rename_if_src "鲳鲹.png" "斐氏鲳鲹.png"
# p5
rename_if_src "黄背若梅鲷.png" "黄背梅鲷.png"
# p6
rename_if_src "地中海鹦嘴鱼.png" "异齿鹦鲷.png"
# p7
rename_if_src "鹦嘴鱼.png" "驼峰大鹦嘴鱼.png"
# p8
rename_if_src "狮子鱼.png" "翱翔蓑鲉.png"
# p10
rename_if_src "拉马神仙鱼.png" "胄刺尻鱼.png"
rename_if_src "瘤鲷.png" "金黄突额隆头鱼.png"
rename_if_src "皇帝神仙鱼.png" "主刺盖鱼.png"
# p11
rename_if_src "黄鳐.png" "赤半魟.png"
rename_if_src "白对虾.png" "凡纳对虾.png"
# p12
rename_if_src "鳗鲶.png" "线纹鳗鲶.png"
# p13
rename_if_src "长尾鲨.png" "浅海长尾鲨.png"

echo "完成（仅当源文件存在时才会 mv）。"
