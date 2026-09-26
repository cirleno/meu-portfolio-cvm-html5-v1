# Agent instructions

## Project shape

- Single-package, static `pt-BR` portfolio in vanilla HTML/CSS/JS. No runtime framework, backend, database, or env config. No README — this file is the only prose doc.
- `index.html` is the page and the HtmlWebpackPlugin template; `css/style.css` is the only local stylesheet; `js/script.js` is the only Webpack entry. CSS is `<link>`ed, never imported.
- **The site has zero external resources.** The only outbound request is the Google Maps iframe. Icons are inline `<svg class="icon">` (Font Awesome Free 6.4.0 paths, attribution in the `index.html` head comment); there is no icon font, no CDN, no webfont. Keep it that way: any new dependency on a third-party origin means a CSP change.
- `404.html` is standalone (inline CSS, no JS) and must stay >512 bytes for old-IE.
- `js/vendor/` holds only `.gitkeep` and is reserved for local third-party scripts; CSP is `script-src 'self'`, so no CDN JS may be added.

## Commands and validation

- Use Node 24 to match CI. There is no `.nvmrc` and no `engines` pin; install with `npm ci`.
- `npm run optimize:images` parses `<img data-source>` in `index.html`, wipes and regenerates `img/generated/{cards,thumbs,full}` as WebP (quality 80) fitted inside 400px, 800px and 1600px, never enlarging. It only accepts `img/` paths with `.avif/.jpeg/.jpg/.png/.webp`, skips anything under `img/generated/`, and **throws** if no valid gallery image is found.
- `img/generated/` is gitignored but every gallery `src`/`srcset` points into it, so thumbnails are broken on a fresh clone until the optimizer runs. `prestart`/`prebuild` run it automatically; run it by hand after editing `index.html` gallery markup.
- `npm start` → optimize images, then webpack-dev-server (hot + liveReload, opens a browser) serving the **repository root**, so every file in the repo is reachable during dev.
- `npm run build` → optimize images, then production build into `dist/`.
- `npm test` is a deliberate failing placeholder. There is no lint, format, typecheck, or browser-test tooling. Verify with `npm run build` plus focused manual checks; there is no local preview or deploy command.
- Production output comes from an explicit CopyPlugin allowlist. Any new root asset must be added to `webpack.config.prod.js` or it will be missing from `dist/`. Note `css/style.css` is deliberately *filtered out* of that copy — `HashedStylePlugin` emits it under its hashed name instead. Ignoring it via `globOptions.ignore` makes fast-glob return zero entries and the build fails with `unable to locate '.../css/**/*' glob`.

## Asset naming and cache busting

