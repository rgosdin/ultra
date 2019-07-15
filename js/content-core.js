window.core = {};

window.core.is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
window.core.is_chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && !/OPR/.test(navigator.userAgent);
window.core.is_opera = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && /OPR/.test(navigator.userAgent);
window.core.is_edge = ['Edge'].indexOf(navigator.platform) !== -1;
window.core.is_chrome_os = /CrOS/.test(navigator.userAgent);
window.core.is_macintosh = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].indexOf(navigator.platform) !== -1;
window.core.is_windows = ['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(navigator.platform) !== -1;
window.core.is_linux = (!window.core.is_chrome_os || !window.core.is_macintosh) && navigator.platform.indexOf('Linux') !== -1;
window.core.path = 'filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/persistent/';
window.core.language = navigator.browserLanguage || navigator.language || navigator.userLanguage;

// https://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality
window.core.downScaleCanvas = function (cv, scale) {
    if (!(scale < 1) || !(scale > 0)) return cv;
    let sqScale = scale * scale; // square scale = area of source pixel within target
    let sw = cv.width; // source image width
    let sh = cv.height; // source image height
    let tw = Math.floor(sw * scale); // target image width
    let th = Math.floor(sh * scale); // target image height
    let sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
    let tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
    let tX = 0, tY = 0; // rounded tx, ty
    let w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
    // weight is weight of current source point within target.
    // next weight is weight of current source point within next target's point.
    let crossX = false; // does scaled px cross its current px right border ?
    let crossY = false; // does scaled px cross its current px bottom border ?
    let sBuffer = cv.getContext('2d').getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
    let tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
    let sR = 0, sG = 0, sB = 0; // source's current point r,g,b

    for (sy = 0; sy < sh; sy++) {
        ty = sy * scale; // y src position within target
        tY = 0 | ty;     // rounded : target pixel's y
        yIndex = 3 * tY * tw;  // line index within target array
        crossY = (tY !== (0 | (ty + scale)));
        if (crossY) { // if pixel is crossing botton target pixel
            wy = (tY + 1 - ty); // weight of point within target pixel
            nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
        }
        for (sx = 0; sx < sw; sx++, sIndex += 4) {
            tx = sx * scale; // x src position within target
            tX = 0 | tx;    // rounded : target pixel's x
            tIndex = yIndex + tX * 3; // target pixel index within target array
            crossX = (tX !== (0 | (tx + scale)));
            if (crossX) { // if pixel is crossing target pixel's right
                wx = (tX + 1 - tx); // weight of point within target pixel
                nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
            }
            sR = sBuffer[sIndex];   // retrieving r,g,b for curr src px.
            sG = sBuffer[sIndex + 1];
            sB = sBuffer[sIndex + 2];
            if (!crossX && !crossY) { // pixel does not cross
                // just add components weighted by squared scale.
                tBuffer[tIndex] += sR * sqScale;
                tBuffer[tIndex + 1] += sG * sqScale;
                tBuffer[tIndex + 2] += sB * sqScale;
            } else if (crossX && !crossY) { // cross on X only
                w = wx * scale;
                // add weighted component for current px
                tBuffer[tIndex] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tX+1) px
                nw = nwx * scale
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
            } else if (!crossX && crossY) { // cross on Y only
                w = wy * scale;
                // add weighted component for current px
                tBuffer[tIndex] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tY+1) px
                nw = nwy * scale
                tBuffer[tIndex + 3 * tw] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
            } else { // crosses both x and y : four target points involved
                // add weighted component for current px
                w = wx * wy;
                tBuffer[tIndex] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // for tX + 1; tY px
                nw = nwx * wy;
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
                // for tX ; tY + 1 px
                nw = wx * nwy;
                tBuffer[tIndex + 3 * tw] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                // for tX + 1 ; tY +1 px
                nw = nwx * nwy;
                tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                tBuffer[tIndex + 3 * tw + 5] += sB * nw;
            }
        } // end for sx
    } // end for sy

    // create result canvas
    let resCV = document.createElement('canvas');
    resCV.width = tw;
    resCV.height = th;
    let resCtx = resCV.getContext('2d');
    let imgRes = resCtx.getImageData(0, 0, tw, th);
    let tByteBuffer = imgRes.data;
    // convert float32 array into a UInt8Clamped Array
    let pxIndex = 0; //
    for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
        tByteBuffer[tIndex] = 0 | (tBuffer[sIndex]);
        tByteBuffer[tIndex + 1] = 0 | (tBuffer[sIndex + 1]);
        tByteBuffer[tIndex + 2] = 0 | (tBuffer[sIndex + 2]);
        tByteBuffer[tIndex + 3] = 255;
    }
    // writing result to canvas.
    resCtx.putImageData(imgRes, 0, 0);
    return resCV;
};
window.core.scaleCanvas = function (canvas) { // nimbus_screenshot
    if (localStorage.keepOriginalResolution === 'true') {
        if (window.is_chrome) canvas = window.core.downScaleCanvas(canvas, 1 / window.devicePixelRatio);
    } else {
        if (window.is_firefox) canvas = window.core.downScaleCanvas(canvas, window.devicePixelRatio);
    }
    return canvas;
};
window.core.getLocationParam = function () {
    const p = window.location.href.match(/\?(\w+)$/);
    return (p && p[1]) || '';
};
window.core.kbToMb = function (size, n) {
    return ((size) / 1024 / 1024).toFixed(n || 0) + ' MB';
};
window.core.fileToBlob = function (url, cb) {
    function errorHandler(e) {
        console.error(e);
    }

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.PERSISTENT, 10 * 1024 * 1024 * 1024, function (fs) {
        fs.root.getFile(url.replace(window.core.path, ''), {}, function (fileEntry) {
            fileEntry.file(function (file) {
                let reader = new FileReader();
                reader.onloadend = function (e) {
                    cb(new Blob([new Uint8Array(reader.result)]));
                };
                reader.readAsArrayBuffer(file);
            }, errorHandler);
        });
    }, errorHandler);
};
window.core.urlToBlob = function (url, cb) {
    function errorHandler(e) {
        console.error(e);
    }

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.PERSISTENT, 10 * 1024 * 1024 * 1024, function (fs) {
        fs.root.getFile(url, {}, function (fileEntry) {
            fileEntry.file(function (file) {
                let reader = new FileReader();
                reader.onloadend = function (e) {
                    cb && cb(new Blob([new Uint8Array(reader.result)]));
                };
                reader.readAsArrayBuffer(file);
            }, errorHandler);
        });
    }, errorHandler);
};
window.core.saveFile = function (name, blob, cb) {
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.PERSISTENT, 10 * 1024 * 1024 * 1024, function (fs) {
            let truncated = false;
            fs.root.getFile(name, {create: true}, function (fileEntry) {
                fileEntry.createWriter(function (writer) {
                    writer.onwriteend = function () {
                        if (!truncated) {
                            truncated = true;
                            this.truncate(this.position);
                            return;
                        }
                        cb && cb();
                    };

                    writer.onerror = console.error;
                    writer.write(blob);
                }, console.error);
            }, console.error);
        }, console.error
    );
};
window.core.dataUrlToBlob = function (dataURL) {
    let arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], {type: mime});
};
window.core.blobToDataURL = function (blob, cb) {
    let a = new FileReader();
    a.onload = function (e) {
        cb && cb(e.target.result);
    };
    a.readAsDataURL(blob);
};
window.core.checkDifferent = function (arr) {
    for (let i = 0, l = arr.length; i < l - 1; i++) {
        for (let j = i + 1; j < l; j++) {
            if (arr[i] === arr[j] && +arr[i] !== 0) {
                return false;
            }
        }
    }
    return true;
};
window.core.dataUrlToArrayBuffer = function (dataURL, cb) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", dataURL, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
        cb && cb(this.response)
    };
    xhr.send();
};
window.core.dataURLtoBlob = function (dataURL) {
    console.log(dataURL)
    let arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
};
window.core.sendMessage = function (data, cb) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data, {}, cb);
    });
};
window.core.executeFile = function (files, cb) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
        let tab_id = tabs[0].id;

        console.log('executeFile', tabs[0], files);

        files.reverse();
        let load = function (file, cb) {
            if (/\.css$/.test(file)) {
                chrome.tabs.insertCSS(tab_id, {file: file});
                cb && cb();
            } else if (/\.js/.test(file)) {
                chrome.tabs.executeScript(tab_id, {file: file}, cb);
            } else {
                chrome.tabs.executeScript(tab_id, {code: file}, cb);
            }
        };

        (function check() {
            if (!files.length) return cb && cb();
            load(files[files.length - 1], function () {
                files.splice(files.length - 1, 1);
                check();
            })
        })();
    });
};
window.core.imageToCanvas = function (dataUrl, cb) {
    let image = new Image();
    image.onload = function () {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);

        cb && cb(canvas)
    };
    image.src = dataUrl;
};
window.core.checkWaterMark = function (cb) {
    if (localStorage.enableWatermark !== 'false') {
        if (localStorage.typeWatermark === 'image') {
            let watermark = new Image();
            watermark.onload = function () {
                cb && cb(true);
            };
            watermark.onerror = function () {
                cb && cb(false);
            };
            watermark.src = localStorage.fileWatermark;
        } else {
            cb && cb(true);
        }
    } else {
        cb && cb(false);
    }
};
window.core.getWaterMark = function (cb) {
    const c = document.createElement('canvas');
    const ctx = c.getContext("2d");
    const percent = localStorage.percentWatermark;

    if (localStorage.typeWatermark === 'image') {
        let watermark = new Image();
        watermark.onload = function () {
            const width = watermark.width * percent;
            const height = watermark.height * percent;
            c.width = width;
            c.height = height;

            ctx.globalAlpha = +localStorage.alphaWatermark;
            ctx.drawImage(watermark, 0, 0, width, height);
            cb && cb(c);
        };
        watermark.src = localStorage.fileWatermark;
    } else {
        const font = core.sizeFont({
            text: localStorage.textWatermark,
            size: localStorage.sizeWatermark,
            family: localStorage.fontWatermark
        });

        document.body.appendChild(c);

        c.width = font.w;
        c.height = font.h;
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.globalAlpha = +localStorage.alphaWatermark;
        ctx.fillStyle = localStorage.colorWatermark;
        ctx.font = 'bold ' + localStorage.sizeWatermark + 'px ' + localStorage.fontWatermark;
        ctx.fillText(localStorage.textWatermark, -10000, -10000);

        window.setTimeout(function (canvas, context) {
            context.fillText(localStorage.textWatermark, 0, 0, font.w);
            document.body.removeChild(canvas);
            cb && cb(canvas);
        }.bind(this, c, ctx), 100);
    }
};
window.core.sizeFont = function (data) {
    let body = document.getElementsByTagName("body")[0];
    let dummy = document.createElement("div");
    dummy.appendChild(document.createTextNode(data.text));
    dummy.setAttribute("style", "font-family: " + data.family + "; font-size: " + data.size + "px; float: left; white-space: nowrap; overflow: hidden;");
    body.appendChild(dummy);
    const result = {w: dummy.offsetWidth + (data.size * 0.4), h: dummy.offsetHeight};
    body.removeChild(dummy);
    return result;
};
window.core.setOption = function (key, value) {
    if (window.core.is_chrome) return;
    window.core.sendMessage({operation: 'set_option', key: key, value: value});
};
window.core.setEvent = function (key, value) {
    chrome.runtime.sendMessage({operation: 'event', type: key, value: value});
};

