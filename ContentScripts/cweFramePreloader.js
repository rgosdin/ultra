(function(){function a(){a.__rules||(a.__rules=[{hostname:/^.*word-edit.officeapps.live.com$/,pathname:/^.*\/wordeditorframe.aspx$/}]);for(var b=0;b<a.__rules.length;b++)if(a.__rules[b].hostname.test(window.location.hostname)&&a.__rules[b].pathname.test(window.location.pathname))return!0;return!1}a()&&chrome.runtime.sendMessage(null,{message:"com.donjohnston.cowriter.service.load",service:"ms-office-word-editor"})})();