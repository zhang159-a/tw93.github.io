---
layout: post
title: "Github-Desktop 使用"
poem: "Github-Desktop"
summary: "记录一下使用Github-Desktop的一些功能记录。"
feature: ""
category: 技术实践
tags: [Git]
published: true
---

![](https://img.byhaoran.cn/PicGo/29f81779-b7f9-4ada-8f11-75b64a4cd9b5.jpg)

> 图形化的 Git 操作

# 核心词

| **术语**                | **一句话理解**                                 |
| ----------------------- | ---------------------------------------------- |
| Repository（仓库）      | 一个项目的文件、版本历史与分支集合。           |
| Local（本地）           | 你 Mac 上的项目副本；断网时也能编辑和 Commit。 |
| Remote / origin（远程） | GitHub 上对应的仓库；通常名为 origin。         |
| Branch（分支）          | 一条独立工作线；建议每个任务从 main 新建分支。 |
| Commit（提交）          | 带说明的本地版本快照；应小而完整。             |
| Push / Pull             | Push 上传本地提交；Pull 下载并合并远程提交。   |
| Pull Request（PR）      | 请求把一个分支的改动审阅并合并到另一个分支。   |

# 安装与初始化

官方下载：desktop.github.com

登录，设置提交身份，设置外部编辑器，外部终端

- Vscode
- Ghostty

# 认识界面

![](https://img.byhaoran.cn/PicGo/75636bb3-1d69-4e95-81a6-9782f89a7d86.jpg)

| **界面名称**               | **中文理解** | **使用时看什么**                           |
| -------------------------- | ------------ | ------------------------------------------ |
| Current Repository         | 当前仓库     | 切换项目；先确认这里，避免提交到错误仓库。 |
| Current Branch             | 当前分支     | 切换或新建分支；提交前一定检查。           |
| Fetch / Pull / Push origin | 同步按钮     | 按钮文案会随状态变化：检查、下载或上传。   |
| Changes                    | 未提交改动   | 选择文件或行，查看 diff，填写提交说明。    |
| History                    | 提交历史     | 查看每次 Commit 的作者、时间、SHA 与差异。 |
| Open in Editor             | 在编辑器打开 | 编辑文件；快捷键 `Shift + Command + A`。   |

# 打开项目

## 从 Github 上克隆已有项目（最常见）

1. 打开克隆窗口
   菜单栏选择 File → Clone Repository，或按 Shift + Command + O。
2. 选择仓库
   在 GitHub.com 标签中选择你有权访问的仓库；也可以切到 URL 标签粘贴仓库地址。
3. 选择 Local Path
   选择 Mac 上的父目录。GitHub Desktop 会在其中新建仓库同名文件夹；不要把多个仓库叠在同一个目录里。
4. Clone
   点击 Clone。完成后可选择 Repository → Show in Finder 或 Open in Editor。

## 添加 Mac 上已有 Git 仓库

1. Add Local Repository
   选择 File → Add Local Repository，或把 Git 仓库文件夹直接拖入 GitHub Desktop。
2. 选择目录
   选择包含 .git 目录的项目根目录，然后点击 Add Repository。
3. 按需发布
   若还没有远程仓库，点击 Publish repository，填写名称、描述、所属账户/组织，并检查 Keep this code private。

## 创建全新仓库

1. New Repository
   选择 File → New Repository。填写 Name、Description 与 Local Path。
2. 初始化选项
   按项目需要选择 README、.gitignore 与 License。新手至少建议创建 README，并为开发项目选择合适的 .gitignore。
3. Create / Publish
   先在本地创建；需要上传 GitHub 时，再点击 Publish repository。

# 标准流程

![](https://img.byhaoran.cn/PicGo/e744787c-9e7b-437c-9406-c280a6f52e19.jpg)

01 Fetch / Pull：先拿到最新进度
切到要工作的基础分支（通常是 main），点击 Fetch origin；如果出现 Pull origin，再点击 Pull。

02 新建任务分支
点击 Current Branch → New Branch。名称用短横线连接并表达任务，例如 docs/update-install-guide 或 fix/login-timeout。

03 在编辑器修改并保存
选择 Repository → Open in Editor。GitHub Desktop 会自动检测保存后的文件变化。

04 Review diff
回到 Changes，逐个文件检查绿色新增与红色删除。只勾选属于本次任务的文件或行。

05 Commit
在 Summary 写简短、明确的提交说明；必要时在 Description 补充原因。点击 Commit to BRANCH。

06 Push
点击 Push origin。首次推送新分支时，按钮可能显示 Publish branch。

07 Pull Request
点击 Preview Pull Request，确认 base 分支与 diff，再在浏览器填写标题和说明并创建 PR。

# Review,Commit 把历史写清楚

## 怎么看 diff

> 这个部分是我之前一直都不怎么注意的地方，以后要多尝试，不过现在这个 AI 写代码的时代，我自己也没法判断是否合理。

- 绿色通常表示新增，红色通常表示删除；修改会同时出现删除与新增。
- 点击齿轮可切换 Unified / Split 视图；大量格式变化时可临时 Hide Whitespace Changes。
- **取消文件前的勾选，可让该文件留到下一次 Commit**。
- 同一文件包含多个主题时，可以点选行来做 partial commit；未选中的改动会保留。
- 提交前检查是否混入构建产物、依赖目录、大文件或包含秘密信息的文件。

## Commit

> 动词+对象+目的

- docs: add macOS installation steps
- fix: prevent duplicate uploads
- feat: add dark mode preference

一个 Commit 尽量只做一件事。不要把“修登录、改首页颜色、更新依赖”塞在同一个提交里。

## 状态判断

| **你做了什么** | **如何确认**                            | **现在在哪里**        |
| -------------- | --------------------------------------- | --------------------- |
| 编辑器已保存   | Changes 出现文件                        | 改动只在 Mac 工作区。 |
| 已 Commit      | Changes 为空，History 有新提交          | 记录仍可能只在本地。  |
| 已 Push        | 顶部没有 Push origin；GitHub 可看到提交 | 远程仓库已同步。      |

# Fetch,Pull,Push

> 推荐顺序 开始工作先 Pull；完成一小段工作就 Commit；确认无误再 Push。团队仓库在 Push 前再 Fetch 一次，可以更早发现别人已经更新。

| **按钮**       | **实际作用**                           | **什么时候用**                     |
| -------------- | -------------------------------------- | ---------------------------------- |
| Fetch origin   | 只检查并下载远程信息，不直接改工作文件 | 每天开始、切换设备后、准备 Push 前 |
| Pull origin    | 把远程新提交整合到当前本地分支         | Fetch 后发现远程领先               |
| Push origin    | 把当前分支的本地提交上传到远程         | Commit 完成并通过必要检查后        |
| Publish branch | 第一次把本地新分支创建到 GitHub        | 新分支第一次上传                   |

## Push 被拒绝时

> 不要急着 Force push Force push 会改写远程分支历史，可能破坏同事基于旧历史进行的工作。除非你理解影响且团队明确允许，否则不要使用。

01 先读提示
如果远程存在你没有的提交，GitHub Desktop 通常会要求先 Fetch / Pull。

02 拉取并检查
Pull 后检查是否自动合并；若出现冲突，按“冲突处理”章节处理。

03 再 Push
确认项目能正常运行或通过测试后，再点击 Push origin。

# 分支与 PR

> 为什么不要直接改 main

分支让每个任务拥有独立工作线。你可以反复修改、提交和推送，而不影响稳定的 main。Pull Request 则把“要合并什么、为什么、是否通过检查”放到一个可审阅的页面中。

01 更新基础分支
切到 main，Fetch / Pull 到最新。
02 创建分支
Current Branch → New Branch；确认 Based on 是正确的基础分支。
03 命名
使用可读名称，例如 feat/profile-card、fix/export-crash、docs/setup-guide。
04 提交并发布
完成 Commit 后点击 Publish branch 或 Push origin。

## 创建 PR

01 预览
点击 Preview Pull Request，确认当前分支是 head，目标通常是 base: main。
02 检查可合并状态
Desktop 会显示是否可以自动合并；若不能，先同步基础分支并处理冲突。
03 在 GitHub 完成
点击 Create Pull Request 后浏览器会打开 GitHub。填写清楚的标题、改动说明、测试方式与截图（如适用）。
04 响应评审
根据评论继续在同一分支修改、Commit、Push；PR 会自动更新，无需重新创建。
05 合并并清理
检查通过并获批准后在 GitHub 合并。随后删除远程任务分支，并在 Desktop 切回 main、Pull 最新结果。

# 解决冲突

当两个分支以不兼容的方式修改同一处内容，Git 无法自动决定最终结果，就会产生 merge conflict。冲突不是文件损坏，而是需要人做内容选择。

01 打开冲突列表
在 GitHub Desktop 的提示中点击 View conflicts，确认受影响文件。

02 用编辑器打开文件
逐个文件查看冲突标记，理解当前分支与另一分支分别想保留什么。
current branch
你的版本
另一分支版本
incoming branch

03 编辑成最终内容
保留正确部分、合并两边逻辑，删除所有冲突标记。不要简单地只选一边而忽略业务含义。

04 保存并标记已解决
保存文件，回到 GitHub Desktop。确认所有冲突已解决后继续 merge / rebase。

05 验证
运行项目、测试或文档预览，确认合并结果正确。

06 Commit / Push
完成 GitHub Desktop 提示的合并提交，再 Push origin。

## 减少冲突的 5 个习惯

- 每天先 Pull，定期同步 main
- 每一个分支只做一个清晰任务
- Commit 小而完整，及时 push
- 多人不要同时大范围的修改同一个文件
- PR 尽早创建为 Draft,让团队看到正在修改的范围

# 撤销、恢复与暂存

| **场景**                  | **推荐操作**                                | **结果与注意**                                       |
| ------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| 未 Commit，想丢弃文件改动 | Changes 里右键文件 → Discard Changes        | 改动会进入 macOS 废纸篓；清空前通常可恢复。          |
| 刚 Commit，但还未 Push    | Changes 底部点击 Undo                       | 提交被撤销，改动回到工作区，可继续编辑。             |
| 已 Push，想撤销某次提交   | History 右键提交 → Revert Changes in Commit | 创建一个反向新提交，保留原历史，适合协作。           |
| 要临时切换分支            | Branch → Stash All Changes                  | 临时收起未提交改动；Desktop 一次只能保存一组 stash。 |
| 要改最后一次提交          | 使用 Amend Last Commit                      | 适合补漏或改说明；已 Push 后可能涉及改写历史。       |

# 高频快捷键

| **快捷键**          | **作用**          | **典型用途**          |
| ------------------- | ----------------- | --------------------- |
| Command + ,         | 打开 Settings     | 配置账户、Git、编辑器 |
| Shift + Command + O | Clone Repository  | 克隆远程仓库          |
| Command + T         | 仓库列表          | 快速切换项目          |
| Command + 1 / 2     | Changes / History | 改动与历史视图切换    |
| Command + B         | 分支列表          | 切换分支              |
| Shift + Command + N | 新建分支          | 为新任务创建分支      |
| Command + G         | 聚焦 Summary      | 快速填写提交说明      |
| Command + Enter     | Commit            | 提交说明框处于焦点时  |
| Command + P         | Push              | 上传本地提交          |
| Shift + Command + P | Pull              | 下载远程新提交        |
| Shift + Command + A | Open in Editor    | 用默认编辑器打开仓库  |
| Shift + Command + F | Show in Finder    | 在 Finder 中显示仓库  |
| Shift + Command + S | Stash             | 临时收起未提交改动    |
