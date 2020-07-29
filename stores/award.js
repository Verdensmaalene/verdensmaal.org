var Prismic = require('prismic-javascript')
var { resolve } = require('../components/base')

module.exports = award

var CACHE_KEY = 'award'
var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

function award (state, emitter) {
  state.award = {
    loading: false,
    fields: state.award
      ? (state.award.fields || {})
      : {},
    error: state.award ? state.award.error : null
  }

  try {
    var props = window.localStorage.getItem(CACHE_KEY)
    if (props) state.award.fields = JSON.parse(props)
  } catch (err) {}

  emitter.on('award:set', function (name, value) {
    if (!value) delete state.award[name]
    else state.award.fields[name] = value
    var asJSON = JSON.stringify(state.award.fields)
    window.localStorage.setItem(CACHE_KEY, asJSON)
    emitter.emit('render')
  })

  emitter.on('award:nominate', function () {
    state.award.loading = true
    emitter.emit('render')

    window.fetch(state.href, {
      method: 'POST',
      body: JSON.stringify(state.award.fields),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }).then(function (res) {
      if (!res.ok) throw new Error(res.statusMessage || 'Could not submit')
      window.localStorage.removeItem(CACHE_KEY)
      state.award.loading = false
      emitter.emit('award:success')
      emitter.emit('pushState', `${state.href}/tak`)
    }).catch(function (err) {
      state.award.error = err
      state.award.loading = false
      emitter.emit('award:error', err)
      emitter.emit('render')
    })
  })

  emitter.on('award:vote', function () {
    state.award.loading = true
    emitter.emit('render')

    Prismic.api(REPOSITORY, { req: state.req }).then(function (api) {
      return api.getSingle('award').then(function (doc) {
        if (state.params.uid === 'oversigt') {
          if (!state.award.fields.email) {
            throw new Error('email missing')
          }
          return window.fetch(state.href, {
            method: 'POST',
            body: JSON.stringify(state.award.fields),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          }).then(function (res) {
            if (!res.ok) throw new Error(res.statusMessage || 'Could not submit')
            window.localStorage.removeItem(CACHE_KEY)
            state.award.loading = false
            state.award.error = null
            emitter.emit('pushState', resolve(doc) + '/tak')
          })
        } else {
          const categories = doc.data.categories.filter(function (item) {
            return item.link.id && !item.link.isBroken
          })
          const index = categories.findIndex(function (item) {
            return item.link.uid === state.params.uid
          })

          state.award.error = null
          if (index === categories.length - 1) {
            state.award.loading = false
            emitter.emit('pushState', resolve(doc) + '/oversigt')
          } else {
            const next = categories[index + 1]
            state.award.loading = false
            emitter.emit('pushState', resolve(next.link))
          }
        }
      })
    }).catch(function (err) {
      state.award.loading = false
      state.award.error = err
      emitter.emit('render')
    })
  })
}
