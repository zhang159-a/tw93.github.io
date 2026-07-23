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
`YYYY-MM-DD-topic.md`. Choose a structure from `_templates/`, copy it into
`_posts/`, rename it, and update its frontmatter:

- `01-技术研究.md` - technical practice, product analysis, and research.
- `02-学习复盘.md` - courses, tools, books, and learning records.
- `03-观点思考.md` - observations, opinions, and personal reflections.

Keep `published: false` while drafting and remove that line when the post is
ready. Images uploaded through PicGo should be inserted as absolute Cloudflare
R2 URLs.

Weekly issues live in `_weekly/`. Copy `_weekly/001-template.md`, rename it to
the issue slug (for example `001-first-week.md`), fill in `issue`, `title`,
`date`, `cover`, and `description`, then remove `published: false` when the
issue is ready. Published issues appear at `/weekly/`, in site search, and in
the dedicated `/weekly/feed.xml` RSS feed.

## Deployment

The repository is deployed with Vercel. The production domain is
`www.byhaoran.cn`; `byhaoran.cn` redirects to it.

The original theme is based on
[cosy-jekyll-theme](https://rubygems.org/gems/cosy-jekyll-theme) and remains
available under the MIT License.
