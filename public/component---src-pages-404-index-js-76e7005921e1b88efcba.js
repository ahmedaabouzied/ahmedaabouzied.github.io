(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{146:function(e,t,a){"use strict";a.r(t),a.d(t,"query",function(){return E});var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(164),c=a.n(o),s=a(301),u=a.n(s),d=a(159),g=a(160),m=a(190),p=a(152),f=a.n(p),h=a(153),v=a.n(h),b=function(e){var t=e.data;return r.a.createElement(d.a,null,r.a.createElement(g.a,{title:"404: Page not found",description:"404 Page",path:"404",keywords:["javascript","frontend","blog"]}),r.a.createElement("div",{className:u.a.container},r.a.createElement("div",{className:u.a.image},r.a.createElement(c.a,{fluid:t.file.childImageSharp.fluid})),r.a.createElement("div",{className:u.a.message},r.a.createElement("h1",null,"Page not found"),r.a.createElement(m.a,{to:v.a.resolvePageUrl(f.a.pages.home)},"Return to homepage"))))};b.propTypes={data:l.a.shape({file:l.a.shape({childImageSharp:l.a.shape({fluid:l.a.object.isRequired}).isRequired}).isRequired}).isRequired};var E="2811592818";t.default=b},152:function(e,t){e.exports={pathPrefix:"/trixeg",siteUrl:"https://ahmedaabouzied.github.io",siteTitle:"Trixeg",siteDescription:"Software Developer Blog",author:"Ahmed Abouzied",postsForArchivePage:3,defaultLanguage:"en",disqusScript:"https://ahmedaabouzied.github.com/embed.js",pages:{home:"/",blog:"blog",about:"about",tag:"tag",archive:"archive"},social:{github:"https://github.com/ahmedaabouzied",linkedin:"",rss:"/rss.xml"},tags:{go:{name:"Golang",description:"Go Programming Language."}}}},153:function(e,t,a){a(74),a(156),a(37),a(172),a(36);var n=a(152),r={resolveUrl:function(){for(var e=arguments.length,t=new Array(e),a=0;a<e;a++)t[a]=arguments[a];return t.reduce(function(e,t){var a=t.toString().trim();return a&&(e+=(""===e?"":"/")+a.replace(/^\/|\/$/g,"")),e},"")},resolvePageUrl:function(){return r.resolveUrl.apply(r,arguments)+"/"},getSuggestedPosts:function(e,t,a){var n=function(t){var a=0;return t.node.frontmatter.tags.forEach(function(t){a+=-1!==e.frontmatter.tags.indexOf(t)?1:0}),a};return t.edges.sort(function(e,t){return n(t)-n(e)}).slice(0,a)},getRelatedTranslations:function(e,t){return t.filter(function(t){return t.node.fileAbsolutePath.split("/").slice(-2,-1)[0]===e.fileAbsolutePath.split("/").slice(-2,-1)[0]}).map(function(e){var t=e.node,a=t.fileAbsolutePath.split(".").slice(-2,-1)[0];return{hreflang:"index"!==a.slice(-5)?a:n.defaultLanguage,path:r.resolvePageUrl(t.frontmatter.path)}})},capitalize:function(e){return e[0].toUpperCase()+e.slice(1)}};e.exports=r},154:function(e,t,a){"use strict";a.d(t,"b",function(){return u});var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(33),c=a.n(o);a.d(t,"a",function(){return c.a});a(155);var s=r.a.createContext({}),u=function(e){return r.a.createElement(s.Consumer,null,function(t){return e.data||t[e.query]&&t[e.query].data?(e.render||e.children)(e.data?e.data.data:t[e.query].data):r.a.createElement("div",null,"Loading (StaticQuery)")})};u.propTypes={data:l.a.object,query:l.a.string.isRequired,render:l.a.func,children:l.a.func}},155:function(e,t,a){var n;e.exports=(n=a(157))&&n.default||n},157:function(e,t,a){"use strict";a.r(t);a(35);var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(55),c=a(2),s=function(e){var t=e.location,a=c.default.getResourcesForPathnameSync(t.pathname);return a?r.a.createElement(o.a,Object.assign({location:t,pageResources:a},a.json)):null};s.propTypes={location:l.a.shape({pathname:l.a.string.isRequired}).isRequired},t.default=s},158:function(e){e.exports={data:{file:{childImageSharp:{fixed:{width:500,height:281,src:"/static/2e1eebde07dacc2bea3f52c07324d1e0/90fcb/facebook-logo.png",srcSet:"/static/2e1eebde07dacc2bea3f52c07324d1e0/90fcb/facebook-logo.png 1x,\n/static/2e1eebde07dacc2bea3f52c07324d1e0/8658c/facebook-logo.png 1.5x,\n/static/2e1eebde07dacc2bea3f52c07324d1e0/c2a4f/facebook-logo.png 2x"}}}}}},159:function(e,t,a){"use strict";var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(34),c=a.n(o),s=a(7),u=a.n(s),d=a(154),g=a(162),m=a(171),p=a.n(m),f=a(152),h=a.n(f),v=a(153),b=a.n(v),E=function(e){function t(){var t;return(t=e.call(this)||this).render=function(){return r.a.createElement("div",{className:p.a.container,style:t.state.fixedHeader?{backgroundImage:"none"}:null},r.a.createElement("div",{className:p.a.titleContainer},r.a.createElement("div",{className:p.a.title},r.a.createElement(d.a,{to:b.a.resolvePageUrl(h.a.pages.home)},r.a.createElement("h4",null,h.a.siteTitle),r.a.createElement("p",{className:t.state.fixedHeader?p.a.hiddenDescription:p.a.visibleDescription},h.a.siteDescription))),r.a.createElement("div",{className:p.a.menuButton},t.state.collapsedMenu?r.a.createElement(g.c,{size:"30",onClick:t.toggleMenu}):r.a.createElement(g.m,{size:"30",onClick:t.toggleMenu}))),r.a.createElement("div",{className:[p.a.list,t.state.collapsedMenu?p.a.collapsedMenu:p.a.expandedMenu].join(" ")},r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement(d.a,{to:b.a.resolvePageUrl(h.a.pages.home)},"Home")),r.a.createElement("li",null,r.a.createElement(d.a,{to:b.a.resolvePageUrl(h.a.pages.tag)},"Tags")),r.a.createElement("li",null,r.a.createElement(d.a,{to:b.a.resolvePageUrl(h.a.pages.about)},"About"))),r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement("a",{target:"_blank",rel:"nofollow noopener noreferrer",href:h.a.social.github},r.a.createElement(g.f,{size:"30"}))),r.a.createElement("li",null,r.a.createElement("a",{target:"_blank",rel:"nofollow noopener noreferrer",href:h.a.social.linkedin},r.a.createElement(g.g,{size:"30"}))),r.a.createElement("li",null,r.a.createElement(d.a,{to:b.a.resolveUrl(h.a.social.rss)},r.a.createElement(g.l,{size:"30"}))))))},t.state={lastScrollY:0,fixedHeader:!1,collapsedMenu:!0},t.toggleFixedHeader=t.toggleFixedHeader.bind(c()(t)),t.toggleMenu=t.toggleMenu.bind(c()(t)),t}u()(t,e);var a=t.prototype;return a.componentDidMount=function(){window.addEventListener("scroll",this.toggleFixedHeader)},a.componentWillUnmount=function(){window.removeEventListener("scroll",this.toggleFixedHeader)},a.toggleFixedHeader=function(){var e=this;this.toggleFixedHeader.animationInProgress||(this.toggleFixedHeader.animationInProgress=!0,setTimeout(function(){e.setState({lastScrollY:window.scrollY,fixedHeader:window.scrollY>100&&e.state.lastScrollY<window.scrollY},function(){return e.toggleFixedHeader.animationInProgress=!1})},200))},a.toggleMenu=function(){this.setState({collapsedMenu:!this.state.collapsedMenu})},t}(n.Component),y=a(173),w=a.n(y),x=function(){return r.a.createElement("div",{className:w.a.container},r.a.createElement("p",null,"Copyrights © Trixeg Blog 2019"))},P=(a(174),a(175)),q=a.n(P),U=function(e){var t=e.children,a=e.title;return r.a.createElement(r.a.Fragment,null,r.a.createElement(E,null),r.a.createElement("div",{className:q.a.container},a?r.a.createElement("div",{className:q.a.title},r.a.createElement("h1",null,a)):null,t),r.a.createElement(x,null))};U.propTypes={children:l.a.node.isRequired,title:l.a.string},U.defaultProps={title:""};var R=U;a.d(t,"a",function(){return R})},160:function(e,t,a){"use strict";a(165);var n=a(158),r=a(0),i=a.n(r),l=a(4),o=a.n(l),c=a(176),s=a.n(c),u=a(154),d=a(152),g=a.n(d),m=a(153),p=a.n(m);function f(e){var t=e.title,a=e.description,r=e.path,l=e.lang,o=e.keywords,c=e.contentType,d=e.imageUrl,m=e.translations,f=e.meta;return i.a.createElement(u.b,{query:h,render:function(e){var n=o&&o.length>0?{name:"keywords",content:o.join(", ")}:[],u=p.a.resolvePageUrl(g.a.siteUrl,g.a.pathPrefix,r),h=p.a.resolveUrl(g.a.siteUrl,d||e.file.childImageSharp.fixed.src);return i.a.createElement(s.a,{title:t,titleTemplate:"%s | "+g.a.siteTitle,meta:[{name:"description",content:a},{property:"og:title",content:t},{property:"og:type",content:c||"website"},{property:"og:url",content:u},{property:"og:description",content:a},{property:"og:image",content:h},{property:"og:image:alt",content:a},{property:"og:site_name",content:g.a.siteTitle},{property:"og:locale",content:l||"en_US"},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:title",content:t},{name:"twitter:description",content:a},{name:"twitter:image",content:h},{name:"twitter:image:alt",content:a},{name:"twitter:site",content:g.a.author},{name:"twitter:creator",content:g.a.author}].concat(n).concat(f||[]),link:[{rel:"canonical",href:u}].concat(m?m.map(function(e){return{rel:"alternate",hreflang:e.hreflang,href:p.a.resolvePageUrl(g.a.siteUrl,g.a.pathPrefix,e.path)}}):[])})},data:n})}f.propTypes={title:o.a.string.isRequired,description:o.a.string.isRequired,path:o.a.string.isRequired,lang:o.a.string,contentType:o.a.oneOf(["article","website"]),imageUrl:o.a.string,keywords:o.a.arrayOf(o.a.string),translations:o.a.arrayOf(o.a.shape({hreflang:o.a.string.isRequired,path:o.a.string.isRequired})),meta:o.a.arrayOf(o.a.shape({property:o.a.string.isRequired,content:o.a.string.isRequired}))};var h="1166109120",v=f;a.d(t,"a",function(){return v})},190:function(e,t,a){"use strict";var n=a(0),r=a.n(n),i=a(4),l=a.n(i),o=a(154),c=a(210),s=a.n(c),u=function(e){var t=e.children,a=e.to,n=e.buttonStyle;return r.a.createElement(o.a,{to:a,className:s.a.button+" "+n},t)};u.propTypes={children:l.a.node.isRequired,to:l.a.string.isRequired,buttonStyle:l.a.string},u.defaultProps={buttonStyle:""};var d=u;a.d(t,"a",function(){return d})}}]);
//# sourceMappingURL=component---src-pages-404-index-js-76e7005921e1b88efcba.js.map