const path = require('path');

module.exports = {
  entry: {
    script: './js/script.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: 'js/[name].js',
  },
};
