var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Background9 extends Component {
  update () {
    return false
  }

  createElement (opts = {}) {
    return html`
      <div class="Background9 ${opts.size === 'small' ? 'Background9--small' : ''}" id="backgorund-9">
        <svg class="u-isHidden">
          <symbol viewBox="0 0 186 186" id="background9-turbine-blades">
            <g fill="none" fill-rule="evenodd">
              <path d="M.5.5h185v185H.5z"/>
              <path fill="#FFF" d="M89.652 89.958l-1.158-33.02 1.214-52.876 10.328 69.652-3.97 13.88-2.076 4.852m-.063 4.98L65.91 114.94l-46.4 25.386 55.157-43.77 14.006-3.502 5.24-.63m4.345-2.434l29.174 15.506 45.186 27.49-65.484-25.88-10.036-10.38-3.165-4.223"/>
              <circle fill="#FFF" cx="93" cy="93" r="7"/>
            </g>
          </symbol>

          <symbol viewBox="0 0 18 232" id="background9-turbine-pole">
            <path d="M.948 231.688L5.903 3.244l6.192-2.48 4.95 230.924" fill="#FFF" fill-rule="evenodd"/>
          </symbol>
        </svg>

        <div>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background9-cloud"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background9-cloud"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background9-cloud"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background9-cloud"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background9-cloud"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
          <svg viewBox="0 0 50 50" width="50" height="50" class="Background9-cloud"><circle r="25" cx="25" cy="25" fill="currentColor" /></svg>
        </div>

        <svg class="Background9-satellite" viewBox="0 0 86 56" width="86" height="56">
          <g stroke-width="3" stroke="#FFF" fill="none" fill-rule="evenodd">
            <rect fill="#fff" x="1.5" y="10.5" width="25" height="10" rx="2"/>
            <rect fill="#fff" x="59.5" y="10.5" width="25" height="10" rx="2"/>
            <path d="M27.5 15.5h5m22 0h5" stroke-linecap="square" />
            <path fill="#fff" d="M29 50c2.22-5.85 7.87-10 14.5-10 6.62 0 12.27 4.15 14.5 10H29z"/>
            <path d="M43.5 54.5v-4" stroke-linecap="round"/>
            <path d="M43.5 32.5v7" stroke-linecap="square" />
            <path fill="#fff" d="M39 1.5c-2.5 0-4.5 2-4.5 4.5v22c0 2.5 2 4.5 4.5 4.5h8c2.5 0 4.5-2 4.5-4.5V6c0-2.5-2-4.5-4.5-4.5h-8z"/>
          </g>
        </svg>

        <svg class="Background9-bridge" viewBox="0 0 671 147">
          <g fill="none" fill-rule="evenodd">
            <path fill="currentColor" d="M.7 92.9h9.7V147H.7zM85.4 94.1h9.7V147h-9.7zM576.2 93.9h9.7V147h-9.7zM491.4 93.9h9.7V147h-9.7zM204.5 147h-8.3V2.4l4.2-1.8 4.1 1.8zM392 147h-8.3V2.4l4.2-1.8 4.1 1.8z"/>
            <path stroke="currentColor" stroke-width="3" d="M498 94.1C433.5 58.4 387.9 3.5 387.9 3.5s-45.7 76-93.8 76.2c-51.6.2-93.7-76.2-93.7-76.2S154.8 58.4 90.3 94.1"/>
            <path stroke="currentColor" stroke-width="3" d="M478.7 92.9h191.9-191.9v.2-.2H167.1V37.7v55.2h311.6v-9.8 9.8zm-311.6 0v.2-.2h-5.8V43.7v49.2h5.8zm-5.8 0v.2-.2h-28.9V66.7v26.2h28.9zm-28.9 0v.8-.8h-5.8V71.4v21.5h5.8zm-5.8 0v.2-.2h-17.3V82.2v10.7h17.3zm-17.3 0v1-1h-5.8v.8-.8H.7h102.8v-6.8 6.8h5.8zm288.4-78.4v78-78zm5.8 6v71.4-71.4zm5.8 5.8v66-66zm5.8 5.7v60.1V32zm5.7 4.9v55.4-55.4zm5.8 6.1v49.3V43zm5.8 4.7v44.9-44.9zm5.8 4.9v39.9-39.9zM444 58v34.6V58zm5.7 4.7v30.2-30.2zm5.8 3.4v26.8-26.8zm5.8 4.5v21.7-21.7zm5.8 4.1v17.4-17.4zm5.8 3.8v13.6-13.6zm11.5 8.3v6.1-6.1zM190.2 15.3v77-77zm-5.8 6v71.4-71.4zm-5.7 5.8V92 27.1zm-5.8 5.6v60.2-60.2zm-17.4 15.8v43.9-43.9zm-5.7 4.9v38.8-38.8zM144 57v35.3V57zm-5.8 4.9v30-30zm-17.3 13.6v17.4-17.4zm-5.8 3.8v13.6-13.6zm262.8-61.1V92 18.2zm-5.8 8.1v66-66zm-5.7 7.3v58.5-58.5zm-5.8 6.2v52.5-52.5zm-5.8 6.7v46.1-46.1zm-5.8 4.8v41-41zm-5.8 6.1V92 57.4zm-5.7 4.6v30.5V62zm-5.8 3.5v26.8-26.8zm-5.8 4.4v22.4-22.4zm-5.8 2.6V92 72.5zm-5.8 3.7v16.1-16.1zm-5.8 1.8v14.3V78zm-5.7 1.6v12.5-12.5zm-11.6 0V92 79.6zM210 18.2V92 18.2zm5.8 8.1v66-66zm5.8 8.5v57.3-57.3zm5.8 6.3v51.2-51.2zm5.7 6.3v44.9-44.9zm5.8 5.7V92 53.1zm5.8 5.1v33.7-33.7zm5.8 4.7v29.6-29.6zm5.8 4.1v25.3V67zm5.7 2.9v22.2-22.2zm5.8 4.1v18.1V74zm5.8 2.2v15.9-15.9zm5.8 1.8v14.1V78zm5.8 1.6v12.7-12.7zm11.5 0v12.5-12.5z"/>
          </g>
        </svg>

        <svg class="Background9-radiotower" viewBox="0 0 114 166">
          <g fill="none" fill-rule="evenodd">
            <path stroke="currentColor" stroke-width="2" d="M99.3 87.9h-.1V54.8l-.1-.3.1.3v-.9H86.6h12.6V42.2v11.7h13.4V42.2v11.7h.4-.4v34h-.3l.2.5-.2-.5h-13l-.1.2v.8l-.3-.8.3.8V88l-.1.3.1-.3V88h-.5l.1-.3-.1.3H86.2h12.5l-6.5 16.6 6.6 17-6.6-17-6.7 17 6.7-17-6.7-16.9 6.7 17 6.5-16.7h.5v.2l.1-.2h-.1V54.8l6.6 16.6 6.6-16.9-6.6 16.9 6.5 16.5h-13l6.5-16.5-6.6-16.6v-.9h13.4v34h-.3l-6.5-16.5-6.5 16.5zm-7-17l-6.6-17 6.7 17 6.6-17-6.6 17zm0 0l-6.6 17 6.7-17 6.7 17-6.7-17zm6.9 50.3V89l6.3 16.1-6.3 16.2V89l6.3 16.1 6.7-16.9-6.7 17 6.7 16.9-6.7-17-6.3 16.2zm0 0l-.3.8.3-.8v.8h13.4v33.5h.4-.4v9.8-9.8h-.3l.3.7-.3-.7H99.5l-.3.7.3-.7h-.3v9.8-9.8.1-.1H85.8l6.7-17-6.7-16.8 6.7 16.9-6.7 16.9h-.3.3v.1-.1h13.4l-6.7-17L99 122H86.6 99l-6.5 16.6 6.7 16.9V122H99l.1-.3-.1.3h.2v33.5h.3l6.4-16.3 6.4 16.3H99.5l6.4-16.3-6.7-16.9 6.7 16.9 6.6-16.9-6.6 16.9 6.4 16.3h.3V122H99.2v-.8zM112.6 88V122h.4-.4V87.9h.1-.1zM85.5 42.2v123.1V42.2z"/>
            <path fill="currentColor" d="M60.5 20.6v-3.9h3v3.9h8.6l9.5 18.6H.2l9.4-18.6h50.9z"/>
            <path fill="currentColor" fill-rule="nonzero" d="M.3 42.2v123.1h5.8v-39.4H37v39.4h44.6V42.2H.3zM14 114.7H6.1V98.8H14v15.9zm0-18.3H6.1V78.5H14v17.9zm0-20.2H6.1V57.7H14v18.5zm10.1 38.5h-7.8V98.8h7.8v15.9zm0-18.3h-7.8V78.5h7.8v17.9zm0-20.2h-7.8V57.7h7.8v18.5zm10.1 38.5h-7.8V98.8h7.8v15.9zm0-18.3h-7.8V78.5h7.8v17.9zm0-20.2h-7.8V57.7h7.8v18.5zm10.1 38.5h-7.8V98.8h7.8v15.9zm0-18.3h-7.8V78.5h7.8v17.9zm0-20.2h-7.8V57.7h7.8v18.5zm10 38.5h-7.8V98.8h7.8v15.9zm0-18.3h-7.8V78.5h7.8v17.9zm0-20.2h-7.8V57.7h7.8v18.5zm10.1 38.5h-7.8V98.8h7.8v15.9zm0-18.3h-7.8V78.5h7.8v17.9zm0-20.2h-7.8V57.7h7.8v18.5zm10.8 38.5h-8.4V98.8h8.4v15.9zm0-18.3h-8.4V78.5h8.4v17.9zm0-20.2h-8.4V57.7h8.4v18.5z"/>
            <path fill="currentColor" d="M54.6 9.7l-.2-.3a1.5 1.5 0 0 1 2.2-2l.2.2 8-7.2.2.1c2 4.8.9 10.5-3.2 14.2-4.1 3.7-10 4.1-14.4 1.5l7.2-6.5z"/>
          </g>
        </svg>

        <svg class="Background9-carlsberg" viewBox="0 0 81 191">
          <g fill="none" fill-rule="evenodd">
            <path d="M30.7 77.9a2 2 0 0 0-4 0v15.3h4V77.9zM26 77.9a2 2 0 0 0-4 0v15.3h4V77.9zM53 106.9h3.1v12.4H53zM51.1 130v27h7v-27-.3a3.5 3.5 0 1 0-7 0v.2zM24.8 106.9h3.1v12.4h-3.1zM44 130v-.3a3.5 3.5 0 1 0-7 .2V157h7v-27zM59 77.9a2 2 0 0 0-4 0v15.3h4V77.9zM29.9 130c0-2-1.6-3.6-3.5-3.6-2 0-3.5 1.6-3.5 3.5V157h7v-27zM54.2 77.9a2 2 0 0 0-4 0v15.3h4V77.9zM44.6 77.9a2 2 0 0 0-4 0v15.3h4V77.9zM39.9 77.9a2 2 0 0 0-4 0v15.3h4V77.9zM38.9 106.9H42v12.4h-3.1z"/>
            <path fill="currentColor" fill-rule="nonzero" d="M11.8 96.3V71.4H.2l10-9.5V48.2c0-1.7 1.2-3.6 3-3.8v-8.1h.7v8c1.6.3 3 2 3 3.7v7h9.9V44.7h5.4V25.3h2.5c-1.5-1-2.5-2.6-2.5-5.3 0-4.6 5.9-10.5 7.5-12V0h.7v8C42 9.5 48 15.4 48 20c0 2.7-1 4.4-2.5 5.3h2v19.4H53V55h10V48.2c0-1.7 1.2-3.6 3-3.8v-7.6h.8v7.6c1.6.2 3 2 3 3.6v13.8L81 71.5H69v24.9H11.8zM55 77.9v15.3h4V77.9a2 2 0 0 0-4 0zm-4.8 0v15.3h4V77.9a2 2 0 0 0-4 0zm-9.6 0v15.3h4V77.9a2 2 0 0 0-4 0zm-4.7 0v15.3h4V77.9a2 2 0 0 0-4 0zm-9.2 0v15.3h4V77.9a2 2 0 0 0-4 0zm-4.8 0v15.3h4V77.9a2 2 0 0 0-4 0zM9.6 97.5h60.6v4.1H9.6v-4.1zm-3.2 62.2h68.2v4.4H6.4v-4.4zm13.6 15c.2.2.6.5 1.4.5l1-.1-.1.4-1.3 15s.5 1 .3 1.1h-2.7l.4-1-.6-10.6.3-1 .4-3.2c0 .3.1.5.3.5.3 0 .5-1 .6-1.5zm-6.4 0c-.4.2-1 .3-2-.1l-2-.8a31 31 0 0 0-1-.8c-2.1-1.2-3.6-2.2-2.2-5.6a3.9 3.9 0 0 1 2.4-2.4c1.1-.4 2.5-.3 3.8 0 1 .3 1.9.6 2.6 1l-2.3 1.6v2.9c.3.4.8 1.6.9 2l-.2 2.2zm1 1.1l.3 3-.5 11.7s.5 1.1.3 1.1H12c-.2 0 .3-1 .3-1l-1.2-14.2-1-2 1.3.6 1.4.3.9-.2c0 .5 0 1.3.4 1.3.2 0 .3-.3.4-.6zm4.2-.7l-.5 3.8c-1.9 7.3-.6 10.4-.1 11.2l-.3.1c-2.8-2.2-2.4-8.3-2.4-8.4 0-5.7-.8-6.8-.9-6.8l-.5-.4c0-.4.2-1.6 0-2.1 0-.5-.6-1.8-.7-2v-2.7l2-1.5h3l1.8 1.5v2.6l-.5 2 .1 1.9-1 .8zm47.6-.3c.2.2.7.4 1.4.4l1-.1v.4l-1.4 15.1s.6 1 .3 1h-2.6c-.2-.1.3-1 .3-1L65 180l.2-1 .4-3.1c0 .2.2.4.3.4.4 0 .5-1 .6-1.5zm-6.4 0c-.3.1-1 .2-2-.2l-2-.8a31 31 0 0 0-1-.8c-2-1.2-3.4-2-2.4-5.1H52l-1.8.1a9 9 0 0 0-4.8 3.3l-.1.1-.3.4-.1.1c-.4.6-.8 1.3-1 2l-.2.3c-.8 2-1.2 4.2-1.2 6.4V192h-2.3v-11c0-4.3-1.1-7.8-3.2-10.3-1.8-2-4-3-6.3-3-1 0-1.9 0-2.8.5.8 2.6-.4 3.4-2.3 4.5l-1.1.7-2 .9c-1.1.4-1.8.1-2 0v-1.8l.3-2v-3l-1.6-1.5c1.5-.6 4-1.5 6-.9h29.9c1.2-.4 2.6-.3 4 0 .9.2 1.8.6 2.5.9l-2.3 1.6v3c.3.4.8 1.6.9 2l-.2 2.1zm11.8-9.6c1 .4 1.8 1.1 2.3 2.3 1.3 3.2 0 4-2.1 5.3l-1 .7-2 .9c-1.2.4-1.8.1-2 0l-.2-1.8.4-2v-3l-1.6-1.5c1.6-.7 4.2-1.6 6.2-.9zM60.9 176c.2.5.4 1.4.5 3l-.6 11.7s.5 1 .3 1h-2.6c-.3 0 .3-1 .3-1l-1.3-14.2c0-.4-.5-1-.9-1.9l1.2.5 1.5.3.8-.1c0 .5.1 1.2.4 1.3.2 0 .3-.3.4-.6zm4.3-.8l-.5 3.8c-1.9 7.4-.6 10.4-.1 11.2l-.3.1C61.6 188 62 182 62 182c0-5.8-.8-6.8-.9-6.9l-.5-.4c0-.4.2-1.6.1-2 0-.6-.7-1.9-.8-2.2V168l2-1.5H65l1.7 1.4v2.7l-.4 2v1.8l-1 .8zm3.9-16.5H11.8v-55.8h57.3v55.8zm-16-51.7v12.4h3v-12.4h-3zm1.5 19.3c-2 0-3.5 1.6-3.5 3.5V157h7V130v-.2c0-1.9-1.5-3.5-3.5-3.5zM39 107v12.4H42v-12.4h-3.1zm-2 23V157H44v-27-.3a3.5 3.5 0 1 0-7 0v.2zm-12.1-23v12.4h3v-12.4h-3zm-2 23V157h7v-27c0-2-1.5-3.6-3.4-3.6-2 0-3.6 1.6-3.6 3.5z"/>
            <path fill="currentColor" fill-rule="nonzero" d="M41.2.3h6.7v4.1h-6.7zM67.5 37.1h6.6v4h-6.6zM5.7 36.5h6.6v4.1H5.7z"/>
          </g>
        </svg>

        <div>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background9-turbine">
            <g transform="translate(0 -68)">
              <use class="Background9-blades" xlink:href="#background9-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background9-turbine-pole" />
          </svg>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background9-turbine">
            <g transform="translate(0 -68)">
              <use class="Background9-blades" xlink:href="#background9-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background9-turbine-pole" />
          </svg>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background9-turbine">
            <g transform="translate(0 -68)">
              <use class="Background9-blades" xlink:href="#background9-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background9-turbine-pole" />
          </svg>
        </div>
      </div>
    `
  }
}
