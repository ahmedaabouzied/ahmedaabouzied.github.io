(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{144:function(e,t,a){"use strict";a.r(t),a.d(t,"pageQuery",function(){return b});a(76),a(161);var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(164),s=a.n(o),c=a(159),u=a(160),d=a(181),g=a(300),p=a.n(g),m=a(152),f=a.n(m),h=a(153),v=a.n(h),E=function(e){var t=e.data,a=e.pageContext.tag,n=f.a.tags[a].name||v.a.capitalize(a),i=f.a.pages.tag,l=t.allFile.edges.find(function(e){return e.node.name===a}).node.childImageSharp.fluid;return r.a.createElement(c.a,null,r.a.createElement(u.a,{title:n,description:"All post about "+n,path:v.a.resolvePageUrl(i,a),keywords:[n]}),r.a.createElement("div",{className:p.a.heading},r.a.createElement("div",null,r.a.createElement("h1",null,n)),r.a.createElement("div",{className:p.a.cover},r.a.createElement(s.a,{fluid:l}))),r.a.createElement(d.a,{posts:t.allMarkdownRemark.edges}))};E.propTypes={data:l.a.shape({allMarkdownRemark:l.a.shape({edges:l.a.arrayOf(l.a.object).isRequired}).isRequired,allFile:l.a.shape({edges:l.a.arrayOf(l.a.shape({node:l.a.shape({name:l.a.string.isRequired,childImageSharp:l.a.shape({fluid:l.a.object.isRequired}).isRequired}).isRequired})).isRequired}).isRequired}).isRequired,pageContext:l.a.shape({tag:l.a.string.isRequired}).isRequired};var b="2344042588";t.default=E},152:function(e,t){e.exports={pathPrefix:"/trixeg",siteUrl:"https://ahmedaabouzied.github.io",siteTitle:"Trixeg",siteDescription:"Software Developer Blog",author:"Ahmed Abouzied",postsForArchivePage:3,defaultLanguage:"en",disqusScript:"https://ahmedaabouzied.github.com/embed.js",pages:{home:"/",blog:"blog",about:"about",tag:"tag",archive:"archive"},social:{github:"https://github.com/ahmedaabouzied",linkedin:"",rss:"/rss.xml"},tags:{go:{name:"Golang",description:"Go Programming Language."}}}},153:function(e,t,a){a(74),a(156),a(37),a(172),a(36);var n=a(152),r={resolveUrl:function(){for(var e=arguments.length,t=new Array(e),a=0;a<e;a++)t[a]=arguments[a];return t.reduce(function(e,t){var a=t.toString().trim();return a&&(e+=(""===e?"":"/")+a.replace(/^\/|\/$/g,"")),e},"")},resolvePageUrl:function(){return r.resolveUrl.apply(r,arguments)+"/"},getSuggestedPosts:function(e,t,a){var n=function(t){var a=0;return t.node.frontmatter.tags.forEach(function(t){a+=-1!==e.frontmatter.tags.indexOf(t)?1:0}),a};return t.edges.sort(function(e,t){return n(t)-n(e)}).slice(0,a)},getRelatedTranslations:function(e,t){return t.filter(function(t){return t.node.fileAbsolutePath.split("/").slice(-2,-1)[0]===e.fileAbsolutePath.split("/").slice(-2,-1)[0]}).map(function(e){var t=e.node,a=t.fileAbsolutePath.split(".").slice(-2,-1)[0];return{hreflang:"index"!==a.slice(-5)?a:n.defaultLanguage,path:r.resolvePageUrl(t.frontmatter.path)}})},capitalize:function(e){return e[0].toUpperCase()+e.slice(1)}};e.exports=r},154:function(e,t,a){"use strict";a.d(t,"b",function(){return u});var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(33),s=a.n(o);a.d(t,"a",function(){return s.a});a(155);var c=r.a.createContext({}),u=function(e){return r.a.createElement(c.Consumer,null,function(t){return e.data||t[e.query]&&t[e.query].data?(e.render||e.children)(e.data?e.data.data:t[e.query].data):r.a.createElement("div",null,"Loading (StaticQuery)")})};u.propTypes={data:l.a.object,query:l.a.string.isRequired,render:l.a.func,children:l.a.func}},155:function(e,t,a){var n;e.exports=(n=a(157))&&n.default||n},157:function(e,t,a){"use strict";a.r(t);a(35);var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(55),s=a(2),c=function(e){var t=e.location,a=s.default.getResourcesForPathnameSync(t.pathname);return a?r.a.createElement(o.a,Object.assign({location:t,pageResources:a},a.json)):null};c.propTypes={location:l.a.shape({pathname:l.a.string.isRequired}).isRequired},t.default=c},158:function(e){e.exports={data:{file:{childImageSharp:{fixed:{width:500,height:281,src:"/static/2e1eebde07dacc2bea3f52c07324d1e0/90fcb/facebook-logo.png",srcSet:"/static/2e1eebde07dacc2bea3f52c07324d1e0/90fcb/facebook-logo.png 1x,\n/static/2e1eebde07dacc2bea3f52c07324d1e0/8658c/facebook-logo.png 1.5x,\n/static/2e1eebde07dacc2bea3f52c07324d1e0/c2a4f/facebook-logo.png 2x"}}}}}},159:function(e,t,a){"use strict";var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(34),s=a.n(o),c=a(7),u=a.n(c),d=a(154),g=a(162),p=a(171),m=a.n(p),f=a(152),h=a.n(f),v=a(153),E=a.n(v),b=function(e){function t(){var t;return(t=e.call(this)||this).render=function(){return r.a.createElement("div",{className:m.a.container,style:t.state.fixedHeader?{backgroundImage:"none"}:null},r.a.createElement("div",{className:m.a.titleContainer},r.a.createElement("div",{className:m.a.title},r.a.createElement(d.a,{to:E.a.resolvePageUrl(h.a.pages.home)},r.a.createElement("h4",null,h.a.siteTitle),r.a.createElement("p",{className:t.state.fixedHeader?m.a.hiddenDescription:m.a.visibleDescription},h.a.siteDescription))),r.a.createElement("div",{className:m.a.menuButton},t.state.collapsedMenu?r.a.createElement(g.c,{size:"30",onClick:t.toggleMenu}):r.a.createElement(g.m,{size:"30",onClick:t.toggleMenu}))),r.a.createElement("div",{className:[m.a.list,t.state.collapsedMenu?m.a.collapsedMenu:m.a.expandedMenu].join(" ")},r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement(d.a,{to:E.a.resolvePageUrl(h.a.pages.home)},"Home")),r.a.createElement("li",null,r.a.createElement(d.a,{to:E.a.resolvePageUrl(h.a.pages.tag)},"Tags")),r.a.createElement("li",null,r.a.createElement(d.a,{to:E.a.resolvePageUrl(h.a.pages.about)},"About"))),r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement("a",{target:"_blank",rel:"nofollow noopener noreferrer",href:h.a.social.github},r.a.createElement(g.f,{size:"30"}))),r.a.createElement("li",null,r.a.createElement("a",{target:"_blank",rel:"nofollow noopener noreferrer",href:h.a.social.linkedin},r.a.createElement(g.g,{size:"30"}))),r.a.createElement("li",null,r.a.createElement(d.a,{to:E.a.resolveUrl(h.a.social.rss)},r.a.createElement(g.l,{size:"30"}))))))},t.state={lastScrollY:0,fixedHeader:!1,collapsedMenu:!0},t.toggleFixedHeader=t.toggleFixedHeader.bind(s()(t)),t.toggleMenu=t.toggleMenu.bind(s()(t)),t}u()(t,e);var a=t.prototype;return a.componentDidMount=function(){window.addEventListener("scroll",this.toggleFixedHeader)},a.componentWillUnmount=function(){window.removeEventListener("scroll",this.toggleFixedHeader)},a.toggleFixedHeader=function(){var e=this;this.toggleFixedHeader.animationInProgress||(this.toggleFixedHeader.animationInProgress=!0,setTimeout(function(){e.setState({lastScrollY:window.scrollY,fixedHeader:window.scrollY>100&&e.state.lastScrollY<window.scrollY},function(){return e.toggleFixedHeader.animationInProgress=!1})},200))},a.toggleMenu=function(){this.setState({collapsedMenu:!this.state.collapsedMenu})},t}(n.Component),y=a(173),w=a.n(y),x=function(){return r.a.createElement("div",{className:w.a.container},r.a.createElement("p",null,"Copyrights © Trixeg Blog 2019"))},q=(a(174),a(175)),R=a.n(q),P=function(e){var t=e.children,a=e.title;return r.a.createElement(r.a.Fragment,null,r.a.createElement(b,null),r.a.createElement("div",{className:R.a.container},a?r.a.createElement("div",{className:R.a.title},r.a.createElement("h1",null,a)):null,t),r.a.createElement(x,null))};P.propTypes={children:l.a.node.isRequired,title:l.a.string},P.defaultProps={title:""};var k=P;a.d(t,"a",function(){return k})},160:function(e,t,a){"use strict";a(165);var n=a(158),r=a(0),i=a.n(r),l=a(4),o=a.n(l),s=a(176),c=a.n(s),u=a(154),d=a(152),g=a.n(d),p=a(153),m=a.n(p);function f(e){var t=e.title,a=e.description,r=e.path,l=e.lang,o=e.keywords,s=e.contentType,d=e.imageUrl,p=e.translations,f=e.meta;return i.a.createElement(u.b,{query:h,render:function(e){var n=o&&o.length>0?{name:"keywords",content:o.join(", ")}:[],u=m.a.resolvePageUrl(g.a.siteUrl,g.a.pathPrefix,r),h=m.a.resolveUrl(g.a.siteUrl,d||e.file.childImageSharp.fixed.src);return i.a.createElement(c.a,{title:t,titleTemplate:"%s | "+g.a.siteTitle,meta:[{name:"description",content:a},{property:"og:title",content:t},{property:"og:type",content:s||"website"},{property:"og:url",content:u},{property:"og:description",content:a},{property:"og:image",content:h},{property:"og:image:alt",content:a},{property:"og:site_name",content:g.a.siteTitle},{property:"og:locale",content:l||"en_US"},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:title",content:t},{name:"twitter:description",content:a},{name:"twitter:image",content:h},{name:"twitter:image:alt",content:a},{name:"twitter:site",content:g.a.author},{name:"twitter:creator",content:g.a.author}].concat(n).concat(f||[]),link:[{rel:"canonical",href:u}].concat(p?p.map(function(e){return{rel:"alternate",hreflang:e.hreflang,href:m.a.resolvePageUrl(g.a.siteUrl,g.a.pathPrefix,e.path)}}):[])})},data:n})}f.propTypes={title:o.a.string.isRequired,description:o.a.string.isRequired,path:o.a.string.isRequired,lang:o.a.string,contentType:o.a.oneOf(["article","website"]),imageUrl:o.a.string,keywords:o.a.arrayOf(o.a.string),translations:o.a.arrayOf(o.a.shape({hreflang:o.a.string.isRequired,path:o.a.string.isRequired})),meta:o.a.arrayOf(o.a.shape({property:o.a.string.isRequired,content:o.a.string.isRequired}))};var h="1166109120",v=f;a.d(t,"a",function(){return v})},161:function(e,t,a){var n=a(25).f,r=Function.prototype,i=/^\s*function ([^ (]*)/;"name"in r||a(14)&&n(r,"name",{configurable:!0,get:function(){try{return(""+this).match(i)[1]}catch(e){return""}}})},169:function(e,t,a){"use strict";a(161),a(156);var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(154),s=a(191),c=a.n(s),u=a(152),d=a.n(u),g=a(153),p=a.n(g),m=function(e){var t=e.tags;return r.a.createElement("div",{className:c.a.tags},t.filter(function(e,a){return a===t.indexOf(e)}).sort().map(function(e){return r.a.createElement(o.a,{to:p.a.resolvePageUrl(d.a.pages.tag,e),key:e},d.a.tags[e].name||p.a.capitalize(e))}))};m.propTypes={tags:l.a.arrayOf(l.a.string).isRequired};var f=m;a.d(t,"a",function(){return f})},181:function(e,t,a){"use strict";var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(154),s=(a(164),a(196)),c=a.n(s),u=a(169),d=a(153),g=a.n(d),p=function(e){var t=e.posts;return r.a.createElement("div",{className:c.a.container},t.map(function(e,t){var a=e.node.frontmatter,n=a.title,i=a.date,l=a.path,s=a.tags,d=(a.cover,a.excerpt);return r.a.createElement("div",{key:n,className:c.a.post},r.a.createElement("div",{className:c.a.content},r.a.createElement(o.a,{to:g.a.resolvePageUrl(l)},i?r.a.createElement("label",null,i):null,r.a.createElement("h2",null,n),r.a.createElement("p",null,d)),r.a.createElement(u.a,{tags:s})))}))};p.propTypes={posts:l.a.arrayOf(l.a.shape({node:l.a.shape({frontmatter:l.a.shape({title:l.a.string.isRequired,date:l.a.string,path:l.a.string.isRequired,tags:l.a.arrayOf(l.a.string).isRequired,cover:l.a.shape({childImageSharp:l.a.shape({fluid:l.a.object.isRequired}).isRequired}).isRequired})})}))};var m=p;a.d(t,"a",function(){return m})}}]);
//# sourceMappingURL=component---src-templates-tag-tag-js-a02e86c9fe9aa00b29cb.js.map