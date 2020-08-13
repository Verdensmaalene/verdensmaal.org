var html = require('choo/html')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var grid = require('../components/grid')
var { select } = require('../components/form')
var subject = require('../components/subject')
var material = require('../components/material')
var breadcrumbs = require('../components/breadcrumbs')
var { i18n, srcset, asText, resolve, isSameDomain } = require('../components/base')

var EDUCATIONAL_LEVELS = [
  'Indskoling',
  'Mellemtrin',
  'Udskoling',
  'Ungdomsuddannelse'
]

var text = i18n()

module.exports = view(subjectView, meta, {
  theme: 'verdenstimen'
})

function subjectView (state, emit) {
  var predicates = Predicates.at('document.type', 'subject')
  var subjects = state.docs.get(predicates, function (err, response) {
    if (err || !response || !response.results_size) return null
    return response.results
  })

  if (state.params.subject === 'materialer') {
    const predicates = [Predicates.at('document.type', 'material')]

    if (state.query.level) {
      const value = decodeURIComponent(state.query.level)
      predicates.push(Predicates.at('my.material.audiences.label', value))
    }

    let materials = state.query.goal ? state.docs.get([
      Predicates.at('document.type', 'goal'),
      Predicates.at('my.goal.number', +state.query.goal)
    ], function (err, res) {
      if (err) return []
      if (!res) return null
      var id = res.results[0].id
      predicates.push(Predicates.at('my.material.goals.link', id))
      return getMaterials(predicates)
    }) : getMaterials(predicates)

    if (state.query.subject) {
      if (!subjects) {
        materials = null
      } else if (materials) {
        const subject = subjects.find((doc) => doc.uid === state.query.subject)
        materials = materials.filter(function (doc) {
          return subject.data.materials.some((item) => item.link.id === doc.id)
        })
      }
    }

    if (!materials) {
      materials = []
      for (let i = 0; i < 3; i++) materials.push(null)
    }

    const goals = getGoals()

    var level = state.query.level && EDUCATIONAL_LEVELS.find(function (name) {
      return decodeURIComponent(state.query.level) === name
    })

    return html`
      <main class="View-main">
        ${level ? subject({
          image: {
            alt: level,
            src: '/' + level.toLowerCase() + '.svg'
          },
          title: level,
          description: html`<p>${text`On this page you can find all materials suitable for ${level.toLowerCase()}. Use the filters bellow to narrow the search to specific goals or subjects.`}</p>`
        }) : null}
        <div class="View-space u-container">
          ${grid({ size: { md: '1of2' } }, [
            breadcrumbs([{
              label: 'Verdenstimen',
              link: { href: '/verdenstimen' }
            }, {
              label: text`Materials`
            }]),
            grid({ gutter: 'sm', size: { md: '1of2' } }, [
              select({
                name: 'goal',
                plain: true,
                label: text`Choose goal`,
                onchange () {
                  var query = Object.keys(state.query).reduce(function (query, key) {
                    if (key !== 'goal') query.push(`${key}=${state.query[key]}`)
                    return query
                  }, [])
                  if (this.value) query.push(`goal=${encodeURIComponent(this.value)}`)
                  emit('replaceState', `${state.href}?${query.join('&')}`)
                }
              }, [{
                value: '',
                label: text`All goals`,
                selected: !state.query.goal
              }].concat(goals)),
              select({
                name: 'subject',
                plain: true,
                label: text`Choose school subject`,
                onchange () {
                  var query = Object.keys(state.query).reduce(function (query, key) {
                    if (key !== 'subject') query.push(`${key}=${state.query[key]}`)
                    return query
                  }, [])
                  if (this.value) query.push(`subject=${encodeURIComponent(this.value)}`)
                  emit('replaceState', `${state.href}?${query.join('&')}`)
                }
              }, [{
                value: '',
                label: text`All school subjects`,
                selected: !state.query.subject
              }].concat(subjects ? subjects.map(function (doc) {
                return {
                  value: doc.uid,
                  label: asText(doc.data.title),
                  selected: state.query.subject === doc.uid
                }
              }) : []))
            ])
          ])}
          ${grid({ size: '1of1' }, materials.length ? materials.map(asMaterial) : [
            html`<p class="u-textCenter u-spaceT8">${text`No materials found`}</p>`
          ])}
        </div>
      </main>
    `
  }

  return state.docs.getByUID('subject', state.params.subject, function (err, doc) {
    if (err) throw err

    if (doc) {
      const ids = doc.data.materials.filter(function (item) {
        return !item.link.isBroken && item.link.id
      }).map((item) => item.link.id)
      const predicates = Predicates.any('document.id', ids)
      var materials = ids.length ? getMaterials(predicates) : []
      if (materials) {
        materials = materials.filter(function (doc) {
          if (state.query.goal) {
            const goals = doc.data.goals.map((item) => item.link && item.link.data && item.link.data.number)
            if (!goals.includes(+state.query.goal)) return false
          }
          if (state.query.level) {
            const value = decodeURIComponent(state.query.level)
            const levels = doc.data.audiences.map((item) => item.label)
            if (!levels.includes(value)) return false
          }
          return true
        })
      }
    }

    if (!materials) {
      materials = []
      for (let i = 0; i < 3; i++) materials.push(null)
    }

    if (doc && doc.data.image.url) {
      var image = Object.assign({
        alt: doc.data.image.alt || asText(doc.data.title),
        sizes: '15rem'
      }, doc.data.image.dimensions)
      if (/\.svg(\?.+)?$/.test(doc.data.image.url)) {
        image.src = doc.data.image.url
      } else {
        Object.assign(image, {
          srcset: srcset(doc.data.image, [240, 480, [600, 'q_50'], [900, 'q_50']]),
          src: srcset(doc.data.image, [240]).split(' ')[0]
        })
      }
    }

    var goals = getGoals()

    return html`
      <main class="View-main">
        ${doc ? subject({
          image,
          title: asText(doc.data.title),
          description: asElement(doc.data.description)
        }) : subject.loading({ image: true })}
        <div class="View-space u-container">
          ${grid({ size: { md: '1of2' } }, [
            breadcrumbs([{
              label: 'Verdenstimen',
              link: { href: '/verdenstimen' }
            }, {
              label: doc ? asText(doc.data.title) : html`
                <span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>
              `
            }]),
            grid({ gutter: 'sm', size: { md: '1of2' } }, [
              select({
                name: 'goal',
                plain: true,
                label: text`Choose goal`,
                onchange () {
                  var query = Object.keys(state.query).reduce(function (query, key) {
                    if (key !== 'goal') query.push(`${key}=${state.query[key]}`)
                    return query
                  }, [])
                  if (this.value) query.push(`goal=${encodeURIComponent(this.value)}`)
                  emit('replaceState', `${state.href}?${query.join('&')}`)
                }
              }, [{
                value: '',
                label: text`All goals`,
                selected: !state.query.goal
              }].concat(goals)),
              select({
                name: 'level',
                plain: true,
                label: text`Choose educational level`,
                onchange () {
                  var query = Object.keys(state.query).reduce(function (query, key) {
                    if (key !== 'level') query.push(`${key}=${state.query[key]}`)
                    return query
                  }, [])
                  if (this.value) query.push(`level=${encodeURIComponent(this.value)}`)
                  emit('replaceState', `${state.href}?${query.join('&')}`)
                }
              }, [{
                value: '',
                label: text`All educational levels`,
                selected: !state.query.level
              }].concat(EDUCATIONAL_LEVELS.map(function (label) {
                var value = decodeURIComponent(state.query.level)
                return { label, selected: value === label }
              })))
            ])
          ])}
          ${grid({ size: '1of1' }, materials.length ? materials.map(asMaterial) : [
            html`<p class="u-textCenter u-spaceT8">${text`No materials found`}</p>`
          ])}
        </div>
      </main>
    `
  })

  function asMaterial (doc) {
    if (!doc) return material.loading()
    if (doc.data.image.url) {
      var image = {
        alt: doc.data.image.alt || asText(doc.data.title),
        size: '(min-width: 1000px) 400px, 10vw',
        srcset: srcset(doc.data.image, [400, 600, [800, 'q_50']], {
          transforms: 'f_jpg,c_thumb'
        }),
        src: srcset(doc.data.image, [400]).split(' ')[0]
      }
    }

    var goals = []
    if (doc.data.goals && doc.data.goals.length) {
      goals = doc.data.goals.map(function (goal) {
        if (goal && goal.link && goal.link.type === 'goal') {
          return goal
        }
      })

      if (!goals[0]) { goals = null }
    }

    return material({
      image,
      title: asText(doc.data.title),
      description: asElement(doc.data.description),
      link: { href: `${state.href}/${doc.uid}` },
      goals: goals ? goals.map(function (item) {
        if (!item) return false
        return {
          number: item.link.data.number,
          link: { href: resolve(item.link) }
        }
      }) : null,
      subjects: subjects ? subjects.filter(function (subject) {
        return subject.data.materials.some((item) => item.link.id === doc.id)
      }).map(function (subject) {
        return {
          label: asText(subject.data.title),
          link: { href: resolve(subject) }
        }
      }) : null,
      duration: doc.data.duration,
      audiences: doc.data.audiences.map(function ({ label }) {
        return {
          label: label,
          link: {
            href: `/verdenstimen/materialer?level=${encodeURIComponent(label)}`
          }
        }
      }),
      partners: doc.data.partners.map(function (item) {
        if (item.link.isBroken || (!item.link.id && !item.link.url)) return null

        var link = { href: resolve(item.link) }
        if (link.target === '_blank' || !isSameDomain(link.href)) {
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
        }

        return {
          link: link,
          name: asText(item.link.data.title)
        }
      }).filter(Boolean)
    })
  }

  function getMaterials (predicates) {
    return state.docs.get(predicates, function (err, res) {
      if (err) throw err
      if (!res) return null
      return res.results
    })
  }

  function getGoals () {
    var predicates = Predicates.at('document.type', 'goal')
    var opts = { orderings: '[my.goal.number]' }
    return state.docs.get(predicates, opts, function (err, res) {
      if (err) return null
      if (!res) return []
      return res.results.map(function (doc) {
        var { number, title } = doc.data
        return {
          value: number,
          label: `${number}. ${asText(title)}`,
          selected: +state.query.goal === number
        }
      })
    })
  }
}

function meta (state) {
  if (state.params.subject === 'materialer') {
    return state.docs.getByUID('sector', 'verdenstimen', function (err, doc) {
      if (err) throw err
      var title = text`Materialer`
      if (!doc) return { title }
      var attrs = {
        title,
        description: asText(doc.data.description),
        'og:image': doc.data.image.url
      }

      if (!attrs['og:image']) {
        return state.docs.getSingle('website', function (err, doc) {
          if (err) throw err
          if (doc) attrs['og:image'] = doc.data.default_social_image.url
          return attrs
        })
      }

      return attrs
    })
  }

  return state.docs.getByUID('subject', state.params.subject, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url
    }

    if (!attrs['og:image']) {
      return state.docs.getSingle('website', function (err, doc) {
        if (err) throw err
        if (doc) attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
