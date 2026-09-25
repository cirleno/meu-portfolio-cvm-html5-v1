# Agent instructions

## Project shape

- This is a single-package, static `pt-BR` portfolio site: `index.html` is the main template, `css/style.css` is the only app stylesheet, and `js/script.js` is the only Webpack JavaScript entry. There is no framework, backend, database, or environment configuration.
- `index.html` is also the HtmlWebpackPlugin template, and production uses `inject: false`; keep its manual `<script src="js/script.js" defer>` tag aligned with the Webpack entry.
- `404.html` is a standalone page copied into the build; it does not load `js/script.js`.

## Commands

- Use Node 24 to match CI; no local Node version pin exists.
- Install a clean, reproducible dependency tree with `npm ci`.
- `npm run optimize:images` reads the gallery `data-source` attributes from `index.html` and generates 800 px thumbnails and 1600 px full-size WebP variants under `img/generated/`.
- `npm start` runs the image generator first, then webpack-dev-server with hot/live reload, auto-opens a browser, and serves the repository root; no port is configured.
- `npm run build` runs the image generator first and creates the production artifact in `dist/`. The directory is ignored, cleaned on every build, and must not be edited or treated as source.
- `npm test` intentionally exits with an error because no test suite exists. There are no lint, format, typecheck, or browser-test scripts/configs; use `npm run build` plus focused manual checks.

## Build and content gotchas

- Webpack bundles `./js/script.js`; CSS is not imported, but is linked from `index.html` and copied. Files under `img`, `css`, and `js/vendor` are copied automatically; new root-level assets require an explicit `CopyPlugin` entry in `webpack.config.prod.js`.
- Gallery images use generated thumbnails in `img/generated/thumbs/` and full-size variants in `img/generated/full/`; the original source path stays in `data-source` and is used by the image generator.
- `img/generated/` is ignored and rebuilt by the image generator; do not edit its files as source.
- Rebuild before inspecting the production site. No preview/static-server command is defined, so serve `dist/` separately when validating the built artifact.
- Deployment-domain URLs and paths are hardcoded in `index.html` metadata/schema, `sitemap.xml`, `robots.txt`, and `site.webmanifest`; update them together when the deployment target changes.
- Contact values in `index.html` are base64/XOR-obfuscated `data-contact` values decoded by `js/script.js`. The form only opens `mailto:` or `wa.me` links—there is no server endpoint—so update the encoded values and decoder inputs consistently.
- The mobile navigation breakpoint is duplicated as `768px` in both `css/style.css` and `js/script.js`; change both together.

## Deployment and validation

- `.github/workflows/deploy-pages.yml` runs on pushes to `main` and manual dispatches: Node 24 → `npm ci` → `npm run build` → publish `dist/` to `xmarcaltecnico/xmarcaltecnico.github.io` using `PAGES_DEPLOY_TOKEN`. There is no local deploy command.
- With no automated tests, manually cover the affected mobile menu, gallery filters/modal keyboard behavior, form handoff, image paths, and network-dependent Font Awesome/Google Map assets.
- `.editorconfig` requires UTF-8, LF, two-space indentation, a final newline, and trimmed trailing whitespace. Existing site files contain four-space sections; do not reformat unrelated code when making focused changes.
