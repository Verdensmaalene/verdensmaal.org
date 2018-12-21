var html = require('choo/html')
var Component = require('choo/component')
var intro = require('../intro')
var { i18n } = require('../base')

var text = i18n()

var BIRD_WING_FLAP = 'M13.774.01C9.294.01 2.172 2.586 1.408 3.26c-.764.675-.826 1.707-.397 2.35.43.645 2.092.414 2.57.2.478-.214 3.01-.287 6.168-.287 3.258 0 9.663 3.873 15.858 9.648.513.456 1.006.684 1.48.684.472 0 .95-.223 1.43-.67 6.225-5.79 12.62-9.662 15.882-9.662 3.174 0 5.59.025 6.18.287.59.262 1.95.595 2.593-.2.645-.793.29-1.7-.282-2.218S44.918 0 40.375 0c-6.204 0-11.313 5.462-13.29 7.025C25.162 5.522 20.03.01 13.775.01z'
var BIRD_WING_ORIGIN = 'M13.774.01C9.294.01 2.172 4.586 1.408 5.26c-.764.675-.826 1.707-.397 2.35.43.645 2.092.414 2.57.2.478-.214 3.01-1.287 6.168-1.287 3.258 0 9.663.873 15.858 6.648.513.456 1.006.684 1.48.684.472 0 .95-.223 1.43-.67 6.225-5.79 12.62-6.662 15.882-6.662 3.174 0 5.59 1.025 6.18 1.287.59.262 1.95.595 2.593-.2.645-.793.29-1.7-.282-2.218S44.918 0 40.375 0c-6.204 0-11.313 3.462-13.29 5.025C25.162 3.522 20.03.01 13.775.01z'

module.exports = class Mission extends Component {
  constructor (id, state, emit) {
    super(id)
    this.state = state
    this.local = state.components[id] = {
      id: id,
      isLoaded: false,
      isHighContrast: state.ui.isHighContrast
    }
  }

  static loading () {
    return html`
      <div class="Mission">
        <div class="Mission-content u-container">
          <div class="Mission-body">
            ${intro.loading({ adaptive: true })}
          </div>
          <div class="Mission-footer">
            <div class="Mission-partners">
              <span class="Mission-partner u-loadingAdaptive">${text`LOADING_TEXT_SHORT`}</span>
              <span class="Mission-partner u-loadingAdaptive">${text`LOADING_TEXT_SHORT`}</span>
              <span class="Mission-partner u-loadingAdaptive">${text`LOADING_TEXT_SHORT`}</span>
            </div>
          </div>
        </div>
      </div>
    `
  }

  update () {
    if (this.local.isHighContrast !== this.state.ui.isHighContrast) {
      this.local.isHighContrast = this.state.ui.isHighContrast
      return true
    }
    return false
  }

  createElement (props) {
    return html`
      <div class="Mission ${this.local.isLoaded ? 'is-loaded' : ''}" id="${this.local.id}">
        ${!this.local.isHighContrast ? background() : null}
        <div class="Mission-content u-container">
          <div class="Mission-body">
            ${intro({ title: props.title, body: props.description })}
          </div>
          ${!this.local.isHighContrast && props.partners ? html`
            <div class="Mission-footer">
              <div class="Mission-partners">
                ${props.partners.map((partner) => html`
                  <a href="${partner.href}" class="Mission-partner">
                    <img class="Mission-logo" src="${partner.image.src}" width="${partner.image.width}" height="${partner.image.height}" />
                  </a>
                `)}
              </div>
            </div>
          ` : null}
        </div>
      </div>
    `
  }
}

