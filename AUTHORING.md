# Writing for The Smoking Duck

Use `hugo new content blog/my-post.md`, or create a leaf bundle at
`content/blog/my-post/index.md` when an article has local media. Existing flat
posts and public URLs do not need to move.

```yaml
---
title: "My article title"
date: 2026-10-07T12:00:00+02:00
draft: true
description: "A concise description of what the article explains."
tags: [tech, go, networking]
---
```

Use the shared `tech` tag for technical articles, alongside any specific topic
tags. It groups technical writing at `/blog/tech/`, linked from the navigation.
Keep the default archetype unclassified so personal posts remain easy to author.

Descriptions and tags are optional. Missing descriptions use a cleaned,
bounded summary at render time. Keep existing titles and URLs when updating
published posts. Set `lang: ar` for a new Arabic article (or `lang: en` for
English); the existing `arabic` tag also identifies Arabic pages. `rtl: true`
controls article direction independently. Existing Arabic title detection
remains supported.

## Inline media

Put PNG, JPEG, WebP, or SVG beside a bundle's `index.md` and reference it:

```markdown
![Request flow through the system](request-flow.svg)
![Kafka consumer lag after increasing partition count](consumer-lag.png)
```

Markdown alt text is preserved. Raster page resources receive intrinsic
dimensions to reserve layout space; images scale to the article width without
changing aspect ratio. Original files are retained without recompression,
so authors can use high resolution screenshots. SVG remains vector media.
Static images such as `/images/example.png` and remote URLs still work, but
cannot automatically supply intrinsic dimensions through page resources.

Optional captions use Hugo's built-in shortcode:

```text
{{< figure src="profiler-output.png" alt="CPU profile with encoding as the largest stack" caption="Profile after the first optimization." >}}
```

Use fenced, language-labelled code blocks for source code. Long lines scroll
horizontally and retain the site's syntax highlighting. The existing Mermaid
code-block hook remains available when interactive diagram rendering is useful.

Inline images do not become social or header images. For an explicit optional
social preview only, add `images: ["social-preview.png"]` to front matter.
No image field is required.

## Build and deployment

Use the pinned Hugo extended 0.165.0 and run `hugo --gc --minify --enableGitInfo`.
Production uses `https://blog.aabouzied.com/`; preview builds may override
`baseURL`. The blog section is mounted at `/`, with its native feed at `/index.xml`; Hugo also
generates taxonomy feeds, `/sitemap.xml`, and `/robots.txt`.

GitHub and email are configured under `params.social`. Set `linkedin` to your
actual profile URL to enable its footer link and author structured-data entry.
No analytics is configured.
