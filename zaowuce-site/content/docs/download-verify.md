---
id: download-verify
name: 确认下载的文件完整
kind: 教程
summary: 用电脑自带的命令计算 SHA256，与工具页面上登记的值对比，确认安装包没有损坏。
tools: [inventory-table-update]
order: 5
updated: 2026-10-16
---
## 为什么要核对

造物册在提供下载前已经核对过服务器上的文件。下载过程中如果网络中断，你拿到的文件仍可能不完整；对比一次 SHA256 就能确认。

## Windows

在下载文件所在的文件夹里，按住 Shift 右键选择「在此处打开 PowerShell 窗口」，输入：

```
certutil -hashfile 文件名.zip SHA256
```

## macOS

打开「终端」，输入以下命令（把文件拖进终端窗口即可填入路径）：

```
shasum -a 256 文件名.zip
```

## 对比

把输出的一长串字符与工具页面「版本与下载」中该文件的 SHA256 对比。完全一致才说明文件完整；不一致请重新下载。
