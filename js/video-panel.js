/**
 * Created by hasesanches on 2017.
 */

(function () {

    // if (window.__nscContentScriptVideoPanel) return;
    // window.__nscContentScriptVideoPanel = true;

    $.get(chrome.runtime.getURL('template/panel-video-compact.html'), function (data) {
        $('body').append(data).append($('<div>').addClass('nsc-video-editor'));

        var body = document.body,
            html = document.documentElement,
            page_w = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            page_h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
            intervalClear = null, videoPanelMove = false;

        $('[data-event-param=clear]').closest('.nsc-panel-button').hide();

        var videoEditor = $('.nsc-video-editor').width(page_w).height(page_h).videoEditor();

        $('.nsc-video-editor').on('nimbus-editor-change', function (e, tools, color) {
            if (tools) {
                let $this = $('[data-event-param=' + tools + ']');
                let $button = $this.closest('.nsc-panel-button');
                $('.nsc-panel-button').removeClass('active').filter($button).addClass('active');
                if ($this.eq(0).closest('.nsc-panel-dropdown').length) {
                    $button.removeClass('opened').find('.nsc-panel-text').empty().append($this.eq(0).clone().on('click touchend').trigger('click'));
                }
            }
            if (color) {
                $('#nsc_panel_button_colors').css('background-color', color).closest('.nsc-panel-button').removeClass('opened');
            }
        });

        $('*[data-event^=nimbus-editor]').on('click touchend', function () {
            videoEditor.trigger($(this).data('event'), $(this).data('eventParam'));
            if ($(this).data('event') === 'nimbus-editor-active-tools') {
                videoEditorTools = $(this).data('eventParam');
                chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: $(this).data('eventParam')});
            }
        });

        $('*[data-i18n]')
            .on('mouseenter touchenter', function () {
                $('.nsc-panel-tooltip-layout').text(chrome.i18n.getMessage($(this).data('i18n')));
                $('.nsc-panel.nsc-panel-compact').addClass('nsc-tooltip');
            })
            .on('mouseleave touchleave', function () {
                $('.nsc-panel.nsc-panel-compact').removeClass('nsc-tooltip')
            });

        $('.nsc-panel-toggle-button').on('click', function () {
            $('.nsc-panel.nsc-panel-compact').hide();
        });

        $('.nsc-panel-trigger').on('click touchend', function () {
            let $this_button = $(this).closest('.nsc-panel-button');
            $('.nsc-panel-button').not($this_button).removeClass('opened');
            if ($this_button.find('.nsc-panel-dropdown').length) $this_button.toggleClass('opened');
        });

        function panelKeyDown(e) {
            if (e.altKey) {

                console.log(e.key, e)
                switch (e.key) {
                    case 'v':
                        if ($('.nsc-panel.nsc-panel-compact:visible').length) {
                            $('.nsc-panel.nsc-panel-compact').hide();
                            chrome.runtime.sendMessage({operation: 'set_video_panel', value: 'false'});
                            videoEditor.trigger('nimbus-editor-active-tools', false);
                        } else {
                            $('.nsc-panel.nsc-panel-compact').show();
                            chrome.runtime.sendMessage({operation: 'set_video_panel', value: 'true'});
                            videoEditor.trigger('nimbus-editor-active-tools', videoEditorTools);
                        }
                        break;
                    case 's':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'cursorDefault');
                        videoEditorTools = 'cursorDefault';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'cursorDefault'});
                        break;
                    case 'g':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'cursorShadow');
                        videoEditorTools = 'cursorShadow';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'cursorShadow'});
                        break;
                    case 'l':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'cursorRing');
                        videoEditorTools = 'cursorRing';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'cursorRing'});
                        break;
                    case 'p':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'pen');
                        videoEditorTools = 'pen';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'pen'});
                        break;
                    case 'a':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'arrow');
                        videoEditorTools = 'arrow';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'arrow'});
                        break;
                    case 'r':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'square');
                        videoEditorTools = 'square';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'square'});
                        break;
                    case 'm':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'notifRed');
                        videoEditorTools = 'notifRed';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'notifRed'});
                        break;
                    case 'q':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'notifBlue');
                        videoEditorTools = 'notifBlue';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'notifBlue'});
                        break;
                    case 'c':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'notifGreen');
                        videoEditorTools = 'notifGreen';
                        chrome.runtime.sendMessage({operation: 'set_video_editor_tools', tools: 'notifGreen'});
                        break;
                    // case 'n':
                    //     videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'clear');
                    //     break;
                    case 'u':
                        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'clearAll');
                        break;
                }
            }
        }

        $('.nsc-panel.nsc-panel-compact .nsc-panel-move')
            .on('mousedown', function () {
                videoPanelMove = true;
            })
            .on('mouseup', function () {
                videoPanelMove = false;
            });

        $(window).on('keydown', panelKeyDown)
            .on('mousemove', function (e) {
                if (videoPanelMove) {
                    $('.nsc-panel.nsc-panel-compact').css({left: e.clientX - 2, bottom: $(window).height() - e.clientY - 46 / 2});
                }
            })
            .on('mouseup', function () {
                videoPanelMove = false;
            });


        var $web_camera = $('#nimbus_web_camera_toggle');
        var $button_play = $('#nsc_panel_button_play');
        var $button_pause = $('#nsc_panel_button_pause');
        var $button_stop = $('#nsc_panel_button_stop');
        $button_play.hide();
        chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
            if (req.operation === 'status_video') {
                if (!req.status) {
                    // $('.nsc-panel.nsc-panel-compact').hide();
                    // $('.nsc-video-editor').hide();

                    // TODO: Доработать возобновление работы
                    $('html body').css({cursor: 'auto', 'user-select': 'auto'});
                    $('.nsc-panel.nsc-panel-compact').remove();
                    $('.nsc-video-editor').remove();
                    $(window).off('keydown', panelKeyDown);
                    chrome.runtime.onMessage.removeListener(arguments.callee);
                    intervalClear && clearInterval(intervalClear)
                } else if (req.state === 'recording') {
                    $button_play.hide();
                    $button_pause.show();
                } else {
                    $button_pause.hide();
                    $button_play.show();
                }
            }
            if (req.operation === 'nsc_video_panel_is') {
                sendResponse(true)
            }
        });

        $web_camera.on('click', function () {
            chrome.runtime.sendMessage({operation: 'web_camera_toggle_panel'});
        });

        $button_play.on('click touchend', function () {
            chrome.runtime.sendMessage({operation: 'status_video_change', status: 'play'});
        });
        $button_pause.on('click touchend', function () {
            chrome.runtime.sendMessage({operation: 'status_video_change', status: 'pause'});
        });
        $button_stop.on('click touchend', function () {
            chrome.runtime.sendMessage({operation: 'status_video_change', status: 'stop'});
        });

        if (deawingTools) {
            $('.nsc-panel.nsc-panel-compact').show();
            videoEditor.trigger('nimbus-editor-active-tools', videoEditorTools);
        } else {
            $('.nsc-panel.nsc-panel-compact').hide();
            videoEditor.trigger('nimbus-editor-active-tools', false);
        }

        if (deleteDrawing) {
            intervalClear = setInterval(function () {
                videoEditor.trigger('nimbus-editor-remove-old');
            }, deleteDrawing * 1000)
        }

    });

})();