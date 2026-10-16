#!/usr/bin/env bash
# 在新购买的阿里云轻量服务器（Alibaba Cloud Linux 4）上以 root 运行一次：
#   bash setup-server.sh
# 安装 Nginx 与 Node.js 22，创建运行账号和目录，安装 systemd 服务与 Nginx 配置。
set -euo pipefail

NODE_VERSION="${NODE_VERSION:-22.22.0}"   # 运行前可改成当时 22.x 的最新版本
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "== 安装 Nginx 和常用工具"
dnf install -y nginx tar xz rsync

echo "== 安装 Node.js ${NODE_VERSION}（国内镜像）"
if ! command -v node >/dev/null || [[ "$(node -v)" != "v${NODE_VERSION}" ]]; then
  ARCH="$(uname -m)"; case "$ARCH" in x86_64) A=x64;; aarch64) A=arm64;; *) echo "不支持的架构 $ARCH"; exit 1;; esac
  cd /tmp
  curl -fsSLO "https://npmmirror.com/mirrors/node/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${A}.tar.xz"
  curl -fsSLO "https://npmmirror.com/mirrors/node/v${NODE_VERSION}/SHASUMS256.txt"
  grep " node-v${NODE_VERSION}-linux-${A}.tar.xz\$" SHASUMS256.txt | sha256sum -c -
  tar -xJf "node-v${NODE_VERSION}-linux-${A}.tar.xz" -C /usr/local --strip-components=1
fi
node -v

echo "== 创建运行账号与目录"
id zaowuce >/dev/null 2>&1 || useradd --system --home /opt/zaowuce --shell /sbin/nologin zaowuce
mkdir -p /opt/zaowuce/releases /var/lib/zaowuce/downloads /etc/nginx/cert
chown -R zaowuce:zaowuce /var/lib/zaowuce
chmod 700 /var/lib/zaowuce

echo "== 安装服务与 Nginx 配置"
install -m 644 "$HERE/zaowuce.service" /etc/systemd/system/zaowuce.service
install -m 644 "$HERE/nginx-zaowuce.conf" /etc/nginx/conf.d/zaowuce.conf
systemctl daemon-reload
systemctl enable zaowuce nginx

echo
echo "完成。接下来："
echo "  1. 把证书放到 /etc/nginx/cert/zaowuce.com.pem 和 .key，然后 nginx -t && systemctl restart nginx"
echo "  2. 在你的电脑上运行 deploy/deploy.sh 发布网站"
echo "  3. 在服务器上开通所有者账号："
echo "     cd /opt/zaowuce/current && sudo -u zaowuce DATA_DIR=/var/lib/zaowuce node scripts/create-user.mjs --account owner --name 站主 --role owner"
echo "  4. 轻量服务器控制台的防火墙只放行 22、80、443"
