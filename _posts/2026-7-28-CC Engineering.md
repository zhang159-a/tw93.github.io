---
layout: post
title: "CC Engineering"
poem: "CC Engineering"
summary: "记录一下 CC 的工程设计，claude.md,skill,mcp,subagent,hooks,plugins"
feature: ""
category: 学习笔记
tags: [cc]
published: true
---

> 来源 小林 coding 微信公众号
> 面试官皱眉：“你懂 Claude Code？” 我笑了：“何止懂？CLAUDE.md、Skills、Subagents、MCP、Hooks、Plugins 样样都懂”

![](https://img.byhaoran.cn/PicGo/114df5a2-b150-4ac1-8e54-183320c1f575.jpg)

# 1. 如何记住你的项目

> 通过 claude.md
> ![](https://img.byhaoran.cn/PicGo/9d844360-b435-4b01-9576-62459f0f44a7.jpg)

## CLAUDE.md 放哪、怎么被加载

CLAUDE.md 不止能放一个地方。

放在 ~/.claude/CLAUDE.md 的是全局配置，你所有项目都会加载，适合写个人偏好，比如「回答用中文」「commit 信息别写太长」。

放在项目根目录的是项目配置，也是最常用的一层，写这个项目的技术栈、命令、规范。

还可以放在子目录里。这一层有点讲究，它不是启动就加载的，而是等 Claude 读到那个子目录下的文件时才带进来。大项目里各模块规范不一样，就可以各放各的，互不干扰。

三个层级摆在一起看，就是这么个结构。

```
~/.claude/
└── CLAUDE.md        # 全局，所有项目都加载

my-project/
├── CLAUDE.md        # 项目级，启动就加载
├── web/
│   └── CLAUDE.md    # 动到 web 模块的文件才加载
└── core/
    └── CLAUDE.md    # 动到 core 模块才加载
```

![](https://img.byhaoran.cn/PicGo/6c495fbb-e0a1-4a68-ad52-6dc05cf1efc2.jpg)

除了你手写的 CLAUDE.md，Claude Code 还有一套自动记忆。它会在干活过程中自己记下一些经验，比如「这个项目的构建产物在 dist 目录」「用户喜欢先写测试」，存到自己的记忆目录里，下次会话自动想起来。

你写规矩，它记经验，两边凑一块才算全。

![](https://img.byhaoran.cn/PicGo/d6059a84-0523-4830-b2e0-b20d9cbb63fa.jpg)

## 一份像样的 CLAUDE.md 长什么样？

- 项目说明
- 常用命令
- 铁律
-

```
# 项目说明
Spring Boot 服务，JDK 8，禁止用高版本语法。

## 常用命令
- 单测：mvn test -pl web
- 打包：mvn clean package -DskipTests

## 铁律
- core 模块是待下线的祖传代码，只读，不许改
- 表结构变更必须走 Flyway，不许手写 ALTER TABLE
```

![](https://img.byhaoran.cn/PicGo/2836a837-49a5-4dd3-acdc-8a3076f62b1d.jpg)

# 2.不常用的知识放在哪里？

> 用 Skill 来解决

Skill 的设计，我第一次看懂的时候真有点想拍大腿。核心就一个点，拆两层加载。

每个 Skill 是一个文件夹，里面放一个 SKILL.md，文件开头有一段 frontmatter，就是用两条横线包起来的元信息，里面有名字和一句话描述。

启动的时候，Claude 只加载所有 Skill 的「一句话描述」，正文一个字都不读。等你真的提出相关任务，它发现描述对得上，才去把正文完整读进来。

启动时 Claude 眼里的 Skill 库，其实就是一张这样的单子。

```
code-review    审查代码改动时用，带团队检查清单
deploy-check   上线发布前用，带发布步骤和回滚预案
db-migrate     改表结构时用，带 Flyway 操作规范
```

![](https://img.byhaoran.cn/PicGo/7f099a97-23aa-4ab2-8bc9-c401fce66b25.jpg)

- 自动触发
- 手动触发

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/12235f09-933d-4da1-8dd5-708cc47a908e.jpg?imageSlim)

# 3.怎么让 CC 变成一支小团队

> subagent 解决 context 的问题，主对话只要结果

主对话把任务派出去，Subagent 在一个完全独立的上下文里干活，搜索、试错、翻文件随便折腾，都污染不到主对话。干完了，只把汇总结果交回来。

更妙的是可以并行。比如安全漏洞、性能隐患、测试覆盖，三路检查互不依赖，派给三个 Subagent 同时跑，主对话就在那等结果，效率直接翻倍。

## subagent 配置

配置方式跟 Skill 一脉相承，也是放文件。项目的 .claude/agents/ 目录下，一个 markdown 文件就是一个 Subagent。

文件分两截。frontmatter 写元信息，名字、什么时候用、能用哪些工具、跑哪个模型。正文写它的系统提示，相当于给这个「组员」的岗位说明书。

frontmatter 里我最喜欢 tools 这个字段。审查代码的 agent，你就只给它读文件和搜索的权限，不给写权限，它想改代码都改不了，天然安全。

model 也很实用。翻日志、跑批量搜索这种体力活，指定用便宜快速的模型，需要深度推理的分析再上贵的。一支团队里有主力有助手，成本就压下来了。

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/efe5b701-9865-4bc8-9ffa-d479e47555dd.jpg?imageSlim)

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/18081436-4d5f-46db-bea5-d09a4e0737e5.jpg?imageSlim)

# 4.访问外部系统

> MCP

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/eee700ba-7ba8-43a8-83a7-e6fdabedba13.jpg?imageSlim)

## MCP

架构上就两个角色。Claude Code 这边是 Client，工具那边是 Server。

Server 对外声明自己有哪些本事，最主要的就是 tools，一组可以被调用的工具。每个工具带着名字、说明和参数定义。拿 GitHub 的 Server 来说，Claude 连上后拿到的工具清单大概是这个样子。

```
get_pull_request     读取某个 PR 的详情和改动
list_issues          按条件列出仓库的 issue
add_issue_comment    在 issue 或 PR 下发表评论
```

任务需要时，Claude 从清单里挑一个发起调用，Server 执行完把结果传回来。

Server 装在哪都行。跑在你自己机器上的就是个本地进程，走标准输入输出通信，适合操作本地资源。也可以部署在服务商那边，走 HTTP 连过去，GitHub、Notion 这些官方服务基本都提供了。

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/943e4b1a-629f-4f34-860e-08808ec68a03.jpg?imageSlim)

# 5.规则怎么才能次次生效？

> hooks

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/10853b15-8732-406f-a234-c3938b8c093c.jpg?imageSlim)
它让你在 Claude 工作流程的关键节点上，挂一段自己的 shell 命令。节点一到，命令就跑，没有商量的余地。这里压根没有模型什么事，它理不理解、自不自觉，都不影响这段命令执行，纯粹是程序层面的强制触发。

