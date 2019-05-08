var html = require('choo/html')
var Component = require('choo/component')
var view = require('../components/view')
var grid = require('../components/grid')
var form = require('../components/form')
var intro = require('../components/intro')
var banner = require('../components/banner')
var button = require('../components/button')
var { i18n, asText, srcset } = require('../components/base')

var text = i18n()
var CATEGORIES = [{
  label: 'Leaving No One Behind',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sed gravida lorem. Phasellus congue justo at magna varius, vel vestibulum est faucibus.'
}, {
  label: 'Transforming our World',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sed gravida lorem. Phasellus congue justo at magna varius, vel vestibulum est faucibus.'
}, {
  label: 'Ildsjælpeprisen',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sed gravida lorem. Phasellus congue justo at magna varius, vel vestibulum est faucibus.'
}]

module.exports = view(page, meta)

function page (state, emit) {
  return state.docs.getByUID('page', 'sdg-award', function (err, doc) {
    if (err) throw err

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)
    var counter = state.cache(Counter, 'motivation-counter')

    return html`
      <main class="View-main">
        <div class="View-spaceLarge">
          ${doc && doc.data.image.url ? banner(image(doc.data.image)) : html`
            <div class="u-container">${intro({ title, body: description })}</div>
          `}
          ${doc.data.image.url ? html`
            <div class="View-space">
              <div class="Text">
                <h1>${title}</h1>
                <p>${description}</p>
              </div>
            </div>
          ` : null}
          ${!doc ? intro.loading() : null}
          <div class="View-space u-container">
            <form action="/api/nomination" method="POST" class="Form" onsubmit=${onsubmit}>
              <div class="Text u-spaceB4">
                <h2 class="Text-h3">Select the category</h2>
                <p>For which award should your nominee be considered?</p>
              </div>
              ${grid({ size: { 'md': '1of3' } }, CATEGORIES.map((props, index) => form.choice(Object.assign({
                id: `category-${index}`,
                value: props.label,
                disabled: state.ui.isLoading,
                selected: state.nomination['TODO:CATEGORY'],
                name: 'TODO:CATEGORY'
              }, props), onchange)))}
              <div class="Text u-spaceT8 u-spaceB4">
                <h2 class="Text-h3">Tell us about yourself</h2>
              </div>
              ${grid({ size: { 'md': '1of2' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Your name',
                      value: state.nomination['TODO:NAME'] || '',
                      id: 'TODO:NAME',
                      name: 'TODO:NAME',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'E-mail',
                      value: state.nomination['TODO:EMAIL'] || '',
                      id: 'TODO:EMAIL',
                      name: 'TODO:EMAIL',
                      type: 'email',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                  </div>
                `, html`
                  <div>
                    ${form.input({
                      label: 'Organisation/company',
                      value: state.nomination['TODO:ORG'] || '',
                      id: 'TODO:ORG',
                      name: 'TODO:ORG',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'Telephone',
                      value: state.nomination['TODO:TEL'] || '',
                      id: 'TODO:TEL',
                      name: 'TODO:TEL',
                      type: 'tel',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                  </div>
                `
              ])}
              <div class="Text u-spaceT8 u-spaceB4">
                <h2 class="Text-h3">Who would you like to nominate?</h2>
              </div>
              ${grid({ size: { 'md': '1of2' } }, [
                form.input({
                  label: 'Name of nominee',
                  value: state.nomination['TODO:NOMINEE'] || '',
                  id: 'TODO:NOMINEE',
                  name: 'TODO:NOMINEE',
                  required: true,
                  onchange: onchange,
                  disabled: state.ui.isLoading
                }),
                form.input({
                  label: 'Organisation/company',
                  value: state.nomination['TODO:NOMENEE_ORG'] || '',
                  id: 'TODO:NOMENEE_ORG',
                  name: 'TODO:NOMENEE_ORG',
                  onchange: onchange,
                  disabled: state.ui.isLoading
                })
              ])}
              ${form.textarea({
                rows: 12,
                class: 'u-spaceB1',
                label: 'Motivation',
                value: state.nomination['TODO:MOTIVATION'] || '',
                id: 'TODO:MOTIVATION',
                name: 'TODO:MOTIVATION',
                required: true,
                oninput: oninput,
                onchange: onchange,
                disabled: state.ui.isLoading,
                comment: 'Max. 300 words'
              })}
              ${counter.render(state.nomination['TODO:MOTIVATION'])}
              <div class="Text u-spaceT8 u-spaceB2">
                <h2 class="Text-h3">Relevant links</h2>
                <p>Please add any relevant links, e.g. social media or press coverage.</p>
              </div>
              ${grid({ size: { 'md': '1of2' } }, [
                html`
                  <div>
                    ${form.input({
                      class: 'u-spaceB0',
                      placeholder: 'Paste link here',
                      value: state.nomination['TODO:LINKS-1'] || '',
                      id: 'TODO:LINKS-1',
                      name: 'TODO:LINKS-1',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      class: 'u-spaceB0',
                      placeholder: 'Paste link here',
                      value: state.nomination['TODO:LINKS-2'] || '',
                      id: 'TODO:LINKS-2',
                      name: 'TODO:LINKS-2',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      class: 'u-spaceB0',
                      placeholder: 'Paste link here',
                      value: state.nomination['TODO:LINKS-3'] || '',
                      id: 'TODO:LINKS-3',
                      name: 'TODO:LINKS-3',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                  </div>
                `
              ])}
              <div class="u-flex u-flexWrap u-alignCenter">
                <div class="u-spaceR3 u-spaceT6">
                  ${button({ type: 'submit', text: text`Submit`, primary: true, disabled: state.ui.isLoading })}
                </div>
                <div class="Text Text-small u-spaceT6">
                  <div class="Text-muted">
                    <p>Ved at indsende disse oplysninger<br>accepterer du vores <a href="/materielle-licenser">vilkår og betingelser</a>.</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    `

    function onchange (event) {
      emit('nomination:set', event.target.name, event.target.value)
    }

    function oninput (event) {
      counter.render(event.target.value)
    }

    function onsubmit (event) {
      emit('nomination:submit', new FormData(event.target))
      event.preventDefault()
    }
  })
}

// word counter component
// () -> Counter
class Counter extends Component {
  update () {
    return true
  }

  createElement (value = '') {
    var length = value ? value.split(' ').length : '0'
    return html`<span class="Form-meta">${text`Using ${length} words`}</span>`
  }
}

// construct image properties
// obj -> obj
function image (props) {
  return {
    width: props.dimensions.width,
    height: props.dimensions.height,
    caption: props.copyright,
    alt: props.alt || '',
    src: props.url,
    sizes: '100vw',
    srcset: srcset(
      props.url,
      [400, 600, 900, 1800, [3000, 'q_60']],
      { aspect: 9 / 16 }
    )
  }
}

function meta (state) {
  return state.docs.getByUID('page', 'sdg-award', function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url || doc.data.image.url
    }

    if (!attrs['og:image']) {
      return state.docs.getSingle('website', function (err, doc) {
        if (err) throw err
        if (!doc) return state.meta['og:image']
        attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
