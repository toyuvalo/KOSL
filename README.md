# KOSL — Kropp Olsha Science Lab

Open source processes and equipment for home semiconductor fabrication. No toxic chemicals, no cleanroom, no million-dollar equipment.

**Live site:** [kosl.dvlce.ca](https://kosl.dvlce.ca)

## Maintainer Guide

This repo is the live website — GitHub Pages deploys directly from the root of the `master` branch via `.github/workflows/deploy.yml`.

### Structure

```
index.html          Home page
about.html          About KOSL
projects.html       Research projects
shop.html           Products (RiboResist, machines)
contact.html        Contact page
style.css           Shared styles
components.js       Shared UI components (nav, footer, reveal animations)
hero-animation.js   Canvas particle animation for home page hero
CNAME               Custom domain config (kosl.dvlce.ca)
```

### Editing

All pages are static HTML. Shared navigation and footer are injected by `components.js` at runtime. To add a new page:

1. Create `page.html` in the root
2. Include `<link rel="stylesheet" href="style.css">` in `<head>`
3. Include `<script src="components.js"></script>` before `</body>`
4. Push to `master` — deploy is automatic

### Local Preview

Open any `.html` file directly in a browser, or use a local server:

```bash
npx serve .
```

## Version

0.1.0