## Hook 挂在哪些环节上？

Claude Code 把一次会话的生命周期切出了一串事件。会话启动、你提交提示词、每次工具调用之前、工具调用之后、Claude 准备结束回复，这些时机全都可以挂 Hook。

用得最多的是工具调用前后这两个。调用前的 Hook 能做拦截，检查这次操作合不合规，不合规直接摁住不让执行。调用后的 Hook 做善后，比如改完文件自动跑格式化。

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/e139236b-8660-4c0f-80aa-f557a92a180f.jpg?imageSlim)

配置写在 settings.json 里，就两样东西要认识。matcher 负责筛选，比如只匹配「编辑文件」这类工具调用。command 就是要执行的命令，事件命中就跑。

命令的退出码是有讲究的。退出码是 0，一切正常放行。退出码是 2，这次操作直接被拦截，命令的报错信息还会回传给 Claude，它看到之后会自己调整做法。

说人话就是，门禁不光能拦人，还能告诉他为什么被拦、该走哪个门。

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/467edd3e-f8c3-4654-8604-c987f98ad060.jpg?imageSlim)

## eg:自动格式化和敏感文件保护

善后型的最常用，比如改完文件自动格式化。

```
"hooks": {
  "PostToolUse": [{
    "matcher": "Edit|Write",
    "hooks": [{ "type": "command",
      "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
  }]
}
```

