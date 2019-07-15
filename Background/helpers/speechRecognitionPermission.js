navigator.mediaDevices.getUserMedia({audio:!0}).then(function(a){if(a=a.getTracks())for(var b=0;b<a.length;b++)a[b].stop()}).catch(function(a){});
