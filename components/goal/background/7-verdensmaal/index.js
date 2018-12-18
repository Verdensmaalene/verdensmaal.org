var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Background7 extends Component {
  update () {
    return false
  }

  createElement (opts = {}) {
    return html`
      <div class="Background7 ${opts.size === 'small' ? 'Background7--small' : ''}" id="background-7">
        <div class="Background7-dimmer"></div>
        <svg class="u-isHidden">
          <symbol viewBox="0 0 186 186" id="background7-turbine-blades">
            <g fill="none" fill-rule="evenodd">
              <path d="M.5.5h185v185H.5z"/>
              <path fill="#FFF" d="M89.652 89.958l-1.158-33.02 1.214-52.876 10.328 69.652-3.97 13.88-2.076 4.852m-.063 4.98L65.91 114.94l-46.4 25.386 55.157-43.77 14.006-3.502 5.24-.63m4.345-2.434l29.174 15.506 45.186 27.49-65.484-25.88-10.036-10.38-3.165-4.223"/>
              <circle fill="#FFF" cx="93" cy="93" r="7"/>
            </g>
          </symbol>
          <symbol viewBox="0 0 18 232"  id="background7-turbine-pole">
            <path d="M.948 231.688L5.903 3.244l6.192-2.48 4.95 230.924" fill="#FFF" fill-rule="evenodd"/>
          </symbol>
        </svg>
        <svg class="Background7-building" viewBox="0 0 226 160">
          <g fill="none" fill-rule="evenodd">
            <g fill="#FFF">
              <path fill-rule="nonzero" d="M146.9 57H78.6L86.4 40H139l7.9 16.8zm-68.3 2.3V160h26.6v-30.5h15V160H147V59.3H78.6zm21 90.8h-15v-20.8h15v20.8zm0-30.4h-15V99h15v20.7zm0-29.8h-15V69.3h15v20.6zm20.6 29.8h-15V99h15v20.7zm0-29.8h-15V69.3h15v20.6zm20.7 60.2h-15v-20.8h15v20.8zm0-30.4h-15V99h15v20.7zm0-29.8h-15V69.3h15v20.6z"/>
              <path d="M134.6 75.3h6.9v1.5h-7v14h-1.4v-14h-8v-1.5h8v-6.1h1.5v6.1zm-41.4 0h6.9v1.5h-7v14h-1.4v-14h-8v-1.5h8v-6.1h1.5v6.1zm20.7 0h6.9v1.5h-7v14h-1.4v-14h-8v-1.5h8v-6.1h1.5v6.1zm20.7 29.8h6.9v1.5h-7v14h-1.4v-14h-8V105h8V99h1.5v6zm-41.4 0h6.9v1.5h-7v14h-1.4v-14h-8V105h8V99h1.5v6zm20.7 0h6.9v1.5h-7v14h-1.4v-14h-8V105h8V99h1.5v6zm20.7 30.5h6.9v1.5h-7v13h-1.4v-13h-8v-1.5h8v-7.1h1.5v7zm-41.4 0h6.9v1.5h-7v13h-1.4v-13h-8v-1.5h8v-7.1h1.5v7z"/>
            </g>
            <g fill="#FFF">
              <g fill-rule="nonzero">
                <path d="M206.3 153c0 3.6 2.8 6.5 6.4 6.5 3.5 0 6.4-3 6.4-6.5 0-3.7-2.9-6.6-6.4-6.6-3.5 0-6.4 3-6.4 6.6zm3 0c0-2 1.5-3.5 3.4-3.5 1.8 0 3.3 1.6 3.3 3.5s-1.5 3.4-3.3 3.4c-2 0-3.4-1.5-3.4-3.4zM174 153a6.4 6.4 0 1 0 12.8 0c0-3.7-2.8-6.6-6.3-6.6-3.6 0-6.4 3-6.4 6.6zm3 0c0-2 1.6-3.5 3.4-3.5 1.9 0 3.4 1.6 3.4 3.5s-1.6 3.4-3.4 3.4c-1.8 0-3.4-1.5-3.4-3.4z"/>
                <path d="M167.8 145.6v6.2c0 2.2 1.4 2.7 2.2 2.7H173c.1 0 .3 0 .3-.2v-1-.3c0-4.1 3.2-7.5 7.3-7.5 4 0 7.3 3.3 7.3 7.5v1.3c0 .2.1.3.2.3h17l.3-.3V153c0-4 3.3-7.4 7.4-7.4 4 0 7.3 3.3 7.3 7.4v1.3l.2.3h4.3c.7 0 .7-1.1.7-1.1v-4a7 7 0 0 0-.2-1.8 6.6 6.6 0 0 0-1.6-2.5c-3.5-2.7-12.9-3.8-13.7-4-.7-.2-.7-.1-1-.3-.2-.2-3.3-4.2-6-5.5a24.3 24.3 0 0 0-11.2-2.2c-5.5 0-8.5 1.5-10.9 2.9-2.4 1.3-7 5.2-7.6 5.6l-.8.6s-1.3.7-2.4 1c-2 .3-2 2.3-2 2.3zm25.8-3.5v-6.3c8.1.3 11.5 5 12.1 5.8 0 0 .5.5 0 .5h-12.1zm-14-.6c.4-.5 4.1-5.2 12-5.7v6.3h-12s-.5 0 0-.6z"/>
              </g>
              <path fill-rule="nonzero" d="M167.9 149v3.5h-1.7c-2.5 0-4-1.8-4-4.5v-9c0-1-.2-1.2-1.1-1.2h-6.5v-3.5h6.5c2.9 0 4.6 1.8 4.6 4.8v8.9c0 .9 0 1 .5 1h1.7z"/>
              <path d="M142.8 137.4H145.6V135H143s-.6-.1-.7-.6c0-.5.5-.7.5-.7h2.7l.1-.1v-1.4s0-.2.2-.2h3c.4 0 1.2 0 2.3 1 1 .5 1.4 1.2 1.5 2 0 .1 0 .2.3.2h2.4v1.8h-2.4c-.2 0-.3 0-.3.2-.1.8-.6 1.5-1.4 2.1a4 4 0 0 1-2.4 1h-3s-.3 0-.3-.2v-1.3s0-.2-.2-.2h-2.5s-.5 0-.6-.5c0-.5.3-.6.6-.7z"/>
            </g>
            <path fill="#FFF" d="M65.4 40.9v118.6h-33v-25.9c-.2-7.3-6.1-13.1-13.5-13.1s-13.3 5.8-13.5 13.1v25.8H.1V41l8.6-3v-.1L44 0 48 4 34 19v9.8l-13.7 4.9L34 19v9.8l31.4-11.3V41zm-38.3 70.7V84H8.3v27.7h18.8zM27 77V49.3H8.3V77h18.8zm29.5 76.6V126H38v27.7h18.7zm0-42V84H38v27.7h18.7zm0-34.6V49.3H38V77h18.7z"/>
            <path stroke="#FFF" stroke-width="2" d="M17.8 92.7H8h9.8V84v8.7zm0 0h9.3-9.3V112 92.7zm29.4 0V83v9.7h-9.3 9.3zm0 0V112 92.7H57h-9.8zm0 42V125v9.7h-9.3 9.3zm0 0V154v-19.3H57h-9.8zm0-76.1h-9.3 9.3v-9.3 9.3zm0 0H57h-9.8V77 58.6zm-29.4 0H8h9.8v-9.3 9.3zm0 0V77 58.6h9.3-9.3z"/>
          </g>
        </svg>
        <svg class="Background7-energySun" viewBox="0 0 73 72" width="73" height="72">
          <g fill="none" fill-rule="evenodd">
            <path d="M36.5 15.54c-11.32 0-20.5 9.17-20.5 20.5 0 11.32 9.18 20.5 20.5 20.5S57 47.36 57 36.04c0-11.33-9.18-20.5-20.5-20.5" fill="#FFF"/>
            <g stroke="#FFF" stroke-width="3" stroke-linecap="round">
              <path class="Background7-lightRay" d="M36.5 10.5v-9"/>
              <path class="Background7-lightRay" d="M23.76 13.93l-4.5-7.82"/>
              <path class="Background7-lightRay" d="M14.44 23.25l-7.82-4.5"/>
              <path class="Background7-lightRay" d="M11.03 36H2"/>
              <path class="Background7-lightRay" d="M14.44 48.72l-7.82 4.52"/>
              <path class="Background7-lightRay" d="M23.76 58.05l-4.5 7.8"/>
              <path class="Background7-lightRay" d="M36.5 61.46v9.03"/>
              <path class="Background7-lightRay" d="M49.62 57.82l4.65 7.74"/>
              <path class="Background7-lightRay" d="M58.78 48.34l7.9 4.37"/>
              <path class="Background7-lightRay" d="M61.97 36H71"/>
              <path class="Background7-lightRay" d="M58.56 23.25l7.82-4.5"/>
              <path class="Background7-lightRay" d="M49.24 13.93l4.5-7.82"/>
            </g>
          </g>
        </svg>
        <div class="Background7-turbines">
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background7-turbine">
            <g transform="translate(0 -68)">
              <use class="Background7-blades" xlink:href="#background7-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background7-turbine-pole" />
          </svg>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background7-turbine">
            <g transform="translate(0 -68)">
              <use class="Background7-blades" xlink:href="#background7-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background7-turbine-pole" />
          </svg>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background7-turbine">
            <g transform="translate(0 -68)">
              <use class="Background7-blades" xlink:href="#background7-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background7-turbine-pole" />
          </svg>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background7-turbine">
            <g transform="translate(0 -68)">
              <use class="Background7-blades" xlink:href="#background7-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background7-turbine-pole" />
          </svg>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background7-turbine">
            <g transform="translate(0 -68)">
              <use class="Background7-blades" xlink:href="#background7-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background7-turbine-pole" />
          </svg>
          <svg viewBox="0 0 186 325" width="186" height="325" class="Background7-turbine">
            <g transform="translate(0 -68)">
              <use class="Background7-blades" xlink:href="#background7-turbine-blades" />
            </g>
            <use y="95" height="232" xlink:href="#background7-turbine-pole" />
          </svg>
        </div>
        <div>
          ${lightBulb(1)}
          ${lightBulb(2)}
          ${lightBulb(3)}
        </div>
      </div>
    `
  }
}

