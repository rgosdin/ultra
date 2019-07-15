var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,d,g){a!=Array.prototype&&a!=Object.prototype&&(a[d]=g.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.Symbol=function(){var a=0;return function(d){return $jscomp.SYMBOL_PREFIX+(d||"")+a++}}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var d=0;return $jscomp.iteratorPrototype(function(){return d<a.length?{done:!1,value:a[d++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.makeIterator=function(a){$jscomp.initSymbolIterator();$jscomp.initSymbol();$jscomp.initSymbolIterator();var d=a[Symbol.iterator];return d?d.call(a):$jscomp.arrayIterator(a)};
$jscomp.polyfill=function(a,d,g,k){if(d){g=$jscomp.global;a=a.split(".");for(k=0;k<a.length-1;k++){var b=a[k];b in g||(g[b]={});g=g[b]}a=a[a.length-1];k=g[a];d=d(k);d!=k&&null!=d&&$jscomp.defineProperty(g,a,{configurable:!0,writable:!0,value:d})}};$jscomp.FORCE_POLYFILL_PROMISE=!1;
$jscomp.polyfill("Promise",function(a){function d(){this.batch_=null}function g(c){return c instanceof b?c:new b(function(a,b){a(c)})}if(a&&!$jscomp.FORCE_POLYFILL_PROMISE)return a;d.prototype.asyncExecute=function(c){null==this.batch_&&(this.batch_=[],this.asyncExecuteBatch_());this.batch_.push(c);return this};d.prototype.asyncExecuteBatch_=function(){var c=this;this.asyncExecuteFunction(function(){c.executeBatch_()})};var k=$jscomp.global.setTimeout;d.prototype.asyncExecuteFunction=function(c){k(c,
0)};d.prototype.executeBatch_=function(){for(;this.batch_&&this.batch_.length;){var c=this.batch_;this.batch_=[];for(var a=0;a<c.length;++a){var b=c[a];delete c[a];try{b()}catch(l){this.asyncThrow_(l)}}}this.batch_=null};d.prototype.asyncThrow_=function(c){this.asyncExecuteFunction(function(){throw c;})};var b=function(c){this.state_=0;this.result_=void 0;this.onSettledCallbacks_=[];var a=this.createResolveAndReject_();try{c(a.resolve,a.reject)}catch(f){a.reject(f)}};b.prototype.createResolveAndReject_=
function(){function a(a){return function(c){f||(f=!0,a.call(b,c))}}var b=this,f=!1;return{resolve:a(this.resolveTo_),reject:a(this.reject_)}};b.prototype.resolveTo_=function(a){if(a===this)this.reject_(new TypeError("A Promise cannot resolve to itself"));else if(a instanceof b)this.settleSameAsPromise_(a);else{a:switch(typeof a){case "object":var c=null!=a;break a;case "function":c=!0;break a;default:c=!1}c?this.resolveToNonPromiseObj_(a):this.fulfill_(a)}};b.prototype.resolveToNonPromiseObj_=function(a){var c=
void 0;try{c=a.then}catch(f){this.reject_(f);return}"function"==typeof c?this.settleSameAsThenable_(c,a):this.fulfill_(a)};b.prototype.reject_=function(a){this.settle_(2,a)};b.prototype.fulfill_=function(a){this.settle_(1,a)};b.prototype.settle_=function(a,b){if(0!=this.state_)throw Error("Cannot settle("+a+", "+b|"): Promise already settled in state"+this.state_);this.state_=a;this.result_=b;this.executeOnSettledCallbacks_()};b.prototype.executeOnSettledCallbacks_=function(){if(null!=this.onSettledCallbacks_){for(var a=
this.onSettledCallbacks_,b=0;b<a.length;++b)a[b].call(),a[b]=null;this.onSettledCallbacks_=null}};var m=new d;b.prototype.settleSameAsPromise_=function(a){var b=this.createResolveAndReject_();a.callWhenSettled_(b.resolve,b.reject)};b.prototype.settleSameAsThenable_=function(a,b){var c=this.createResolveAndReject_();try{a.call(b,c.resolve,c.reject)}catch(l){c.reject(l)}};b.prototype.then=function(a,d){function c(a,b){return"function"==typeof a?function(b){try{l(a(b))}catch(u){g(u)}}:b}var l,g,k=new b(function(a,
b){l=a;g=b});this.callWhenSettled_(c(a,l),c(d,g));return k};b.prototype.catch=function(a){return this.then(void 0,a)};b.prototype.callWhenSettled_=function(a,b){function c(){switch(d.state_){case 1:a(d.result_);break;case 2:b(d.result_);break;default:throw Error("Unexpected state: "+d.state_);}}var d=this;null==this.onSettledCallbacks_?m.asyncExecute(c):this.onSettledCallbacks_.push(function(){m.asyncExecute(c)})};b.resolve=g;b.reject=function(a){return new b(function(b,c){c(a)})};b.race=function(a){return new b(function(b,
c){for(var d=$jscomp.makeIterator(a),k=d.next();!k.done;k=d.next())g(k.value).callWhenSettled_(b,c)})};b.all=function(a){var c=$jscomp.makeIterator(a),d=c.next();return d.done?g([]):new b(function(a,b){function k(b){return function(c){f[b]=c;l--;0==l&&a(f)}}var f=[],l=0;do f.push(void 0),l++,g(d.value).callWhenSettled_(k(f.length-1),b),d=c.next();while(!d.done)})};return b},"es6","es3");
$jscomp.executeAsyncGenerator=function(a){function d(d){return a.next(d)}function g(d){return a.throw(d)}return new Promise(function(k,b){function m(a){a.done?k(a.value):Promise.resolve(a.value).then(d,g).then(m,b)}m(a.next())})};$jscomp.findInternal=function(a,d,g){a instanceof String&&(a=String(a));for(var k=a.length,b=0;b<k;b++){var m=a[b];if(d.call(g,m,b,a))return{i:b,v:m}}return{i:-1,v:void 0}};
$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,g){return $jscomp.findInternal(this,a,g).v}},"es6","es3");window.dji=window.dji||{};
(function(){function a(a){dji.ui.dropdown.showPopup(a.currentTarget,{alignTop:!0,alignRight:!0})}function d(a){a.stopPropagation();a.preventDefault();dji.ui.dropdown.hidePopup();dji.account.showConnectToEducatorModalDlg()}function g(a){a.stopPropagation();a.preventDefault();dji.ui.dropdown.hidePopup();a=h.dji.config.cowriterUrl()+"/change-password?redirect_uri="+chrome.runtime.getURL("go.html");window.location=a}function k(a){a.stopPropagation();a.preventDefault();dji.ui.dropdown.hidePopup();dji.ui.modalDlg.showMessageDlg("dji-cwu-signing-out");
e.signOut(function(a){a?window.close():dji.ui.modalDlg.hideDlg()})}function b(a){($(a.currentTarget).hasClass("dji-cwu-option-dropdown-item")||$(a.currentTarget).hasClass("dji-cwu-dropdown"))&&dji.ui.dropdown.showPopup(a.currentTarget)}function m(a){$(a.target).hasClass("dji-cwu-color-picker-value")&&dji.ui.colorPicker.showPopup(a.currentTarget)}function c(a){$(a.currentTarget).toggleClass("dji-cwu-on");var b=$(a.currentTarget).hasClass("dji-cwu-on");$(a.currentTarget).trigger({type:"change",checked:b})}
function y(a){if(!this.hasAttribute("dji-cwu-not-available")){var b=$(a.currentTarget).find(".dji-cwu-menu-item-text").text(),q=$(a.currentTarget).closest(".dji-cwu-option-dropdown-item");q.find(".dji-cwu-option-item-value").text(b);q.trigger({type:"change",value:$(a.currentTarget).attr("dji-cwu-value"),text:b})}dji.ui.dropdown.hidePopup();a.stopPropagation();a.preventDefault()}function f(a){var b=a.currentTarget.style.backgroundColor;a.preventDefault();a.stopPropagation();$(a.currentTarget).closest(".dji-cwu-color-picker-value").trigger({type:"change",
color:b})}function l(a){var b=a.currentTarget.style.backgroundColor,q=a.currentTarget.style.color;a.preventDefault();a.stopPropagation();$("body").trigger({type:"dji-cwu-change-colors",color:q,backgroundColor:b})}function r(a){$(a.currentTarget).parent().find(".dji-cwu-tab-button.dji-cwu-selected").removeClass("dji-cwu-selected");$(a.currentTarget).addClass("dji-cwu-selected");$(a.currentTarget).closest(".dji-cwu-color-popup").attr("dji-cwu-view-mode",$(a.currentTarget).attr("dji-cwu-item"));a.preventDefault();
a.stopPropagation()}function A(){$("#dji-cwu-user-name").on("click","#dji-cwu-connect-with-educator",d).on("click","#dji-cwu-change-user-password",g).on("click","#dji-cwu-sign-out",k).on("click",a);$(".dji-cwu-option-color-picker-value").on("click",".dji-cwu-color-item",f).on("click",".dji-cwu-color-template",l).on("click",".dji-cwu-colors-tab-items .dji-cwu-tab-button",r);$(".dji-cwu-color-picker-value").on("click",m);$(".dji-cwu-menu-item-text").mouseover(function(){$(this).css("background-color",
"red")});$(".dji-cwu-option-dropdown-item").on("click",".dji-cwu-menu-item",y).on("click",b);$(".dji-cwu-options-view").on("click",".dji-cwu-switch-container",c)}function w(){dji.account.initialize(e);var a=e.allowChanges();-1===a.indexOf("<none>")&&-1===a.indexOf("<no-overrides>")||$("div[dji-cwu-options]").addClass("dji-cwu-not-allow-changes");A();chrome.runtime.onMessage.addListener(u);dji.ui.modalDlg.hideDlg();$("body").removeClass("dji-cwu-not-ready");x()}function t(a){var b=v&&!v.isInitialized();
e&&e.isLoaded()&&e.isLoggedIn()?b&&(dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("dji-cwu-loading-message"),e&&"--options-language-change"===e.restartReason()&&1===a&&(dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("dji-cwu-change-language-wait-message"))):(h||(h=chrome.extension.getBackgroundPage()),e=h&&h.CWEBackgroundManagerInstance?h.CWEBackgroundManagerInstance():null,1===a&&(dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("dji-cwu-loading-message"),e&&"--options-language-change"===
e.restartReason()&&(dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("cwu_change_language_wait_message"))),e&&(p=h.CWESettingsInstance(),q=h.dji.tts,B=(v=h.CWEPredictionEngine)?v.instance:null,b=v&&!v.isInitialized(),e.isLoaded()&&!e.isLoggedIn()?(dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("dji-cwu-please-sign-in-message")):e.localeRequiresReboot()&&(dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("dji-cwu-language-has-been-changed-message"))),a++);e&&e.isLoaded()&&
e.isLoggedIn()?1<a&&!b?window.location.reload():b?setTimeout(function(){e.__initializePredictionEngine(function(b,q){b?setTimeout(w,3E3):q?Logger.instance.error("*** Failed to initialize Prediction Engine!"):(Logger.instance.log("*** Prediction Engine initialization is already in progress!"),setTimeout(t,500,a+1))})},2E3):w():setTimeout(t,500,a+1)}function z(){return $jscomp.executeAsyncGenerator(function(){function a(a,d,c){for(;;)switch(b){case 0:return h.dji.speechRecognition.stop(),e.translateHtmlDocument(document),
dji.templates.cache(),Logger.initialize(),Logger.instance.log(p),Logger.instance.log(q),Logger.instance.log(B),b=1,{value:dji.ui.templatesRegistry.cache("/ContentScripts/ui/cweMainViewTemplates.html","default"),done:!1};case 1:if(1!=a){b=2;break}b=-1;throw c;case 2:return b=3,{value:cweMainView.initialize(document.getElementById("dji-cwu-ime-sample"),!0),done:!1};case 3:if(1!=a){b=4;break}b=-1;throw c;case 4:cweMainView.suggestionsCount=5,cweMainView.setSuggestions(["Samples","Samplers","Sampling",
"Simply","Sampler"]),cweMainView.show(!0),CWESpeechOptions.instance=new CWESpeechOptions(p,q,e),Logger.instance.log(CWESpeechOptions.instance),CWETextOptions.instance=new CWETextOptions(p),Logger.instance.log(CWETextOptions.instance),CWEPredictionOptions.instance=new CWEPredictionOptions(p,B,e,h),Logger.instance.log(CWEPredictionOptions.instance),h||(h=chrome.extension.getBackgroundPage()),e&&(a=h.dji.config.cowriterUrl(),$("a[dji-cowriter-url]").attr("href",a),$("a[dji-cowriter-privacy-policy-url]").attr("href",
a+"/privacy-policy"),$("a[dji-cowriter-tos-url]").attr("href",a+"/tos")),a=$("#dji-cwu-main-overlay"),dji.ui.colorPicker.init(a),a=$("#dji-cwu-main-overlay"),dji.ui.dropdown.init(a),a=$("#dji-cwu-modal-dlg-overlay"),dji.ui.modalDlg.init(a),dji.ui.toast.init(),t(1),b=-1;default:return{value:void 0,done:!0}}}var b=0,d={next:function(b){return a(0,b,void 0)},throw:function(b){return a(1,void 0,b)},return:function(a){throw Error("Not yet implemented");}};$jscomp.initSymbolIterator();d[Symbol.iterator]=
function(){return this};return d}())}function u(a){var b=!1;switch(a.reason){case "load":case "initialize_nacl_started":case "initialize_nacl_finished":case "update_topic_finished":case "update_topic_started":case "busy_started":case "busy_finished":b=!0}b&&x(a.details)}function x(a){!e||e.isBusy()?($("input").prop("disabled",!0),a&&a.userData&&a.userData.action?"update"===a.userData.action?(document.body.classList.remove("dji-cwu-working"),dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("dji-cwu-updating-topic-message")):
"create"===a.userData.action?(document.body.classList.remove("dji-cwu-working"),dji.ui.modalDlg.hideDlg(),dji.ui.modalDlg.showMessageDlg("dji-cwu-creating-topic-message")):document.body.classList.add("dji-cwu-working"):document.body.classList.add("dji-cwu-working")):(a&&a.userData&&a.userData.action&&dji.ui.modalDlg.hideDlg(),document.body.classList.remove("dji-cwu-working"),$("input").prop("disabled",!1))}var h=chrome.extension.getBackgroundPage(),e=h&&h.CWEBackgroundManagerInstance?h.CWEBackgroundManagerInstance():
null,p=e?h.CWESettingsInstance():null,q=h?h.dji.tts:null,v=e?h.CWEPredictionEngine:null,B=v?v.instance:null;window.cweMainView=new DjiCwuMainView;$(document).ready(function(){$("body").addClass("dji-cwu-not-ready");z()})})();
(function(){function a(){for(var a=A.value.trim(),b=w.value.trim(),d=t.value.trim(),c=z.value.trim(),g=u.value.trim(),f=x.value.trim().split("\n"),n=0;n<f.length;n++)f[n]=f[n].trim(),0===f[n].length&&(f.splice(n,1),n--);0!==a.length&&0!==b.length&&0!==d.length&&0!==f.length&&((n=k(a))?(n.login=b,n.dapi=d,n.resources=c,n.cowriter=g,n.relatedUris=f):e.push({name:a,login:b,dapi:d,resources:c,cowriter:g,relatedUris:f}),h=a,l.style.display="none",a={configName:h,configs:e},a=JSON.stringify(a),p.writeFile("env.config",
a,function(){chrome.runtime.reload()}))}function d(){l.style.display="none"}function g(){var a=e[r.selectedIndex];A.value=a.name;w.value=a.login;t.value=a.dapi;z.value=a.resources;u.value=a.cowriter;x.value=a.relatedUris.join("\n")}function k(a){for(var b=0;b<e.length;b++){var d=e[b];if(d.name===a)return d}return null}function b(){if(!l){var b=Date.now(),c="__dapi-0-"+b,f="__dapi-1-"+b,m="__dapi-2-"+b,p="__dapi-3-"+b,y="__dapi-4-"+b,n="__dapi-5-"+b,C="__dapi-6-"+b,D="__dapi-7-"+b,E="__dapi-100-"+
b,F="__dapi-101-"+b,G="__dapi-800-"+b;b=('<div id="#0" style="display:none;position:fixed;top:0;left:0;bottom:0;right:0;background-color:rgba(100,0,0,0.8);cursor:default;z-index:1100000010;"><style>table.opt-'+b+" input, table.opt-"+b+' textarea {font-family: monospace;font-size: 12px;}</style><div style="margin:50px auto;width:500px;background-color:#FFFFFF;padding:20px;"><h2>Login &amp; D:API settings (<i>you better logout first</i>)</h2><table style="width:100%;margin-top:2px;font-size:14px;" class="opt-'+
b+'"><tr><td style="width:80px;">Predefined:</td><td><select id="#1" style="width:100%"></select></td></tr><tr><td colspan="2" align="right"><hr/></td></tr><tr><td>Name*:</td><td><input id="#2" type="text" style="width:100%;"/></td></tr><tr><td>Login URL*:</td><td><input id="#3" type="text" style="width:100%;"/></td></tr><tr><td style="width:100px;">D:API URL*:</td><td><input id="#4" type="text" style="width:100%;"/></td></tr><tr><td style="width:100px;">Res URL*:</td><td><input id="#5" type="text" style="width:100%;"/></td></tr><tr><td style="width:100px;">Co:Writer URL*:</td><td><input id="#7" type="text" style="width:100%;"/></td></tr><tr><td valign="top" style="width:100px;">Related URL*:</td><td><textarea id="#6" style="width:100%;height: 60px;"></textarea></td></tr><tr><td colspan="2" style="text-align:right;padding-top:10px;">When you press OK, the extension will be reloaded to apply the new settings.</td></tr><tr><td style="text-align:left;padding-top:10px;"><button id="#800">Reload Extension</button></td><td style="text-align:right;padding-top:10px;"><button id="#100">OK</button>&nbsp;<button id="#101">Cancel</button></td></tr></div></div>').replace("#0",
c).replace("#1",f).replace("#2",m).replace("#3",p).replace("#4",y).replace("#5",n).replace("#6",C).replace("#7",D).replace("#100",E).replace("#101",F).replace("#800",G);document.body.insertAdjacentHTML("beforeend",b);l=document.getElementById(c);r=document.getElementById(f);A=document.getElementById(m);w=document.getElementById(p);t=document.getElementById(y);z=document.getElementById(n);x=document.getElementById(C);u=document.getElementById(D);r.addEventListener("change",g);document.getElementById(E).addEventListener("click",
a);document.getElementById(F).addEventListener("click",d);document.getElementById(G).addEventListener("click",function(){return chrome.runtime.reload()})}if("block"!==l.style.display){for(c=null;c=r.lastChild;)r.removeChild(c);for(c=0;c<e.length;c++)f=e[c],m=document.createElement("option"),m.innerText=f.name,r.appendChild(m),f.name===h&&(r.selectedIndex=c);if(c=k(h))A.value=c.name,w.value=c.login,t.value=c.dapi,z.value=c.resources,u.value=c.cowriter,x.value=c.relatedUris.join("\n");l.style.display=
"block"}}function m(){var a="";document.addEventListener("keydown",function(c){if(!c.repeat){var d=!1;!c.altKey||c.ctrlKey||c.shiftKey||c.metaKey?0<a.length&&(a=""):(c=String.fromCharCode(c.keyCode),32<=c.charCodeAt(0)&&(0===a.length||a.charAt(a.length-1)!==c)&&(a+=c,d=!0));d&&"QSX"===a&&(a="",b())}},!0);document.addEventListener("keyup",function(b){!b.altKey&&0<a.length&&(a="")},!0)}function c(a){p.readFile("env.config",function(b){if(b)try{var c=JSON.parse(b);h=c.configName;e=c.configs}catch(H){Logger.instance.error(H)}0===
e.length&&(e=f.dji.config.allEnvs(),h=f.dji.config.env().name);a()})}function y(){f||(f=chrome.extension.getBackgroundPage());(f&&f.CWEBackgroundManagerInstance?f.CWEBackgroundManagerInstance():null).requestFileSystem(function(a){p=a;c(m)})}var f=chrome.extension.getBackgroundPage(),l=null,r=null,A=null,w=null,t=null,z=null,u=null,x=null,h=null,e=[],p=null;$(document).ready(function(){y()})})();
