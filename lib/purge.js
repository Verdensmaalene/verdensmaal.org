var cccpurge = require('cccpurge')
var Prismic = require('prismic-javascript')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

module.exports = purge

function purge (urls, callback = Function.prototype) {
  if (typeof urls === 'function') {
    callback = urls
    urls = []
  }

  cccpurge(require('../index'), {
    urls: urls,
    resolve: resolve,
    root: 'https://dk.globalgoals.org',
    zone: process.env.CLOUDFLARE_VERDENSMAALENE_ZONE,
    email: process.env.CLOUDFLARE_CODEANDCONSPIRE_EMAIL,
    key: process.env.CLOUDFLARE_CODEANDCONSPIRE_KEY
  }, callback)
}

function resolve (route, done) {
  if (route !== '*') return done(null)
  Prismic.api(REPOSITORY).then(function (api) {
    return api.query(
      Prismic.Predicates.at('document.type', 'goal')
    ).then(function (response) {
      done(null, response.results.map((doc) => `/${doc.data.number}-${doc.uid}`))
    })
  }).catch(done)
}
