# 造物册

团队的工具工作台与知识库：`zaowuce.com`。

- **服务端**：Node.js 22 标准库，零依赖。登录、会话、成员停用、受控下载与 SHA256 校验。
- **内容**：`content/` 下的 Markdown 文件，用 Git 管理版本；发布前自动检查。
- **前端**：原生 ES 模块，无需构建；桌面与手机、浅色与深色都可用。
- **部署**：阿里云轻量服务器 + Nginx + systemd，见 `deploy/`。

服务器上**不保存任何业务数据**：进销存表格在同事自己的电脑上处理，网站只提供程序、教程与样表。

## 本地运行

```bash
npm run user -- --account owner --name 站主 --role owner   # 第一次：开通自己的账号，记下临时密码
npm start                                                   # 打开 http://127.0.0.1:8080
```

| 命令 | 作用 |
| --- | --- |
| `npm start` | 启动网站 |
| `npm run dev` | 修改代码后自动重启 |
| `npm test` | 运行测试（登录、权限、下载校验、内容渲染） |
| `npm run check` | 检查内容与发布清单，发布前必跑 |
| `npm run user -- …` | 开通账号 |
| `npm run release -- …` | 登记下载文件 |
| `npm run demo` | 生成不需要服务器的演示版到 `demo/` |

## 目录

```
content/tools/    工具页面，一个工具一个文件
content/skills/   SKILL
content/docs/     入门、教程、常见问题
releases/         每个下载型工具的发布清单（版本、文件、大小、SHA256）
downloads/        下载包本体（不进 Git，由 deploy.sh 同步到服务器）
public/           前端
lib/              服务端
scripts/          账号、内容检查、登记下载、演示版
deploy/           Nginx、systemd、初始化、发布、回滚、备份
test/             自动化测试
```

## 维护内容

每个文件开头是一段 `---` 包起来的信息，后面是正文：

```markdown
---
id: first-update            # 与文件名一致，发布后不要改
name: 第一次更新进销存表格
kind: 教程                  # 入门／教程／常见问题／案例
summary: 一句话说明这篇解决什么问题。
tools: [inventory-table-update]   # 关联的工具，工具页面会自动显示这篇
applies_to: ["1.0.10"]      # 适用版本，与推荐版本不一致时页面会提示
status: published           # draft 为草稿，不会出现在网站上
visibility: team            # owner 为仅你自己可见
updated: 2026-10-16
---
## 第一节标题
正文……
```

正文支持：`## 标题`（自动生成目录）、列表、`- [ ]` 核对清单、表格、` ```prompt ` 提示词代码块（带复制按钮），以及提示框：

```markdown
> [!warn] 标题
> 内容。类型可选 info／ok／warn／danger
```

工具的 `maturity`：`trial` 试用、`formal` 正式、`sample` 示例、`upcoming` 待开放、`history` 历史。**示例改为正式前，请先用一次真实任务验证**，不要只改标签。

改完运行 `npm run check`，再发布。

## 发布一个下载包

```bash
# 1. 登记文件（复制到 downloads/，计算大小和 SHA256，写回发布清单）
npm run release -- --asset inventory-1.0.10-win --file ~/Desktop/进销存表格更新-Windows.zip
# 2. 全部文件登记并实机验证后，设为推荐版本
npm run release -- --tool inventory-table-update --recommend 1.0.10
# 3. 在 releases/inventory-table-update.json 的 verified_on 里写上验证过的系统，例如 "Windows 11 + WPS 2023"
```

练习样表的文件 ID 是 `inventory-sample-01`，登记方式相同。

新版本：在 `releases/<工具>.json` 的 `releases` 里加一条，文件 ID 和文件名写上新版本号。已发布的文件不要在同一版本号下替换内容；有问题的版本把 `status` 改为 `withdrawn`，并填 `replaced_by`。

服务器上的文件与登记不一致时，网站会自动停止提供该文件的下载，并在「站点状态」里标红。

## 上线

前提：服务器已购买，域名备案已通过，已在阿里云申请 SSL 证书。

1. 把 `deploy/` 复制到服务器，以 root 运行一次 `bash deploy/setup-server.sh`。
2. 证书放到 `/etc/nginx/cert/zaowuce.com.pem` 和 `.key`，运行 `nginx -t && systemctl restart nginx`。
3. 在你的电脑上发布：`DEPLOY_HOST=root@服务器IP deploy/deploy.sh`。
4. 在服务器上开通所有者账号（命令见 setup-server.sh 结束时的提示）。
5. 轻量服务器控制台的防火墙只放行 22、80、443。

之后每次更新内容或程序，都在你的电脑上重复第 3 步。新版本启动失败时：`DEPLOY_HOST=… deploy/deploy.sh rollback` 回到上一版。

### 备份

服务器上只有 `/var/lib/zaowuce/accounts.json`（账号）和 `downloads.log`（下载记录）不可重建：

```bash
DEPLOY_HOST=root@服务器IP deploy/backup.sh     # 拉回到 ~/zaowuce-backup/
```

代码与内容在 Git 里，下载包在你的电脑上有原件。服务器损坏时：在新服务器上重跑上线步骤，再把 `accounts.json` 放回 `/var/lib/zaowuce/`。

## 安全设计

- 所有内容、接口和下载都需要登录；页面外壳可匿名加载，但不含任何内容。
- 密码用 scrypt 加盐保存；同一来源 15 分钟内输错 5 次暂停登录。
- 会话 Cookie 为 HttpOnly、SameSite=Lax，生产环境带 Secure；无操作 12 小时或满 7 天失效。
- 停用或重置密码后，该账号在所有设备上的登录立即失效；每次请求都会重新确认账号状态。
- 临时密码登录后只能修改密码，不能访问其他内容。
- 写操作要求站内请求头并校验来源，防止跨站请求。
- 内容中的 HTML 一律转义；严格的 CSP 禁止内联脚本和外部资源。
- systemd 限制服务只能写 `/var/lib/zaowuce`；网站只监听 127.0.0.1，由 Nginx 对外提供 HTTPS。

## 已知限制

- 会话保存在内存中，服务重启后所有人需要重新登录。
- 进销存可视化程序尚未接入；接入时挂在同一个 Nginx 之后，先经过造物册的登录校验。
- `deploy/` 中的脚本按 Alibaba Cloud Linux 4 编写，尚未在真实服务器上运行过，第一次上线时请逐步确认输出。
