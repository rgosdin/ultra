window.dji=window.dji||{};
(function(c){function l(a){a&&a.sender&&a.sender.id&&0<=g.indexOf(a.sender.id)&&a.onMessage.addListener(m.bind(a))}function m(a){var d=this;"notification"===a.type?e.onNotification&&f(e.onNotification,a.data):"query"===a.type&&(e.onQuery?f(e.onNotification,a.data,function(b){d.postMessage({queryId:a.id,type:"answer",data:b})}):d.postMessage({queryId:a.id,type:"answer",data:null}))}function f(a){if(a)try{a.apply(this,[].slice.call(arguments).splice(1))}catch(d){Logger.instance.error(d)}}var g=["ifajfiofeifbbhbionejdliodenmecna",
"mloajfnmjckfjbeeofcdaecbelnblden","cbcfbhjolgdaepkoaoepejclfggmdand","ioadmlabdmgldhncokgjbhlnpalnfccd"],e={onNotification:null,onQuery:null},h=!1,k=0;c.init=function(a){h||(a=a||{},e.onNotification=a.onNotification||null,e.onQuery=a.onQuery||null,h=!0,chrome.runtime.onConnectExternal.addListener(l))};c.broadcastNotification=function(a){for(var d=chrome.runtime.id,b=0;b<g.length;b++)g[b]!==d&&c.sendNotification(g[b],a)};c.sendNotification=function(a,d,b){if(0<=g.indexOf(a)){a=chrome.runtime.connect(a);
a.onDisconnect.addListener(function(){});try{a.postMessage({id:++k,type:"notification",data:d}),a.disconnect(),f(b,{success:!0})}catch(p){f(b,{success:!1})}}};c.sendQuery=function(a,d,b){if(0<=g.indexOf(a)&&b&&"function"===typeof b){var e=function(){f(b,null)},c=chrome.runtime.connect(a);c.onDisconnect.addListener(e);c.onMessage.addListener(function(a){c.onDisconnect.removeListener(e);c.disconnect();f(b,a)});try{c.postMessage({id:++k,type:"query",data:d})}catch(n){Logger.instance.error(n),f(b,null)}}}})(window.dji.proxy=
window.dji.proxy||{});
