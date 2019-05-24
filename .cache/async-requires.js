// prefer default export if available
const preferDefault = m => m && m.default || m

exports.components = {
  "component---src-templates-post-post-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/templates/post/post.js" /* webpackChunkName: "component---src-templates-post-post-js" */),
  "component---src-templates-tag-tag-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/templates/tag/tag.js" /* webpackChunkName: "component---src-templates-tag-tag-js" */),
  "component---src-templates-archive-archive-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/templates/archive/archive.js" /* webpackChunkName: "component---src-templates-archive-archive-js" */),
  "component---cache-dev-404-page-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/.cache/dev-404-page.js" /* webpackChunkName: "component---cache-dev-404-page-js" */),
  "component---src-pages-404-index-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/404/index.js" /* webpackChunkName: "component---src-pages-404-index-js" */),
  "component---src-pages-about-index-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/about/index.js" /* webpackChunkName: "component---src-pages-about-index-js" */),
  "component---src-pages-index-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/index.js" /* webpackChunkName: "component---src-pages-index-js" */),
  "component---src-pages-tag-index-js": () => import("/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/src/pages/tag/index.js" /* webpackChunkName: "component---src-pages-tag-index-js" */)
}

exports.data = () => import(/* webpackChunkName: "pages-manifest" */ "/media/ahmedaabouzied/D/code/work/ahmedaabouzied.github.io/.cache/data.json")

