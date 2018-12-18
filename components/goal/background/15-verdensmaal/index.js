var html = require('choo/html')
var Component = require('choo/component')

var BIRD_WING_FLAP = 'M13.774.01C9.294.01 2.172 2.586 1.408 3.26c-.764.675-.826 1.707-.397 2.35.43.645 2.092.414 2.57.2.478-.214 3.01-.287 6.168-.287 3.258 0 9.663 3.873 15.858 9.648.513.456 1.006.684 1.48.684.472 0 .95-.223 1.43-.67 6.225-5.79 12.62-9.662 15.882-9.662 3.174 0 5.59.025 6.18.287.59.262 1.95.595 2.593-.2.645-.793.29-1.7-.282-2.218S44.918 0 40.375 0c-6.204 0-11.313 5.462-13.29 7.025C25.162 5.522 20.03.01 13.775.01z'

module.exports = class Background15 extends Component {
  update () {
    return false
  }

  load (element) {
    var bird = element.querySelector('.js-bird')
    bird.appendChild(html`
      <animate attributeName="d" begin="0s" dur="1200ms" repeatCount="indefinite" values="${[BIRD_WING_FLAP, bird.getAttribute('d'), BIRD_WING_FLAP].join(';')}" />
    `)
  }

  createElement (opts = {}) {
    return html`
      <div class="Background15 ${opts.size === 'small' ? 'Background15--small' : ''}" id="background-15">
        <svg class="u-hiddenVisually">
          <symbol viewBox="0 0 54 14" id="background15-bird-symbol">
            <path class="js-bird" d="M13.774.01C9.294.01 2.172 4.586 1.408 5.26c-.764.675-.826 1.707-.397 2.35.43.645 2.092.414 2.57.2.478-.214 3.01-1.287 6.168-1.287 3.258 0 9.663.873 15.858 6.648.513.456 1.006.684 1.48.684.472 0 .95-.223 1.43-.67 6.225-5.79 12.62-6.662 15.882-6.662 3.174 0 5.59 1.025 6.18 1.287.59.262 1.95.595 2.593-.2.645-.793.29-1.7-.282-2.218S44.918 0 40.375 0c-6.204 0-11.313 3.462-13.29 5.025C25.162 3.522 20.03.01 13.775.01z" fill="currentColor" fill-rule="evenodd"/>
          </symbol>
        </svg>
        <div class="Background15-sky">
          <div>
            <svg class="Background15-bird" width="54" height="14"><use xlink:href="#background15-bird-symbol" /></svg>
            <svg class="Background15-bird" width="54" height="14"><use xlink:href="#background15-bird-symbol" /></svg>
            <svg class="Background15-bird" width="54" height="14"><use xlink:href="#background15-bird-symbol" /></svg>
            <svg class="Background15-bird" width="54" height="14"><use xlink:href="#background15-bird-symbol" /></svg>
          </div>
          <div>
            <svg viewBox="0 0 50 50" width="50" height="50" class="Background15-cloud Background15-cloud--sm"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
            <svg viewBox="0 0 50 50" width="50" height="50" class="Background15-cloud Background15-cloud--md"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
            <svg viewBox="0 0 50 50" width="50" height="50" class="Background15-cloud Background15-cloud--md"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
            <svg viewBox="0 0 50 50" width="50" height="50" class="Background15-cloud Background15-cloud--lg Background15-cloud--light"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
            <svg viewBox="0 0 50 50" width="50" height="50" class="Background15-cloud Background15-cloud--sm Background15-cloud--dark"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          </div>
        </div>
        <svg viewBox="0 0 630 236" class="Background15-hills">
          <g fill="none" fill-rule="evenodd">
            <path class="Background15-hill" d="M448 236c-65-50.2-92.7-100.4-161.8-100-54.4.3-105.2 53.5-160 100H448z" fill-opacity=".2" fill="#FFF"/>
            <path class="Background15-hill" d="M364.3 236c-61.2-39.8-117.8-58.5-169.7-56.2-78 3.5-96.7 23-193.8 56.2h363.5z" fill-opacity=".2" fill="#FFF"/>
            <path class="Background15-hill" d="M628 236C629.5 78.8 629.5.2 628 .3 506.6 8.6 476.2 165.3 323.4 236H628z" fill-opacity=".2" fill="#FFF"/>
            <path class="Background15-hill Background15-hill--dark" d="M628 236v-36.2C532.8 137.5 507 46.6 416.6 60c-96.8 14.3-126 130.5-249.7 176-4.5 1.6 149.2 1.6 461 0h.1z"/>
          </g>
        </svg>
        <svg class="Background15-trees Background15-inhabitant" viewBox="0 0 119 104">
          <g fill="none" fill-rule="evenodd">
            <g fill="#105702">
              <path d="M95.25 106.86V83.454c0-.402-.3-.735-.67-.735h-8.874c-.375 0-.67.333-.67.735v23.406"/>
              <path d="M118.932 55.256c0-18.79-13.619-50.242-30.075-50.242s-29.5 31.452-29.5 50.242"/>
              <path d="M59.357 53.239c0 18.036 13.637 31.148 30.081 31.148 16.456 0 29.494-13.112 29.494-31.148"/>
            </g>
            <g fill="#FFF">
              <path d="M43.607 104.312v-23.43a.705.705 0 0 0-.7-.711h-9.331a.7.7 0 0 0-.694.711v23.43"/>
              <path d="M80.206 38.067c0-9.358-7.462-16.943-16.669-16.943-.362 0-.712.038-1.068.057C61.587 9.339 51.888 0 40.006 0c-12.456 0-22.55 10.26-22.55 22.921 0 3.583.838 6.963 2.282 9.987C8.45 35.45 0 45.665 0 57.901c0 14.148 11.287 25.615 25.2 25.615 1.019 0 33.631-.204 33.631-.204 9.856 0 17.85-8.112 17.85-18.13a18.19 18.19 0 0 0-4.868-12.42 16.98 16.98 0 0 0 8.393-14.695"/>
            </g>
          </g>
        </svg>
        <svg class="Background15-bear Background15-inhabitant" viewBox="0 0 281 144">
          <g fill="currentColor" fill-rule="evenodd">
            <path d="M154 105l-8 23v3l1 8 2 2 14 7h2l2-1c2 0 3-1 3-3v-3-2l12-22-6-16-22 4z"/>
            <path d="M9 98l-8 23v2l1 8c1 2 1 3 3 3l15 7h1l4-1 2-1v-5-1l9-25-16-30L9 98z"/>
            <path d="M280 66l-5-17-1-1a14 14 0 0 0-1-6l-4-6c1-3 0-6-2-8l-4 1-1-2-4-4-19-8-2-1h-22l-19-6-10-1-29 5-7-1-41-9c-7-1-15-2-22-1h-4C71 2 59 6 49 13L21 32l-4 2-2 3-6 20c-1 1 0 3 1 5l1 1c1 2 3 2 4 0l1-2 6 12a7 7 0 0 0 1 2l16 31v2l2 29 2 3 5 6 3 2h21l2-1 2-1c2-2 3-4 2-7h-1v-3l3-32 2-4 4-3c1-1 3-2 5-1l6 2 1 1s45 6 51 4l25-6c3 0 5 1 6 3l6 16 11 23 2 2 6 6 4 1h14l4-2v-6l-1-1-2-3-6-42-1-9 5-3 24-12h4l9 3 13 2h2c3-1 6-4 6-8v-1"/>
          </g>
        </svg>
        <svg class="Background15-deer Background15-inhabitant" viewBox="0 0 330 196">
          <g fill="currentColor" fill-rule="evenodd">
            <path d="M227 191l-2 6h7v-6l5-18 7-25-14-1z"/>
            <path d="M322 28l7-10V4a3 3 0 0 0-5 0v12l-2 3-2-11a3 3 0 0 0-6 1l3 16-5 8-4 1 2-3a3 3 0 1 0-4-3l-5 6-1-9a3 3 0 1 0-5 1l1 14-2 3-4 1-4-1-4-21a3 3 0 0 0-5 1l2 13-10-5-2-20-3-2c-2 0-3 2-3 3l2 13-5-5 1-17a3 3 0 1 0-5 0l-1 11-5-5a3 3 0 1 0-4 4l20 21v1h1l18 8-4 4-16-8s-1 0 0 0l7 15h6l1 1 2 5v1l-12 20-35 2-46-2c-4 0-10 1-17 8-4 4-10 15-8 22l1 3 14 30c1 3 1 7-2 10l-5 6v1l5 30h5l2-7 4-22 19-23 25 3 16 2h6l7 29 1 18-1 6h8l-1-6 1-46 2-6 25-28 1-2 3-34 2-3 1-11 3-6 10-3 4-11-1-1-15 6-3-2 18-7 6-9z"/>
            <path d="M174 191l-1 6h7l-1-6z"/>
            <path d="M202 149l-14 16 3 26-1 6h6l-1-6z"/>
            <path d="M60 192l-1 5h6v-5l5-17 6-23-13-1z"/>
            <path d="M143 53l-14 6-5-3-5 1-5-1h-1l-4 3-15-7v1l7 13h5l1 1 2 5-11 18v1l-32 2-42-2h-1c-3 0-8 1-15 7-4 4-9 14-7 20l1 3 13 27c1 4 0 7-2 9l-5 6v1l5 27h4l2-6 4-20 17-21h1l22 3 14 1h6l7 27 1 16-2 6h8l-1-6 1-41 2-6 23-26v-1l3-31 2-4 1-9 3-6 9-3 3-10v-1"/>
            <path d="M12 192l-1 5h6v-5z"/>
            <path d="M38 153l-12 14 3 25-1 5h5l-1-5z"/>
          </g>
        </svg>
        <svg class="Background15-puffin Background15-inhabitant" viewBox="0 0 98 131">
          <g fill="none" fill-rule="evenodd">
            <path d="M81 7c16 8 17 18 16 20v1H67c7-8 16-18 14-21zM48 120l1-1 2-10h-2l-2-2v11l1 2zm8-59c1-7 1-14 5-18 2-2 7-3 15-4h10c5 7 17 35-10 56l-22 12-1 1v13l1 1 14-2h2l-1 1-4 1 1 1h7l1 1-1 1h-2l-4 1 2 2 2 1-2 1-18-3v-1l-1-1-6-1-2-2v-1l2-15-1-1-21 1c30-11 32-29 34-45z" fill="currentColor"/>
            <path d="M22 106c30-11 32-29 34-45 1-7 1-14 6-18 4-5 22-4 24-4-2-2-4-5-5-9l-1-2v-2c8-9 3-17 1-20-1-1-12-11-24-1-1 0-10 6-5 32 1 3-4 8-7 10l-4 5c-5 6-14 18-17 28-1 4-11 9-15 11l-4 3v1l5 1v1l-9 8v1l4 4 13-4h4z" fill="#105702"/>
            <path d="M75 11h-1a27 27 0 0 0-5 2l2 1 4 1a2 2 0 1 0 0-4zm-4 15c-6 0-17-10-17-11 0 0 11-11 17-11a11 11 0 1 1 0 22z" fill="currentColor" fill-rule="nonzero"/>
          </g>
        </svg>
      </div>
    `
  }
}
