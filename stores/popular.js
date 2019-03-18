var analytics = require('../lib/analytics')
var Prismic = require('prismic-javascript')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

module.exports = popular

function popular (state, emitter) {
  state.popular = state.prefetch ? null : state.popular

  emitter.on('fetch:popular', function () {
    var res = analytics().then(function (data) {
      return Prismic.getApi(REPOSITORY, { req: state.req }).then(function (api) {
        var docs = data.slice(0, 5).map(function ([href]) {
          var parts = href.split('/')
          return api.getByUID('news', parts[parts.length - 1]).catch(() => null)
        })
        return Promise.all(docs)
      })
    }).then(function (docs) {
      state.popular = docs.filter(Boolean)
      emitter.emit('render')
    })
    if (state.prefetch) state.prefetch.push(res)
  })
}
