var html = require('choo/html')
var {asText} = require('prismic-richtext')
var {Predicates} = require('prismic-javascript')
var view = require('../components/view')
var grid = require('../components/grid')
var card = require('../components/card')
var intro = require('../components/intro')
var {i18n} = require('../components/base')
var button = require('../components/button')

var text = i18n()
var PAGE_SIZE = 3

module.exports = view(news, meta)

function news (state, emit) {
  var more = true

  return state.docs.getSingle('news_listing', function render (err, doc) {
    if (err) throw err
    var title, body
    if (!doc) {
      title = html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
      body = html`<span class="u-loading">${text`LOADING_TEXT_LONG`}</span>`
    } else {
      title = asText(doc.data.title)
      body = asText(doc.data.description)
    }

    var num = +state.query.page
    num = isNaN(num) ? 1 : num

    return html`
      <main class="View-main">
        <div class="View-section">
          ${intro({title, body})}
          ${page(num)}
          ${more ? html`
            <p class="u-textCenter">
              ${button({href: `/nyheder?page=${num + 1}`, text: text`Show more`, onclick: onclick, disabled: state.ui.isLoading})}
            </p>
          ` : null}
        </div>
      </main>
    `
  })

  // fetch page falling back to previous page (in client)
  // (num, fn) -> HTMLElement
  function page (num) {
    let predicate = Predicates.at('document.type', 'news')
    let opts = {
      pageSize: num * PAGE_SIZE + 2,
      orderings: '[document.first_publication_date desc]'
    }

    return state.docs.get(predicate, opts, function fallback (err, response) {
      if (err) return onpage(err)
      if (response) return onpage(null, response)
      if (num > 1 && typeof window !== 'undefined') return page(num - 1)
      return onpage()
    })

    // create a render a block for news items
    // num -> fn
    function onpage (err, response) {
      if (err) throw err
      if (!response) {
        var cells = []
        for (let i = 0; i < PAGE_SIZE; i++) cells.push({date: true})
        return [
          grid({size: '1of2'}, cells.slice(0, 2).map(card.loading)),
          grid({size: '1of3'}, cells.map(card.loading))
        ]
      }

      if (!response.results_size) {
        more = false
        return html`
          <div class="Text u-textCenter u-sizeFull">
            <p>${text`Nothing to see here`}</p>
          </div>
        `
      }

      // remove more button if we received an incomplete response
      if (response.results_size !== num * PAGE_SIZE + 2) more = false

      var rows = [
        grid({size: '1of2'}, response.results.slice(0, 2).map(newsCard)),
        grid({size: '1of3'}, response.results.slice(2, PAGE_SIZE + 2).map(newsCard))
      ]

      if (response.results_size > PAGE_SIZE + 2) {
        rows.push(grid(
          {size: '1of3', appear: true},
          response.results.slice(PAGE_SIZE + 2).map(newsCard))
        )
      }

      return rows
    }
  }

  // capture click and emit silent pushState
  // obj -> void
  function onclick (event) {
    emit('pushState', event.target.href, true)
    event.preventDefault()
  }
}

// render document as card
// obj -> HTMLElement
function newsCard (doc) {
  var date = new Date(doc.first_publication_date)
  return card({
    title: asText(doc.data.title),
    body: asText(doc.data.description),
    figure: {
      alt: doc.data.image.alt,
      src: doc.data.image.url,
      caption: doc.data.image.copyright
    },
    date: {
      datetime: date,
      text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
    },
    link: {
      href: `/nyheder/${doc.uid}`
    }
  })
}

function meta (state) {
  return state.docs.getSingle('news_listing', function (err, doc) {
    if (err) throw err
    if (!doc) return {}
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
