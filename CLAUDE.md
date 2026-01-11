# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for the Computational Social Science Laboratory at Shibaura Institute of Technology, hosted on GitHub Pages at https://css-laboratory.github.io/

## Development

**Local development** - No build system. Serve files with any HTTP server:
```bash
python -m http.server 8000
# or
npx http-server
```

**Deployment** - Push to `main` branch; GitHub Pages auto-deploys.

## Architecture

### Data-Driven Content Pattern
Content is stored in Excel/CSV files under `data/`, not in HTML. JavaScript loaders fetch and parse these files client-side:
- **Excel files** (.xlsx) - Parsed using SheetJS library (`XLSX.utils.sheet_to_json()`)
- **CSV files** - Custom regex-based parser handles quoted fields with commas

Data flow: `data/*.xlsx` → `fetch()` → `XLSX.read()` → DOM generation

### Component Loading
Navbar and footer are loaded dynamically via `components-loader.js`:
```
components/navbar.html → #navbar-container
components/footer.html → #footer-container
```

### Directory Structure
```
data/           # Content in Excel/CSV (homepage, research, members, blog, resources)
components/     # Reusable navbar.html and footer.html
javascript/     # Loaders for each content type + animations
css/            # Single styles.css with CSS variables
images/         # Assets organized by section
```

### Key Loaders (in javascript/)
- `components-loader.js` - Loads navbar/footer, sets active nav link
- `research-loader.js` - Loads from `data/research/research_focus.xlsx` and `paper_info.xlsx`
- `member-loader.js` - Loads from `data/members/*.xlsx`
- `blog-loader.js` - Loads from `data/blog/blogInfo.csv`
- `resources-loader.js` - Loads from `data/resources/ResourceInfo.csv`

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

### Adding Content
Edit the appropriate Excel/CSV file in `data/` - no HTML changes needed. The loaders handle rendering automatically.

## External Dependencies (CDN)
- SheetJS (XLSX parsing): `cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
- Font Awesome 6.4.0
- Google Fonts (Roboto)
- Google Analytics (G-GLT1PTTN4B)