function lightBulb (index) {
  return html`
    <svg class="Background7-lightbulb" viewBox="0 0 70 452" width="70" height="452">
      <defs>
        <path id="bulb-${index}" d="M0 21.2V.05h31.03v42.3H0z"/>
      </defs>
      <g fill="none" fill-rule="evenodd">
        <g transform="rotate(-180 25.75 216.285)">
          <mask id="bulb-mask-${index}" fill="#fff">
            <use xlink:href="#bulb-${index}"/>
          </mask>
          <path fill="#FFF" d="M15.58.05h-.1C6.9.05 0 7.05 0 15.73c0 2.6.62 5.04 1.73 7.2 1.1 2.9 3.24 5.07 4.44 10.18.6 2.6 1.68 7.1 1.68 7.1.48 2.2 2.4 2.2 2.4 2.2H20.8s1.9 0 2.4-2.2l1.67-7.04c1.2-5.1 3.35-7.28 4.44-10.16v-.03c1.1-2.15 1.78-4.6 1.78-7.2 0-8.7-6.97-15.7-15.47-15.7" mask="url(#bulb-mask-${index})"/>
        </g>
        <path fill="#FFF" d="M30.84 385.5h10.3c.8 0 1.43.65 1.43 1.45 0 .8-.64 1.46-1.43 1.46h-10.3c-.8 0-1.44-.6-1.44-1.4 0-.8.64-1.45 1.44-1.45"/>
        <path fill="#FFF" d="M30.84 381h10.3c.8 0 1.43.67 1.43 1.47 0 .8-.64 1.46-1.43 1.46h-10.3c-.8 0-1.44-.65-1.44-1.46 0-.8.64-1.46 1.44-1.46"/>
        <path fill="#FFF" d="M30.84 376.53h10.3c.8 0 1.43.65 1.43 1.46 0 .8-.64 1.4-1.43 1.4h-10.3c-.8 0-1.44-.66-1.44-1.46 0-.82.64-1.47 1.44-1.47"/>
        <path fill="#FFF" d="M39.8 374.72c-.6-1.56-2.07-2.67-3.8-2.67-1.76 0-3.24 1.1-3.82 2.67h7.6z"/>
        <g stroke="#FFF" stroke-width="3.3" stroke-linecap="round" class="Background7-bulbRays">
          <path class="Background7-lightRay" d="M57 404l7.5-4.3"/>
          <path class="Background7-lightRay" d="M60.3 416.13l8.63.03"/>
          <path class="Background7-lightRay" d="M56.82 428.07l7.48 4.34"/>
          <path class="Background7-lightRay" d="M47.83 437.4L52 445"/>
          <path class="Background7-lightRay" d="M35.32 440.92l-.03 8.64"/>
          <path class="Background7-lightRay" d="M23.35 437.73l-4.2 7.55"/>
          <path class="Background7-lightRay" d="M14 428.4l-7.5 4.3"/>
          <path class="Background7-lightRay" d="M10.78 416.02L2.14 416"/>
          <path class="Background7-lightRay" d="M14.18 403.68l-7.47-4.34"/>
        </g>
        <path stroke="#FFF" stroke-width="2" d="M36 0v369.16" stroke-linecap="square"/>
      </g>
    </svg>
  `
}
