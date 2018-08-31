module.exports = config

function config (ctx) {
  return {
    plugins: [require('postcss-focus-visible')]
  }
}
