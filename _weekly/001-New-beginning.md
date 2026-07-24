---
issue: 1
title: "从一份 Markdown 到一张能打开的图片"
date: 2026-07-24
cover: ""
description: "第 1 期，记录 Hr00 接入 Vercel，并用 PicGo 和 Cloudflare R2 接好图床的过程。"
---

## 这周干了什么

这周最重要的一件事，是把 Hr00 从本地文件夹变成了一个真正能打开、也能继续写下去的博客。

### 先让博客跑起来

Hr00 是一个 Jekyll 静态博客，文章和 Weekly 都是仓库里的 Markdown 文件。我先清理了原主题留下的内容，换上自己的站点信息，再把 GitHub 仓库连接到 Vercel。

这里有一个很具体的坑：Jekyll 构建后的成品在 `_site/`，所以 `vercel.json` 需要明确写上 `"outputDirectory": "_site"`。配置完成后，发布流程就变成了：

```text
写 Markdown → npm run build → push main → Vercel 构建并发布
```

`main` 是生产分支，没有单独的 staging。现在主域名是 [www.byhaoran.cn](https://www.byhaoran.cn/)，`byhaoran.cn` 会跳转到它。

<!-- 图片占位：Vercel 部署成功后的 Hr00 首页截图。用 PicGo 上传后，把下面的示例 URL 换成实际返回的 Cloudflare R2 地址，再取消注释。 -->
<!-- ![Vercel 部署成功后的 Hr00 首页](https://img.byhaoran.cn/PicGo/weekly-001-hr00-home.png) -->

### 再把 PicGo 接到 Cloudflare R2

博客能打开以后，我继续处理图片。把图片直接放进 Git 仓库当然也能用，但写文章时还要整理文件名、目录和相对路径，步骤有点多。我想要的是截图之后直接上传，剪贴板里马上得到一条可以贴进 Markdown 的图片链接。

我在 Cloudflare R2 准备好 bucket 和自定义域名，然后在 PicGo 里选择 `AWS S3` uploader，因为 R2 提供兼容 S3 的 API。实际用到的公开配置如下：

```text
Bucket：自己的 R2 bucket
Region：auto
Endpoint：https://<ACCOUNT_ID>.r2.cloudflarestorage.com
Path style access：开启
Upload path：PicGo/{fullName}
URL prefix：https://img.byhaoran.cn
```

R2 的 Access Key ID 和 Secret Access Key 只保存在本机 PicGo 配置里，不会写进仓库或文章。配置完成后，PicGo 上传的图片会得到类似下面这样的绝对 URL：

```text
https://img.byhaoran.cn/PicGo/<图片文件名>
```

我用实际图片测试过上传和访问，返回的是 HTTP 200。现在写文章时，只需要把图片拖进 PicGo，再把生成的 Markdown 链接粘进正文。

<!-- 图片占位：PicGo 的 AWS S3 配置页截图。截图前遮住 Access Key ID、Secret Access Key 和 Endpoint 中的 Account ID，上传后替换下面的示例 URL。 -->
<!-- ![PicGo 连接 Cloudflare R2 的配置](https://img.byhaoran.cn/PicGo/weekly-001-picgo-r2-settings.png) -->

<!-- 图片占位：PicGo 上传成功并复制 Markdown 链接的截图。上传后替换下面的示例 URL。 -->
<!-- ![PicGo 上传图片后的结果](https://img.byhaoran.cn/PicGo/weekly-001-picgo-upload-result.png) -->

## 这周学了什么

以前我会把“博客发布”当成一件事，今天把它拆开以后，发现其实是两条独立的链路：

```text
文章：Markdown → GitHub → Vercel → www.byhaoran.cn
图片：本地图片 → PicGo → Cloudflare R2 → img.byhaoran.cn
```

这样拆开的好处是排查很直接。文章没更新，就检查 Git push、Vercel 构建和 `_site/`；图片打不开，就检查 PicGo 返回的路径、R2 对象和自定义域名。

还有一个需要一直记住的边界：公开 URL 可以写进文章，S3 credentials 不行。配置示例里保留 `<ACCOUNT_ID>` 和图片 URL 占位符，既能记住格式，也不会把敏感信息带进 Git 历史。

## 这周看了什么

这次没有追很多新工具，主要是在看每一段真实的输出：Jekyll 有没有生成 `_site/`，Vercel 有没有读到正确目录，主域名有没有返回页面，PicGo 上传后给出的 URL 能不能直接访问。配置界面里显示“成功”还不够，浏览器最终能打开才算完成。

## 这周想了什么

第 1 期 Weekly 没有等到一周结束才写。今天刚好把写作、图片和发布串成了一条完整流程，就先从这里开始。

这个博客现在还很空，模板也会继续调整，但以后每次想记录点东西，已经不用重新想“图片放哪里”“怎么上线”。Markdown 写完，构建通过，推到 `main`，剩下的交给 Vercel；图片交给 PicGo 和 R2。流程短一点，开始写的阻力也会小一点。
