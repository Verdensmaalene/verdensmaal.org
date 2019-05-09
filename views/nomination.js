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
  label: 'Inkluderingsprisen',
  description: 'Leaving no one behind – vi skal sikre, at de svageste kommer med. Prisen gives for den handling eller initiativ, der bedst har nået og inkluderet en eller flere af de grupper, der er i størst risiko for ikke at nå Verdensmålene – og konkret har forbedret deres situation.'
}, {
  'class': 'u-bg16',
  label: 'Forandringsprisen',
  description: 'Verdensmålene handler om en grundlæggende forandring af vores verden. Prisen gives for den mest nytænkende og effektfulde idé eller opfindelse, der samtidig har det største systemforandrende potentiale.'
}, {
  'class': 'u-bg7',
  label: 'Ildsjæleprisen',
  description: 'Som enkeltpersoner kan vi ændre og inspirere vores medmennesker. Prisen gives til den, der i kraft af sit personlige engagement har markeret sig som en stærk ildsjæl for Verdensmålene og har inspireret andre til at være med.'
}]

module.exports = view(page, meta)

function page (state, emit) {
  return state.docs.getByUID('page', 'nominer-en-helt', function (err, doc) {
    if (err) throw err

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)
    var counter = state.cache(Counter, 'motivation-counter')
    var body = asElement(doc.data.body, state.docs.resolve, serialize)
    var { fields, error } = state.nomination

    return html`
      <main class="View-main">
        <div class="View-spaceLarge">
          <div class="u-container">${intro({ title, body: description })}</div>
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
                <h2 class="Text-h3">Vælg en kategori</h2>
                <p>Hvilken pris har din kandidat gjort sig fortjent til?</p>
              </div>
              ${grid({ size: { 'lg': '1of3' } }, CATEGORIES.map((props, index) => form.choice(Object.assign({
                id: `category-${index}`,
                value: props.label,
                disabled: state.ui.isLoading,
                selected: fields['entry.57699070'],
                name: 'entry.57699070'
              }, props), onchange)))}
              <div class="Text u-spaceT8 u-spaceB4">
                <h2 class="Text-h3">Fortæl os om dig selv</h2>
              </div>
              ${grid({ size: { 'md': '1of2', 'lg': '1of3' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Dit navn',
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
                      label: 'Din organisation/virksomhed',
                      value: fields['entry.1490561457'] || '',
                      id: 'entry.1490561457',
                      name: 'entry.1490561457',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'Telefonnummer',
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
                <h2 class="Text-h3">Hvem vil du gerne nominere?</h2>
              </div>

              ${grid({ size: { 'md': '1of2', 'lg': '1of3' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Navn',
                      value: fields['entry.2012872212'] || '',
                      id: 'entry.2012872212',
                      name: 'entry.2012872212',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'E-mail',
                      value: fields['entry.1015718738'] || '',
                      id: 'entry.1015718738',
                      name: 'entry.1015718738',
                      type: 'email',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                  </div>
                `, html`
                  <div>
                    ${form.input({
                      label: 'Organisation/virksomhed',
                      value: fields['entry.993919630'] || '',
                      id: 'entry.993919630',
                      name: 'entry.993919630',
                      required: true,
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                    ${form.input({
                      label: 'Telefonnummer',
                      value: fields['entry.1899378004'] || '',
                      id: 'entry.1899378004',
                      name: 'entry.1899378004',
                      type: 'tel',
                      onchange: onchange,
                      disabled: state.ui.isLoading
                    })}
                  </div>
                `
              ])}
              ${form.textarea({
                rows: 10,
                'class': 'u-spaceB1',
                label: 'Hvorfor skal din kandidat nomineres til prisen?',
                value: fields['entry.1264591994'] || '',
                id: 'entry.1264591994',
                name: 'entry.1264591994',
                required: true,
                oninput: oninput,
                onchange: onchange,
                disabled: state.ui.isLoading,
                comment: 'Beskriv hvad personen har gjort, hvem målgruppen er og hvad effekten har været. Beskriv også meget gerne, hvordan Verdensmålene har været med i arbejdet. (Max 300 ord).'
              })}
              ${counter.render(fields['entry.1264591994'])}
              <div class="Text u-spaceT8 u-spaceB2">
                <h2 class="Text-h3">Relevante links</h2>
                <p>Indsæt meget gerne links til kandidatens hjemmeside, sociale medier eller f.eks. presseomtale af projektet/kandidaten.</p>
              </div>
              ${grid({ size: { 'lg': '2of3' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Link',
                      plain: true,
                      'class': 'u-spaceB1',
                      placeholder: 'Indsæt link her',
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
                  ${button({ type: 'submit', text: text`Indsend`, primary: true, disabled: state.ui.isLoading })}
                </div>
                <div class="Text Text-small u-spaceT6">
                  <div class="Text-muted">
                    <p>Ved at indsende disse oplysninger<br>accepterer du vores <a href="https://verdensbedstenyheder.dk/om-verdens-bedste-nyheder/persondatapolitik/" rel="noreferrer noopener" target="_blank">vilkår og betingelser</a>.</p>
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

function meta (state) {
  return state.docs.getByUID('page', 'nominer-en-helt', function (err, doc) {
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
