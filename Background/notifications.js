window.dji=window.dji||{};
(function(c){function f(b){}var g=CWEChromeUtilities.generateUUID();c.show=function(b){for(var a={type:"basic",iconUrl:chrome.extension.getURL("Graphics/CoWriterIcon-48x48.png"),title:chrome.runtime.getManifest().name},c="type iconUrl message contextMessage items requireInteraction".split(" "),d,e=0;e<c.length;e++)d=c[e],b.hasOwnProperty(d)&&b[d]&&(a[d]=b[d]);chrome.notifications.create(b.noUuid?null:g,a,f)};c.showByAuthCode=function(b){var a="We could not sign you in automatically.";switch(b){case 800001:a=
"To sign in, click Co:Writer's icon.";break;case 800002:a="We could not sign you in automatically: click Co:Writer's icon and pick the organization you'd like to use.";break;case 800003:a="We could not sign you in automatically: your license has expired.";break;case 800004:a="We could not sign you in automatically: your organization has canceled the license.";break;case 800005:a="We could not sign you in automatically: click Co:Writer's icon and enter payment information.";break;case 800020:a="We could not sign you in automatically: you must have at least one student to gain access to Co:Writer.";
break;case 800021:a="We could not sign you in automatically: you must have at least one child to gain access to Co:Writer.";break;case 810401:a="We could not sign you in automatically: you don't have a license for Co:Writer."}c.show({message:a})}})(window.dji.notifications=window.dji.notifications||{});