if (window.is_firefox) window.core.path = 'filesystem:moz-extension://' + chrome.i18n.getMessage("@@extension_id") + '/persistent/';

document.addEventListener('DOMContentLoaded', function () {
    let show_chrome_only = document.getElementsByClassName("show-chrome-only");
    let show_firefox_only = document.getElementsByClassName("show-firefox-only");
    let hide_chrome_only = document.getElementsByClassName("hide-chrome-only");
    let hide_firefox_only = document.getElementsByClassName("hide-firefox-only");
    let hide_linux_only = document.getElementsByClassName("hide-linux-only");

    for (let sco of show_chrome_only) {
        let display = sco.style.display;
        sco.style.display = 'none';
        if (window.core.is_chrome) sco.style.display = display;
    }

    for (let sfo of show_firefox_only) {
        let display = sfo.style.display;
        sfo.style.display = 'none';
        if (window.core.is_firefox) sfo.style.display = display;
    }

    for (let hco of hide_chrome_only) {
        if (window.core.is_chrome) hco.style.display = 'none';
    }

    for (let hfo of hide_firefox_only) {
        if (window.core.is_firefox) hfo.style.display = 'none';
    }

    for (let hfo of hide_linux_only) {
        if (window.core.is_linux) hfo.style.display = 'none';
    }

});