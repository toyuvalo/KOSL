# KOSL Repo Cleanup Work Order For Claude

Date: 2026-04-08
Scope: Tracked repo state only
Final cleanup requirement: archive this document out of the repo root when the work is complete

## Primary Goal

Keep the site repo simple and publishable with:
- one root master document for contributors
- a clean top-level site structure
- current assets/pages separated from historical material
- no ambiguity about what content is source versus media or drop-folder residue

## Current Issues To Fix

1. The repo has no tracked root README.
2. The root is the live website structure, so contributor/developer documentation currently has no home.
3. The static pages and shared assets/scripts are all at the top level, which is fine for publishing but still needs a clearer maintainer-facing structure.
4. Historical or media-heavy content needs an intentional place so the repo does not drift into a loose website dump.

## Work Order

### 1. Add A Root Master Document
- Add `README.md` for maintainers/contributors.
- Explain what KOSL is, how it is published, and which files are the core site entrypoints.
- Keep it concise and root-level.

### 2. Keep The Publishing Structure Clean
- Preserve the root-level layout if GitHub Pages or current hosting requires it.
- Still group anything non-essential into clear folders where possible:
  - shared assets
  - docs
  - archive/history
  - media/video if intentionally tracked
- Avoid letting the repo root become a miscellaneous asset drop zone.

### 3. Separate Maintainer Docs From Site Files
- Add any contributor/build/deployment notes under a `docs/` folder or equivalent.
- Keep the root focused on the actual site plus one maintainer README.

### 4. Clarify Asset Policy
- Decide how videos and large media should be handled.
- If media is intentional, keep it organized and documented.
- If not, move it out of the active site root or archive it.

### 5. Add Maintenance Guardrails
- Add a lightweight repo policy covering:
  - one root maintainer README
  - clean site root
  - historical/media content organized intentionally
  - no loose working files in the root

## Acceptance Criteria
- The repo has a maintainer-facing root README.
- The site root stays publishable and understandable.
- Media/history/docs are separated cleanly from live pages.

## Final Deliverable
- short cleanup report with files moved, removed, rewritten, archived, and any unresolved publishing-structure decisions

## Archive Instruction
- When done, move this file out of the repo root into an archive/docs-history location.
