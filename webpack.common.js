const path = require('path');

module.exports = {
  entry: {
    script: './js/script.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    // Nome fixo de proposito: o <script src="js/script.js" defer> fica no
    // index.html (para o arquivo abrir sozinho), e nao no bundle injetado.
    // O dev-server serve este mesmo path da memoria, entao HMR funciona.
    filename: 'js/script.js',
  },
};
