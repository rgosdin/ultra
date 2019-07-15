var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.findInternal=function(a,c,b){a instanceof String&&(a=String(a));for(var d=a.length,e=0;e<d;e++){var f=a[e];if(c.call(b,f,e,a))return{i:e,v:f}}return{i:-1,v:void 0}};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,c,b){a!=Array.prototype&&a!=Object.prototype&&(a[c]=b.value)};
$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(a,c,b,d){if(c){b=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in b||(b[e]={});b=b[e]}a=a[a.length-1];d=b[a];c=c(d);c!=d&&null!=c&&$jscomp.defineProperty(b,a,{configurable:!0,writable:!0,value:c})}};
$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,b){return $jscomp.findInternal(this,a,b).v}},"es6","es3");
function CWETextOptions(a){this.m_cweSettings=a;this.m_fonts="Arial;Courier New;Georgia;Helvetica;Times New Roman;Verdana;OpenDyslexic".split(";");this.m_guesses=$("#dji-cwu-number-of-guesses");this.m_font=$("#dji-cwu-text-font");this.m_color=$("#dji-cwu-text-color");this.m_background=$("#dji-cwu-text-background-color");this.m_size=$("#dji-cwu-text-size");this.m_imeSample=$("#dji-cwu-ime-sample");this.m_imeSampleHideTimer=null;this.__initialize();return this}CWETextOptions.instance=null;
CWETextOptions.prototype.__initialize=function(){var a=this,c=$("div[dji-cwu-template-id=dji-cwu-font-family]");this.m_guesses.on("change",function(b){if(b.value!=a.m_cweSettings.predictionGuesses()){var c=$("[dji-cwu-template-id=dji-cwu-number-of-guesses]");c.find("[dji-check]").removeAttr("dji-check");c.find("[dji-cwu-value='"+b.value+"']").attr("dji-check","");b.noSave||a.m_cweSettings.predictionGuesses(parseInt(b.value))}});this.m_font.on("change",function(b){c.find("[dji-check]").removeAttr("dji-check");
c.find("[dji-cwu-value='"+b.value+"']").attr("dji-check","");b.noSave||a.m_cweSettings.guessWindowFontFamily(a.m_fonts[b.value]);a.__updateSample(!0)});this.m_color.on("change",function(b){a.m_color.css({"background-color":b.color});b.noSave||a.m_cweSettings.guessWindowColor(b.color);a.__updateSample(!0)});this.m_background.on("change",function(b){a.m_background.css({"background-color":b.color});b.noSave||a.m_cweSettings.guessWindowBackgroundColor(b.color);a.__updateSample(!0)});$("body").on("dji-cwu-change-colors",
function(b){a.m_color.css({"background-color":b.color});a.m_background.css({"background-color":b.backgroundColor});b.noSave||(a.m_cweSettings.guessWindowColor(b.color),a.m_cweSettings.guessWindowBackgroundColor(b.backgroundColor));a.__updateSample(!0)});this.m_size.on("input change",function(b){var c=parseInt($(b.currentTarget).val());c+="%";$(b.currentTarget).closest(".dji-cwu-option-slider-item").find(".dji-cwu-slider-value").text(c);b.noSave||a.m_cweSettings.guessWindowFontSize(parseInt(c));b.hasOwnProperty("noImeSample")&&
!1!==b.noImeSample||a.__updateSample(!0)});this.m_imeSample.on("click",function(b){null!==a.m_imeSampleHideTimer&&(clearTimeout(a.m_imeSampleHideTimer),a.m_imeSampleHideTimer=null);a.m_imeSample.removeClass("dji-cwu-visible")});this.__load()};
CWETextOptions.prototype.__load=function(){if(this.m_cweSettings){this.m_guesses.find(".dji-cwu-option-item-value").text(this.m_cweSettings.predictionGuesses());$("[dji-cwu-template-id=dji-cwu-number-of-guesses]").find("[dji-cwu-value='"+this.m_cweSettings.predictionGuesses()+"']").attr("dji-check","");for(var a=this.m_cweSettings.guessWindowFontFamily(),c="",b=0,d=$("div[dji-cwu-template-id=dji-cwu-font-family]"),e=$("div[dji-cwu-template-id=dji-cwu-font-family-item]"),f=0;f<this.m_fonts.length;f++){var h=
CWEChromeUtilities.escapeHtml(this.m_fonts[f]);a===this.m_fonts[f]&&(c=h,b=f);var g=e.clone();g.find(".dji-cwu-menu-item-text").text(h);g.attr("dji-cwu-value",f);d.append(g)}d.find("[dji-cwu-value='"+b+"']").attr("dji-check","");this.m_font.find(".dji-cwu-option-item-value").text(c);this.m_color.css({"background-color":this.m_cweSettings.guessWindowColor()});this.m_background.css({"background-color":this.m_cweSettings.guessWindowBackgroundColor()});this.m_size.val(this.m_cweSettings.guessWindowFontSize()).trigger({type:"change",
noImeSample:!0,noSave:!0});this.__updateSample(!1)}};
CWETextOptions.prototype.__updateSample=function(a){cweMainView.windowOptions={scale:this.m_cweSettings.guessWindowScale(),fontFamily:this.m_cweSettings.guessWindowFontFamily(),textColor:this.m_cweSettings.guessWindowColor(),backgroundColor:this.m_cweSettings.guessWindowBackgroundColor()};if(a){var c=this;this.m_imeSample.addClass("dji-cwu-visible");null!==this.m_imeSampleHideTimer&&clearTimeout(this.m_imeSampleHideTimer);this.m_imeSampleHideTimer=setTimeout(function(){c.m_imeSampleHideTimer=null;
c.m_imeSample.removeClass("dji-cwu-visible")},15E3)}};