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
/**
 * Created by hasesanches on 13.12.2016.
 */
chrome.runtime.onMessage.addListener(function (req) {
    if ($('.nsc-timer').length) return;

    // window.is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    // window.is_chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && !/OPR/.test(navigator.userAgent);
    // window.is_opera = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && /OPR/.test(navigator.userAgent);
    // window.is_edge = navigator.userAgent.indexOf("Edge") > -1;

    if (req.operation === 'content_start_timer') {
        let nsc_progress = 0, nsc_progress_bar, nsc_progress_bar_timer, $nsc_timer;

        // if (window.is_chrome) {
        $nsc_timer = $('<div>').addClass('nsc-timer').append(
            $('<div>').addClass('nsc-timer-content').append(
                $('<div>').addClass('nsc-timer-progress')
            ),
            $('<div>').addClass('nsc-timer-sep'),
            $('<div>').addClass('nsc-timer-cancel').append(
                $('<button type="button" name="">')
                    .addClass('nsc-timer-button')
                    // .css('pointer-events', 'none')
                    .text(chrome.i18n.getMessage('panelCancel'))
                    .on('click', function () {
                        nsc_progress_bar.destroy();
                        $nsc_timer.remove();
                        chrome.runtime.sendMessage({operation: 'content_stop_timer'});
                    })
            )
        );
        // } else {
        //     $nsc_timer = $('<div>').addClass('nsc-timer').append(
        //         $('<div>').addClass('nsc-timer-content').append(
        //             $('<div>').addClass('nsc-timer-progress').css({'text-align': 'center', 'font-size': '42px', 'line-height': '88px'})
        //         ),
        //         $('<div>').addClass('nsc-timer-sep'),
        //         $('<div>').addClass('nsc-timer-cancel').append(
        //             $('<button type="button" name="">')
        //                 .addClass('nsc-button')
        //                 .text(chrome.i18n.getMessage('panelCancel'))
        //                 .click(function () {
        //                     clearTimeout(nsc_progress_bar);
        //                     chrome.runtime.sendMessage({operation: 'content_stop_timer'});
        //                     $nsc_timer.remove();
        //                 })
        //         )
        //     );
        // }

        $('body').append($nsc_timer);

        if (req.type === 'capture_delayed') {
            $nsc_timer.addClass('capture-delayed');
        } else {
            $nsc_timer.removeClass('capture-delayed');
        }

        nsc_progress_bar = new ProgressBar.Circle('.nsc-timer-progress', {
            color: '#fff',
            trailColor: '#3b3b3b',
            strokeWidth: 7,
            trailWidth: 7,
            easing: 'linear',
            duration: req.countdown,
            text: {
                autoStyleContainer: false
            },
            from: {color: '#1694ab', width: 7},
            to: {color: '#1694ab', width: 7},
            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
                let value = Math.round(req.countdown - req.countdown * circle.value());
                circle.setText(value);

                if (circle.value() >= 1) {
                    chrome.runtime.sendMessage({operation: 'content_end_timer', type: req.type});
                    nsc_progress_bar.destroy();
                    $nsc_timer.remove();
                    clearTimeout(nsc_progress_bar_timer);
                }
            }
        });
        nsc_progress_bar.text.style.fontFamily = '"OpenSansSemibold", Helvetica, sans-serif';
        nsc_progress_bar.text.style.fontSize = '46px';
        nsc_progress_bar.set(0);

        nsc_progress_bar_timer = window.setInterval(function () {
            nsc_progress += 1 / req.countdown;
            nsc_progress_bar.set(nsc_progress);
        }, 1000);

        // return true;

        // if (window.is_chrome) {
        //     nsc_progress_bar = new ProgressBar.Circle('.nsc-timer-progress', {
        //         color: '#fff',
        //         trailColor: '#3b3b3b',
        //         easing: 'linear',
        //         strokeWidth: 7,
        //         trailWidth: 7,
        //         text: {zontainer: false
        //         },
        //         from: {color: '#1694ab', width: 7},
        //         to: {color: '#1694ab', width: 7},
        //         step: function (state, circle) {
        //             console.log(arguments)
        //             circle.path.setAttribute('stroke', state.color);
        //             circle.path.setAttribute('stroke-width', state.width);
        //         }
        //     });
        //
        //     nsc_progress_bar.set(0);
        //     nsc_progress_bar.animate(1, {
        //             duration: 1000 * req.countdown,
        //             step: function (state, circle) {
        //                 console.log(arguments)
        //                 circle.setText(req.countdown - Math.floor(req.countdown * circle.value()));
        //             }
        //         },
        //         function () {
        //             console.log(arguments)
        //             chrome.runtime.sendMessage({operation: 'content_end_timer', type: req.type});
        //             nsc_progress_bar.destroy();
        //             $nsc_timer.remove();
        //         });
        //
        //     nsc_progress_bar.text.style.fontFamily = '"OpenSansSemibold", Helvetica, sans-serif';
        //     nsc_progress_bar.text.style.fontSize = '46px';
        // } else {
        //     function step() {
        //         if (req.countdown <= 0) {
        //             clearTimeout(nsc_progress_bar);
        //             chrome.runtime.sendMessage({operation: 'content_end_timer', type: req.type});
        //             $nsc_timer.remove();
        //         } else {
        //             $nsc_timer.find('.nsc-timer-progress').text(req.countdown);
        //             req.countdown--;
        //             if (nsc_progress_bar) {
        //                 clearTimeout(nsc_progress_bar);
        //                 nsc_progress_bar = null;
        //             }
        //             nsc_progress_bar = window.setTimeout(step, 1000);
        //         }
        //     }
        //     step();
        // }
    }
});