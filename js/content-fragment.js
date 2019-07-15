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
        let captureFragment = {
            position: {},
            border: 3,
            init: function () {
                window.thisFragment = true;

                this.eventsElements(document.body);

                $(document.body)
                    .on('mouseenter', this.mouseEnter.bind(this))
                    .on('mouseleave', this.mouseLeave.bind(this))
                    .trigger('mouseenter');

                $('*').on('contextmenu', function (e) {
                    e.preventDefault();
                    window.captureFragment.removeFragment(true);
                    return false;
                });
            },
            removeFragment: function (all) {
                if (all) {
                    this.eventsElements(document.body, true);
                    window.thisFragment = undefined;
                    captureFragment = undefined;
                }

                $(document.body)
                    .off('mouseenter'/*, this.mouseEnter*/)
                    .off('mouseleave'/*, this.mouseLeave*/)
                    .off('mousemove touchmove'/*, this.mouseMove*/)
                    .off('mouseup touchend'/*, this.mouseUp*/);

                $('*').off('contextmenu');

                $('.capture-fragment-border').remove();
                $('.fragment-box').remove();
            },
            eventStop: function (e) {
                e.preventDefault();
                e.stopPropagation();
            },
            eventsElements: function (elem, remove, cb) {
                if (!remove) {
                    $(elem).on('click', this.eventStop)
                } else {
                    $(elem).off('click', this.eventStop)
                }

                const childrenElems = $(elem).children();
                for (let i = 0, len = childrenElems.length; i < len; i++) {
                    this.eventsElements(childrenElems[i], remove);
                    if (i === len + 1) cb || cb();
                }
            },
            viewFragment: function (dataUrl, position) {
                let container_fragment = $('<div/>', {
                    id: 'fragment_box',
                    class: 'fragment-box'
                });

                let fragment_img = $('<img/>', {
                    id: 'fragment_image',
                    class: 'fragment-image',
                    src: dataUrl,
                    width: position.w + 'px',
                    height: position.h + 'px'
                });

                let ns_crop_buttons = $('<div/>', {
                    'id': 'screenshotbutton',
                    'class': 'ns-crop-buttons bottom'
                });

                $('<button/>', {
                    html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnEdit") + '</span>',
                    'class': 'ns-btn edit'
                }).on('click', function () {
                    chrome.runtime.sendMessage({operation: 'open_edit_page'});
                    captureFragment.removeFragment(true);
                }).appendTo(ns_crop_buttons);

                    $('<button/>', {
                        html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnSave") + '</span>',
                        'class': 'ns-btn save'
                    }).on('click', function () {
                        chrome.runtime.sendMessage({operation: 'download_screen_content'});
                        captureFragment.removeFragment(true);
                    }).appendTo(ns_crop_buttons);

                $('<button/>', {
                    html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnCancel") + '</span>',
                    'class': 'ns-btn cancel'
                }).on('click', function () {
                    captureFragment.removeFragment(true);
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
                    chrome.runtime.sendMessage({operation: 'send_to', path: 'nimbus', dataUrl: dataUrl});
                    captureFragment.removeFragment(true);
                }).appendTo(ns_more_container);

                $('<button/>', {
                    html: '<span>Slack</span>',
                    'class': 'ns-btn slack'
                }).on('click', function () {
                    chrome.runtime.sendMessage({operation: 'send_to', path: 'slack', dataUrl: dataUrl});
                    captureFragment.removeFragment(true);
                }).appendTo(ns_more_container);

                $('<button/>', {
                    html: '<span>Google Drive</span>',
                    'class': 'ns-btn google'
                }).on('click', function () {
                    chrome.runtime.sendMessage({operation: 'send_to', path: 'google', dataUrl: dataUrl});
                    captureFragment.removeFragment(true);
                }).appendTo(ns_more_container);

                $('<button/>', {
                    html: '<span>Print</span>',
                    'class': 'ns-btn print'
                }).on('click', function () {
                    chrome.runtime.sendMessage({operation: 'send_to', path: 'print', dataUrl: dataUrl});
                    captureFragment.removeFragment(true);
                }).appendTo(ns_more_container);

                if (window.is_firefox) {
                    $('<button/>', {
                        html: '<span>' + chrome.i18n.getMessage("cropBtnCopy") + '</span>',
                        'class': 'ns-btn copy'
                    }).on('click', function () {
                        chrome.runtime.sendMessage({operation: 'copy_to_clipboard', dataUrl: dataUrl});
                        captureFragment.removeFragment(true);
                    }).appendTo(ns_more_container);
                }

                ns_crop_more.append(ns_more_container);

                const window_size = {
                    x: Math.round($(window).scrollLeft()),
                    y: Math.round($(window).scrollTop()),
                    w: Math.round($(window).width()),
                    h: Math.round($(window).height())
                };

                if ((position.h + position.y + 60) > window_size.y + window_size.h) {
                    ns_crop_buttons.css({'bottom': '0', 'top': 'auto'});
                    ns_crop_more.css({'bottom': '0', 'top': 'auto'});
                } else {
                    ns_crop_buttons.css({'bottom': 'auto', 'top': '100%'});
                    ns_crop_more.css({'bottom': 'auto', 'top': '100%'});
                }

                if (position.w < 325) ns_crop_more.css({'bottom': '0', 'top': 'auto'});

                container_fragment.append(fragment_img).append(ns_crop_buttons).append(ns_crop_more)
                    .css({
                        top: position.y - this.border,
                        left: position.x - this.border,
                        'border-width': this.border
                    });
                $(document.body).append(container_fragment);

                this.mouseUpActive = false;
            },
            viewBorder: function () {
                if (!$('.capture-fragment-border').length) {
                    $(document.body).append(
                        $('<div>', {class: 'capture-fragment-border', id: 'capture_fragment_border_top'}),
                        $('<div>', {class: 'capture-fragment-border', id: 'capture_fragment_border_bottom'}),
                        $('<div>', {class: 'capture-fragment-border', id: 'capture_fragment_border_left'}),
                        $('<div>', {class: 'capture-fragment-border', id: 'capture_fragment_border_right'})
                    );
                }
                $('#capture_fragment_border_top').css({top: this.position.y, left: this.position.x, width: this.position.w, height: this.border});
                $('#capture_fragment_border_bottom').css({top: this.position.y + this.position.h - this.border, left: this.position.x, width: this.position.w, height: this.border});
                $('#capture_fragment_border_left').css({top: this.position.y, left: this.position.x, width: this.border, height: this.position.h});
                $('#capture_fragment_border_right').css({top: this.position.y, left: this.position.x + this.position.w - this.border, width: this.border, height: this.position.h});
            },
            mouseMove: function (e) {
                let $elem = $(e.target);

                if ($elem.closest('.fragment-box').length) return;

                this.position = {
                    x: Math.round($elem.offset().left),
                    y: Math.round($elem.offset().top),
                    w: Math.round($elem.outerWidth()),
                    h: Math.round($elem.outerHeight())
                };

                this.viewBorder();
            },
            mouseUpActive: false,
            mouseUp: function (e) {
                if (e.which === 3) return false;

                let $elem = $(e.target);

                if ($elem.closest('.fragment-box').length || this.mouseUpActive) return false;

                this.mouseUpActive = true;
                this.removeFragment();

                const window_size = {
                    x: Math.round($(window).scrollLeft()),
                    y: Math.round($(window).scrollTop()),
                    w: Math.round($(window).width()),
                    h: Math.round($(window).height())
                };
                const position = {
                    x: this.position.x,
                    y: this.position.y,
                    w: this.position.w,
                    h: this.position.h
                };

                window.setTimeout(function () {
                    chrome.runtime.sendMessage({operation: 'generate_fragment', position: position, window_size: window_size, z: window.core.is_chrome ? window.devicePixelRatio : 1});
                }.bind(this), 200);

            },
            mouseEnter: function (e) {
                $(document.body).on('mousemove touchmove', this.mouseMove.bind(this));
                $(document.body).on('mouseup touchend', this.mouseUp.bind(this));
            },
            mouseLeave: function (e) {
                $('.capture-fragment-border').remove();
                $(document.body).off('mousemove touchmove', this.mouseMove.bind(this));
                $(document.body).off('mouseup touchend', this.mouseUp.bind(this));
            }
        };

        window.addEventListener('keydown', function (e) {
            if (e.keyCode === 27) captureFragment.removeFragment(true);
        }, false);

        chrome.runtime.onMessage.addListener(function (req) {
            if (req.operation === 'content_fragment_scroll') {
                const speed = Math.abs(window.scrollY - req.scroll.y) * 0.5;
                $('html').stop(true).animate({
                    scrollTop: req.scroll.y
                }, speed, function () {
                    const window_size = {
                        x: Math.round($(window).scrollLeft()),
                        y: Math.round($(window).scrollTop()),
                        w: Math.round($(window).width()),
                        h: Math.round($(window).height())
                    };
                    chrome.runtime.sendMessage({operation: 'generate_fragment', position: req.position, window_size: window_size, z: window.core.is_chrome ? window.devicePixelRatio : 1});
                });
            }

            if (req.operation === 'content_set_fragment_image') {
                captureFragment.removeFragment();
                captureFragment.viewFragment(req.image, req.position);
            }
        });

        captureFragment.init();
    }
})(jQuery);