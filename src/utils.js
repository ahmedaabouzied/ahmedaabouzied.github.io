const Config = require("../config");

const Utils = {
  /**
   * Join provided url paths.
   * @param {...string} paths Provided paths. It doesn't matter if they have trailing slash.
   * @return {string} Resolved url without trailing slash.
   */
  resolveUrl: (...paths) => {
    return paths.reduce((resolvedUrl, path) => {
      let urlPath = path.toString().trim();
      if (urlPath)
        resolvedUrl +=
          (resolvedUrl === "" ? "" : "/") + urlPath.replace(/^\/|\/$/g, "");
      return resolvedUrl;
    }, "");
  },
  /**
   * Resolve a page url adding a trailing slash.
   * Needed to prevent 301 redirects cause of Gatsby.js' folder structure.
   * @param {...string} path Provided paths. It doesn't matter if they have trailing slash.
   * @return {string} Resolved url with trailing slash.
   */
  resolvePageUrl: (...path) => {
    let resolvedUrl = Utils.resolveUrl(...path);
    return resolvedUrl + "/";
  },
  /**
   * Pass a post and retrieve a list of related translations.
   * @param {Object} post The post of which retrieve its translations. It accepts a `node` object from Graphql's query `allMarkdownRemark`
   * @param {Object} postList The list of posts where search translations. It accepts a `edges` array from Graphql's query `allMarkdownRemark`
   * @return {Object} An array of objects with languages as keys (ISO 639-1) and translated post's paths as values.
   */
  getRelatedTranslations: (post, postList) => {
    return postList
      .filter(({ node }) => {
        // Get posts in the same folder of provided post
        return (
          node.fileAbsolutePath.split("/").slice(-2, -1)[0] ===
          post.fileAbsolutePath.split("/").slice(-2, -1)[0]
        );
      })
      .map(({ node }) => {
        let lang = node.fileAbsolutePath.split(".").slice(-2, -1)[0];
        return {
          hreflang: lang.slice(-5) !== "index" ? lang : Config.defaultLanguage,
          path: Utils.resolvePageUrl(node.frontmatter.path)
        };
      });
  },
  /**
   * Capitalize passed string
   * @param {string} str string to capitalize
   * @return {string} string with first letter to uppercase
   */
  capitalize: str => str[0].toUpperCase() + str.slice(1)
};

module.exports = Utils;
