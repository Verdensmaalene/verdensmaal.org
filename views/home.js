var html = require('choo/html')
var parse = require('date-fns/parse')
var asElement = require('prismic-element')
var View = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var logo = require('../components/logo')
var panel = require('../components/panel')
var intro = require('../components/intro')
var alert = require('../components/alert')
var button = require('../components/button')
var { input } = require('../components/form')
var popular = require('../components/popular')
var headline = require('../components/headline')
var GoalGrid = require('../components/goal-grid')
var datestamp = require('../components/datestamp')
var { verdenstime } = require('../components/symbol')
var intersection = require('../components/intersection')
var cardSlot = require('../components/goal-grid/slots/card')
var paddSlot = require('../components/goal-grid/slots/padded')
var centerSlot = require('../components/goal-grid/slots/center')
var { i18n, srcset, asText, resolve } = require('../components/base')
var highlight = require('../components/highlight')

var text = i18n()

// override GoalGrid background method in high contrast mode
class HighContrastGoalGrid extends GoalGrid {
  background () {
    return null
  }
}

class Home extends View {
  meta (state) {
    return state.docs.getSingle('website', function (err, doc) {
      if (err) throw err
      if (!doc) return { title: text`LOADING_TEXT_SHORT` }
      return {
        title: asText(doc.data.name),
        description: asText(doc.data.description),
        'og:image': doc.data.default_social_image.url
      }
    })
  }

  update (state, emit) {
    return !state.ui.transitions.includes('goal-page')
  }

