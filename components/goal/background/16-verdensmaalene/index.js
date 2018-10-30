var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Background extends Component {
  update () {
    return false
  }

  createElement (opts = {}) {
    return html`
      <div class="Background16 ${opts.size === 'small' ? 'Background16--small' : ''}" id="background-16">
        <svg class="u-hiddenVisually">
          <symbol viewBox="0 0 20 50" id="background16-man">
            <path d="M5.88 5C5.88 2.68 7.73.8 10 .8c2.28 0 4.12 1.88 4.12 4.2 0 2.32-1.84 4.2-4.12 4.2-2.27 0-4.12-1.88-4.12-4.2m9.02 5.43c2.86.25 5.1 2.66 5.1 5.6V27.7c0 .9-.73 1.6-1.63 1.6-.9 0-1.63-.72-1.63-1.62V17.66c0-.38-.1-.9-.8-.9-.47 0-.57.5-.6.84v30.05c0 1.3-1.03 2.35-2.32 2.35-1.3 0-2.35-1.05-2.35-2.35v-17.3c0-.2-.07-.7-.67-.7-.6 0-.67.5-.68.7v17.3C9.32 48.95 8.28 50 7 50c-1.3 0-2.36-1.05-2.36-2.35V17.6c0-.32-.12-.82-.6-.82-.68 0-.78.5-.78.9v10c0 .9-.73 1.64-1.63 1.64-.9 0-1.63-.73-1.63-1.63V16c0-2.94 2.24-5.35 5.1-5.6l.3-.03h9.2c.1 0 .2 0 .3.02" fill="currentColor" fill-rule="evenodd"/>
          </symbol>
          <symbol viewBox="0 0 46 94" id="background16-woman">
            <path d="M30.5 8c0 4.3-3.5 7.8-8 7.8-4.2 0-7.7-3.5-7.7-8 0-4.3 3.5-7.8 7.8-7.8 4.4 0 8 3.5 8 8zM6.8 25.7s2.3-6.2 7.5-6.2H31c5.2 0 7.5 6.2 7.5 6.2L45 47s1.3 4-2 5c-3.4 1-4.4-2.8-4.4-2.8l-5.3-18s-.2-1.2-1.3-1c-1 .4-.6 1.8-.6 1.8l9.2 33.4H32v24c0 2.2-1.8 4-4 4-2.4 0-4.2-1.8-4.2-4v-24h-2.3v24c0 2.2-2 4-4 4-2.4 0-4.2-1.8-4.2-4v-24H4.7L14 32s.3-1.4-.7-1.7c-1-.3-1.4 1-1.4 1l-5.3 18S5.7 53 2.4 52C-1 51 .2 47 .2 47L6.8 26z" fill="currentColor" fill-rule="evenodd"/>
          </symbol>
          <svg viewBox="0 0 30 55" id="background16-child">
            <path d="M22.6 24s-.4.8-.4 1.6v2.2L25.7 42h-3.5v9.3c0 1.8-1.4 3.5-3.2 3.5-1.8 0-3.3-1-3.3-3v-9.7h-2v10c0 2-1.4 2.8-3.2 2.8-1.8 0-3.2-1-3.2-3V42H3.8l2.7-14v-2.4V24L.2 12 0 11c0-1.3 1-2.4 2.4-2.4.8 0 1.6.6 2 1.3.2.2 3.3 6 4.3 7s2 1.6 2 1.6h8s1-.6 2-1.6 4-7.2 4.3-7.3c.4-.7 1.2-1 2-1 1.4 0 2.4 1 2.4 2.3l-.7 2-6 11zm-8-11c-3.5 0-6.5-2.8-6.5-6.4C8 3 11 0 14.8 0c3.6 0 6.6 3 6.6 6.6 0 3.6-3 6.5-6.6 6.5z" fill="currentColor" fill-rule="evenodd"/>
          </svg>
          <svg viewBox="0 0 46 93" id="background16-elderly">
            <path d="M22.5 4.2c-2.3 1.2-4 4-4 7 0 4.2 3.2 7.6 7 7.6 4 0 7-3.4 7-7.7 0-2.8-1.4-5.3-3.5-6.6.2-.4.3-1 .3-1.3 0-1.6-1.5-3-3.5-3s-3.5 1.4-3.5 3c0 .5 0 .8.2 1.2zM9 51.8c1.8-.3 2.4-3 2.4-3L16 31.7s.4-1.4 1.3-1c1 .2.5 1.6.5 1.6l-8 32.6h7.5V88c0 2.4 1.6 4.2 3.6 4.2s3.6-1.8 3.6-4V64.7h2V88c0 2.4 1.6 4.2 3.7 4.2 2 0 3.6-1.8 3.6-4V64.7h7.5l-8.2-32.6s-.3-1.4.6-1.7c.8-.3 1 1 1 1L39.8 49s1 3.7 4 2.7c2.8-1 1.8-4.8 1.8-4.8l-5.8-21s-2-6-6.7-6H18.2c-4.6 0-6.7 6-6.7 6L5.7 47s-1 3 1.2 4.4l-.2.3L0 91c0 .6.3 1.2 1 1.3.6 0 1-.3 1-1l7-39.2V52z" fill="currentColor" fill-rule="evenodd"/>
          </svg>
          <symbol viewBox="0 0 27 43" id="background16-judge">
            <g fill="none" fill-rule="evenodd">
              <path fill="#FFF" d="M.46 20h26.32v-2.97H.46M2.38 43h22.48v-2.98H2.38m1.55-1.12H23.3V21.13H3.94"/>
              <path d="M14.8 30.46c0-.2-.06-.37-.15-.52-.1-.14-.2-.27-.38-.38-.15-.1-.36-.22-.63-.33l-.7-.3c-.13.12-.25.3-.34.5-.1.23-.14.44-.14.63 0 .2.04.4.14.53s.23.2.4.3c.17.1.37.2.6.3l.7.3c.18-.2.3-.4.38-.6.07-.2.1-.4.1-.6m1.48-.4c0 .4-.13.7-.4 1-.28.3-.64.5-1.1.6.4.1.7.3.9.6.2.3.3.6.3.9 0 .5-.25 1-.73 1.3-.5.3-1.15.5-2 .5-.4 0-.73-.1-1-.1-.26-.1-.47-.2-.64-.3l-.4-.4c-.1-.2-.1-.3-.1-.4 0-.2 0-.4.2-.5.1-.2.3-.2.5-.2.1 0 .3 0 .4.1l.3.3.2.42.1.5h.2c.3 0 .6-.05.9-.2s.3-.36.3-.7c0-.16-.1-.3-.1-.44-.1-.13-.2-.25-.4-.35l-.6-.3-.7-.3c-.6-.24-1-.5-1.3-.8-.3-.3-.5-.68-.5-1.1 0-.4.1-.7.3-1s.6-.55 1.1-.75c-.4-.2-.77-.4-.9-.7-.2-.3-.3-.6-.3-1 0-.5.2-.9.7-1.22s1.15-.5 1.95-.5c.4 0 .7 0 1 .1.3.04.5.14.63.3.16.1.3.2.34.34s.1.3.1.4c0 .2-.03.4-.15.55-.1.16-.3.2-.57.2-.18 0-.3 0-.44-.1-.1-.07-.2-.2-.3-.34-.1-.1-.13-.3-.2-.5l-.1-.42c0-.05-.04-.05-.06-.05-.36 0-.66.1-.9.28-.23.16-.34.38-.34.68 0 .2.1.35.17.47s.2.24.4.34l.6.3.8.3c.6.26 1 .5 1.3.8.3.3.4.7.4 1.17" fill="#00689D"/>
              <path d="M17.02 13.45c.37-.1.47.4.47.4l1.4 5.06h2.5l-2.2-7.1s-.8-2.2-2.7-2.2h-6c-1.9 0-2.8 2.3-2.8 2.3l-2.2 7h2.6l1.5-5s.1-.5.4-.4c.3.1.2.7.2.7L9.1 19h8.94l-1.3-4.8s-.15-.6.22-.7m-7.8-6.8c-.34.26-.56.66-.56 1.13 0 .8.7 1.45 1.5 1.45s1.5-.65 1.5-1.45c0-.48-.24-.9-.6-1.16.07-.04.12-.1.17-.15.47.96 1.43 1.62 2.56 1.62s2.1-.66 2.56-1.62l.1.15c-.4.27-.6.68-.6 1.16 0 .8.6 1.45 1.4 1.45.8 0 1.4-.65 1.4-1.45 0-.47-.2-.87-.6-1.14.3-.3.6-.7.6-1.2 0-.6-.4-1.2-.9-1.4.2-.3.4-.6.4-1 0-.8-.7-1.5-1.5-1.5 0-.7-.6-1.3-1.4-1.3-.2 0-.5 0-.6.1-.3-.3-.7-.4-1.1-.4-.4 0-.7.1-1 .3-.2-.1-.3-.1-.5-.1-.8 0-1.5.6-1.5 1.4-.8 0-1.5.65-1.5 1.45 0 .4.1.8.3 1-.6.2-1 .8-1 1.4 0 .5.2.9.5 1.2" fill="#FFF"/>
            </g>
          </symbol>
        </svg>

        <div class="Background16-sky">
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--medium Background16-cloud--light"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--small"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--small Background16-cloud--dark"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--medium"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--large"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--small Background16-cloud--light"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--small Background16-cloud--dark"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--large Background16-cloud--light"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background16-cloud Background16-cloud--medium"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>

          <svg width="147" height="111" viewBox="0 0 147 111" class="Background16-dove">
            <g fill="currentColor" fill-rule="evenodd">
              <path class="Background16-pedal" d="M17 52s-3 5-8 6c-4 1-9-2-9-2s3-6 8-6c4-1 9 2 9 2"/>
              <path class="Background16-pedal" d="M37 86s-5 2-9 0c-4-3-5-8-5-8s5-2 9 0c4 3 5 8 5 8"/>
              <path class="Background16-pedal" d="M18 110s-6 2-10-1c-4-2-5-8-5-8s6-1 10 1 5 8 5 8"/>
              <path d="M14 9c-3-3-3-8-3-8s5-1 8 2 3 8 3 8-5 1-8-2"/>
              <path d="M27 32c-4 1-7-2-7-2s2-4 6-5c3 0 7 3 7 3l-6 4"/>
              <path d="M25 20s-3 3-7 3c-3 0-6-4-6-4s3-3 7-3l6 4"/>
              <path d="M29 16s-3-4-2-8c0-4 5-7 5-7s3 4 2 8-5 7-5 7"/>
              <path d="M38 24s-4-4-3-8 5-6 5-6 3 4 3 7c-1 4-5 7-5 7"/>
              <path d="M23 13l1-1 6 7c4 4 8 8 9 14l4-4c6-7 13-2 24 7s24 9 36-5c16-18 31-18 41-17-7 3-9 9-12 26s-12 25-24 27c7 2 7 6 17 12 7 5 18 3 22 2-8 2-17 11-25 14l-14 4H95l-10-2c-23-5-29-24-29-37 0-14-4-19-11-21l-5-1c0 3 0 7-2 12h-1l2-12h-6l5-4c-1-6-5-10-9-14-2-2-5-4-6-7"/>
            </g>
          </svg>
        </div>

        <div class="Background16-container">
          <div>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-woman" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-man" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-woman" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="93"><use xlink:href="#background16-elderly" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="30" height="55"><use xlink:href="#background16-child" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-woman" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="30" height="55"><use xlink:href="#background16-child" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-elderly" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-man" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-woman" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="30" height="55"><use xlink:href="#background16-child" /></svg>
            <svg class="Background16-person Background16-person--citizen" width="46" height="94"><use xlink:href="#background16-woman" /></svg>
          </div>

          <svg width="43" height="74" viewBox="0 0 43 74" class="Background16-person Background16-person--judge">
            <g fill="currentColor" fill-rule="evenodd">
              <path d="M21.4 13.1c3.5 0 6.3-2.9 6.3-6.3 0-3.5-2.8-6.4-6.3-6.4a6.4 6.4 0 0 0-6.3 6.4 6.2 6.2 0 0 0 6.3 6.3"/>
              <path d="M28.9 15.6h-15A8.6 8.6 0 0 0 6.2 23h30.4c-.8-4-3.8-6.9-7.7-7.3"/>
              <path d="M33 36.4H10.3v-4h22.3v4h.2zm4.6-10.6H.2v3.9h3.1v44H40v-44h2.9v-3.9h-5.2z" fill-rule="nonzero"/>
            </g>
          </svg>

          <svg width="242" height="125" viewBox="0 0 242 125" class="Background16-institution">
            <g fill="#FFF" fill-rule="evenodd">
              <path d="M198.8 48.5c-1.3-1.6-2.7-3-4.3-4.3h4.3v4.3zm-39.6-4.3h4.8a23.6 23.6 0 0 0-4.8 5v-5z" fill-rule="nonzero"/>
              <path d="M204.1 38.9h-50.3V107h6.7V61.4c.4-9.5 8.7-17 18.7-17 10.1 0 18.4 7.5 18.8 17v45.7h6.1V38.9z"/>
              <path d="M199.3 66.6h-40.4V63h40.4z"/>
              <path d="M177.2 63.2h3.5v44.1h-3.5z"/>
              <path d="M208.7 107.3h12V38.9h-12z"/>
              <path d="M221.1 115.9H20.8v-5.5h200.3z"/>
              <path d="M.4 124.6h241v-5.5H.4z"/>
              <path d="M118.4 65.3h-17.8v-15h17.8v15zm0 28h-17.8V70.6h17.8v22.7zm-33.1-28H67.5v-15h17.8v15zm0 28H67.5V70.6h17.8v22.7zM52 65.3H34.3v-15h17.8v15zm0 28H34.3V70.6h17.8v22.7zM20.8 107h111.1v-68H20.8v68z" fill-rule="nonzero"/>
              <path d="M179.2.3l-51.5 25h102.5z"/>
              <path d="M226.3 8.6h-21l21 10.7z"/>
              <path d="M132.2 8.6h21.2l-21.2 10.7z"/>
              <path d="M226.2 28.9H132v6.5H226.2z"/>
              <path d="M137.2 107.3h12V38.9h-12z"/>
            </g>
          </svg>
        </div>
      </div>
    `
  }
}
