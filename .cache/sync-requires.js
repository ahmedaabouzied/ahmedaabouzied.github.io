const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---src-templates-post-post-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/templates/post/post.js"))),
  "component---src-templates-tag-tag-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/templates/tag/tag.js"))),
  "component---src-templates-archive-archive-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/templates/archive/archive.js"))),
  "component---cache-dev-404-page-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/.cache/dev-404-page.js"))),
  "component---src-pages-404-index-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/404/index.js"))),
  "component---src-pages-about-index-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/about/index.js"))),
  "component---src-pages-index-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/index.js"))),
  "component---src-pages-tag-index-js": hot(preferDefault(require("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/tag/index.js")))
}

