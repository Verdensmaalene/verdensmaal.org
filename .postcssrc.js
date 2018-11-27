module.exports = config

function config (ctx) {
  var plugins = [require('postcss-focus-visible')]
  if (ctx.env !== 'development') {
    plugins.push(
      require('postcss-custom-properties'),
      // TODO: include once https://github.com/MoOx/reduce-css-calc/issues/50 is resolved
      // require('postcss-calc')
    )
  }

  return { plugins }
}
