#!/usr/bin/env bash
# 在你自己的电脑上运行，把服务器上不可重建的数据拉回本机：
#   DEPLOY_HOST=root@服务器IP deploy/backup.sh
# 代码和内容在 Git 里，下载包在你本机有原件；服务器上只有账号、收藏、反馈和下载记录需要备份。
set -euo pipefail
: "${DEPLOY_HOST:?请设置 DEPLOY_HOST}"
DEST="${BACKUP_DIR:-$HOME/zaowuce-backup}/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEST"
# 账号必须存在；收藏、反馈、下载记录在有人使用后才会生成
rsync -az "$DEPLOY_HOST:/var/lib/zaowuce/accounts.json" "$DEST/"
for f in prefs.json feedback.log downloads.log; do
  rsync -az "$DEPLOY_HOST:/var/lib/zaowuce/$f" "$DEST/" 2>/dev/null || true
done
chmod 600 "$DEST"/*
echo "已备份到 $DEST"
