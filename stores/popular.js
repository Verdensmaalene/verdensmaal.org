var analytics = require('../lib/analytics')
var Prismic = require('prismic-javascript')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

module.exports = popular

function popular (state, emitter) {
  state.popular = state.prefetch ? {} : state.popular
  if (typeof window !== 'undefined') state.popular.error = null

  emitter.on('fetch:popular', function () {
    if (state.popular.loading) return
    state.popular.loading = true
    var res = analytics().then(function (data) {
      return Prismic.getApi(REPOSITORY, { req: state.req }).then(function (api) {
        var docs = data.slice(0, 5).map((item) => {
          var parts = item.url.split('/')
          return api.getByUID('news', parts[parts.length - 1]).catch(() => null)
        })
        return Promise.all(docs)
      })
    }).then(function (docs) {
      state.popular.loading = false
      state.popular.data = docs.filter(Boolean)
      emitter.emit('render')
    }).catch(function (err) {
      state.popular.error = err
      state.popular.loading = false
      emitter.emit('render')
    })
    if (state.prefetch) state.prefetch.push(res)
  })
}
