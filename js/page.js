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

(function () {
    window.thisEr = true;
    let scroll = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        crop: false
    };
    let hideFixedElements = false;
    let fixedElements = [];
    let tik = null;
    let keys = {37: 1, 38: 1, 39: 1, 40: 1};

    let endCapture = function () {
        window.clearTimeout(tik);
        tik = null;
        window.thisEr = false;

        beforeClearCapture();
        // enableFixedPosition(true);
        enableScroll();
        removeMackPage();
    };

    if (!window.hasScreenCapturePage) {
        window.hasScreenCapturePage = true;
        chrome.runtime.onMessage.addListener(function (request, sender, callback) {
            if (request.operation === 'content_scroll_page') {
                // console.log(request);
                scroll.crop = request.scroll_crop;
                hideFixedElements = request.hide_fixed_elements;

                if (scroll.crop === true) {
                    scroll.x = request.x;
                    scroll.y = request.y;
                    scroll.width = request.width;
                    scroll.height = request.height;
                }
                // enableFixedPosition(true);
                getPositions(callback);
                return true;
            }
        });

        window.addEventListener('keydown', function (evt) {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                endCapture();
            }
        }, false);
        window.addEventListener('contextmenu', function (e) {
            endCapture();
            return true;
        }, false);
    }

    function enableFixedPosition(enableFlag) {
        if (enableFlag && !hideFixedElements) {
            console.log(fixedElements);
            for (let i = 0, l = fixedElements.length; i < l; ++i) {
                fixedElements[i].style.cssText = fixedElements[i].style.cssText.replace(/opacity:[^!]+!important; animation:[^!]+!important;/g, '');
            }
            fixedElements = [];
        } else {
            let $vk_layer_wrap = document.querySelectorAll('#wk_layer_wrap');

            if (location.host === 'vk.com' && $vk_layer_wrap.length && $vk_layer_wrap[0].style.display === 'block') {
                fixedElements = document.querySelectorAll('#chat_onl_wrap, #wk_right_nav, #wk_left_arrow_bg, #wk_right_arrow_bg');
            } else {
                let nodeIterator = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT, null, false);
                let currentNode;
                while (currentNode = nodeIterator.nextNode()) {
                    let nodeComputedStyle = document.defaultView.getComputedStyle(currentNode, "");
                    if (!nodeComputedStyle) return;
                    if (nodeComputedStyle.getPropertyValue("position") === "fixed" || nodeComputedStyle.getPropertyValue("position") === "sticky") {
                        fixedElements.push(currentNode);
                    }
                }
            }

            for (let k = 0, len = fixedElements.length; k < len; ++k) {
                fixedElements[k].style.cssText += 'opacity: 0 !important; animation: none !important';
            }
        }
    }

    function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function addedMackPage() {
        let body = document.body,
            html = document.documentElement,
            page_w = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            page_h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        let div = document.createElement('div');
        div.id = 'nimbus_screenshot_mack_page';
        div.style.width = page_w + 'px';
        div.style.height = page_h + 'px';
        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = '0';
        div.style.zIndex = '99999999999999999999999999999';

        body.appendChild(div);
    }

    function removeMackPage() {
        let node = document.getElementById('nimbus_screenshot_mack_page');
        if (node) node.parentElement.removeChild(node);
    }

    function disableScroll() {
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
        document.onkeydown = preventDefaultForScrollKeys;
    }

    function enableScroll() {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }

    function getScrollbarWidth() {
        let width = 18;
        try {
            let inner = document.createElement('p');
            inner.style.width = "100%";
            inner.style.height = "200px";
            inner.style.display = "block";

            let outer = document.createElement('div');
            outer.style.position = "absolute";
            outer.style.top = "0px";
            outer.style.left = "0px";
            outer.style.visibility = "hidden";
            outer.style.width = "200px";
            outer.style.height = "150px";
            outer.style.overflow = "hidden";
            outer.appendChild(inner);

            document.body.appendChild(outer);
            let w1 = inner.offsetWidth;
            outer.style.overflow = 'scroll';
            let w2 = inner.offsetWidth;
            if (w1 === w2) w2 = outer.clientWidth;

            document.body.removeChild(outer);

            width = (w1 - w2);
        } catch (e) {
            // console.log(e)
        }
        return width;
    }


    function getPositions(cb) {
        // document.body.scrollTop = 0;
        window.scrollTo(0, 1000);

        afterClearCapture();
        disableScroll();
        // addedMackPage();

        const body = document.body;
        const html = document.documentElement;

        let totalWidth = [], totalHeight = [];
        if (html && html.clientWidth) totalWidth.push(html.clientWidth);
        if (html && html.scrollWidth) totalWidth.push(html.scrollWidth);
        if (html && html.offsetWidth) totalWidth.push(html.offsetWidth);
        // if (body && body.scrollWidth) totalWidth.push(body.scrollWidth);
        if (body && body.offsetWidth) totalWidth.push(body.offsetWidth);

        if (html && html.clientHeight) totalHeight.push(html.clientHeight);
        if (html && html.scrollHeight) totalHeight.push(html.scrollHeight);
        if (html && html.offsetHeight) totalHeight.push(html.offsetHeight);
        // if (body && body.scrollHeight) totalHeight.push(body.scrollHeight);
        if (body && body.offsetHeight) totalHeight.push(body.offsetHeight);

        totalWidth = Math.max.apply(null, totalWidth);
        totalHeight = Math.max.apply(null, totalHeight);

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let arrangements = [];
        let yPos = totalHeight - windowHeight;
        let xPos = 0;

        const scrollWidth = getScrollbarWidth();
        const hasVScroll = (totalHeight > windowHeight);
        if (hasVScroll) {
            totalWidth += scrollWidth;
        }

        const hasHScroll = (totalWidth > windowWidth - (hasVScroll ? scrollWidth : 0));

        if (hasHScroll) {
            totalHeight += scrollWidth;
            yPos = totalHeight - windowHeight;
        }

        let elems = document.getElementsByTagName("*");
        let elems_scroll = [];

        if (body) {
            for (let i = 0, elems_length = elems.length, parent_scroll_size, parent_rect, parent_overflow_y, elem_rect; i < elems_length; i++) {
                if (elems[i].tagName === 'HTML') continue;
                if (elems[i].tagName === 'BODY') continue;
                if (elems[i].parentNode.tagName === 'BODY') continue;

                parent_scroll_size = Math.ceil(Math.max(elems[i].parentNode.clientHeight, elems[i].parentNode.scrollHeight, elems[i].parentNode.offsetHeight));
                parent_rect = elems[i].parentNode.getBoundingClientRect();
                elem_rect = elems[i].getBoundingClientRect();
                parent_overflow_y = document.defaultView.getComputedStyle(elems[i].parentNode, "").getPropertyValue("overflow-y");

                if (Math.ceil(windowWidth) < Math.ceil(parent_rect.width) * 2
                    && Math.ceil(parent_rect.height) + 5 < parent_scroll_size
                    && Math.ceil(parent_rect.width) > 5
                    && Math.ceil(parent_rect.height) > 5
                    && (parent_overflow_y === 'scroll' || parent_overflow_y === 'auto')
                    && elem_rect.left + elem_rect.width > 0 && elem_rect.top + elem_rect.height > 0
                    // && elem_rect.width > 5 && elem_rect.height > 5
                    && elem_rect.left < windowWidth && elem_rect.top < windowHeight) {

                    if (elems[i].parentNode.classList.contains('is_added_scroll_elem')) continue;

                    totalHeight += (parent_scroll_size - parent_rect.height);

                    for (let b = 0; b < parent_scroll_size; b += parent_rect.height) {
                        elems[i].parentNode.classList.add('is_added_scroll_elem');

                        elems_scroll.push({
                            x: 0,
                            y: b,
                            w: windowWidth,
                            h: parent_scroll_size - b > parent_rect.height ? parent_rect.height : parent_scroll_size - b,
                            elem: {
                                x: Math.ceil(parent_rect.left),
                                y: Math.ceil(parent_rect.top),
                                w: Math.ceil(parent_rect.width),
                                h: Math.ceil(parent_rect.height),
                                dom: elems[i].parentNode
                            }
                        });
                    }
                }
            }

            for (let c = 0, clear_elems = document.getElementsByClassName('is_added_scroll_elem'); c < clear_elems.length; c++) {
                clear_elems[c].classList.remove('is_added_scroll_elem');
            }
        }

        if (scroll.crop === true) {
            window.scrollTo(0, scroll.y);
            totalWidth = scroll.width;
            totalHeight = scroll.height;
            yPos = scroll.y + scroll.height;
            while (yPos >= scroll.y) {
                yPos -= windowHeight;
                yPos += (hasHScroll ? scrollWidth : 0);
                xPos = scroll.x;
                while (xPos < scroll.x + scroll.width) {
                    arrangements.push({
                        x: xPos,
                        x_crop: scroll.x,
                        x_shift: 0,
                        y: yPos >= scroll.y ? yPos : scroll.y,
                        y_crop: yPos - scroll.y < 0 ? 0 : yPos - scroll.y,
                        y_shift: window.pageYOffset >= scroll.y ? 0 : scroll.y - window.pageYOffset,
                        w: scroll.width,
                        h: scroll.height >= windowHeight ? windowHeight : scroll.height,
                        elem: null
                    });
                    xPos += windowWidth;
                    xPos -= (hasVScroll ? scrollWidth : 0);
                }
            }
        } else {
            let elem_scroll;
            while (yPos > -windowHeight) {
                xPos = 0;
                while (xPos < totalWidth) {
                    let added_elems_scroll = null;

                    if (elems_scroll.length) {
                        elem_scroll = elems_scroll[0].elem;
                        if (elem_scroll.y >= yPos - (hasHScroll ? scrollWidth : 0) && elem_scroll.y + elem_scroll.h <= yPos - (hasHScroll ? scrollWidth : 0) + windowHeight) added_elems_scroll = elems_scroll;
                    }

                    if (added_elems_scroll) {
                        if (elem_scroll.y > yPos) arrangements.push({
                            x: xPos,
                            y: yPos > 0 ? yPos : 0,
                            w: windowWidth,
                            h: elem_scroll.y - yPos,
                            elem: null
                        });

                        arrangements = arrangements.concat(added_elems_scroll);

                        if (elem_scroll.y + elem_scroll.h < yPos + windowHeight) arrangements.push({
                            x: xPos,
                            y: elem_scroll.y + elem_scroll.h,
                            w: windowWidth,
                            h: (yPos + windowHeight) - (elem_scroll.y + elem_scroll.h),
                            elem: null
                        });
                    } else {
                        let shiftX = xPos > totalWidth - windowWidth ? xPos - (totalWidth - windowWidth) : 0;
                        arrangements.push({
                            x: xPos - shiftX,
                            y: yPos > 0 ? yPos : 0,
                            w: windowWidth,
                            h: elem_scroll ? (elem_scroll.y < (yPos > 0 ? yPos : 0) + windowHeight ? (yPos > 0 ? yPos : 0) - elem_scroll.y : windowHeight) : windowHeight,
                            elem: null
                        });
                    }
                    xPos += windowWidth;
                    xPos -= (hasVScroll ? scrollWidth : 0);
                }
                yPos -= windowHeight;
                yPos += (hasHScroll ? scrollWidth : 0);
            }
        }

        let last_elem, last_elem_overflow;

        console.log(Object.assign({}, arrangements));

        (function scrollTo() {
            afterClearCapture();

            if (!arrangements.length) {
                endCapture();

                if (scroll.crop !== true) window.scrollTo(0, 0);

                chrome.runtime.sendMessage({operation: 'capture_page_open'});
                return cb && cb();
            }

            let next = arrangements.shift();

            let data = {
                operation: 'capture_page',
                scroll_crop: scroll.crop,
                x: next.x,
                y: next.y,
                x_crop: next.x_crop || 0,
                y_crop: next.y_crop || 0,
                x_shift: next.x_shift || 0,
                y_shift: next.y_shift || 0,
                w: next.w,
                h: next.h,
                totalWidth: totalWidth,
                totalHeight: totalHeight,
                windowWidth: windowWidth,
                windowHeight: windowHeight,
                hasVScroll: hasVScroll,
                hasHScroll: hasHScroll,
                scrollWidth: scrollWidth,
                z: window.core.is_chrome ? window.devicePixelRatio : 1,
                elem: null
            };

            if (next.elem) {
                if (location.host === 'www.charmeck.org') { // TODO: устранить эту бубуйню
                    next.elem.dom.style.position = 'absolute';
                    next.elem.dom.style.top = 0;
                    next.elem.dom.style.left = 0;
                    next.elem.dom.style.right = 0;
                    next.elem.dom.style.bottom = 0;
                }
                last_elem_overflow = document.defaultView.getComputedStyle(next.elem.dom).getPropertyValue("overflow");
                next.elem.dom.style.overflow = "hidden";
                last_elem = next.elem.dom;
                next.elem.dom.scrollTop = next.y;
                data.elem = {
                    x: next.elem.x,
                    y: next.elem.y,
                    w: next.elem.w,
                    h: next.elem.h
                }
            }

            if (location.host === 'docs.google.com' && document.getElementsByClassName('kix-zoomdocumentplugin-outer').length) {
                data.hasVScroll = false;
                data.hasHScroll = false;
            }

            console.log(data);

            let timer = timeScrollEntirePage || 200;
            window.scrollTo(data.x, data.y);
            window.setTimeout(function () {
                enableFixedPosition(data.y === (scroll.crop ? scroll.y : 0));
                timer = (data.y === 0 ? timer += 1000 : timer);
                tik = window.setTimeout(function () {
                    chrome.runtime.sendMessage(data, function (response) {
                        if (tik && typeof(response) !== 'undefined') {
                            if (last_elem) {
                                last_elem.style.overflow = last_elem_overflow;
                                last_elem = last_elem_overflow = null;
                            }
                            scrollTo();
                        }
                    });
                }, timer);
            }, timer);
        })();
    }
})();

