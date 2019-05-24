(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{147:function(e,t,a){"use strict";a.r(t),a.d(t,"query",function(){return m});a(165),a(161),a(156);var n=a(0),r=a.n(n),i=a(4),o=a.n(i),l=a(164),s=a.n(l),c=a(159),u=a(160),d=(a(153),a(302)),p=function(e){var t=e.data,a=t.profilePhoto;t.skillIcons,t.toolIcons;return r.a.createElement(c.a,null,r.a.createElement(u.a,{title:"About",description:"A brief summary of this blog and my work",path:"about"}),r.a.createElement("div",{className:d.container},r.a.createElement("div",{className:d.photo},r.a.createElement(s.a,{fluid:a.childImageSharp.fluid})),r.a.createElement("div",{className:d.content},r.a.createElement("h1",null,"Ahmed Abouzied"),r.a.createElement("h2",null,"Software Developer"),r.a.createElement("p",null,"I am a full stack developer . with very good experience in developing both Front-end , Back-end applications and Mobile applications for android."),r.a.createElement("p",null,"I studied many courses and worked through many books in back-end development , database systems , front-end frameworks and algorithms and data structures."),r.a.createElement("p",null,"I have very experience with the following programming languages : C / C++ , Go , Javascript / NodeJs , Dart , Python , Java , PHP"),r.a.createElement("p",null,"I am very familiar with these front-end frameworks : Angular , React , VueJs"),r.a.createElement("p",null,"And these back-end frameworks and utilities : Node , express , Flutter(for building mobile applications) , the android platform , Gin / Mux (Golang web server frameworks) , Laravel , websockets."),r.a.createElement("p",null,"I use docker , containers , Kubernetes to deploy the web applications to the production server."),r.a.createElement("p",null,"I also know how to operate these databases and integrate them into web / mobile applications : MySQL , SQLlite , PostgreSQL , Mongodb"),r.a.createElement("p",null,"I am also familiar with DNS , FTP , Apache web server , Nginx web server."),r.a.createElement("p",null,"I have worked on many front end , back end , android and full stack projects using every technology mentioned earlier."),r.a.createElement("br",null))))};p.propTypes={data:o.a.shape({profilePhoto:o.a.shape({childImageSharp:o.a.shape({fluid:o.a.object.isRequired}).isRequired}).isRequired,skillIcons:o.a.object.isRequired,toolIcons:o.a.object.isRequired})};o.a.arrayOf(o.a.shape({node:o.a.shape({name:o.a.string.isRequired,childImageSharp:o.a.shape({fixed:o.a.object.isRequired}).isRequired}).isRequired})).isRequired;var m="3043038539";t.default=p},152:function(e,t){e.exports={pathPrefix:"/trixeg",siteUrl:"https://ahmedaabouzied.github.io",siteTitle:"Trixeg",siteDescription:"Software Developer Blog",author:"Ahmed Abouzied",postsForArchivePage:3,defaultLanguage:"en",disqusScript:"https://ahmedaabouzied.github.com/embed.js",pages:{home:"/",blog:"blog",about:"about",tag:"tag",archive:"archive"},social:{github:"https://github.com/ahmedaabouzied",linkedin:"",rss:"/rss.xml"},tags:{go:{name:"Golang",description:"Go Programming Language."}}}},153:function(e,t,a){a(74),a(156),a(37),a(172),a(36);var n=a(152),r={resolveUrl:function(){for(var e=arguments.length,t=new Array(e),a=0;a<e;a++)t[a]=arguments[a];return t.reduce(function(e,t){var a=t.toString().trim();return a&&(e+=(""===e?"":"/")+a.replace(/^\/|\/$/g,"")),e},"")},resolvePageUrl:function(){return r.resolveUrl.apply(r,arguments)+"/"},getSuggestedPosts:function(e,t,a){var n=function(t){var a=0;return t.node.frontmatter.tags.forEach(function(t){a+=-1!==e.frontmatter.tags.indexOf(t)?1:0}),a};return t.edges.sort(function(e,t){return n(t)-n(e)}).slice(0,a)},getRelatedTranslations:function(e,t){return t.filter(function(t){return t.node.fileAbsolutePath.split("/").slice(-2,-1)[0]===e.fileAbsolutePath.split("/").slice(-2,-1)[0]}).map(function(e){var t=e.node,a=t.fileAbsolutePath.split(".").slice(-2,-1)[0];return{hreflang:"index"!==a.slice(-5)?a:n.defaultLanguage,path:r.resolvePageUrl(t.frontmatter.path)}})},capitalize:function(e){return e[0].toUpperCase()+e.slice(1)}};e.exports=r},154:function(e,t,a){"use strict";a.d(t,"b",function(){return u});var n=a(0),r=a.n(n),i=a(4),o=a.n(i),l=a(33),s=a.n(l);a.d(t,"a",function(){return s.a});a(155);var c=r.a.createContext({}),u=function(e){return r.a.createElement(c.Consumer,null,function(t){return e.data||t[e.query]&&t[e.query].data?(e.render||e.children)(e.data?e.data.data:t[e.query].data):r.a.createElement("div",null,"Loading (StaticQuery)")})};u.propTypes={data:o.a.object,query:o.a.string.isRequired,render:o.a.func,children:o.a.func}},155:function(e,t,a){var n;e.exports=(n=a(157))&&n.default||n},157:function(e,t,a){"use strict";a.r(t);a(35);var n=a(0),r=a.n(n),i=a(4),o=a.n(i),l=a(55),s=a(2),c=function(e){var t=e.location,a=s.default.getResourcesForPathnameSync(t.pathname);return a?r.a.createElement(l.a,Object.assign({location:t,pageResources:a},a.json)):null};c.propTypes={location:o.a.shape({pathname:o.a.string.isRequired}).isRequired},t.default=c},158:function(e){e.exports={data:{file:{childImageSharp:{fixed:{width:500,height:281,src:"/static/2e1eebde07dacc2bea3f52c07324d1e0/90fcb/facebook-logo.png",srcSet:"/static/2e1eebde07dacc2bea3f52c07324d1e0/90fcb/facebook-logo.png 1x,\n/static/2e1eebde07dacc2bea3f52c07324d1e0/8658c/facebook-logo.png 1.5x,\n/static/2e1eebde07dacc2bea3f52c07324d1e0/c2a4f/facebook-logo.png 2x"}}}}}},159:function(e,t,a){"use strict";var n=a(0),r=a.n(n),i=a(4),o=a.n(i),l=a(34),s=a.n(l),c=a(7),u=a.n(c),d=a(154),p=a(162),m=a(171),g=a.n(m),f=a(152),h=a.n(f),b=a(153),v=a.n(b),E=function(e){function t(){var t;return(t=e.call(this)||this).render=function(){return r.a.createElement("div",{className:g.a.container,style:t.state.fixedHeader?{backgroundImage:"none"}:null},r.a.createElement("div",{className:g.a.titleContainer},r.a.createElement("div",{className:g.a.title},r.a.createElement(d.a,{to:v.a.resolvePageUrl(h.a.pages.home)},r.a.createElement("h4",null,h.a.siteTitle),r.a.createElement("p",{className:t.state.fixedHeader?g.a.hiddenDescription:g.a.visibleDescription},h.a.siteDescription))),r.a.createElement("div",{className:g.a.menuButton},t.state.collapsedMenu?r.a.createElement(p.c,{size:"30",onClick:t.toggleMenu}):r.a.createElement(p.m,{size:"30",onClick:t.toggleMenu}))),r.a.createElement("div",{className:[g.a.list,t.state.collapsedMenu?g.a.collapsedMenu:g.a.expandedMenu].join(" ")},r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement(d.a,{to:v.a.resolvePageUrl(h.a.pages.home)},"Home")),r.a.createElement("li",null,r.a.createElement(d.a,{to:v.a.resolvePageUrl(h.a.pages.tag)},"Tags")),r.a.createElement("li",null,r.a.createElement(d.a,{to:v.a.resolvePageUrl(h.a.pages.about)},"About"))),r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement("a",{target:"_blank",rel:"nofollow noopener noreferrer",href:h.a.social.github},r.a.createElement(p.f,{size:"30"}))),r.a.createElement("li",null,r.a.createElement("a",{target:"_blank",rel:"nofollow noopener noreferrer",href:h.a.social.linkedin},r.a.createElement(p.g,{size:"30"}))),r.a.createElement("li",null,r.a.createElement(d.a,{to:v.a.resolveUrl(h.a.social.rss)},r.a.createElement(p.l,{size:"30"}))))))},t.state={lastScrollY:0,fixedHeader:!1,collapsedMenu:!0},t.toggleFixedHeader=t.toggleFixedHeader.bind(s()(t)),t.toggleMenu=t.toggleMenu.bind(s()(t)),t}u()(t,e);var a=t.prototype;return a.componentDidMount=function(){window.addEventListener("scroll",this.toggleFixedHeader)},a.componentWillUnmount=function(){window.removeEventListener("scroll",this.toggleFixedHeader)},a.toggleFixedHeader=function(){var e=this;this.toggleFixedHeader.animationInProgress||(this.toggleFixedHeader.animationInProgress=!0,setTimeout(function(){e.setState({lastScrollY:window.scrollY,fixedHeader:window.scrollY>100&&e.state.lastScrollY<window.scrollY},function(){return e.toggleFixedHeader.animationInProgress=!1})},200))},a.toggleMenu=function(){this.setState({collapsedMenu:!this.state.collapsedMenu})},t}(n.Component),w=a(173),y=a.n(w),x=function(){return r.a.createElement("div",{className:y.a.container},r.a.createElement("p",null,"Copyrights © Trixeg Blog 2019"))},k=(a(174),a(175)),P=a.n(k),q=function(e){var t=e.children,a=e.title;return r.a.createElement(r.a.Fragment,null,r.a.createElement(E,null),r.a.createElement("div",{className:P.a.container},a?r.a.createElement("div",{className:P.a.title},r.a.createElement("h1",null,a)):null,t),r.a.createElement(x,null))};q.propTypes={children:o.a.node.isRequired,title:o.a.string},q.defaultProps={title:""};var R=q;a.d(t,"a",function(){return R})},160:function(e,t,a){"use strict";a(165);var n=a(158),r=a(0),i=a.n(r),o=a(4),l=a.n(o),s=a(176),c=a.n(s),u=a(154),d=a(152),p=a.n(d),m=a(153),g=a.n(m);function f(e){var t=e.title,a=e.description,r=e.path,o=e.lang,l=e.keywords,s=e.contentType,d=e.imageUrl,m=e.translations,f=e.meta;return i.a.createElement(u.b,{query:h,render:function(e){var n=l&&l.length>0?{name:"keywords",content:l.join(", ")}:[],u=g.a.resolvePageUrl(p.a.siteUrl,p.a.pathPrefix,r),h=g.a.resolveUrl(p.a.siteUrl,d||e.file.childImageSharp.fixed.src);return i.a.createElement(c.a,{title:t,titleTemplate:"%s | "+p.a.siteTitle,meta:[{name:"description",content:a},{property:"og:title",content:t},{property:"og:type",content:s||"website"},{property:"og:url",content:u},{property:"og:description",content:a},{property:"og:image",content:h},{property:"og:image:alt",content:a},{property:"og:site_name",content:p.a.siteTitle},{property:"og:locale",content:o||"en_US"},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:title",content:t},{name:"twitter:description",content:a},{name:"twitter:image",content:h},{name:"twitter:image:alt",content:a},{name:"twitter:site",content:p.a.author},{name:"twitter:creator",content:p.a.author}].concat(n).concat(f||[]),link:[{rel:"canonical",href:u}].concat(m?m.map(function(e){return{rel:"alternate",hreflang:e.hreflang,href:g.a.resolvePageUrl(p.a.siteUrl,p.a.pathPrefix,e.path)}}):[])})},data:n})}f.propTypes={title:l.a.string.isRequired,description:l.a.string.isRequired,path:l.a.string.isRequired,lang:l.a.string,contentType:l.a.oneOf(["article","website"]),imageUrl:l.a.string,keywords:l.a.arrayOf(l.a.string),translations:l.a.arrayOf(l.a.shape({hreflang:l.a.string.isRequired,path:l.a.string.isRequired})),meta:l.a.arrayOf(l.a.shape({property:l.a.string.isRequired,content:l.a.string.isRequired}))};var h="1166109120",b=f;a.d(t,"a",function(){return b})},161:function(e,t,a){var n=a(25).f,r=Function.prototype,i=/^\s*function ([^ (]*)/;"name"in r||a(14)&&n(r,"name",{configurable:!0,get:function(){try{return(""+this).match(i)[1]}catch(e){return""}}})}}]);
//# sourceMappingURL=component---src-pages-about-index-js-3b61b3ebf70df8cc00c4.js.map