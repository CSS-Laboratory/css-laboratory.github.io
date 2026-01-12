# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Management

- Check @SESSION_NOTES.md at the start of each session for context
- Update SESSION_NOTES.md before ending long work sessions

## Project Overview

Static website for the Computational Social Science Laboratory at Shibaura Institute of Technology, hosted on GitHub Pages at https://css-laboratory.github.io/

## Development

**Local development:**
```bash
npm install              # Install dependencies (first time only)
npm run build            # Generate JSON from content/ Markdown files
python -m http.server 8000   # Serve locally
```

**Deployment** - Push to `main` branch; GitHub Actions rebuilds content JSON, then GitHub Pages auto-deploys.

## Content Management System

### Adding/Editing Content
Drop Markdown files with YAML frontmatter into the `content/` folder:

```
content/
├── news/           # News posts (YYYY-MM-DD-title.md)
├── blog/           # Blog posts (YYYY-MM-DD-title.md)
├── publications/   # Papers (YYYY-title.md)
├── research/       # Research projects (NN-title.md)
├── members/        # Team members by category
│   ├── faculty/
│   ├── postdocs/
│   ├── graduate/
│   └── others/
├── resources/
│   ├── datasets/
│   └── tools/
└── homepage/       # About section content
```

### Markdown Frontmatter Examples

**Blog/News:**
```yaml
---
title: "Post Title"
date: 2025-07-06
description: "Brief description"
image: "images/blog/image.png"
url: "https://external-link.com"
tags:
  - "Tag1"
  - "Tag2"
---
```

**Members:**
```yaml
---
name: "Name"
role: "Position"
bio: "Biography text"
image: "members/photo.jpg"
email: "email@example.com"
github: "https://github.com/..."
order: 1
---
```

**Resources (datasets/tools):**
```yaml
---
name: "Dataset Name"
type: "dataset"
description: "Description"
link: "https://download-link"
image: "images/resources/icon.png"
details:
  -
    key: "#Records"
    value: "1000000"
---
```

### Build Process
1. Edit/add `.md` files in `content/`
2. Run `npm run build` (or push to trigger GitHub Action)
3. Build script generates `_generated/*.json` files
4. JavaScript loaders fetch JSON and render to DOM

## Architecture

### Directory Structure
```
content/        # Markdown source files (edit these)
_generated/     # Auto-generated JSON (don't edit)
scripts/        # Build and migration scripts
javascript/     # Loaders fetch from _generated/*.json
components/     # Reusable navbar.html and footer.html
css/            # styles.css with CSS variables
images/         # Assets organized by section
data/           # Legacy Excel/CSV files (archived)
```

### Key Files
- `scripts/build-content.js` - Converts Markdown → JSON
- `scripts/migrate-content.js` - One-time migration from Excel/CSV
- `.github/workflows/build-content.yml` - Auto-rebuild on push

### JavaScript Loaders (in javascript/)
All loaders fetch from `_generated/*.json`:
- `blog-loader.js` → `_generated/blog.json`
- `member-loader.js` → `_generated/members.json`
- `research-loader.js` → `_generated/research.json`, `_generated/publications.json`
- `resources-loader.js` → `_generated/resources.json`
- `index-data-loader.js` → `_generated/homepage.json`, `_generated/news.json`, `_generated/research.json`

## Conventions

### CSS Variables (defined in :root)
```css
--primary-color: #1a2a6c;
--secondary-color: #2a4858;
--accent-color: #4e9af1;
```

### Naming
- Files: kebab-case (`index-data-loader.js`)
- CSS classes: kebab-case (`project-content`, `team-section-container`)
- Nav link IDs: `nav-home`, `nav-research`, `nav-members`, etc.
- Content files: `YYYY-MM-DD-slug.md` for dated content, `slug.md` for others

## External Dependencies
- Font Awesome 6.4.0 (CDN)
- Google Fonts (Roboto)
- Google Analytics (G-GLT1PTTN4B)
- gray-matter, glob (npm, build-time only)
