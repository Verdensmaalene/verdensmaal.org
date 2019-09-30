var html = require('choo/html')
var parse = require('date-fns/parse')
var { Predicates } = require('prismic-javascript')
var differenceInDays = require('date-fns/difference_in_days')
var view = require('../components/view')
var grid = require('../components/grid')
var card = require('../components/card')
var intro = require('../components/intro')
var button = require('../components/button')
var popular = require('../components/popular')
var Telegram = require('../components/telegram')
var { i18n, srcset, asText, resolve } = require('../components/base')

var text = i18n()
var PAGE_SIZE = 9

module.exports = view(news, meta)

function news (state, emit) {
  if (!state.popular.data && !state.popular.error) emit('fetch:popular')
  if (!state.telegram.data && !state.telegram.error) emit('fetch:telegram')

  return state.docs.getSingle('news_listing', function render (err, doc) {
    if (err) throw err

    var num = +state.query.page
    num = isNaN(num) ? 1 : num

    var news = []
    for (let i = 0; i < num; i++) {
      if (news.length < num * PAGE_SIZE + 1) {
        news = news.concat(page(i + 1))
      }
    }

    // figure out how many news articles to fit in to the first row
    var extra = 1
    var topRow = { md: '1of2' }
    if (state.popular.error && state.telegram.error) extra += 1
    if (state.popular.error || state.telegram.error) topRow.lg = '1of2'
    else topRow.lg = '1of3'

    var still = num * PAGE_SIZE + extra
    if (num > 1) still -= PAGE_SIZE

    var latest = news.slice(0, extra).map(function (doc) {
      return grid.cell({ size: topRow }, newsCard(doc))
    })
    var prev = news.slice(1, still).map(function (doc) {
      return grid.cell({ size: { sm: '1of2', lg: '1of3' } }, newsCard(doc))
    })
    var current = news.slice(still, num * PAGE_SIZE + 1).map(function (doc, index) {
      return grid.cell({ size: { sm: '1of2', lg: '1of3' }, appear: index }, newsCard(doc))
    })
    var hasMore = news.length >= num * PAGE_SIZE + 1

    if (!state.popular.error) {
      if (!state.popular.data) {
        latest.unshift(grid.cell({ size: topRow }, popular.loading()))
      } else {
        const items = state.popular.data.map(function (doc) {
          var date = parse(doc.first_publication_date)
          var image = doc.data.image.url ? {
            alt: doc.data.image.alt || '',
            sizes: '90px',
            srcset: srcset(doc.data.image, [90, 180], {
              transforms: 'f_jpg,c_thumb'
            }),
            src: `/media/fetch/w_90/${doc.data.image.url}`
          } : null
          return {
            image: image,
            href: resolve(doc),
            title: asText(doc.data.title),
            date: {
              datetime: date,
              text: `${date.getDate()}. ${text(`MONTH_${date.getMonth()}`).substr(0, 3)} ${date.getFullYear()}`
            }
          }
        })
        if (!items.length) {
          latest.unshift(grid.cell({ size: topRow }, popular.loading()))
        } else {
          latest.unshift(grid.cell({ size: topRow }, popular(items)))
        }
      }
    }

    if (!state.telegram.error) {
      if (!state.telegram.data) {
        latest.unshift(Telegram.loading())
      } else {
        const telegram = state.cache(Telegram, 'news-telegram')
        latest.unshift(telegram.render(state.telegram.data.slice(0, 9).map(function (item) {
          var date = parse(item.date)
          var diff = differenceInDays(Date.now(), date)
          var prefix = ''
          if (Math.abs(diff) === 0) prefix = `${text`Today`}, `
          else if (diff === 1) prefix = `${text`Yesterday`}, `
          return Object.assign({}, item, {
            date: {
              datetime: date,
              text: `${prefix}${date.getDate()}. ${text(`MONTH_${date.getMonth()}`)}`
            }
          })
        })))
      }
    }

    return html`
      <main class="View-main">
        <div class="u-container">
          <div class="View-spaceLarge">
            ${doc ? intro({ title: asText(doc.data.title), body: asText(doc.data.description) }) : intro.loading()}
          </div>
          ${news.length ? html`
            <section>
              ${grid({ size: { lg: '1of3' } }, latest)}
              ${grid(prev.concat(current))}
            </section>
          ` : html`
            <div class="Text u-textCenter u-sizeFull">
              <p>${text`Nothing to see here`}</p>
            </div>
          `}
          ${!state.ui.isLoading && hasMore ? html`
            <p class="u-textCenter View-space">
              ${button({ href: `/nyheder?page=${num + 1}`, text: text`Show more`, onclick: onclick })}
            </p>
          ` : null}
        </div>
      </main>
    `
  })

  // fetch page by number
  // num -> arr
  function page (num) {
    const predicate = Predicates.at('document.type', 'news')
    const opts = {
      page: num,
      pageSize: PAGE_SIZE + 1,
      orderings: '[document.first_publication_date desc]'
    }

    return state.docs.get(predicate, opts, function onresponse (err, response) {
      if (err) throw err
      if (!response) {
        var cells = []
        for (let i = 0; i < PAGE_SIZE; i++) cells.push(null)
        return cells
      }
      return response.results
    })
  }

  // capture click and emit silent pushState
  // obj -> void
  function onclick (event) {
    if (!state.ui.isLoading) emit('pushState', event.target.href, true)
    event.preventDefault()
  }

  // render document as card
  // obj -> Element
  function newsCard (doc) {
    if (!doc) return card.loading({ date: true })

    var date = parse(doc.first_publication_date)
    var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
    var opts = { transforms: 'f_jpg,c_thumb', aspect: 3 / 4 }

    var image = doc.data.image.url ? {
      alt: doc.data.image.alt,
      sizes: sizes,
      srcset: srcset(doc.data.image, [400, 600, 900, 1800], opts),
      src: `/media/fetch/w_900/${doc.data.image.url}`,
      caption: doc.data.image.copyright
    } : null
    var slot = image ? null : html`
      <div class="u-aspect4-3 u-bgGray u-bgCurrent"></div>
    `

    return card({
      title: asText(doc.data.title),
      body: asText(doc.data.description),
      image: image,
      date: {
        datetime: date,
        text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
      },
      link: {
        href: resolve(doc)
      }
    }, slot)
  }
}

function meta (state) {
  return state.docs.getSingle('news_listing', function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
