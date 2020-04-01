var Prismic = require('prismic-javascript')
var { resolve } = require('../components/base')

module.exports = nomination

var CACHE_KEY = 'nomination'
var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

function nomination (state, emitter) {
  state.nomination = {
    loading: false,
    phase: 'nomination',
    fields: state.nomination
      ? (state.nomination.fields || {})
      : {},
    error: state.nomination ? state.nomination.error : null
  }

  try {
    var props = window.localStorage.getItem(CACHE_KEY)
    if (props) state.nomination.fields = JSON.parse(props)
  } catch (err) {}

  emitter.on('nomination:set', function (name, value) {
    if (!value) delete state.nomination[name]
    else state.nomination.fields[name] = value
    var asJSON = JSON.stringify(state.nomination.fields)
    window.localStorage.setItem(CACHE_KEY, asJSON)
    emitter.emit('render')
  })

  emitter.on('nomination:submit', function () {
    state.nomination.loading = true
    emitter.emit('render')

    if (state.nomination.phase === 'nomination') {
      window.fetch(state.href, {
        method: 'POST',
        body: JSON.stringify(state.nomination.fields),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }).then(function (res) {
        if (!res.ok) throw new Error(res.statusMessage || 'Could not submit')
        window.localStorage.removeItem(CACHE_KEY)
        state.nomination.loading = false
        emitter.emit('nomination:success')
        emitter.emit('pushState', `${state.href}/tak`)
      }).catch(function (err) {
        state.nomination.error = err
        state.nomination.loading = false
        emitter.emit('nomination:error', err)
        emitter.emit('render')
      })
    } else if (state.nomination.phase === 'vote') {
      Prismic.api(REPOSITORY, { req: state.req }).then(function (api) {
        return api.getByUID('page', 'verdensmaalsprisen').then(function (doc) {
          if (state.params.uid === 'oversigt') {
            if (!state.nomination.fields.email) {
              throw new Error('email missing')
            }
            return window.fetch(state.href, {
              method: 'POST',
              body: JSON.stringify(state.nomination.fields),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
              }
            }).then(function (res) {
              if (!res.ok) throw new Error(res.statusMessage || 'Could not submit')
              window.localStorage.removeItem(CACHE_KEY)
              state.nomination.loading = false
              state.nomination.error = null
              emitter.emit('pushState', resolve(doc) + '/tak')
            })
          } else {
            const categories = doc.data.related[0].items.filter(function (item) {
              return item.link.id && !item.link.isBroken
            })
            const index = categories.findIndex(function (item) {
              return item.link.uid === state.params.uid
            })

            state.nomination.error = null
            if (index === categories.length - 1) {
              state.nomination.loading = false
              emitter.emit('pushState', resolve(doc) + '/oversigt')
            } else {
              const next = categories[index + 1]
              state.nomination.loading = false
              emitter.emit('pushState', resolve(next.link))
            }
          }
        })
      }).catch(function (err) {
        state.nomination.loading = false
        state.nomination.error = err
        emitter.emit('render')
      })
    }
  })
}