function background () {
  return html`
    <div class="Mission-background">
      <svg hidden>
        <symbol viewBox="0 0 54 14" id="mission-bird-symbol">
          <path id="mission-bird" d="${BIRD_WING_ORIGIN}" fill="currentColor" fill-rule="evenodd"/>
          <animate xlink:href="#mission-bird" attributeName="d" begin="0s" dur="1200ms" repeatCount="indefinite" values="${[BIRD_WING_FLAP, BIRD_WING_ORIGIN, BIRD_WING_FLAP].join(';')}" />
        </symbol>
      </svg>
      <div class="Mission-birds">
        <svg class="Mission-bird" width="54" height="14"><use xlink:href="#mission-bird-symbol" /></svg>
        <svg class="Mission-bird" width="54" height="14"><use xlink:href="#mission-bird-symbol" /></svg>
        <svg class="Mission-bird" width="54" height="14"><use xlink:href="#mission-bird-symbol" /></svg>
        <svg class="Mission-bird" width="54" height="14"><use xlink:href="#mission-bird-symbol" /></svg>
      </div>
      <svg class="Mission-vista" width="671" height="409" viewBox="0 0 671 409" aria-hidden="true" role="presentation">
        <g fill="none" fill-rule="evenodd">
          <path class="Mission-hill" fill="#75001F" d="M671 409V257.6a234 234 0 0 0-172.7 41.3c-51 37.6-123.3 75.6-186.7 65.1a375.8 375.8 0 0 0-243 45H671z"/>
          <path class="Mission-bear" fill="#FFF" fill-rule="nonzero" d="M35.3 397.5l-5.8-1.4-1.8 4.4 3.3 6.2V407.9c0 .5.4.8.8 1H33l3.8-1.7c.3-.2.5-.4.6-.7l.3-2v-1l-2.4-6zm39.8-2L72 390l-4.3 8.2 2.6 6.9v1.5c0 .3.1.5.3.5l1.3.3h.3l4-2c.4-.1.7-.4.7-.8l.4-2.3v-.5l-2.2-6.2zM.9 386.7v.4c0 1 .7 1.8 1.7 2h.5l3.5-.6 2.6-.7 1 .1 6.6 3v.1c.3.1 1.3.5 1.3.8l-.1 2.5v.1L16 405.8c0 .3-.1.5-.3.7l-.3.3a1.4 1.4 0 0 0 1 2.2h4c.3 0 .6 0 .8-.3l1.9-1.5.4-.5 3-6.5 1.7-4.2c.3-.6 1-1 1.6-.8l6.9 1.6a104.3 104.3 0 0 0 14.1-1.3l1.9-.6c.4-.2 1 0 1.4.3l1 .9.4.8 1 8.8c0 .3 0 .5-.2.8l-.1.2c-.4.6-.2 1.4.4 1.8l.5.3.8.2h5.5c.4 0 .8-.2 1-.5l1.4-1.7c.2-.2.3-.5.3-.7l.6-8c0-.2 0-.4.2-.6l4.2-8.4.1-.1.1-.3 1.7-3.2.3.4c.3.5 1 .5 1.2 0l.3-.4c.3-.3.4-.8.2-1.3l-1.7-5.4c-.1-.3-.3-.5-.6-.7l-1-.6-7.7-5.2c-2.8-1.9-6-3-9.4-3.3h-1c-2-.2-4 0-6 .4l-11.1 2.5c-.7.1-1.4.2-2.1 0l-8-1.1c-.8-.1-1.7 0-2.5.2l-5.4 1.7h-5.9l-.5.1-5.2 2.3a2.5 2.5 0 0 0-1.2 1.1l-.3.4c-.3-.2-.7-.3-1-.1-.7.3-.9 1.3-.5 2.2L3 380l-.1.1c-.3.5-.4 1-.5 1.5v.3l-1.5 4.7z"/>
          <g fill="none" fill-rule="evenodd">
            <path class="Mission-cloud" fill="#FFF" d="M187.7 219.6a36.7 36.7 0 1 1-73.4 0 36.7 36.7 0 0 1 73.4 0" opacity=".2"/>
            <path class="Mission-cloud" fill="#FFF" d="M206.5 106.9a8.4 8.4 0 1 1-16.9 0 8.4 8.4 0 0 1 17 0"/>
            <path class="Mission-cloud" fill="#FFF" d="M634.8 141.4a11.4 11.4 0 1 1-23 0 11.4 11.4 0 0 1 23 0"/>
            <path class="Mission-cloud" fill="#75001F" d="M247 142.8a19.3 19.3 0 1 1-38.6 0 19.3 19.3 0 0 1 38.5 0"/>
            <path class="Mission-cloud" fill="#75001F" d="M672.5 105.6a35 35 0 0 1-35.2-34.8 35 35 0 0 1 35.2-35v69.8z" opacity=".4"/>
          </g>
          <g>
            <g class="Mission-house">
                <path stroke="#FFF" stroke-width="2.2" d="M171.4 305.6V343M158.2 317.7h25.3M212.1 305.6V343M199 317.7h25.2M212.1 362.8v37.4M199 375h25.2M212.1 258.3v37.4M199 271.5h25.2"/>
                <path fill="#FFF" fill-rule="nonzero" d="M147.2 240.7V409h7.2v-34.6-.2-.5a18.3 18.3 0 0 1 36.7 0V409h45.2V240.7h-89.1zm36.8 103h-25.6V306H184v37.8zm0-47.1h-25.6v-37.9H184v37.9zm40.4 104.3h-25.7v-37.8h25.7v37.8zm0-57.2h-25.7V306h25.7v37.8zm0-47.1h-25.7v-37.9h25.7v37.9z"/>
                <path stroke="#FFF" stroke-width="2.2" d="M171.4 258.3v37.4M158.2 271.5h25.3"/>
                <path fill="#FFF" fill-rule="nonzero" d="M236.3 236.4h-89.1l10.3-24.2H226z"/>
            </g>
            <g class="Mission-house" fill="#75001F" fill-rule="nonzero">
              <path d="M339.8 260.4h-98l11.3-24.2h75.4zM241.8 263.8V409H280v-44h21.6v44h38.2V263.8h-98zm30.3 130.9h-21.6v-29.9h21.6v29.9zm0-43.8h-21.6V321h21.6v29.9zm0-42.9h-21.6v-29.8h21.6V308zm29.5 42.9H280V321h21.6v29.9zm0-42.9H280v-29.8h21.6V308zm29.6 86.7h-21.6v-29.9h21.6v29.9zm0-43.8h-21.6V321h21.6v29.9zm0-42.9h-21.6v-29.8h21.6V308z"/>
              <path d="M260.6 365h2.2v29.7h-2.2z"/>
              <path d="M250.6 376v-2.2h22.1v2.2zM320 365h2.2v29.7H320z"/>
              <path d="M310.1 376v-2.2h22v2.2zM290.3 321h2.2v29.7h-2.2z"/>
              <path d="M280.4 332v-2.2h22v2.2zM260.6 321h2.2v29.7h-2.2z"/>
              <path d="M250.6 332v-2.2h22.1v2.2zM320 321h2.2v29.7H320z"/>
              <path d="M310.1 332v-2.2h22v2.2zM290.3 278.1h2.2v29.7h-2.2z"/>
              <path d="M280.4 289.1v-2.2h22v2.2zM260.6 278.1h2.2v29.7h-2.2z"/>
              <path d="M250.6 289.1v-2.2h22.1v2.2zM320 278.1h2.2v29.7H320z"/>
              <path d="M310.1 289.1v-2.2h22v2.2z"/>
            </g>
            <g class="Mission-house">
              <path fill="#FFF" fill-rule="nonzero" d="M408 301.3h-62.7l31.2-34.1z"/>
              <path fill="#FFF" d="M372.8 251.2c1.6-.7 3.4-.7 5.6 0 3.2 1 4.7 2.7 7.6 3.6 1.9.5 3.7.5 5.5 0v10.8c-1.6.7-3.4.7-5.6 0-3.2-1-4.6-2.7-7.5-3.6-1.9-.6-3.8-.6-5.6 0v-10.8z"/>
              <path fill="#FFF" fill-rule="nonzero" d="M345.3 305.6V409h20.5v-39.3h21.7V409H408V305.6h-62.7zm28.4 52.2h-21.6v-38h21.6v38zm29.3 0h-21.7v-38H403v38z"/>
              <path stroke="#FFF" stroke-width="2.2" d="M391.5 320v37.3M381.6 332h22M362.9 320v37.3M351.9 332h22"/>
            </g>
            <g class="Mission-house">
              <path fill="#FFF" fill-rule="nonzero" d="M509.3 248.5h-96.9l11.3-24.2H498zM509.3 252.8h-96.9V409H452v-31-.1V377a21 21 0 0 1 42 0v32h15.3V252.8zM441 391.4h-21.7v-29.9H441v29.9zm0-47.4h-21.7v-29.8H441V344zm.4-48h-21.7v-29.8h21.7V296zm30.6 48h-21.7v-29.8H472V344zm.4-48h-21.7v-29.8h21.7V296zm29 48h-21.7v-29.8h21.7V344zm.5-48h-21.7v-29.8H502V296z"/>
              <path stroke="#FFF" stroke-width="2.2" d="M462 314.4v29.7M451 324.3h22M490.6 314.4v29.7M479.6 324.3h22M431.1 266v29.7M420.1 275.9h22M462 266v29.7M451 275.9h22M491.7 266v29.7M480.7 275.9h22M430 361.7v29.7M420.1 371.6h22M430 314.4v29.7M420.1 324.3h22"/>
            </g>
            <g class="Mission-house" fill="#75001F" fill-rule="nonzero">
              <path d="M569.8 362.8h2.2V398h-2.2z"/>
              <path d="M559.9 376v-2.2h22v2.2zM569.8 259.4h2.2v35.2h-2.2z"/>
              <path d="M559.9 271.5v-2.2h22v2.2z"/>
              <path d="M514.8 240.7V409h9.3V363h21.6V409h45V240.7h-76zm31 105.9h-21.6V311h21.6v35.6zm.3-52.1h-21.6v-35.7h21.6v35.7zm35.4 104.2h-21.6v-35.6h21.6v35.6zm0-52.1h-21.6V311h21.6v35.6zm.3-52.1h-21.6v-35.7h21.6v35.7z"/>
              <path d="M533.5 259.4h2.2v35.2h-2.2z"/>
              <path d="M523.6 271.5v-2.2h22v2.2zM591.8 237.3h-77l8.9-24.2h59.1zM569.8 311.1h2.2v35.2h-2.2z"/>
              <path d="M559.9 323.2V321h22v2.2zM533.5 311.1h2.2v35.2h-2.2z"/>
              <path d="M523.6 323.2V321h22v2.2z"/>
            </g>
          </g>
        </g>
      </svg>
    </div>
  `
}
