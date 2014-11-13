!function(e,n){var t=n;"undefined"!=typeof module&&module.exports?module.exports=t:(t.utils.namespace("io").variante=t,e.vars=t)}("undefined"!=typeof window?window:this,function(){var e,n,t;return function(i){function r(e,n){return b.call(e,n)}function o(e,n){var t,i,r,o,u,f,s,c,l,a,p,d=n&&n.split("/"),y=m.map,h=y&&y["*"]||{};if(e&&"."===e.charAt(0))if(n){for(d=d.slice(0,d.length-1),e=e.split("/"),u=e.length-1,m.nodeIdCompat&&A.test(e[u])&&(e[u]=e[u].replace(A,"")),e=d.concat(e),l=0;l<e.length;l+=1)if(p=e[l],"."===p)e.splice(l,1),l-=1;else if(".."===p){if(1===l&&(".."===e[2]||".."===e[0]))break;l>0&&(e.splice(l-1,2),l-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((d||h)&&y){for(t=e.split("/"),l=t.length;l>0;l-=1){if(i=t.slice(0,l).join("/"),d)for(a=d.length;a>0;a-=1)if(r=y[d.slice(0,a).join("/")],r&&(r=r[i])){o=r,f=l;break}if(o)break;!s&&h&&h[i]&&(s=h[i],c=l)}!o&&s&&(o=s,f=c),o&&(t.splice(0,f,o),e=t.join("/"))}return e}function u(e,n){return function(){var t=O.call(arguments,0);return"string"!=typeof t[0]&&1===t.length&&t.push(null),d.apply(i,t.concat([e,n]))}}function f(e){return function(n){return o(n,e)}}function s(e){return function(n){v[e]=n}}function c(e){if(r(g,e)){var n=g[e];delete g[e],w[e]=!0,p.apply(i,n)}if(!r(v,e)&&!r(w,e))throw new Error("No "+e);return v[e]}function l(e){var n,t=e?e.indexOf("!"):-1;return t>-1&&(n=e.substring(0,t),e=e.substring(t+1,e.length)),[n,e]}function a(e){return function(){return m&&m.config&&m.config[e]||{}}}var p,d,y,h,v={},g={},m={},w={},b=Object.prototype.hasOwnProperty,O=[].slice,A=/\.js$/;y=function(e,n){var t,i=l(e),r=i[0];return e=i[1],r&&(r=o(r,n),t=c(r)),r?e=t&&t.normalize?t.normalize(e,f(n)):o(e,n):(e=o(e,n),i=l(e),r=i[0],e=i[1],r&&(t=c(r))),{f:r?r+"!"+e:e,n:e,pr:r,p:t}},h={require:function(e){return u(e)},exports:function(e){var n=v[e];return"undefined"!=typeof n?n:v[e]={}},module:function(e){return{id:e,uri:"",exports:v[e],config:a(e)}}},p=function(e,n,t,o){var f,l,a,p,d,m,b=[],O=typeof t;if(o=o||e,"undefined"===O||"function"===O){for(n=!n.length&&t.length?["require","exports","module"]:n,d=0;d<n.length;d+=1)if(p=y(n[d],o),l=p.f,"require"===l)b[d]=h.require(e);else if("exports"===l)b[d]=h.exports(e),m=!0;else if("module"===l)f=b[d]=h.module(e);else if(r(v,l)||r(g,l)||r(w,l))b[d]=c(l);else{if(!p.p)throw new Error(e+" missing "+l);p.p.load(p.n,u(o,!0),s(l),{}),b[d]=v[l]}a=t?t.apply(v[e],b):void 0,e&&(f&&f.exports!==i&&f.exports!==v[e]?v[e]=f.exports:a===i&&m||(v[e]=a))}else e&&(v[e]=t)},e=n=d=function(e,n,t,r,o){if("string"==typeof e)return h[e]?h[e](n):c(y(e,n).f);if(!e.splice){if(m=e,m.deps&&d(m.deps,m.callback),!n)return;n.splice?(e=n,n=t,t=null):e=i}return n=n||function(){},"function"==typeof t&&(t=r,r=o),r?p(i,e,n,t):setTimeout(function(){p(i,e,n,t)},4),d},d.config=function(e){return d(e)},e._defined=v,t=function(e,n,t){n.splice||(t=n,n=[]),r(v,e)||r(g,e)||(g[e]=[e,n,t])},t.amd={jQuery:!0}}(),t("almond",function(){}),t("enums/dirtytype",{NONE:0,POSITION:1,SIZE:2,LAYOUT:4,STATE:8,DATA:16,LOCALE:32,DEPTH:64,CONFIG:128,STYLE:256,CUSTOM:512,ALL:4294967295}),t("enums",["enums/dirtytype"],function(e){var n=function(e){return e};return n.DirtyType=e,n}),t("ui/viewcontroller",["../enums/dirtytype"],function(e){function n(n){var t,i=0;Object.defineProperty(this,"name",{value:"",writable:!0}),Object.defineProperty(this,"view",{value:n||null,writable:!1}),Object.defineProperty(this,"data",{get:function(){return t}.bind(this),set:function(n){t=n,this.setDirty(e.DATA)}.bind(this)}),this.setDirty=function(n,t){if(!this.isDirty(n)||t){switch(n){case e.NONE:case e.ALL:i=n;break;default:i|=n}t?this.update():requestAnimationFrame(this.update.bind(this))}},this.isDirty=function(n){switch(n){case e.NONE:case e.ALL:return i==n;default:return 0!==(n&i)}}}return n.prototype.init=function(){this.setDirty(e.ALL)},n.prototype.destroy=function(){},n.prototype.update=function(){this.setDirty(0)},n.prototype.toString=function(){return"[ViewController{"+this.name+"}]"},n}),t("ui",["ui/viewcontroller"],function(e){var n=function(e){return e};return n.ViewController=e,n}),t("utils",[],function(){function e(e,n){if(!e)throw n||"[vars]: Assertion failed."}function n(){self.debug&&window.console&&console.log&&Function.apply.call(console.log,console,arguments)}function t(n,t){e("string"==typeof n,"Invalid identifiers specified."),e("undefined"==typeof t||"object"==typeof t,"Invalid scope specified.");for(var i=n.split("."),r=void 0===t||null===t?window:t,o=0;o<i.length;o++)r=r[i[o]]||(r[i[o]]={});return r}function i(e,n){return e.prototype=Object.create(n.prototype),e.prototype.constructor=e,n}function r(e){if(void 0!==e.length)return e.length;var n=0;switch(typeof e){case"object":if(null!==e&&void 0!==e)for(var t in e)n++;break;case"number":n=(""+e).length;break;default:n=0}return n}function o(){return"ontouchstart"in window.document.documentElement}var u={};return u.assert=e,u.log=n,u.namespace=t,u.inherit=i,u.sizeOf=r,u.isTouchEnabled=o,u}),t("vars",["enums","ui","utils"],function(e,n,t){var i=function(e){return e};return i.version="0.1.0",i.enums=e,i.ui=n,i.utils=t,i}),n("vars")}());