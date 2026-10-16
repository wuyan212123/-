#!/usr/bin/env bash
# 在你自己的电脑上运行，把服务器上不可重建的数据拉回本机：
#   DEPLOY_HOST=root@服务器IP deploy/backup.sh
# 代码和内容在 Git 里，下载包在你本机有原件；服务器上只有账号与下载记录需要备份。
set -euo pipefail
: "${DEPLOY_HOST:?请设置 DEPLOY_HOST}"
DEST="${BACKUP_DIR:-$HOME/zaowuce-backup}/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEST"
rsync -az "$DEPLOY_HOST:/var/lib/zaowuce/accounts.json" "$DEPLOY_HOST:/var/lib/zaowuce/downloads.log" "$DEST/" 2>/dev/null || \
  rsync -az "$DEPLOY_HOST:/var/lib/zaowuce/accounts.json" "$DEST/"
chmod 600 "$DEST"/*
echo "已备份到 $DEST"