  createElement (state, emit) {
    if (!state.popular.data && !state.popular.error && typeof window !=='undefined') {
      emit('fetch:popular')
    }

    var opts = {
      fetchLinks: [
        'goal.title',
        'goal.label',
        'goal.number',
        'goal.description',
        'event.city',
        'page.title',
        'page.image',
        'page.description'
      ]
    }
    return state.docs.getSingle('homepage', opts, function render (err, doc) {
      if (err) throw err

      var goals
      if (doc) {
        goals = doc.data.goals.map(function ({ link }) {
          return {
            number: link.data.number,
            label: asText(link.data.label),
            description: asText(link.data.description),
            href: `/${link.data.number}-${link.uid}`,
            onclick: null
          }
        })
      } else {
        goals = []
        for (let i = 0; i < 17; i++) {
          goals.push({
            blank: true,
            number: i + 1,
            href: `/${i + 1}`,
            onclick (event) {
              // do a hard page load if we don't have the complete url
              window.location = event.currentTarget.href
              event.preventDefault()
            }
          })
        }
      }

      var isHighContrast = state.ui.isHighContrast
      var Grid = isHighContrast ? HighContrastGoalGrid : GoalGrid
      var id = 'homepage-goalgrid' + (isHighContrast ? '-high-contrast' : '')
      var alertLink = doc && doc.data.alert_link

      var featured = []
      if (doc) {
        const headlineLink = doc.data.headline_link
        const news = doc.data.featured_news_listing.filter(function (item) {
          return item.link.type === 'news' && !item.link.isBroken
        })
        const events = doc.data.featured_events_listing.filter(function (item) {
          return item.link.type === 'event' && !item.link.isBroken
        })
        let featuredLink = doc.data.featured_link
        if (featuredLink.isBroken || !(featuredLink.id || featuredLink.url)) {
          featuredLink = null
        }

        const alertHeading = doc && asText(doc.data.alert_heading)
        if (alertHeading) {
          featured.push(grid.cell(html`
            <aside role="banner">
              ${alert({
                heading: asText(doc.data.alert_heading),
                body: asElement(doc.data.alert_message, resolve),
                link: (alertLink.id || alertLink.url) && !alertLink.isBroken ? {
                  href: resolve(doc.data.alert_link),
                  text: doc.data.alert_link_text
                } : null
              })}
            </aside>
          `))
        }

        // append featured headline news, filling up the space if there are no
        // valid list items to be shown
        if (!headlineLink.isBroken && (headlineLink.url || headlineLink.id)) {
          let subheading
          if (doc.data.headline_subheading) {
            subheading = doc.data.headline_subheading
          } else if (headlineLink.id) {
            const { uid, type } = headlineLink
            subheading = state.docs.getByUID(type, uid, function (err, doc) {
              if (err || !doc) return null
              var date = parse(doc.first_publication_date)
              return html`
                <time datetime="${date.toJSON()}">
                  ${text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`}
                </time>
              `
            })
          }

          let heading = asText(doc.data.headline_heading)
          if (!heading && headlineLink.id) {
            heading = asText(doc.data.headline_link.data.title)
          }

          let image = doc.data.headline_image
          if (!image.url && headlineLink.id) {
            image = doc.data.headline_link.data.image
          }

          featured.push(grid.cell({
            size: { lg: news.length ? '2of3' : '1of1' }
          }, headline({
            highlight: doc.data.headline_highlighted,
            image: {
              src: srcset(image.url, [900]).split(' ')[0],
              alt: image.alt || heading,
              sizes: news.length ? '(min-width: 1000px) 66vw, 100vw' : '100vw',
              srcset: srcset(image.url, [400, 600, 900, [1200, 'q_50'], [1800, 'q_50']], {
                transforms: 'f_jpg,c_thumb',
                aspect: news.length ? 0.6 : 0.3
              })
            },
            heading: heading,
            subheading: subheading,
            link: {
              href: resolve(doc.data.headline_link),
              text: text`Read article`
            }
          })))
        }

        // append featured news listing adapting the grid cell widths to wether
        // there's a featured headline news item
        if (news.length) {
          featured.push(grid.cell({
            size: {
              lg: featured.length ? '1of3' : '1of1',
              md: events.length || featuredLink ? '1of2' : '1of1'
            }
          }, panel(grid({
            gutter: 'sm',
            size: {
              lg: featured.length ? '1of1' : `1of${news.length}`,
              md: events.length || featuredLink ? '1of1' : `1of${news.length}`
            }
          }, news.map(function (item) {
            var title = asText(item.heading)
            if (!title) title = asText(item.link.data.title)
            var image = item.image
            if (!image.url) image = item.link.data.image
            var opts = {
              transforms: 'f_jpg,c_thumb',
              aspect: 3 / 4
            }

            return panel.item({
              title: title,
              media: image.url ? html`
                <img class="u-block u-sizeFull" sizes="(min-width: 1000px) 200px, (min-width: 800px) 150px, 96px" srcset="${srcset(image.url, [96, 192, 288, [384, 'q_50']], opts)}" alt="${image.alt || title}" src="${srcset(image.url, [134], opts).split(' ')[0]}">
              ` : null,
              link: {
                text: text`Read article`,
                href: resolve(item.link)
              }
            })
          })), {
            heading: asText(doc.data.featured_news_listing_heading),
            utils: 'u-bgGrayLight',
            footer: button({
              text: text`See all news`,
              href: '/nyheder',
              class: 'u-spaceT3',
              primary: true
            })
          })))
        }

        // append featured events accounting for wether there's an adjacent
        // featured link or not
        if (events.length) {
          featured.push(grid.cell({
            size: {
              lg: featuredLink ? '1of3' : '1of2',
              md: news.length || featuredLink ? '1of2' : '1of1'
            }
          }, panel(grid({
            gutter: 'sm',
            size: {
              lg: '1of1',
              md: news.length || featuredLink ? '1of1' : '1of2'
            }
          }, events.map(function (item) {
            var title = asText(item.heading)
            if (!title) title = asText(item.link.data.title)

            return panel.item({
              title,
              media: html`
                <div class="u-bgWhite u-colorTheme">
                  ${datestamp(parse(item.link.data.start), item.link.data.city)}
                </div>
              `,
              link: {
                text: text`Go to event`,
                href: resolve(item.link)
              }
            })
          })), {
            heading: asText(doc.data.featured_events_listing_heading),
            utils: 'u-bgTheme u-colorWhite'
          })))
        }

        // append featured link and adapt its size depending on wether there
        // are any featured events
        if (featuredLink) {
          let heading = asText(doc.data.featured_link_heading)
          if (!heading && featuredLink.id && featuredLink.data) {
            heading = asText(featuredLink.data.title)
          }

          let image = doc.data.featured_link_image
          if (!image.url && featuredLink.id && featuredLink.data) {
            image = featuredLink.data.image
          }

          if (heading && image && image.url) {
            let body = asText(doc.data.featured_link_description)
            if (!body && featuredLink.id && featuredLink.data) {
              body = asText(featuredLink.data.description)
            }


            let title = heading
            let linkText = doc.data.featured_link_text || text`Read more`
            if (doc.data.featured_link_theme) {
              const theme = doc.data.featured_link_theme.toLowerCase()
              if (theme === 'verdenstimen') {
                title = html`<span class="u-color11 u-colorCurrent">${heading}</span>`
                linkText = html`${verdenstime()} <span class="u-spaceL1">${linkText}</span>`
              }
            }

            const opts = {
              transforms: 'f_jpg,c_thumb',
              aspect: news.length ? 0.6 : 0.3
            }

            featured.push(grid.cell({
              size: {
                lg: events.length ? '1of3' : '1of2',
                md: news.length || events.length ? '1of2' : '1of1'
              }
            }, card({
              body: body,
              title: title,
              bold: true,
              background: true,
              image: {
                src: srcset(image.url, [900], opts).split(' ')[0],
                alt: image.alt || heading,
                sizes: news.length ? '(min-width: 1000px) 33vw, 100vw' : '100vw',
                srcset: srcset(image.url, [400, 600, 900, [1200, 'q_50'], [1800, 'q_50']], opts)
              },
              link: {
                text: linkText,
                href: resolve(featuredLink),
                external: featuredLink.target === '_blank'
              }
            })))
          }
        }

        // append popular news listing only if accompanied by events or link
        if (events.length || featuredLink) {
          if (state.popular.error || !state.popular.data) {
            featured.push(grid.cell({ size: { lg: '1of3' } }, panel(html`<div class="u-aspect1-1"></div>`, { utils: 'u-loading' })))
          } else {
            const count = Math.max(events.length + 2, 4)
            const items = state.popular.data.slice(0, count).map(function (doc) {
              var date = parse(doc.first_publication_date)
              var image = doc.data.image.url ? {
                alt: doc.data.image.alt || '',
                sizes: '90px',
                srcset: srcset(doc.data.image, [90, 180], {
                  transforms: 'f_jpg,c_thumb'
                }),
                src: `/media/fetch/w_90/${doc.data.image.url}`
              } : null
              return {
                image: image,
                href: resolve(doc),
                title: asText(doc.data.title),
                date: {
                  datetime: date,
                  text: `${date.getDate()}. ${text(`MONTH_${date.getMonth()}`).substr(0, 3)} ${date.getFullYear()}`
                }
              }
            })

            let cols = 1
            if (featuredLink) cols +=1
            if (events.length) cols += 1
            featured.push(grid.cell({
              size: {
                lg: `1of${cols}`,
                md: cols > 1 ? '1of2' : '1of1'
              }
            }, panel(popular(items, {
              slim: true
            }), {
              utils: 'u-bgGrayDark u-colorWhite',
              heading: text`Most read`
            })))
          }
        }

        if (featured.length) {
          const heading = asText(doc.data.newsletter_heading)
          let terms = doc.data.newsletter_terms_and_conditions.length ? html`
            <div class="Text u-textRight">
              <small class="Text-muted Text-small">
                ${asElement(doc.data.newsletter_terms_and_conditions, resolve)}
              </small>
            </div>
          ` : null
          const submit = button({
            class: 'u-sizeFill js-submit',
            primary: true,
            text: text`Sign up`,
            type: 'submit'
          })


          featured.push(grid.cell(panel(html`
            <form method="post" action="/api/subscribe" onsubmit=${onsubmit}>
              <div class="Text u-spaceB2">
                ${heading ? html`
                  <h2 class="u-textInherit">
                    <span class="u-textBold">${heading}</span>
                  </h2>
                ` : null}
                ${asElement(doc.data.newsletter_description, resolve)}
              </div>
              <input type="hidden" name="page" value="${state.origin}">
              <input type="hidden" name="country" value="${state.country}">
              ${grid({ gutter: 'xs' }, [
                grid.cell({ size: { lg: '2of3' } }, grid({ size: { md: '1of2' }, gutter: 'xs' }, [
                  input({ type: 'text', name: 'name', label: text`Your name`, placeholder: text`Your name`, required: true, plain: true }),
                  input({ type: 'email', name: 'email', label: text`Your email`, placeholder: text`Your email`, required: true, plain: true })
                ])),
                grid.cell({ align: 'right', size: { lg: '1of3', md: '2of3' } }, terms ? grid({
                  gutter: 'xs'
                }, [
                  grid.cell({ size: { md: '1of2', lg: '2of3' } }, terms),
                  grid.cell({ size: { md: '1of2', lg: '1of3' } }, submit)
                ]) : submit)
              ])}
            </form>
          `, { utils: 'u-bgGrayLight' })))
        }
      } else {
        featured.push(
          grid.cell({ size: { lg: '2of3' } }, headline.loading()),
          grid.cell({ size: { lg: '1of3', md: '1of2' } }, panel(html`<div class="u-aspect1-1"></div>`, { utils: 'u-loading' })),
          grid.cell({ size: { lg: '1of3', md: '1of2' } }, panel(html`<div class="u-aspect1-1"></div>`, { utils: 'u-loading' })),
          grid.cell({ size: { lg: '1of3', md: '1of2' } }, panel(html`<div class="u-aspect1-1"></div>`, { utils: 'u-loading' })),
          grid.cell({ size: { lg: '1of3', md: '1of2' } }, panel(html`<div class="u-aspect1-1"></div>`, { utils: 'u-loading' }))
        )
      }

      return html`
        <main class="View-main">
          <div class="u-container">
            ${featured.length ? html`
              <div class="View-spaceSmall">
                ${grid({ gutter: 'xs' }, featured)}
              </div>
            ` : null}
            <div class="View-spaceLarge">
              ${doc ? intro({ title: asText(doc.data.title), body: asElement(doc.data.description) }) : intro.loading()}
            </div>
            <section>
              ${state.cache(Grid, id).render(goals, state.ui.gridLayout, slot)}
            </section>
          </div>
          ${doc ? html`
            <div class="u-container">
              <div class="View-spaceLarge">
                ${doc.data.interlink_heading.length ? intersection({ title: asText(doc.data.interlink_heading), body: asElement(doc.data.interlink_text, resolve) }) : intersection.loading()}
              </div>
            </div>
          ` : null}
        </main>
      `

      function onsubmit (event) {
        if (!event.target.checkValidity()) {
          event.target.reportValidity()
        } else {
          var form = event.currentTarget
          var data = new window.FormData(form)
          var button = form.querySelector('.js-submit')
          button.disabled = true
          emit('subscribe', data)
        }
        event.preventDefault()
      }

      // render slot by type
      // str -> Element
      function slot (type) {
        switch (type) {
          case 'square': return centerSlot(logo({ vertical: true }), type)
          case 'large': {
            if (!doc || !doc.data.grid_slots.length) return null
            const slice = doc.data.grid_slots[0]
            const props = {
              image: slice.primary.image.url ? slice.primary.image : null,
              title: asText(slice.primary.title),
              body: asText(slice.primary.body),
              link: {
                href: resolve(slice.primary.link)
              }
            }
            return cardSlot(props, type)
          }
          case 'small': {
            if (!doc || !doc.data.interlink_heading.length) return null
            return paddSlot(intersection({
              restrained: true,
              body: asElement(doc.data.interlink_text.map(function (block) {
                return Object.assign({}, block, {
                  text: block.text.replace(/\n/g, ' ')
                })
              }), resolve)
            }), 'fill')
          }
          default: return null
        }
      }
    })
  }
}

module.exports = View.createClass(Home, 'homepage')
