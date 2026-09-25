# Agent instructions

## Project shape

- This is a single-package, static `pt-BR` portfolio using vanilla HTML/CSS/JS: no runtime framework, backend, database, or environment configuration.
- `index.html` is the main page and HtmlWebpackPlugin template; `css/style.css` is the only linked local stylesheet, and `js/script.js` is the only Webpack entry.
- Both Webpack modes use `inject: false`; keep `index.html`'s manual `<script src="js/script.js" defer>` tag aligned with the `script` entry.
- `404.html` is standalone, uses inline CSS, and does not load `js/script.js`.

## Commands and validation

- Use Node 24 to match CI; there is no `.nvmrc` or `package.json` `engines` pin. Install reproducibly with `npm ci`.
- `npm run optimize:images` scans supported `<img data-source>` values in `index.html`, deletes and regenerates `img/generated/`, and writes WebP variants fitted within 800×800 and 1600×1600 without enlarging smaller originals.
- `npm start` first optimizes images, then runs webpack-dev-server with hot/live reload, opens a browser, and serves the repository root; no port is configured.
- `npm run build` first optimizes images, cleans `dist/`, and creates the production artifact there. Never edit `dist/` or `img/generated/` as source.
- `npm test` is an intentional failing placeholder. There are no lint, format, typecheck, or browser-test tools/configs; use `npm run build` and focused manual checks. No local deploy or production-preview command exists.

## Build and UI contracts

- Webpack emits the `script` entry as `dist/js/script.js`. CSS is linked rather than imported. Development exposes all repository-root files, but production uses an explicit `CopyPlugin` list; add new root assets to `webpack.config.prod.js`.
- Gallery markup has three paths: `src` uses the generated thumbnail, `data-source` keeps the original, and `data-full` uses the generated full image. Thumbnail and modal load failures fall back to `data-source`.
- Contact `data-contact` values are base64-encoded and decoded in `js/script.js` with XOR key `XMarcalTec2026`; keep `index.html` and the JS contact constants synchronized. The form only opens `mailto:` or `wa.me` links; there is no server endpoint.
- The `data-contact` anchors intentionally ship without `href` and get it from JS at startup; the owner chose to keep the obfuscation, so do not "fix" this by hardcoding the phone or email.
- The mobile breakpoint is coupled across CSS and JS: CSS includes widths through `768px`, while JavaScript treats only widths above `768px` as desktop. Update both CSS media blocks and the JS check together.
- `index.html` deliberately starts with `no-js`; JavaScript removes it and CSS exposes a static navigation fallback. Preserve that behavior when changing navigation.
- The lightbox marks the other `body` children as `inert`; the mobile drawer moves focus to its first link and to the target section (sections carry `tabindex="-1"`). Keep that focus/inert handling when touching the modal or the drawer.
- Font Awesome (`cdnjs.cloudflare.com`) and Google Maps (`www.google.com`) are external and constrained by the page CSP; update the CSP when changing those resources.

## Deployment and conventions

- `.github/workflows/deploy-pages.yml` runs on pushes to `main` and manual dispatch: Node 24 → `npm ci` → `npm run build` → publish `dist/` to `xmarcaltecnico/xmarcaltecnico.github.io` with `PAGES_DEPLOY_TOKEN`.
- Absolute deployment URLs in `index.html` metadata/schema, `sitemap.xml`, and `robots.txt` must be updated together when the deployment target changes.
- For manual checks, cover the mobile menu at 768/769 px and without JavaScript, gallery filters and modal keyboard/focus behavior, image fallbacks, form validation/handoff, external resources, and the standalone 404 page.
- `.editorconfig` requires UTF-8, LF, two-space indentation, a final newline, and trimmed trailing whitespace. `index.html`, `css/style.css`, and `js/script.js` intentionally use 4-space steps (CSS comment banners keep 1/3/5-space alignment); `404.html`, `scripts/`, and the Webpack configs use 2. Do not reformat unrelated code.
- For UI/accessibility reviews, follow `.agents/skills/web-design-guidelines/SKILL.md`.