拆开看很好懂。PostToolUse 是挂载点，工具调用之后触发。matcher 筛出「编辑或写入文件」这类操作。command 里 jq 那一截看着唬人，讲真我第一次配的时候也愣了一下，其实就是从事件信息里抠出这次改的是哪个文件，抠出来直接喂给 prettier。

此后任何文件被编辑，prettier 必然跑一遍，我再也没在 CLAUDE.md 里念叨过格式化的事。

格式化是让它多做事，还有一类正相反，是不许它做的事，比如动敏感文件。这次把 Hook 挂在工具调用之前。

```
"PreToolUse": [{
  "matcher": "Edit|Write",
  "hooks": [{ "type": "command",
    "command": "~/.claude/hooks/protect.sh" }]
}]
```

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/813d7d51-3433-45f6-b85b-93955b9d4aa1.jpg?imageSlim)

# 6.这套配置怎么打包带走？

> 包管理 Plugin

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/b107ad92-ae27-495d-a641-dfae797889c1.jpg?imageSlim)

Plugin 就是 Claude Code 配置的包管理。

先说清楚一点，它本身不提供任何新能力，别指望装个 Plugin 就多出什么神仙功能。它干的是打包和分发的活，把 Skills、Subagents、Hooks、MCP 配置装进一个盒子里，发布出去。别人一条命令装上，你更新了，他跟着更新。

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/4ca62f6b-e3f9-4dad-9e2c-5f69b7166943.jpg?imageSlim)

## Plugin 里面有什么

一个 Plugin 就是一个约定好结构的文件夹。

```
my-review-kit/
├── .claude-plugin/plugin.json   # 名字、版本、描述
├── skills/        # Skill 们
├── agents/        # Subagent 们
├── hooks/         # Hook 配置
└── .mcp.json      # MCP 接入配置
```

plugin.json 是身份证，写清楚名字和版本。剩下几个目录，就是把前面几章那些散装配置按类别归位。你会发现没有任何新概念，Plugin 纯粹是个收纳盒。

分发靠 marketplace。它可以就是一个 git 仓库，团队自己建一个，把插件放进去。使用的人先把这个仓库登记进来

```
/plugin marketplace add your-team/claude-plugins
```

登记完，这个仓库里的插件就都能看到了，挑想要的装就行。跟手机上「先添加应用商店，再从里面下应用」一个流程。

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/871b37da-9ebf-47f8-8698-73f87462f1d1.jpg?imageSlim)

# 7.完整的一套工作流

最后咱们把镜头拉远，看一次完整的配合。

场景就用团队里最日常的，一次代码审查加修改。

会话一开，CLAUDE.md 先进场。这一步你是完全无感的，但 Claude 已经知道这个项目用什么、忌什么了。

然后你敲了一句「审一下今天这个 PR」。

就这一句话，后面其实发生了不少事。MCP 先把 PR 的改动从 GitHub 拉下来。审查的活呢，不在主对话里干，派给了 code-reviewer Subagent。这个 Subagent 手里还拿着 code-review Skill 里那份团队清单，在自己的上下文里逐个文件过。

那你在主对话里看到的是什么？就一份干干净净的审查结论。搜了多少文件、读了多少代码，你全程不用看。

假设审出三个问题，Claude 接着动手修。这时候 Hook 开始上班了，改一个文件就跟着跑一遍格式化，没人提醒它，也不靠它自觉。中途它想顺手动一下配置文件里的密钥，被拦截 Hook 摁住了。

修完，审查意见通过 MCP 评论回 PR。收工。

还有一个细节，我觉得最有意思。上面这一整套配置，你可能压根没亲手配过，就是上周从团队 marketplace 装的那个 Plugin，全组人手一份，一字不差。

![](https://mac-md-1314217273.cos.ap-nanjing.myqcloud.com/f801054a-74a8-437d-929c-37e73594952d.jpg?imageSlim)

| 你遇到的问题                      | 该用的能力 |
| --------------------------------- | ---------- |
| 每次会话都要重新交代项目背景      | CLAUDE.md  |
| 专项知识和流程，用时才需要        | Skills     |
| 中间过程太多，主对话被污染        | Subagents  |
| 需要访问 GitHub、数据库等外部系统 | MCP        |
| 规则必须百分百执行，不能靠自觉    | Hooks      |
| 配置要跨项目复用、团队共享        | Plugins    |