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

"use strict";

(function ($) {
    if (!window.nimbusWatermarkInjected) {
        window.nimbusWatermarkInjected = true;

        chrome.runtime.onMessage.addListener(function (req) {
            console.log(req)
            if (req.operation === 'nsc_watermark_video_is') {
                sendResponse(true)
            }
            if (req.operation === 'status_video') {
                if (!req.status) $('#nsc_watermark_video').remove();
            }
            if (req.operation === 'set_watermark_video') {
                let watermark = new Image();
                watermark.onload = function () {
                    let x, y, shift = 10;
                    switch (req.position) {
                        case 'lt':
                            x = shift;
                            y = shift;
                            break;
                        case 'rt':
                            x = window.innerWidth - watermark.width - shift;
                            y = shift;
                            break;
                        case 'lb':
                            x = shift;
                            y = window.innerHeight - watermark.height - shift;
                            break;
                        case 'rb':
                            x = window.innerWidth - watermark.width - shift;
                            y = window.innerHeight - watermark.height - shift;
                            break;
                        case 'c':
                            x = Math.floor((window.innerWidth - watermark.width) / 2);
                            y = Math.floor((window.innerHeight - watermark.height) / 2);
                            break;
                    }

                    if ($('#nsc_watermark_video').length) {
                        $('#nsc_watermark_video').attr('src', req.dataUrl).css({'top': y, 'left': x})
                    } else {
                        $('body').append($('<img>').attr('src', req.dataUrl).attr('id', 'nsc_watermark_video').css({'position': 'fixed', 'top': y, 'left': x, 'z-index': 9999999999999999999}))
                    }
                };
                watermark.src = req.dataUrl;
            }
        });
    }
})(jQuery);