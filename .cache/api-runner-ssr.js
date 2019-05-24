var plugins = [{
      plugin: require('/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/node_modules/gatsby-plugin-react-helmet/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      plugin: require('/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/node_modules/gatsby-plugin-manifest/gatsby-ssr'),
      options: {"plugins":[],"name":"Luigi Colella Blog","short_name":"Luigi Colella","start_url":"/","background_color":"#0C2744","theme_color":"#0C2744","display":"standalone","icon":"src/images/icon.png","legacy":true},
    },{
      plugin: require('/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/node_modules/gatsby-plugin-feed/gatsby-ssr'),
      options: {"plugins":[],"feeds":[{"query":"\n          {\n            allMarkdownRemark(\n              limit: 10,\n              sort: { order: DESC, fields: [frontmatter___date] }\n            ) {\n              edges {\n                node {\n                  html\n                  frontmatter {\n                    title\n                    date\n                    path\n                    excerpt\n                  }\n                }\n              }\n            }\n          }\n        ","output":"/rss.xml","title":"Luigi Colella RSS Feed"}]},
    },{
      plugin: require('/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/node_modules/gatsby-plugin-sitemap/gatsby-ssr'),
      options: {"plugins":[]},
    }]
// During bootstrap, we write requires at top of this file which looks like:
// var plugins = [
//   {
//     plugin: require("/path/to/plugin1/gatsby-ssr.js"),
//     options: { ... },
//   },
//   {
//     plugin: require("/path/to/plugin2/gatsby-ssr.js"),
//     options: { ... },
//   },
// ]

const apis = require(`./api-ssr-docs`)

// Run the specified API in any plugins that have implemented it
module.exports = (api, args, defaultReturn, argTransform) => {
  if (!apis[api]) {
    console.log(`This API doesn't exist`, api)
  }

  // Run each plugin in series.
  // eslint-disable-next-line no-undef
  let results = plugins.map(plugin => {
    if (!plugin.plugin[api]) {
      return undefined
    }
    const result = plugin.plugin[api](args, plugin.options)
    if (result && argTransform) {
      args = argTransform({ args, result })
    }
    return result
  })

  // Filter out undefined results.
  results = results.filter(result => typeof result !== `undefined`)

  if (results.length > 0) {
    return results
  } else {
    return [defaultReturn]
  }
}
