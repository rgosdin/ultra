window.jsdapi=window.jsdapi||{};
(function(b){function f(a){if(a)try{a.apply(this,[].slice.call(arguments).splice(1))}catch(d){Logger.instance.error(d)}}var g=null,c=null;b.setUrls=function(a){g=a.server+(a.api||"/api");c=a.server+(a.languages||"/languages")};b.translate=function(a,d,b,c){jsdapi.authorize(function(e){if(!e)return f(c,{error:401,message:"Authorization failed!"});e=JSON.stringify({q:b,source:a,target:d});jsdapi.http.sendRequest({timeout:2E4,responseType:"json",method:"POST",url:g,contentType:"application/json",content:e},
c)})};b.languages=function(a){jsdapi.authorize(function(b){if(!b)return f(a,{error:401,message:"Authorization failed!"});jsdapi.http.sendRequest({timeout:1E4,method:"POST",url:c,contentType:"application/json"},a)})}})(window.jsdapi.translate=window.jsdapi.translate||{});window.jsdapi.translator=window.jsdapi.translate;