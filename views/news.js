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

    var news = []
    for (let i = 0; i < num; i++) {
      if (news.length < num * PAGE_SIZE + 2) news.push(...page(i + 1))
    }

    var latest = news.slice(0, 2)
    var first = news.slice(2, PAGE_SIZE + 2)
    var rest = news.slice(PAGE_SIZE + 2, num * PAGE_SIZE + 2).filter(Boolean)

    return html`
      <main class="View-main">
        <div class="View-section">
          ${intro({title, body})}
          ${news.length ? html`
            <section>
              ${grid({size: '1of2'}, latest.map(withLoading))}
              ${grid({size: '1of3'}, first.map(withLoading))}
              ${grid({size: '1of3', appear: true}, rest.map(newsCard))}
            </section>
          ` : html`
            <div class="Text u-textCenter u-sizeFull">
              <p>${text`Nothing to see here`}</p>
            </div>
          `}
          ${news.length >= num * PAGE_SIZE + 2 ? html`
            <p class="u-textCenter">
              ${button({href: `/nyheder?page=${num + 1}`, text: text`Show more`, onclick: onclick})}
            </p>
          ` : null}
        </div>
      </main>
    `
  })

  // render doc as card, fallback to loading while fetching doc
  // obj -> HTMLElement
  function withLoading (doc) {
    if (doc) return newsCard(doc)
    return card.loading({date: true})
  }

  // fetch page by number
  // num -> arr
  function page (num) {
    let predicate = Predicates.at('document.type', 'news')
    let opts = {
      page: num,
      pageSize: PAGE_SIZE + 2,
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
    if (!doc) return {title: text`LOADING_TEXT_SHORT`}
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
