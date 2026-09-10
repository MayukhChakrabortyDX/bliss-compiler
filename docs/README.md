# Bliss documentation site

This is a standalone VitePress `docs/` directory for Bliss.

It contains three intentionally separate experiences:

- `/` — the Bliss marketing / project homepage.
- `/docs/` — the documentation landing page, grouping language and compiler material.
- `/docs/<item>` — the custom documentation shell with left navigation, right outline, and previous/next navigation.
- `/blog/` — the custom blog index and article layout.

The site uses a fully custom VitePress theme. It does **not** extend VitePress's default visual theme. VitePress is used only as the Markdown/content pipeline and router.

## Run

From the Bliss compiler repository:

```bash
bun run docs:dev
```

Build with:

```bash
bun run docs:build
```

The existing repository should already have VitePress installed. If this docs directory is moved to a new project, install VitePress and Vue there first.
