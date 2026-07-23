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

## Deployment

The repository is deployed with Vercel. The intended production domain is
`hr00-blog.vercel.app`.

The original theme is based on
[cosy-jekyll-theme](https://rubygems.org/gems/cosy-jekyll-theme) and remains
available under the MIT License.
