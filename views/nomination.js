var html = require('choo/html')
var Component = require('choo/component')
var asElement = require('prismic-element')
var view = require('../components/view')
var grid = require('../components/grid')
var form = require('../components/form')
var intro = require('../components/intro')
var Anchor = require('../components/anchor')
var banner = require('../components/banner')
var button = require('../components/button')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset } = require('../components/base')

var text = i18n()

var CATEGORIES = [{
  'class': 'u-bg10',
  label: 'Leaving No One Behind',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sed gravida lorem. Phasellus congue justo at magna varius, vel vestibulum est faucibus.'
}, {
  'class': 'u-bg16',
  label: 'Transforming our World',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sed gravida lorem. Phasellus congue justo at magna varius, vel vestibulum est faucibus.'
}, {
  'class': 'u-bg7',
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
    var body = asElement(doc.data.body, state.docs.resolve, serialize)
    var { fields, error } = state.nomination

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
          ${doc ? html`<div class="Text">${body}</div>` : intro.loading()}
          <div class="View-space u-container">
            <form action="/api/nomination" method="POST" class="Form" onsubmit=${onsubmit}>
              ${error ? html`
                <div class="Form-error u-spaceB6">
                  ${state.cache(Anchor, 'nomination-error', { auto: true }).render()}
                  <div class="Text">
                    <h2 class="Text-h3">${text`Oops`}</h2>
                    <p>${text`Something seems to be missing. Please make sure that you have filled in all requried fields (marked with a *).`}</p>
                    ${process.env.NODE_ENV === 'development' ? html`<pre>${error.stack}</pre>` : null}
                  </div>
                </div>
              ` : null}
              <div class="Text u-spaceB4">
                <h2 class="Text-h3">Select the category</h2>
                <p>For which award should your nominee be considered?</p>
              </div>
              ${grid({ size: { 'md': '1of3' } }, CATEGORIES.map((props, index) => form.choice(Object.assign({
                id: `category-${index}`,
                value: props.label,
                disabled: state.ui.isLoading,
                selected: fields['entry.57699070'],
                name: 'entry.57699070'
              }, props), onchange)))}
              <div class="Text u-spaceT8 u-spaceB4">
                <h2 class="Text-h3">Tell us about yourself</h2>
              </div>
              ${grid({ size: { 'md': '1of2' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Your name',
                      value: fields['entry.1816023571'] || '',
                      id: 'entry.1816023571',
                      name: 'entry.1816023571',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'E-mail',
                      value: fields['entry.979846681'] || '',
                      id: 'entry.979846681',
                      name: 'entry.979846681',
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
                      value: fields['entry.1490561457'] || '',
                      id: 'entry.1490561457',
                      name: 'entry.1490561457',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'Telephone',
                      value: fields['entry.872971700'] || '',
                      id: 'entry.872971700',
                      name: 'entry.872971700',
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
                  value: fields['entry.2012872212'] || '',
                  id: 'entry.2012872212',
                  name: 'entry.2012872212',
                  required: true,
                  onchange: onchange,
                  disabled: state.ui.isLoading
                }),
                form.input({
                  label: 'Organisation/company',
                  value: fields['entry.682921765'] || '',
                  id: 'entry.682921765',
                  name: 'entry.682921765',
                  required: true,
                  onchange: onchange,
                  disabled: state.ui.isLoading
                })
              ])}
              ${form.textarea({
                rows: 12,
                'class': 'u-spaceB1',
                label: 'Motivation',
                value: fields['entry.1264591994'] || '',
                id: 'entry.1264591994',
                name: 'entry.1264591994',
                required: true,
                oninput: oninput,
                onchange: onchange,
                disabled: state.ui.isLoading,
                comment: 'Please describe what the nominee has done, who the target group was, where it took place and which of the SDGs have been included. Max. 300 words.'
              })}
              ${counter.render(fields['entry.1264591994'])}
              <div class="Text u-spaceT8 u-spaceB2">
                <h2 class="Text-h3">Relevant links</h2>
                <p>Please add any relevant links, e.g. social media or press coverage.</p>
              </div>
              ${grid({ size: { 'md': '1of2' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Link',
                      plain: true,
                      'class': 'u-spaceB1',
                      placeholder: 'Paste link here',
                      value: fields['entry.1030183847'] || '',
                      id: 'entry.1030183847',
                      name: 'entry.1030183847',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'Link',
                      plain: true,
                      'class': 'u-spaceB1',
                      placeholder: 'Paste link here',
                      value: fields['entry.1272236586'] || '',
                      id: 'entry.1272236586',
                      name: 'entry.1272236586',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'Link',
                      plain: true,
                      'class': 'u-spaceB1',
                      placeholder: 'Paste link here',
                      value: fields['entry.2039565048'] || '',
                      id: 'entry.2039565048',
                      name: 'entry.2039565048',
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
      if (!event.target.checkValidity()) {
        event.target.reportValidity()
        event.preventDefault()
        return
      }
      emit('nomination:submit')
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
    return html`<span class="Form-meta">${text`Using ${length}/300 words`}</span>`
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
