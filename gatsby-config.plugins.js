const feedPlugin = require("./gatsby-config.plugins.feed");

module.exports = [
  "gatsby-plugin-react-helmet",
  "gatsby-transformer-sharp",
  "gatsby-plugin-sharp",
  "gatsby-plugin-less",
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `images`,
      path: `${__dirname}/src/images`
    }
  },
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: "Luigi Colella Blog",
      short_name: "Luigi Colella",
      start_url: "/",
      background_color: "#0C2744",
      theme_color: "#0C2744",
      display: "standalone",
      icon: "src/images/icon.png", // This path is relative to the root of the site.
      legacy: true // this will add apple-touch-icon links to <head>. Required for versions prior to iOS 11.3.
    }
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `markdown-pages`,
      path: `${__dirname}/content`
    }
  },
  {
    resolve: "gatsby-transformer-remark",
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-images`,
          options: {
            maxWidth: 1000,
            quality: 80,
            showCaptions: true,
            linkImagesToOriginal: false
          }
        },
        "gatsby-remark-prismjs"
      ]
    }
  },
  feedPlugin,
  `gatsby-plugin-sitemap`,
  `gatsby-plugin-robots-txt`,
  {
    resolve: `gatsby-plugin-google-analytics`,
    options: {
      // The property ID; the tracking code won't be generated without it
      trackingId: "UA-162432082-1",
      // Defines where to place the tracking script - `true` in the head and `false` in the body
      head: false,
      // Setting this parameter is optional
      anonymize: true,
      // Setting this parameter is also optional
      respectDNT: true,
      // Avoids sending pageview hits from custom paths
      exclude: ["/preview/**", "/do-not-track/me/too/"],
      // Delays sending pageview hits on route update (in milliseconds)
      pageTransitionDelay: 0,
      // Enables Google Optimize using your container Id
      optimizeId: "GTM-W84XNL2",
      // Enables Google Optimize Experiment ID
      experimentId: "lsZSqACSTA-jAlZRuAjkEQ",
      // Set Variation ID. 0 for original 1,2,3....
      // Any additional optional fields
      sampleRate: 5,
      siteSpeedSampleRate: 10,
      cookieDomain: "blog.ahmedaabouzied.com"
    }
  },
  {
    resolve: "gatsby-plugin-google-tagmanager",
    options: {
      id: "GTM-5GTC9PH",

      // Include GTM in development.
      // Defaults to false meaning GTM will only be loaded in production.
      includeInDevelopment: false,

      // datalayer to be set before GTM is loaded
      // should be an object or a function that is executed in the browser
      // Defaults to null
      defaultDataLayer: { platform: "gatsby" }
    }
  }
];
