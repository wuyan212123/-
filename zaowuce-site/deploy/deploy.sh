#!/usr/bin/env bash
# 在你自己的电脑上运行，把网站发布到服务器：
#   DEPLOY_HOST=root@服务器IP deploy/deploy.sh            发布当前代码与内容
#   DEPLOY_HOST=root@服务器IP deploy/deploy.sh rollback   回到上一个版本
# 每次发布放在 /opt/zaowuce/releases/<时间>/，current 指向正在运行的版本，保留最近 5 个。
set -euo pipefail

: "${DEPLOY_HOST:?请设置 DEPLOY_HOST，例如 DEPLOY_HOST=root@1.2.3.4}"
cd "$(dirname "$0")/.."
REMOTE=/opt/zaowuce

if [[ "${1:-}" == "rollback" ]]; then
  ssh "$DEPLOY_HOST" bash -s <<'REMOTE_SH'
set -euo pipefail
cd /opt/zaowuce/releases
cur="$(basename "$(readlink -f /opt/zaowuce/current)")"
prev="$(ls -1 | sort | grep -B1 "^${cur}\$" | head -n1)"
if [[ -z "$prev" || "$prev" == "$cur" ]]; then echo "没有更早的版本可以回退"; exit 1; fi
ln -sfn "/opt/zaowuce/releases/$prev" /opt/zaowuce/current
systemctl restart zaowuce
sleep 1
curl -fsS http://127.0.0.1:8080/healthz >/dev/null && echo "已回退到 $prev"
REMOTE_SH
  exit 0
fi

echo "== 发布前检查"
npm test --silent
node scripts/check-content.mjs

TS="$(date +%Y%m%d-%H%M%S)"
echo "== 上传代码与内容 → $REMOTE/releases/$TS"
rsync -az --delete \
  --exclude .git --exclude data --exclude downloads --exclude demo --exclude node_modules --exclude test \
  ./ "$DEPLOY_HOST:$REMOTE/releases/$TS/"

echo "== 同步下载包"
rsync -az --delete --exclude .gitkeep downloads/ "$DEPLOY_HOST:/var/lib/zaowuce/downloads/"

echo "== 切换版本并重启"
ssh "$DEPLOY_HOST" bash -s -- "$TS" <<'REMOTE_SH'
set -euo pipefail
TS="$1"
chown -R zaowuce:zaowuce /var/lib/zaowuce/downloads
cd "/opt/zaowuce/releases/$TS"
sudo -u zaowuce DATA_DIR=/var/lib/zaowuce DOWNLOAD_DIR=/var/lib/zaowuce/downloads node scripts/check-content.mjs >/dev/null
ln -sfn "/opt/zaowuce/releases/$TS" /opt/zaowuce/current
systemctl restart zaowuce
sleep 1
if ! curl -fsS http://127.0.0.1:8080/healthz >/dev/null; then
  echo "新版本启动失败，请运行 deploy.sh rollback，并查看 journalctl -u zaowuce -n 50"
  exit 1
fi
ls -1d /opt/zaowuce/releases/* | sort | head -n -5 | xargs -r rm -rf
echo "已发布 $TS"
REMOTE_SH