- Both Webpack modes use `HtmlWebpackPlugin` with **`inject: false`**. The script tag is written by hand at the end of `index.html` (`<script src="js/script.js" defer>`) and the entry emits exactly `js/script.js` — deliberate trade-off, chosen by the owner: it keeps the file openable by double-click (no server, no build) at the cost of JS cache busting. Do not "improve" this to `inject: 'body'` + `[contenthash]` without asking; that silently breaks opening `index.html` directly.
- JS has **no** content hash. GitHub Pages serves `Cache-Control: public, max-age=600`, so a stale `script.js` self-heals in ~10 min; a deploy that must be instant needs a manual `?v=` bump on the script tag. Only the CSS is hashed.
- The dev server serves `/js/script.js` from its in-memory build, so HMR still works despite `inject: false` (the emitted filename matches the hand-written tag).
- `HashedStylePlugin` (`webpack.config.prod.js`) hashes `css/style.css`, emits `css/style.<hash>.css`, and rewrites the `<link href="css/style.css">` in the emitted HTML. Dev serves the plain `css/style.css` from disk; only prod hashes.
- Because the `<link>` is matched by literal string, keep exactly one `<link rel="stylesheet" href="css/style.css">` and exactly one `<script src="js/script.js" defer>` in the template.
- Icon set is real and shipped: `favicon.ico` (32), `icon.png` (192), `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180), `mstile-70/150/310`, `tile-wide.png`, wired by `site.webmanifest` + `browserconfig.xml` (referenced via `msapplication-config`). Bump the `?v=` query on the `<link rel=icon>` tags when the bytes change. There is no `icon.svg`; do not re-add it to CopyPlugin.

## UI contracts that are easy to break

- Gallery images have five paths: `src` = generated thumb (800), `srcset` = `cards/… 400w` + `thumbs/… 800w`, `sizes` = `(max-width: 768px) 100vw, 370px`, `data-full` = generated full (1600), `data-source` = committed original. Thumbnail and modal both fall back to `data-source` on load failure — the JS fallback **must remove `srcset`/`sizes` first**, because `srcset` outranks `src` and the fallback would silently never apply. Source folder names are mirrored into `img/generated/`, including the accented `img/Florianópolis/`; renaming a folder means editing every path in `index.html`.
- `.item-galeria` uses `aspect-ratio: 4 / 3` (not a fixed height) so the grid has no CLS; `object-fit: cover` still crops portrait photos, and the lightbox is the full view.
- `data-contact` values are base64 of UTF-16LE XORed with key `XMarcalTec2026`, decoded in `js/script.js`. The phone/email used by the form are separate encoded constants (`WHATSAPP_NUMBER`, `CONTACT_EMAIL`) in that file; keep all of them in sync with `index.html`. The form only opens `mailto:` or `wa.me` links in a new tab — there is no backend.
- The `data-contact` anchors intentionally ship with no `href` and get it from JS at startup. This is deliberate obfuscation, and for the same reason the JSON-LD **omits `telephone`** (see the comment above the `ld+json` block). Do not "fix" either by hardcoding the phone or email. Consequence to keep in mind: with JS disabled there is no contact path at all, only the `<noscript>` warning inside the form.
- The mobile breakpoint is coupled across CSS and JS: CSS uses `@media (max-width: 768px)`, JS uses `MOBILE_NAV_MAX = 768` plus `matchMedia('(min-width: 769px)')` to close the drawer. Change both.
- `index.html` starts as `<html class="no-js">`; JS removes the class and CSS reveals a static nav fallback for no-JS users. Preserve this when touching navigation.
- Overlays: both the lightbox and the mobile drawer set `inert` on every other `body` child and trap Tab (`setSiblingsInert` + `trapFocus` in `js/script.js`). `.nav-overlay` must stay **non-inert** while the drawer is open or it stops being clickable. The drawer focuses its first link on open, the target section (`tabindex="-1"`) on nav click, and the toggle on close/Escape; the back-to-top button focuses `#home`. Preserve focus/inert behavior when editing the modal, drawer, or that button.
- The gallery filter is a `role="group"` of `aria-pressed` buttons with `aria-controls="galeria-grid"`, and it writes a visible/announced count into `#galeria-status` (`role="status"`). Keep that announcement when changing filter logic.
- The CSP meta tag is `default-src 'self'` with `frame-src https://www.google.com` (the embedded map) and `img-src 'self' data:`. There is no `style-src`/`font-src` exception anymore. Update the CSP whenever a resource origin is added.

## Deploy and conventions

- `.github/workflows/deploy-pages.yml`: on push to `main` or manual dispatch → Node 24 → `npm ci` → `npm run build` → `peaceiris/actions-gh-pages` publishes `./dist` to `xmarcaltecnico/xmarcaltecnico.github.io` using `PAGES_DEPLOY_TOKEN`.
- The absolute URL `https://xmarcaltecnico.github.io/` is duplicated in `index.html` (canonical, OG, Twitter, JSON-LD), `sitemap.xml`, and `robots.txt`; change all of them together.
- `dist/` is ~10 MB because the committed originals under `img/` ship as the `data-source` fallback; the page itself only loads `img/generated/*`. It is gitignored — never treat it as source.
- Manual check list: mobile menu at 768 vs 769 px and with JS disabled, gallery filters + announced count, modal keyboard/focus, image fallbacks (including that `srcset` is dropped), both form submit paths, the map iframe, icons/manifest, and the standalone 404.
- `.editorconfig` mandates UTF-8, LF, 2-space indent, final newline, trimmed trailing whitespace — but `index.html`, `css/style.css`, and `js/script.js` deliberately use 4-space steps (CSS banner comments keep 1/3/5-space alignment); `404.html`, `scripts/`, `browserconfig.xml`, and the Webpack configs use 2. Match the file you are editing; do not reformat unrelated code.
- For UI/accessibility reviews, follow `.agents/skills/web-design-guidelines/SKILL.md` (pinned via `skills-lock.json`; it fetches the current rules from vercel-labs/web-interface-guidelines at review time).
