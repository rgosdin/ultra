(function(){function n(c,a){var b=[];for(srcKey in a)if(srcKey.match(/^closure/)&&"number"!=typeof a[srcKey]){var d=a[srcKey];if(d)for(closureKey in d){var e=d[closureKey];if(e&&e!=a)for(eventListKey in e)if(eventListKey===c){var f=e[eventListKey];if(f){if(void 0!=f.length&&f[0].src==a)for(c=0;c<f.length;c++)if(g.instance.log(f[c]),f[c].src===a)for(eventPropertyName in f[c])f[c][eventPropertyName].src===a&&b.push(f[c][eventPropertyName]);return b}}}}return b}function p(){e=document.getElementsByClassName("docs-texteventtarget-iframe")[0];
h=e.contentDocument;m=h.getElementsByTagName("body")[0];k=n("keydown",h);l=n("keypress",h);g.instance.log(l)}var q=document.getElementById("__DJI_CWE_CHROME_GOOGLE_DOCS_PROXY"),e=document.getElementsByClassName("docs-texteventtarget-iframe")[0],h=e.contentDocument,m=h.getElementsByTagName("body")[0],k=[],l=[],g={instance:{log:function(){}}};setTimeout(function(){p()},0);q.addEventListener("__DJI_CWE_IME_RELOAD",function(c){p()},!1);q.addEventListener("__DJI_CWE_IME_REPLACETEXT",function(c){g.instance.log("__DJI_CWE_IME_REPLACETEXT");
g.instance.log(c);c=c.detail;var a={__isDjiIMEEvent:!0,altGraphKey:!1,altKey:!1,bubbles:!0,cancelBubble:!1,cancelable:!0,charCode:0,clipboardData:void 0,ctrlKey:!1};a.currentTarget=e.contentDocument;a.defaultPrevented=!1;a.detail=0;a.eventPhase=0;a.keyCode=0;a.keyIdentifier=0;a.keyLocation=0;a.layerX=0;a.layerY=0;a.location=0;a.metaKey=!1;a.pageX=0;a.pageY=0;a.returnValue=!0;a.shiftKey=!1;a.srcElement=m;a.target=m;a.timeStamp=(new Date).getTime();a.type="keypress";a.view=e.contentWindow;a.which=0;
g.instance.log(a);var b;if(0<c.extended.rightKey){a.charCode=0;a.keyCode=39;a.which=39;for(var d=0;d<c.extended.rightKey;d++)for(a.timeStamp=(new Date).getTime(),b=0;b<k.length;b++)k[b](a)}if(0<c.extended.backspaceKey)for(a.charCode=0,a.keyCode=8,a.which=8,d=0;d<c.extended.backspaceKey;d++)for(a.timeStamp=(new Date).getTime(),b=0;b<k.length;b++)k[b](a);for(d=0;d<c.text.length;d++)for(b=c.text[d],a.charCode=b.charCodeAt(0),a.keyCode=b.charCodeAt(0),a.which=b.charCodeAt(0),a.shiftKey=b.toUpperCase()==
b?!0:!1,a.timeStamp=(new Date).getTime(),b=0;b<l.length;b++)l[b](a)},!1)})();
