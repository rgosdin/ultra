var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(d,e,h){d!=Array.prototype&&d!=Object.prototype&&(d[e]=h.value)};$jscomp.getGlobal=function(d){return"undefined"!=typeof window&&window===d?d:"undefined"!=typeof global&&null!=global?global:d};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.Symbol=function(){var d=0;return function(e){return $jscomp.SYMBOL_PREFIX+(e||"")+d++}}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var d=$jscomp.global.Symbol.iterator;d||(d=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[d]&&$jscomp.defineProperty(Array.prototype,d,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(d){var e=0;return $jscomp.iteratorPrototype(function(){return e<d.length?{done:!1,value:d[e++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(d){$jscomp.initSymbolIterator();d={next:d};d[$jscomp.global.Symbol.iterator]=function(){return this};return d};$jscomp.makeIterator=function(d){$jscomp.initSymbolIterator();$jscomp.initSymbol();$jscomp.initSymbolIterator();var e=d[Symbol.iterator];return e?e.call(d):$jscomp.arrayIterator(d)};
$jscomp.polyfill=function(d,e,h,g){if(e){h=$jscomp.global;d=d.split(".");for(g=0;g<d.length-1;g++){var f=d[g];f in h||(h[f]={});h=h[f]}d=d[d.length-1];g=h[d];e=e(g);e!=g&&null!=e&&$jscomp.defineProperty(h,d,{configurable:!0,writable:!0,value:e})}};$jscomp.FORCE_POLYFILL_PROMISE=!1;
$jscomp.polyfill("Promise",function(d){function e(){this.batch_=null}function h(b){return b instanceof f?b:new f(function(a,c){a(b)})}if(d&&!$jscomp.FORCE_POLYFILL_PROMISE)return d;e.prototype.asyncExecute=function(b){null==this.batch_&&(this.batch_=[],this.asyncExecuteBatch_());this.batch_.push(b);return this};e.prototype.asyncExecuteBatch_=function(){var b=this;this.asyncExecuteFunction(function(){b.executeBatch_()})};var g=$jscomp.global.setTimeout;e.prototype.asyncExecuteFunction=function(b){g(b,
0)};e.prototype.executeBatch_=function(){for(;this.batch_&&this.batch_.length;){var b=this.batch_;this.batch_=[];for(var a=0;a<b.length;++a){var c=b[a];delete b[a];try{c()}catch(l){this.asyncThrow_(l)}}}this.batch_=null};e.prototype.asyncThrow_=function(b){this.asyncExecuteFunction(function(){throw b;})};var f=function(b){this.state_=0;this.result_=void 0;this.onSettledCallbacks_=[];var a=this.createResolveAndReject_();try{b(a.resolve,a.reject)}catch(k){a.reject(k)}};f.prototype.createResolveAndReject_=
function(){function b(b){return function(k){c||(c=!0,b.call(a,k))}}var a=this,c=!1;return{resolve:b(this.resolveTo_),reject:b(this.reject_)}};f.prototype.resolveTo_=function(b){if(b===this)this.reject_(new TypeError("A Promise cannot resolve to itself"));else if(b instanceof f)this.settleSameAsPromise_(b);else{a:switch(typeof b){case "object":var a=null!=b;break a;case "function":a=!0;break a;default:a=!1}a?this.resolveToNonPromiseObj_(b):this.fulfill_(b)}};f.prototype.resolveToNonPromiseObj_=function(b){var a=
void 0;try{a=b.then}catch(k){this.reject_(k);return}"function"==typeof a?this.settleSameAsThenable_(a,b):this.fulfill_(b)};f.prototype.reject_=function(b){this.settle_(2,b)};f.prototype.fulfill_=function(b){this.settle_(1,b)};f.prototype.settle_=function(b,a){if(0!=this.state_)throw Error("Cannot settle("+b+", "+a|"): Promise already settled in state"+this.state_);this.state_=b;this.result_=a;this.executeOnSettledCallbacks_()};f.prototype.executeOnSettledCallbacks_=function(){if(null!=this.onSettledCallbacks_){for(var b=
this.onSettledCallbacks_,a=0;a<b.length;++a)b[a].call(),b[a]=null;this.onSettledCallbacks_=null}};var c=new e;f.prototype.settleSameAsPromise_=function(b){var a=this.createResolveAndReject_();b.callWhenSettled_(a.resolve,a.reject)};f.prototype.settleSameAsThenable_=function(b,a){var c=this.createResolveAndReject_();try{b.call(a,c.resolve,c.reject)}catch(l){c.reject(l)}};f.prototype.then=function(b,a){function c(a,b){return"function"==typeof a?function(b){try{d(a(b))}catch(p){e(p)}}:b}var d,e,g=new f(function(a,
b){d=a;e=b});this.callWhenSettled_(c(b,d),c(a,e));return g};f.prototype.catch=function(b){return this.then(void 0,b)};f.prototype.callWhenSettled_=function(b,a){function d(){switch(f.state_){case 1:b(f.result_);break;case 2:a(f.result_);break;default:throw Error("Unexpected state: "+f.state_);}}var f=this;null==this.onSettledCallbacks_?c.asyncExecute(d):this.onSettledCallbacks_.push(function(){c.asyncExecute(d)})};f.resolve=h;f.reject=function(b){return new f(function(a,c){c(b)})};f.race=function(b){return new f(function(a,
c){for(var d=$jscomp.makeIterator(b),f=d.next();!f.done;f=d.next())h(f.value).callWhenSettled_(a,c)})};f.all=function(b){var a=$jscomp.makeIterator(b),c=a.next();return c.done?h([]):new f(function(b,d){function f(a){return function(c){e[a]=c;g--;0==g&&b(e)}}var e=[],g=0;do e.push(void 0),g++,h(c.value).callWhenSettled_(f(e.length-1),d),c=a.next();while(!c.done)})};return f},"es6","es3");
$jscomp.executeAsyncGenerator=function(d){function e(e){return d.next(e)}function h(e){return d.throw(e)}return new Promise(function(g,f){function c(b){b.done?g(b.value):Promise.resolve(b.value).then(e,h).then(c,f)}c(d.next())})};
var Module={},WasmModuleWrapper=function(){var d=null,e=!1,h=!1,g=void 0;Module.locateFile=function(f){return d+"/"+f};Module.setStatus=function(d){};Module.monitorRunDependencies=function(d){};Module.onRuntimeInitialized=function(){e=!0;h=!1;try{g&&g(!0)}catch(f){console.error(f)}g=void 0};return{loadAndInitializeAsync:function(f){return $jscomp.executeAsyncGenerator(function(){function c(a,c,n){for(;;)switch(b){case 0:return b=-1,{value:new Promise(function(a,b){if(e||h)return b(Error("Loading in progress!"));
h=!0;g=a;d=f;importScripts(d+"/cowriter-prediction.js");importScripts("/Background/djiVFS.js");importScripts("/Background/djiSyncFSDriver.js")}),done:!0};default:return{value:void 0,done:!0}}}var b=0,a={next:function(a){return c(0,a,void 0)},throw:function(a){return c(1,void 0,a)},return:function(a){throw Error("Not yet implemented");}};$jscomp.initSymbolIterator();a[Symbol.iterator]=function(){return this};return a}())},Module:Module}}();
(function(){function d(c,b){return $jscomp.executeAsyncGenerator(function(){function a(a,h,k){for(;;)switch(d){case 0:g=null;try{return d=3,{value:WasmModuleWrapper.loadAndInitializeAsync(c.appDir),done:!1}}catch(m){e=m;d=1;break}case 3:try{if(1!=a){d=4;break}d=-1;throw k;}catch(m){e=m;d=1;break}case 4:try{d=2;break}catch(m){e=m;d=1;break}case 1:g=f=e;case 2:self.postMessage({message:b,params:{error:g?g.message:null}}),d=-1;default:return{value:void 0,done:!0}}}var d=0,f,e,g,h={next:function(b){return a(0,
b,void 0)},throw:function(b){return a(1,void 0,b)},return:function(a){throw Error("Not yet implemented");}};$jscomp.initSymbolIterator();h[Symbol.iterator]=function(){return this};return h}())}function e(c,b,a,d){a(c[d]);self.postMessage({message:b,params:{userData:c.userData}})}function h(c,b,a){self.postMessage({message:b,params:{topic:c.topic,allTopics:g(c.allTopics),activeTopics:g(c.activeTopics),recentTopics:g(c.recentTopics),userData:a}})}function g(c){if(!c)return null;for(var b=[],a=c.size(),
d=0;d<a;d++)b.push(c.get(d));return b}var f=null;self.addEventListener("message",function(c){var b=c.data,a=b.message;c=b.params;b=(b.options||{}).callbackMessage;if("com.donjohnston.cowriter.worker.load"===a)d(c,b);else if("com.donjohnston.cowriter.worker.initialize"===a)if(c.locale)if(c.resourceDirectory&&c.resourceContainer)if(c.userDirectory){a=c.locale;var k=!1;try{c.commonDirectory&&0<c.commonDirectory.length&&FS.extensions.mapSyncFS(c.commonDirectory),FS.extensions.mapVfsContainer(c.resourceDirectory,
c.resourceContainer),FS.extensions.mapSyncFS(c.userDirectory),(k=Module.initialize(c.resourceDirectory,c.commonDirectory,c.userDirectory,a))&&(f=c)}catch(n){console.error(n)}self.postMessage({message:b,params:{initialized:k,error:k?null:"Worker could not be initialized!"}})}else self.postMessage({message:b,params:{initialized:!1,error:"Missing user directory parameter!"}});else self.postMessage({message:b,params:{initialized:!1,error:"Missing resource directory (or container) parameter!"}});else self.postMessage({message:b,
params:{initialized:!1,error:"Missing locale parameter!"}});else if("com.donjohnston.cowriter.worker.sync"===a)self.postMessage({message:b,params:{userData:c?c.userData:null}});else if("com.donjohnston.cowriter.worker.syncUserDirectory"===a)FS.extensions.syncAsyncFS(f.userDirectory),Module.rebuildUserDataCache(),Module.reloadDictionaries(!0,!0),self.postMessage({message:b,params:{userDirectory:f.userDirectory,userData:c?c.userData:null}});else if("com.donjohnston.cowriter.worker.options"===a){if(a=
c.activeTopics){k=new Module.std_vector_wstring;for(var l=0;l<a.length;l++)k.push_back(a[l]);a=k}else a=null;c.activeTopics=a;Module.setOptions(c);self.postMessage({message:b,params:{userData:c.userData}})}else"com.donjohnston.cowriter.worker.options.mainDictionary"===a?e(c,b,Module.setMainDictionary,"value"):"com.donjohnston.cowriter.worker.options.maxPredictedGuesses"===a?e(c,b,Module.setMaxPredictedGuesses,"value"):"com.donjohnston.cowriter.worker.options.flexibleSpelling"===a?e(c,b,Module.enableFlexibleSpelling,
"flag"):"com.donjohnston.cowriter.worker.options.grammar"===a?e(c,b,Module.enableGrammar,"flag"):"com.donjohnston.cowriter.worker.options.predictAhead"===a?e(c,b,Module.enablePredictAhead,"flag"):"com.donjohnston.cowriter.worker.options.momentaryTopic"===a?e(c,b,Module.enableMomentaryTopic,"flag"):"com.donjohnston.cowriter.worker.followTextChange"===a?(a=Module.followTextChange(c.contextChanged,c.text,c.rangeStart,c.rangeLength),self.postMessage({message:b,params:{guesses:g(a.guesses),replacements:g(a.replacements),
userData:c.userData}})):"com.donjohnston.cowriter.worker.acceptGuess"===a?(a=Module.acceptGuess(c.guess),self.postMessage({message:b,params:{replacement:a.replacement,rangeStart:a.rangeStart,rangeLength:a.rangeLength,userData:c.userData}})):"com.donjohnston.cowriter.worker.restartGuesses"===a?(Module.restartGuesses(),self.postMessage({message:b,params:{userData:c.userData}})):"com.donjohnston.cowriter.worker.resetState"===a?(Module.resetState(),self.postMessage({message:b,params:{userData:c.userData}})):
"com.donjohnston.cowriter.worker.getTopicsState"===a?(a=Module.getTopicsState(),h(a,b,c.userData)):"com.donjohnston.cowriter.worker.getTopics"===a?(a=Module.getTopics(),self.postMessage({message:b,params:{topics:g(a),userData:c.userData}})):"com.donjohnston.cowriter.worker.getActiveTopics"===a?(a=Module.getActiveTopics(),self.postMessage({message:b,params:{activeTopics:g(a),userData:c.userData}})):"com.donjohnston.cowriter.worker.getRecentTopics"===a?(a=Module.getRecentTopics(),self.postMessage({message:b,
params:{recentTopics:g(a),userData:c.userData}})):"com.donjohnston.cowriter.worker.activateTopic"===a?(a=Module.activateTopic(c.topic),h(a,b,c.userData)):"com.donjohnston.cowriter.worker.activateTopics"===a?(a=Module.activateTopics(c.topics),h(a,b,c.userData)):"com.donjohnston.cowriter.worker.setActiveTopics"===a?(a=Module.setActiveTopics(c.topics),h(a,b,c.userData)):"com.donjohnston.cowriter.worker.deactivateTopic"===a?(a=Module.deactivateTopic(c.topic),h(a,b,c.userData)):"com.donjohnston.cowriter.worker.deactivateTopics"===
a?(a=Module.deactivateTopics(c.topics),h(a,b,c.userData)):"com.donjohnston.cowriter.worker.deactivateActiveTopics"===a?(a=Module.deactivateActiveTopics(),h(a,b,c.userData)):"com.donjohnston.cowriter.worker.updateMomentaryTopic"===a?(Module.updateMomentaryTopic(c.text),self.postMessage({message:b,params:{userData:c.userData}})):"com.donjohnston.cowriter.worker.createWikiTopic"===a?(a=Module.createWikiTopic(c.name,c.text,c.activate),self.postMessage({message:b,params:{topic:a.topic,filesUpdateInfo:{files:g(a.filesUpdateInfo.files)},
topicsState:{allTopics:g(a.topicsState.allTopics),activeTopics:g(a.topicsState.activeTopics),recentTopics:g(a.topicsState.recentTopics)},userData:c.userData}})):"com.donjohnston.cowriter.worker.activatePersonalDictionary"===a?(Module.activatePersonalDictionary(c.activate),self.postMessage({message:b,params:{userData:c.userData}})):"com.donjohnston.cowriter.worker.addPersonalWords"===a?(a=Module.addPersonalWords(c.text),self.postMessage({message:b,params:{filesUpdateInfo:{files:g(a.files)},userData:c.userData}})):
"com.donjohnston.cowriter.worker.removePersonalWords"===a?(a=Module.removePersonalWords(c.text),self.postMessage({message:b,params:{filesUpdateInfo:{files:g(a.files)},userData:c.userData}})):"com.donjohnston.cowriter.worker.reloadDictionaries"===a&&(Module.reloadDictionaries(c.userDictionaries,c.topicsContent),self.postMessage({message:b,params:{userData:c.userData}}))});self.postMessage({message:"com.donjohnston.cowriter.worker.ready",params:{error:null}})})();