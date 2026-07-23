# Hr00 Blog

Hr00 的个人博客，记录生活、学习笔记和当下的思考。

## Local development

```bash
npm run prep
npm run dev
```

Open <http://127.0.0.1:4000/>.

## Build

```bash
npm run build
```

The generated static site is written to `_site/`.

## Writing

Chinese posts live in `_posts/` and use the filename format
`YYYY-MM-DD-topic.md`. Images uploaded through PicGo should be inserted as
absolute Cloudflare R2 URLs.

Weekly issues live in `_weekly/`. Copy `_weekly/001-template.md`, rename it to
the issue slug (for example `001-first-week.md`), fill in `issue`, `title`,
`date`, `cover`, and `description`, then remove `published: false` when the
issue is ready. Published issues appear at `/weekly/`, in site search, and in
the dedicated `/weekly/feed.xml` RSS feed.

## Deployment

The repository is deployed with Vercel. The intended production domain is
`hr00-blog.vercel.app`.

The original theme is based on
[cosy-jekyll-theme](https://rubygems.org/gems/cosy-jekyll-theme) and remains
available under the MIT License.
