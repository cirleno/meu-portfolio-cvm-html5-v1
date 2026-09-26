const path = require('path');
const crypto = require('crypto');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const STYLE_HREF = 'css/style.css';
const styleSource = require('fs').readFileSync(path.resolve(__dirname, STYLE_HREF));
const styleHash = crypto.createHash('sha256').update(styleSource).digest('hex').slice(0, 8);
const hashedStyleName = `css/style.${styleHash}.css`;

// Reaproveita o <link> que ja existe no template: nada e hardcoded no index.html,
// o nome so muda quando o conteudo do CSS muda.
class HashedStylePlugin {
  apply(compiler) {
    const { sources, Compilation } = compiler.webpack;

    compiler.hooks.thisCompilation.tap('HashedStylePlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'HashedStylePlugin', stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          compilation.emitAsset(hashedStyleName, new sources.RawSource(styleSource));
        }
      );

      compilation.hooks.processAssets.tap(
        { name: 'HashedStylePlugin', stage: Compilation.PROCESS_ASSETS_STAGE_REPORT },
        (assets) => {
          for (const name of Object.keys(assets)) {
            if (!name.endsWith('.html')) continue;
            const html = assets[name].source().toString();
            if (!html.includes(STYLE_HREF)) continue;
            compilation.updateAsset(
              name,
              new sources.RawSource(html.split(STYLE_HREF).join(hashedStyleName))
            );
          }
        }
      );
    });
  }
}

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      // O script vem do proprio template (js/script.js), nao de injecao:
      // e o que permite abrir o index.html direto no navegador, sem servidor.
      inject: false,
    }),
    new HashedStylePlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        {
          from: 'css',
          to: 'css',
          // O stylesheet de entrada e emitido com hash pelo HashedStylePlugin:
          // aqui so entram os arquivos auxiliares, sem duplicar style.css.
          filter: (resourcePath) => !/style\.css$/.test(resourcePath),
        },
        { from: 'js/vendor', to: 'js/vendor' },
        { from: '404.html', to: '404.html' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'sitemap.xml', to: 'sitemap.xml' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
        { from: 'browserconfig.xml', to: 'browserconfig.xml' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'icon.png', to: 'icon.png' },
        { from: 'icon-512.png', to: 'icon-512.png' },
        { from: 'icon-maskable-512.png', to: 'icon-maskable-512.png' },
        { from: 'apple-touch-icon.png', to: 'apple-touch-icon.png' },
        { from: 'mstile-70x70.png', to: 'mstile-70x70.png' },
        { from: 'mstile-150x150.png', to: 'mstile-150x150.png' },
        { from: 'mstile-310x310.png', to: 'mstile-310x310.png' },
        { from: 'tile-wide.png', to: 'tile-wide.png' },
      ],
    }),
  ],
});
