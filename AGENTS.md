# Hr00 Blog Agent Guide

## Project

This repository powers Hr00's personal Jekyll blog.

Vercel is the deployment target. Feature branches and pull requests are previews; `main` is production. The canonical site URL is `hr00-blog.vercel.app`.

## Repository Map

- `_posts/` - Chinese posts.
- `_layouts/` - Jekyll layouts, including post and PPT modes.
- `_includes/` - shared page fragments.
- `_sass/` - stylesheets.
- `_plugins/` - custom Jekyll plugins.
- `vercel.json` - Vercel build and caching configuration.

## Commands

```bash
npm run prep
npm run dev
npm run build
```

`npm run prep` installs Ruby dependencies through Bundler. `npm run build` runs `bundle exec jekyll build`.

## Content Rules

- Chinese posts live in `_posts/` and are named `YYYY-MM-DD-{topic}.md`.
- Required frontmatter: `layout`, `title`, `date`. Preserve all existing frontmatter fields.
- Preserve the author's voice. Do not rewrite colloquial phrasing to formal style or add emoji.
- Prefer absolute Cloudflare R2 image URLs inserted through PicGo.

## Working Rules

- Do not delete existing posts unless the task explicitly asks.
- Preserve frontmatter fields and date semantics.
- PPT posts use `layout: ppt`; old dates can intentionally hide slides from the normal feed.

## Verification

- Content or layout changes: run `npm run build`.
- Local visual checks: run `npm run dev` and inspect the affected page.
- Frontmatter edits: confirm the page builds and appears in the feed.
- Documentation-only changes: check links and commands.

## GitHub Operations

- Use `gh` for issue and PR inspection.
- Do not post public comments unless the maintainer explicitly asks.
- Draft public replies in the same language as the thread.
