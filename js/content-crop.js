/*
 * "This work is created by NimbusWeb and is copyrighted by NimbusWeb. (c) 2017 NimbusWeb.
 * You may not replicate, copy, distribute, or otherwise create derivative works of the copyrighted
 * material without prior written permission from NimbusWeb.
 *
 * Certain parts of this work contain code licensed under the MIT License.
 * https://www.webrtc-experiment.com/licence/ THE SOFTWARE IS PROVIDED "AS IS",
 * WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * */

(function ($) {

    if (!window.thisFragment) {
        let captureCrop = {
            init: function () {
                window.thisCrop = false;
            }
        }
    }


    let positionLoupe = {x: 10, y: 10};
    let format = 'png';
    let quality = 90;
    let imgdata;
    let cropper;

    function showLoupe(e) {
        let $loupe = $("#nsc_crop_loupe").show();

        let img = document.getElementById('nsc_crop_image');
        let canvas = document.getElementById('nsc_crop_loupe_canvas');
        let context = canvas.getContext('2d');
        let wi = document.documentElement.clientWidth;
        let hi = document.documentElement.clientHeight;
        let z = window.core.is_chrome ? window.devicePixelRatio : 1;
        let x = (e.clientX - 10) * z;
        let y = (e.clientY - 10) * z;
        let h = 30;
        let w = 30;
        let x2 = 0;
        let y2 = 0;
        let lh = $loupe.height() + 10;
        let lw = $loupe.width() + 10;

        if (e.clientX < lw && e.clientY < lh) {
            positionLoupe = {x: wi - lw, y: hi - lh};
        }
        if (e.clientX > wi - lw && e.clientY > hi - lh) {
            positionLoupe = {x: 10, y: 10};
        }

        $loupe.css({top: positionLoupe.y, left: positionLoupe.x});
        $loupe.find('div').text('X = ' + Math.ceil(e.clientX) + ' : Y = ' + Math.ceil(e.clientY));

        context.canvas.width = 240;
        context.canvas.height = 240;

        if (x < 0) {
            x2 = (-8) * x;
            x = 0;
        }
        if (y < 0) {
            y2 = (-8) * y;
            y = 0;
        }
        if ((e.clientX + 15) > wi) {
            w = wi - e.clientX + 14;
        }
        if ((e.clientY + 15) > hi) {
            h = hi - e.clientY + 14;
        }

        let zoom = 8;
        let offctx = document.createElement('canvas').getContext('2d');
        offctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        let imgDt = offctx.getImageData(0, 0, w, h).data;

        for (let xx = 0; xx < w; ++xx) {
            for (let yy = 0; yy < h; ++yy) {
                let i = (yy * w + xx) * 4;
                let r = imgDt[i];
                let g = imgDt[i + 1];
                let b = imgDt[i + 2];
                let a = imgDt[i + 3];
                context.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
                context.fillRect(x2 + xx * zoom, y2 + yy * zoom, zoom, zoom);
            }
        }
        context.lineWidth = 1;
        context.strokeStyle = "#FF6600";
        context.beginPath();
        context.moveTo(120, 0);
        context.lineTo(120, 240);
        context.moveTo(0, 120);
        context.lineTo(240, 120);
        context.stroke();
    }

    function destroyCrop() {
        $('#nsc_crop').remove();
        $('html').css("overflow", "auto");
        window.thisCrop = false;
        cropper.destroy()
    }

    function cropImage(data) {
        let img = new Image();
        img.src = document.getElementById('nsc_crop_image').src;
        img.onload = function () {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            canvas.width = data.width;
            canvas.height = data.height;
            context.drawImage(img, data.x, data.y, data.width, data.height, 0, 0, data.width, data.height);
            imgdata = canvas.toDataURL('image/' + (format === 'jpg' ? 'jpeg' : 'png'), quality / 100);

            chrome.runtime.sendMessage({operation: 'set_screen', dataUrl: imgdata});
        };
    }

    function createCoords() {
        if ($("#ns_crop_button").length || $("#ns_crop_more").length) {
            $('#ns_crop_button').show();
            $('#ns_crop_more').show();
            return;
        }

        let ns_crop_buttons = $('<div/>', {
            'id': 'ns_crop_button',
            'class': 'ns-crop-buttons'
        });

        $('<button/>', {
            html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnEdit") + '</span>',
            'class': 'ns-btn edit'
        }).on('click', function () {
            chrome.runtime.sendMessage({operation: 'open_edit_page'});
            destroyCrop();
        }).appendTo(ns_crop_buttons);


        $('<button/>', {
            html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnSave") + '</span>',
            'class': 'ns-btn save'
        }).on('click', function () {
            chrome.runtime.sendMessage({operation: 'download_screen_content'});
            destroyCrop();
        }).appendTo(ns_crop_buttons);


        $('<button/>', {
            html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnCancel") + '</span>',
            'class': 'ns-btn cancel'
        }).on('click', function () {
            destroyCrop();
        }).appendTo(ns_crop_buttons);

        let ns_crop_more = $('<div/>', {
            html: '<button></button>',
            'id': 'ns_crop_more',
            'class': 'ns-crop-more'
        });

        let ns_more_container = $('<div/>', {
            'id': 'ns_more_container',
            'class': 'ns-crop-more-container'
        });

        $('<button/>', {
            html: '<span>Nimbus</span>',
            'class': 'ns-btn nimbus'
        }).on('click', function () {
            chrome.runtime.sendMessage({operation: 'send_to', path: 'nimbus'});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Slack</span>',
            'class': 'ns-btn slack'
        }).on('click', function () {
            chrome.runtime.sendMessage({operation: 'send_to', path: 'slack'});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Google Drive</span>',
            'class': 'ns-btn google'
        }).on('click', function () {
            chrome.runtime.sendMessage({operation: 'send_to', path: 'google'});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Print</span>',
            'class': 'ns-btn print'
        }).on('click', function () {
            chrome.runtime.sendMessage({operation: 'send_to', path: 'print'});
            destroyCrop();
        }).appendTo(ns_more_container);

        if (window.core.is_firefox) {
            $('<button/>', {
                html: '<span>' + chrome.i18n.getMessage("cropBtnCopy") + '</span>',
                'class': 'ns-btn copy'
            }).on('click', function () {
                chrome.runtime.sendMessage({operation: 'copy_to_clipboard', dataUrl: imgdata});
                destroyCrop();
            }).appendTo(ns_more_container);
        }

        ns_crop_more.append(ns_more_container);
        $('.cropper-crop-box').append('<div id="ns_crop_screenshot_size" class="ns-crop-size"></div>').append(ns_crop_buttons).append(ns_crop_more);
    }

    function showCoords(data) {
        let z = window.core.is_chrome ? window.devicePixelRatio : 1;

        $('#ns_crop_screenshot_size').text(data.width + ' x ' + data.height);

        if ((data.height + data.y + 60) > window.innerHeight * z) {
            $('#ns_crop_button').css({'bottom': '0', 'top': 'auto'});
            $('#ns_crop_more').css({'bottom': '0', 'top': 'auto'});
        } else {
            $('#ns_crop_button').css({'bottom': 'auto', 'top': '100%'});
            $('#ns_crop_more').css({'bottom': 'auto', 'top': '100%'});
        }

        if (data.width < 325) $('#ns_crop_more').css({'bottom': '0', 'top': 'auto'});

        if (data.y < 25) $('#ns_crop_screenshot_size').css({'bottom': 'auto', 'top': '0'});
        else $('#ns_crop_screenshot_size').css({'bottom': '100%', 'top': 'auto'});
    }

    chrome.runtime.sendMessage({operation: 'get_info_screen'}, function (response) {
        window.thisCrop = true;

        format = response.format;
        quality = response.quality;

        $('html').css("overflow", "hidden");
        let $nsc_crop = $('<div/>', {id: 'nsc_crop'});
        $nsc_crop.append('<div id="nsc_crop_loupe" class="nsc-crop-loupe"><canvas id="nsc_crop_loupe_canvas"></canvas><div></div></div>');
        $nsc_crop.append($('<img/>', {id: 'nsc_crop_image', src: response.image}));

        $nsc_crop.appendTo('body');

        const image = document.getElementById('nsc_crop_image');
        cropper = new Cropper(image, {
            autoCrop: false,
            zoomable: false,
            viewMode: 1,
            toggleDragModeOnDblclick: false,
            ready: function () {
                $('.cropper-bg').css('background-image', 'inherit');

                chrome.runtime.sendMessage({operation: 'get_crop_position'}, function (response) {
                    console.log(response)
                    if (response.x && response.y && response.width && response.height) {
                        cropper.crop().setCropBoxData({left: response.x, top: response.y, width: response.width, height: response.height});
                        let data = cropper.getData(true);
                        createCoords(data);
                        showCoords(data);
                    }
                });
            },
            cropstart: function (event) {
                showLoupe(event.detail.originalEvent);

                let data = cropper.getData(true);
                createCoords(data);

                $('#ns_crop_button').hide();
                $('#ns_crop_more').hide();
            },
            cropmove: function (event) {
                let data = cropper.getData(true);

                showLoupe(event.detail.originalEvent);
                showCoords(data);
            },
            cropend: function (e) {
                let data = cropper.getData(true);
                createCoords(data);
                cropImage(data);
            },
            crop: function (event) {

            }
        });

        $nsc_crop.on('mousemove', showLoupe);

        window.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27) destroyCrop();
        }, false);
    })
}(jQuery));