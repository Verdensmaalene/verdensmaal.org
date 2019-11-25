var cccpurge = require('cccpurge')
var Prismic = require('prismic-javascript')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

module.exports = purge

function purge (entry, urls, callback = Function.prototype) {
  if (typeof urls === 'function') {
    callback = urls
    urls = []
  }

  cccpurge(require(entry), {
    urls: urls,
    resolve: resolve,
    root: 'https://www.verdensmaal.org',
    zone: process.env.CLOUDFLARE_ZONE,
    email: process.env.CLOUDFLARE_EMAIL,
    key: process.env.CLOUDFLARE_KEY
  }, callback)
}

function resolve (route, done) {
  switch (route) {
    case '/*': {
      return Prismic.api(REPOSITORY).then(function (api) {
        var queue = []

        queue.push(api.query(
          Prismic.Predicates.at('document.type', 'goal')
        ).then(function (response) {
          return response.results.map((doc) => `/${doc.data.number}-${doc.uid}`)
        }))

        queue.push(api.query([
          Prismic.Predicates.at('document.type', 'page')
        ]).then(function (response) {
          return response.results.map((doc) => `/${doc.uid}`)
        }))

        queue.push(api.query([
          Prismic.Predicates.at('document.type', 'sector')
        ]).then(function (response) {
          return response.results.map((doc) => `/${doc.uid}`)
        }))

        return Promise.all(queue).then(function (urls) {
          done(null, urls.reduce((flat, list) => flat.concat(list), []))
        }).catch(done)
      })
    }
    case '/nyheder/:uid': {
      return Prismic.api(REPOSITORY).then(function (api) {
        return api.query(
          Prismic.Predicates.at('document.type', 'news'),
          { pageSize: 100 }
        ).then(function (response) {
          var urls = response.results.map((doc) => `/nyheder/${doc.uid}`)

          if (response.total_pages > 1) {
            const pages = []
            for (let i = 2; i <= response.total_pages; i++) {
              pages.push(api.query(
                Prismic.Predicates.at('document.type', 'news'),
                { pageSize: 100, page: i }
              ).then(function (response) {
                return response.results.map((doc) => `/nyheder/${doc.uid}`)
              }))
            }
            return Promise.all(pages).then(function (urlsPerPage) {
              return urlsPerPage.reduce((flat, list) => flat.concat(list), urls)
            })
          }

          return urls
        }).then((urls) => done(null, urls)).catch(done)
      })
    }
    case '/events/:uid': {
      return Prismic.api(REPOSITORY).then(function (api) {
        return api.query(
          [
            Prismic.Predicates.at('document.type', 'event'),
            Prismic.Predicates.dateAfter('my.event.start', new Date())
          ],
          { pageSize: 100 }
        ).then(function (response) {
          return response.results.map((doc) => `/events/${doc.uid}`)
        })
      }).then((urls) => done(null, urls)).catch(done)
    }
    default: return done(null)
  }
}
