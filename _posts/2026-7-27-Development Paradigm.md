---
layout: post
title: "Development Paradigm 开发范式"
poem: "Development Paradigm"
summary: "记录一些开发的范式"
feature: ""
category: 技术实践
tags: [开发]
published: true
---

# 总览

# Spec Coding

> 规约驱动开发
> 工具 spec-kit 


安装
```
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

```
specify init my-kanban --integration claude
```

![](https://img.byhaoran.cn/PicGo/d8d8e6c2-5278-450d-a537-f35c647e807a.jpg)

spec-kit 的用法，核心就是几条斜杠命令。你在 AI 编程工具里一条条敲下去，它就带着你把规约驱动那几个台阶挨个走完。

## speckit-constitution

![](https://img.byhaoran.cn/PicGo/22349ca9-b370-480f-a401-7fb3b89a8280.jpg)

## speckit-specify

这一步，你告诉它你要做什么、为什么做。记住，这里只说需求，别提技术。你别急着说「用 React」「用 Postgres」，你就说「我要一个能让团队协作管任务的工具，能建项目、能分配任务、能拖动卡片」。

它会根据你这段话，生成一份正儿八经的需求规约文档。这份文档就是你和 AI 之间第一份对齐的东西。
![](https://img.byhaoran.cn/PicGo/03e8973d-2509-4201-b1bd-4efd95c1d58a.jpg)

## speckit-plan

到这一步，才轮到技术。你把技术栈、架构选型告诉它，比如「前端用什么、后端用什么、数据库用什么、要不要实时更新」。它会基于前面那份需求文档，产出一份技术实现方案。

注意这个顺序，先有需求，再谈技术。这跟很多人上来就问「这个用什么框架好」正好反过来。
![](https://img.byhaoran.cn/PicGo/c9ea1236-d4ea-4fa4-9cb1-8739d336615e.jpg)

## speckit-tasks

这条命令，会把前面那份技术方案，拆成一条条具体的、可执行的任务清单。原本一个笼统的「做一个任务管理工具」，到这里就变成了几十个明确的小活，每一条 AI 都能单独下手。
![](https://img.byhaoran.cn/PicGo/476d9450-faa7-4e3e-b991-6af73841e051.jpg)

## speckit-implement

到这一步，前面该对齐的都对齐了，AI 拿着那份任务清单，一条条照着实现。因为方向、方案、任务全都提前敲定过，它这时候基本就是个执行者，不太会再自作主张地乱改。

你回头看看这一路，是不是正好就是前面说的那几个台阶，想清楚做什么、定方案、拆任务、写代码，一步都没少，只不过 spec-kit 把每一步都变成了一条你亲手敲的命令。

![](https://img.byhaoran.cn/PicGo/a49ca1c3-0169-498c-9070-3218bdc88287.jpg)

## 实战

它其实是一组 skill，装在项目里的 .claude/skills/ 目录下，speckit-specify、speckit-plan、speckit-tasks 这些各占一个文件夹。
说人话就是，skill 就是你提前写好、教 Claude Code 干某一类活的说明书。spec-kit 不过是把「写规约、定方案、拆任务」这几件事，各做成了一份说明书塞进你项目里，你敲一下斜杠就能把对应那份调出来用。

1. specify:先说清楚做什么
2. plan：再定技术方案
3. tasks:把方案拆成任务
4. implement:开始写代码

## 大项目怎么办

上面这套流程，你要是拿去做个小项目，跑得会很顺。

但真实工作里，事情往往没那么干净。需求经常是含糊的，你自己一开始都没完全想明白。项目也经常是大的，牵一发动全身。这种时候，光靠前面那四步，还不太够。

spec-kit 其实还留了几条命令，专门用来兜这个底。小项目你可以跳过，但正经活，我劝你老老实实用上。

第一条，是用来把含糊点问清楚的。

### speckit-clarify

这条命令有意思，它不急着往下走，而是反过来问你。它会盯着你那份需求文档，把里面它觉得含糊、有歧义、你没交代清楚的地方，一个个揪出来问你。

![](https://img.byhaoran.cn/PicGo/cf487905-8194-4d5e-ac2e-ddc462983fe7.jpg)

### speckit-analyze

这条一般在拆完任务、正式写代码之前用。它会把你前面那几份东西，需求、方案、任务清单，放一块交叉比对，看看有没有互相打架的地方。

比如需求里说要支持实时更新，但技术方案里压根没提这块怎么实现。又比如任务清单里，漏了需求里明明写了的某个功能。这些「对不上」的地方，靠人眼一个个核对特别累，交给它扫一遍，省心不少。

![](https://img.byhaoran.cn/PicGo/b8bfa6d8-4ac8-40e3-a42a-089bfcc2f0a9.jpg)

> 你把这几条兜底的命令连起来看，会发现它们干的其实是同一件事，在你正式写代码之前，尽可能多地把「没想清楚」「对不上」的坑给填了。

## 对比瀑布流

![](https://img.byhaoran.cn/PicGo/410d72d3-e821-49ef-8e9b-bd17c1c49a79.jpg)

瀑布流是「一次定死，扛着往前」，规约驱动是「随时对齐，边走边改」。表面都是分阶段，一个是石头，一个是橡皮泥。
