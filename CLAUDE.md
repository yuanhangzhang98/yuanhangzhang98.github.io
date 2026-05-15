# yuanhangzhang98.github.io

Personal homepage of **Yuanhang Zhang** — incoming faculty at USTC (fall 2026), currently postdoc at UC San Diego. Research: AI for physics, physics for AI, LLM-driven autonomous research.

## Stack

Pure static HTML/CSS/JS. **No build step, no Jekyll, no dependencies.** GitHub Pages serves the files directly; `.nojekyll` at the root tells Pages to skip Jekyll processing.

Local preview:

```
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## File map

```
/
├── .nojekyll                  empty file — disables Jekyll on GH Pages
├── index.html                 home: top banner, photo+intro hero, vision, pillars, 5 selected papers, recruiting, news
├── research/index.html        extended research vision + three pillars (each with a figure slot) + manifesto
├── papers/index.html          full publication list with topic filters
├── cv/index.html              CV (education / experience / talks) + PDF link
├── join/index.html            English hiring page — positions, what students will work on, how to apply
├── join/zh/index.html         Chinese hiring page (招生信息) — currently UNLINKED from the site; translation needs polish before re-exposing
├── assets/
│   ├── css/site.css           sole stylesheet — design tokens at the top; V2 additions block near the end
│   ├── js/
│   │   ├── neuristor.js       hero <canvas> animation: thermal-neuristor lattice (dimmed in V2 hero)
│   │   └── site.js            scroll reveals, papers filter, last-updated stamp
│   ├── img/prof_pic.jpg       portrait shown in the home hero
│   └── pdf/CV.pdf
├── CLAUDE.md                  this file
├── README.md                  short public README
├── LICENSE
├── robots.txt
└── archive/                   prior al-folio Jekyll site, kept for reference, NOT served as design
```

## Where to edit what

- **Add a paper** → `papers/index.html` (top of the year-block list) and optionally surface it in the *Selected papers* block in `index.html`.
- **Add a news item** → `index.html`, the *Recent* block near the bottom.
- **Edit hiring text** → `join/index.html` (English) and `join/zh/index.html` (Chinese). Keep the two in sync when content changes.
- **Update CV** → edit `cv/index.html` directly (education / experience / talks). The CV is the page itself; no PDF download is exposed. `assets/pdf/CV.pdf` is retained in the repo for reference only.
- **Swap the hero portrait** → replace `assets/img/prof_pic.jpg` with a new file at the same path.
- **Change palette or type** → `:root` block at the very top of `assets/css/site.css`.
- **Add or tweak the hero animation** → `assets/js/neuristor.js`. Parameters at the top of the file. Dimmed via `.hero-canvas { opacity }` in `site.css`.

## Bilingual

The site is **English-only** at the moment. A draft Chinese join page lives at `/join/zh/` but it is **unlinked** from anywhere on the site and the translation needs polish before re-exposing. To bring it back: revise the copy, then add a lang toggle to `/join/index.html` and a `中文` link in the footer.

## Archive

`archive/` contains the prior al-folio Jekyll site (config, layouts, includes, sass, plugins, bibliography, projects, news, all old assets). Kept in-repo for reference and to preserve `git log`. **It is not part of the live design**, but with `.nojekyll` the URLs `/archive/...` would still serve. Move it out of the repo entirely if that's undesirable.

## GitHub Pages note

The old al-folio repo deployed via `.github/workflows/deploy.yml`, which built Jekyll and pushed to `gh-pages`. That workflow has been archived. **Repository settings → Pages → Source must be set to "Deploy from a branch: master, root (/)"** for the new static site to go live.

## Future extensions (not implemented)

- `/lab/` subsite once the USTC lab launches
- Live research-progress dashboard section in `/research/`
- Auto-research agent log live-tail
- Coauthor force-graph
