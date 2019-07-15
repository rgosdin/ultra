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

$(document).ready(function () {
    $("input, select, textarea").on('input change', function (e) {
        switch (this.name) {
            case 'image-format':
                localStorage.format = this.value;
                window.core.setOption('format', localStorage.format);
                $('.nsc-settings-format .nsc-setting-quality').toggleClass('nsc-setting-quality-hidden', this.value === 'png');
                break;
            case 'show-new-button':
                localStorage.showNewButton = $(this).prop("checked");
                window.core.setOption('showNewButton', localStorage.showNewButton);
                break;
            case 'enable-watermark':
                const _this = this;
                const checked = $(_this).prop("checked");
                if (checked) {
                    nimbusShare.checkPremium(function (err, premium) {
                        if (err || !premium.capture) {
                            $(_this).prop('checked', false);
                            return;
                        }
                        localStorage.enableWatermark = checked;
                        localStorage.isUseWatermark = true;
                        window.core.setOption('enableWatermark', localStorage.enableWatermark);
                        window.core.setEvent('enable-watermark', localStorage.enableWatermark);
                        window.core.setOption('isUseWatermark', localStorage.isUseWatermark);

                        $('input[name=type-watermark]').prop('disabled', false);
                        $('input[name=percent-watermark]').prop('disabled', false);
                        $('select[name=font-watermark]').prop('disabled', false);
                        $('input[name=size-watermark]').prop('disabled', false);
                        $('textarea[name=text-watermark]').prop('disabled', false);
                        $('input[name=button-file-watermark]').prop('disabled', false);
                    });
                } else {
                    localStorage.enableWatermark = checked;
                    window.core.setOption('enableWatermark', localStorage.enableWatermark);
                    window.core.setEvent('enable-watermark', localStorage.enableWatermark);

                    $('input[name=type-watermark]').prop('disabled', true);
                    $('input[name=percent-watermark]').prop('disabled', true);
                    $('select[name=font-watermark]').prop('disabled', true);
                    $('input[name=size-watermark]').prop('disabled', true);
                    $('textarea[name=text-watermark]').prop('disabled', true);
                    $('input[name=button-file-watermark]').prop('disabled', true);
                }
                break;
            case 'type-watermark':
                localStorage.typeWatermark = this.value;
                window.core.setOption('typeWatermark', localStorage.typeWatermark);
                window.core.setEvent('type-watermark', localStorage.typeWatermark);

                if (this.value === 'image' && localStorage.fileWatermark) $('.nsc-settings-watermark-image').attr('src', localStorage.fileWatermark);
                if (this.value === 'text') $('#nsc_settings_watermark_percent').hide();
                else $('#nsc_settings_watermark_percent').show();
                $('[data-type-watermark]').hide().filter('[data-type-watermark=' + this.value + ']').show();
                break;
            case 'percent-watermark':
                localStorage.percentWatermark = +this.value / 100;
                window.core.setOption('percentWatermark', localStorage.percentWatermark);
                window.core.setEvent('percent-watermark', localStorage.percentWatermark);
                break;
            case 'alpha-watermark':
                localStorage.alphaWatermark = +this.value / 100;
                window.core.setOption('alphaWatermark', localStorage.alphaWatermark);
                window.core.setEvent('alpha-watermark', localStorage.alphaWatermark);
                break;
            case 'font-watermark':
                localStorage.fontWatermark = this.value;
                window.core.setOption('fontWatermark', localStorage.fontWatermark);
                window.core.setEvent('font-watermark', localStorage.fontWatermark);
                $('textarea[name=text-watermark]').css({'font-family': localStorage.fontWatermark});
                break;
            case 'size-watermark':
                localStorage.sizeWatermark = this.value;
                window.core.setOption('sizeWatermark', localStorage.sizeWatermark);
                window.core.setEvent('size-watermark', localStorage.sizeWatermark);
                $('textarea[name=text-watermark]').css({
                    'line-height': localStorage.sizeWatermark + 'px',
                    'font-size': localStorage.sizeWatermark + 'px'
                });
                break;
            case 'text-watermark':
                localStorage.textWatermark = this.value;
                window.core.setOption('textWatermark', localStorage.textWatermark);
                window.core.setEvent('text-watermark', localStorage.textWatermark);
                break;
            case 'file-watermark':
                const file = this.files[0];
                if (file.type.match('image.*') && file.size <= 1048576) {
                    window.core.blobToDataURL(file, function (dataUrl) {
                        localStorage.fileWatermark = dataUrl;
                        window.core.setOption('fileWatermark', localStorage.fileWatermark);
                        window.core.setEvent('file-watermark', localStorage.fileWatermark);

                        $('.nsc-settings-watermark-image').attr('src', localStorage.fileWatermark);
                    })
                } else $('#nsc_popup_watermark_limit').show();
                break;
        }
    }).on('click', function () {
        switch (this.name) {
            case 'button-file-watermark':
                $('[name=file-watermark]').focus().trigger('click');
                break;
        }
    }).filter('[name=image-format][value=' + localStorage.format + ']').prop('checked', true).trigger('change').end()
        .filter('[name=show-new-button]').prop('checked', localStorage.showNewButton !== 'false').end()
        .filter('[name=enable-watermark]').prop('checked', localStorage.enableWatermark !== 'false').end()
        .filter('[name=percent-watermark]').val(localStorage.percentWatermark * 100).end()
        .filter('[name=alpha-watermark]').val(localStorage.alphaWatermark * 100).end()
        .filter('[name=font-watermark]').val(localStorage.fontWatermark).trigger('change').end()
        .filter('[name=size-watermark]').val(localStorage.sizeWatermark).trigger('change').end()
        .filter('[name=text-watermark]').val(localStorage.textWatermark).trigger('input').end()
        .filter('[name=type-watermark][value=' + localStorage.typeWatermark + ']').prop('checked', true).trigger('change');

    $("[name=color-watermark]").spectrum({
        color: localStorage.colorWatermark,
        flat: true,
        showAlpha: true,
        showButtons: false,
        move: function (color) {
            if (localStorage.enableWatermark === 'false') return;
            localStorage.colorWatermark = color.toRgbString();
            window.core.setOption('colorWatermark', localStorage.colorWatermark);
            window.core.setEvent('color-watermark', localStorage.colorWatermark);

            $("[name=color-watermark]").val(localStorage.colorWatermark).closest('.nsc-settings-watermark-colorpicker').find('.nsc-settings-watermark-colorpicker-fill-shape-inner').css('background', localStorage.colorWatermark);
            $('textarea[name=text-watermark]').css({'color': localStorage.colorWatermark});
        }
    }).closest('.nsc-settings-watermark-colorpicker').find('.nsc-settings-watermark-colorpicker-fill-shape-inner').css('background-color', localStorage.colorWatermark);

    let $watermark = $('.nsc-settings-watermark-box-item');
    $watermark.on('click', function () {
        if (localStorage.enableWatermark === 'false') return;
        $watermark.removeClass('filled').filter(this).addClass('filled');
        localStorage.positionWatermark = $(this).data('position');
        window.core.setOption('positionWatermark', localStorage.positionWatermark);
        window.core.setEvent('position-watermark', localStorage.positionWatermark);
    }).filter('[data-position=' + localStorage.positionWatermark + ']').addClass('filled');

    $('.nsc-settings-watermark-colorpicker-button').on('click', function () {
        $('.nsc-settings-watermark-colorpicker-drop-holder').toggle();
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.nsc-settings-watermark-colorpicker').length) {
            $('.nsc-settings-watermark-colorpicker-drop-holder').hide();
        }
    });

    $('.nsc-popup-close button, .nsc-popup a').on('click', function (e) {
        $(this).closest('.nsc-popup').hide();
    });

    $('.nsc-open-popup-login-nimbus').on('click', function () {
        $('.nsc-popup').hide();
        $('#nsc_popup_connect_nimbus').show();
        return false;
    });

    $('.nsc-open-popup-register-nimbus').on('click', function () {
        $('.nsc-popup').hide();
        $('#nsc_popup_register_nimbus').show();
        return false;
    });

    $('#nsc_connect_to_google').on('click', function (e) {
        $('#nsc_popup_connect_nimbus').hide();
        window.open('https://nimbus.everhelper.me/auth/openidconnect.php?env=app&provider=google', '_blank');
        return false;
    });

    $('#nsc_connect_to_facebook').on('click', function (e) {
        $('#nsc_popup_connect_nimbus').hide();
        window.open('https://nimbus.everhelper.me/auth/openidconnect.php?env=app&provider=facebook', '_blank');
        return false;
    });

    $('#nsc_form_login_nimbus').on("submit", function () {
        let wrong = false;
        let $form = $(this);
        let email = this.elements['email'];
        let password = this.elements['password'];

        if (password.value.length < 8) {
            $(password).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassInfo"), type: "error", timeout: 5});
            wrong = true;
        }
        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbusShare.server.user.auth(email.value, password.value, function (res) {
                if (res.errorCode === 0) {
                    $form.find('input').val('');
                    $('.nsc-popup').hide();
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationLoginFail"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    }).find('input').on('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 8 ||
            ($(this).attr('name') === 'email' && !/\S+@\S+\.\S+/.test($(this).val()))) {
            $(this).addClass('wrong');
        }
    });

    $('#nsc_form_register_nimbus').bind("submit", function () {
        let wrong = false;
        let $form = $(this);
        let email = this.elements['email'];
        let password = this.elements['password'];
        let password_repeat = this.elements['pass-repeat'];

        if (password.value.length < 8) {
            $(password).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassInfo"), type: "error", timeout: 5});
            wrong = true;
        }

        if (password.value !== password_repeat.value) {
            $(password).addClass('wrong');
            $(password_repeat).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassMatch"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbusShare.server.user.register(email.value, password.value, function (res) {
                if (res.errorCode === 0) {
                    nimbusShare.server.user.auth(email.value, password.value, function () {
                        $form.find('input').val('');
                        $('.nsc-popup').hide();
                    });
                } else if (res.errorCode === -4) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationEmailFail"), type: "error", timeout: 5});
                } else {
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationRegisterFail"),
                        type: "error",
                        timeout: 5
                    });
                }
            });
        }
        return false;
    }).find('input').on('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 8 ||
            ($(this).attr('name') === 'pass-repeat' && $(this).val() !== $(this).closest('form').find("[name='pass']").val()) ||
            $(this).attr('name') === 'email' && !/\S+@\S+\.\S+/.test($(this).val())) {
            $(this).addClass('wrong');
        }
    });

    $('input[name=main-menu-item]').on('change', function () {
        let main_menu_item = JSON.parse(localStorage.mainMenuItem);
        if (this.value === 'visible' || this.value === 'android') {
            $(this).prop('checked', true);
        }
        main_menu_item[this.value] = $(this).prop('checked');
        localStorage.mainMenuItem = JSON.stringify(main_menu_item);
        window.core.setOption('mainMenuItem', localStorage.mainMenuItem);
    });

    $('button[name=filename-template-screenshot]').on('click', function () {
        let $name = $('#filename_template_screenshot');
        $name.val($name.val() + '{' + this.value + '}').trigger('input');
    });
    $('button[name=filename-template-screencast]').on('click', function () {
        let $name = $('#filename_template_screencast');
        $name.val($name.val() + '{' + this.value + '}').trigger('input');
    });
    $('#filename_template_screenshot').on('input', function () {
        localStorage.fileNamePatternScreenshot = this.value;
        window.core.setOption('fileNamePatternScreenshot', localStorage.fileNamePatternScreenshot);
    });
    $('#filename_template_screencast').on('input', function () {
        localStorage.fileNamePatternScreencast = this.value;
        window.core.setOption('fileNamePatternScreencast', localStorage.fileNamePatternScreencast);
    });
    $('#delayed_screenshot_time').on('blur', function () {
        this.value = parseInt(this.value) || 0;
        if (this.value < 0) this.value = 0;
        if (this.value > 999) this.value = 999;
        localStorage.delayedScreenshotTime = this.value;
        window.core.setOption('delayedScreenshotTime', localStorage.delayedScreenshotTime);
    });
    $('#time_scroll_entire_page').on('blur', function () {
        this.value = parseInt(this.value) || 0;
        if (this.value < 100) this.value = 100;
        if (this.value > 9999) this.value = 9999;
        localStorage.timeScrollEntirePage = this.value;
        window.core.setOption('timeScrollEntirePage', localStorage.timeScrollEntirePage);
    });
    $('#depth_screenshot').on('blur', function () {
        this.value = parseInt(this.value) || 1;
        if (this.value < 1) this.value = 1;
        if (this.value > 64) this.value = 64;
        localStorage.depthScreenshot = this.value;
        window.core.setOption('depthScreenshot', localStorage.depthScreenshot);
    });
    $('#enable_save_as').on('change', function () {
        localStorage.enableSaveAs = $(this).prop('checked');
        window.core.setOption('enableSaveAs', localStorage.enableSaveAs);
    });
    $('#save_crop_position').on('change', function () {
        localStorage.saveCropPosition = $(this).prop('checked');
        window.core.setOption('saveCropPosition', localStorage.saveCropPosition);
    });
    $('#hide_fixed_elements').on('change', function () {
        localStorage.hideFixedElements = $(this).prop('checked');
        window.core.setOption('hideFixedElements', localStorage.hideFixedElements);
    });
    $('#show_content_menu').on('change', function () {
        localStorage.showContentMenu = $(this).prop('checked');
        window.core.setOption('showContentMenu', localStorage.showContentMenu);
        chrome.runtime.sendMessage({operation: 'update_context_menu'});
    });
    $('#auto_short_url').on('change', function () {
        localStorage.autoShortUrl = $(this).prop('checked');
        window.core.setOption('autoShortUrl', localStorage.autoShortUrl);
    });
    $('#keep_original_resolution').on('change', function () {
        localStorage.keepOriginalResolution = $(this).prop('checked');
        window.core.setOption('keepOriginalResolution', localStorage.keepOriginalResolution);
    });
    $('#show_info_print').on('change', function () {
        localStorage.showInfoPrint = $(this).prop('checked');
        window.core.setOption('showInfoPrint', localStorage.showInfoPrint);
    });

    $('#image-quality').on('change', function () {
        localStorage.imageQuality = this.value;
        window.core.setOption('imageQuality', localStorage.imageQuality);
        $('#image-quality-value').text(localStorage.imageQuality);
    });

    let $capture_type = $('#capture_type');
    let $capture_enable_edit = $('#capture_enable_edit');
    let $quick_capture_choose = $('#quick_capture_choose');
    let $quick_capture_enable = $('#quick_capture_enable');

    $quick_capture_enable.on('change', function () {
        localStorage.quickCapture = $(this).prop("checked");
        window.core.setOption('quickCapture', localStorage.quickCapture);
        $quick_capture_choose.toggleClass('nsc-settings-choose-enabled', localStorage.quickCapture !== 'false');
    }).prop('checked', (localStorage.quickCapture !== 'false'));

    $quick_capture_choose.toggleClass('nsc-settings-choose-enabled', localStorage.quickCapture !== 'false');

    $capture_type.on('change', function () {
        localStorage.quickCaptureType = this.value;
        window.core.setOption('quickCapture', localStorage.quickCaptureType);
        $capture_type.find('option[value=' + localStorage.quickCaptureType + ']').attr('selected', 'selected');
    }).find('option[value=' + localStorage.quickCaptureType + ']').attr('selected', 'selected');

    $capture_enable_edit.on('change', function () {
        localStorage.enableEdit = this.value;
        window.core.setOption('enableEdit', localStorage.enableEdit);
        $(this).find('option[value=' + localStorage.enableEdit + ']').attr('selected', 'selected');
    }).find('option[value=' + localStorage.enableEdit + ']').attr('selected', 'selected');

    $('#shortcut_load_to_ns').on('change', function () {
        localStorage.hotkeysSendNS = JSON.stringify({key: this.value, title: $(this).find('option:selected').text()});
        window.core.setOption('hotkeysSendNS', localStorage.hotkeysSendNS);
        chrome.runtime.sendMessage({'operation': 'shortcut_load_to_ns_change'});
    });

    $('.open-page').on('click', function (e) {
        chrome.runtime.sendMessage({'operation': 'open_page', 'url': $(this).data('url')});
        return false;
    });

    $('[data-tab]').on('click', function () {
        $('[data-tab]').removeClass('nsc-settings-tab-active').filter(this).addClass('nsc-settings-tab-active');
        $('[data-container]').removeClass('nsc-settings-container-active').filter('[data-container=' + $(this).data('tab') + ']').addClass('nsc-settings-container-active');
    }).filter(function (index) {
        const p = window.location.href.match(/\?(\w+)$/);
        return $(this).data('tab') === (p && p[1]);
    }).trigger('click');

    if (localStorage.enableWatermark === 'false') {
        $('input[name=type-watermark]').prop('disabled', true);
        $('input[name=percent-watermark]').prop('disabled', true);
        $('select[name=font-watermark]').prop('disabled', true);
        $('input[name=size-watermark]').prop('disabled', true);
        $('textarea[name=text-watermark]').prop('disabled', true);
        $('input[name=button-file-watermark]').prop('disabled', true);
    }

    if (localStorage.hotkeysSendNS) {
        $('#shortcut_load_to_ns').val(JSON.parse(localStorage.hotkeysSendNS).key);
    }

    if (localStorage.mainMenuItem) {
        const main_menu_item = JSON.parse(localStorage.mainMenuItem);
        for (let key in main_menu_item) {
            $('input[name=main-menu-item][value=' + key + ']').prop('checked', main_menu_item[key]);
        }
    }

    $('textarea[name=text-watermark]').css({'color': localStorage.colorWatermark});
    $("#image-quality").val(localStorage.imageQuality);
    $('#image-quality-value').text(localStorage.imageQuality);
    $('#delayed_screenshot_time').val(localStorage.delayedScreenshotTime || 3);
    $('#time_scroll_entire_page').val(localStorage.timeScrollEntirePage);
    $('#depth_screenshot').val(localStorage.depthScreenshot);
    $('#filename_template_screenshot').val(localStorage.fileNamePatternScreenshot);
    $('#filename_template_screencast').val(localStorage.fileNamePatternScreencast);
    $("#enable_save_as").prop('checked', (localStorage.enableSaveAs !== 'false'));
    $("#save_crop_position").prop('checked', (localStorage.saveCropPosition !== 'false'));
    $("#hide_fixed_elements").prop('checked', (localStorage.hideFixedElements !== 'false'));
    $("#show_content_menu").prop('checked', (localStorage.showContentMenu !== 'false'));
    $("#auto_short_url").prop('checked', (localStorage.autoShortUrl !== 'false'));
    $("#keep_original_resolution").prop('checked', (localStorage.keepOriginalResolution !== 'false'));
    $("#show_info_print").prop('checked', (localStorage.showInfoPrint !== 'false'));

    const hotkeys = JSON.parse(localStorage.hotkeys);
    const $shortcut_visible = $('#shortcut_visible');
    const $shortcut_fragment = $('#shortcut_fragment');
    const $shortcut_selected = $('#shortcut_selected');
    const $shortcut_scroll = $('#shortcut_scroll');
    const $shortcut_entire = $('#shortcut_entire');
    const $shortcut_window = $('#shortcut_window');
    $shortcut_visible.val(hotkeys.visible);
    $shortcut_fragment.val(hotkeys.fragment);
    $shortcut_selected.val(hotkeys.selected);
    $shortcut_scroll.val(hotkeys.scroll);
    $shortcut_entire.val(hotkeys.entire);
    $shortcut_window.val(hotkeys.window);

    [$shortcut_visible, $shortcut_fragment, $shortcut_selected, $shortcut_scroll, $shortcut_entire, $shortcut_window].forEach(function ($shortcut) {
        $shortcut.on('change', function () {
            const e = $shortcut_entire.val();
            const f = $shortcut_fragment.val();
            const s = $shortcut_selected.val();
            const sc = $shortcut_scroll.val();
            const v = $shortcut_visible.val();
            const w = $shortcut_window.val();

            if (window.core.checkDifferent([e, f, s, sc, v, w])) {
                localStorage.hotkeys = JSON.stringify({
                    entire: e,
                    fragment: f,
                    selected: s,
                    scroll: sc,
                    visible: v,
                    window: w
                });
                window.core.setOption('hotkeys', localStorage.hotkeys);
            } else {
                $shortcut_visible.val(hotkeys.visible);
                $shortcut_fragment.val(hotkeys.fragment);
                $shortcut_selected.val(hotkeys.selected);
                $shortcut_scroll.val(hotkeys.scroll);
                $shortcut_entire.val(hotkeys.entire);
                $shortcut_window.val(hotkeys.window);
            }
        });
    })

    $('*[data-i18n]').each(function () {
        $(this).on('restart-i18n', function () {
            const text = chrome.i18n.getMessage($(this).data('i18n')) || $(this).data('i18n');
            const attr = $(this).data('i18nAttr');
            if (attr && text) {
                $(this).attr(attr, text);
            } else if (text) {
                $(this).html(text);
            }
        }).trigger('restart-i18n');
    });

    $('#nimbus_help_link').attr('href', 'https://everhelper.desk.com/customer/en/portal/articles/' + (window.navigator.language === 'ru' ? '2155978' : '1180411'));

    if (window.core.is_firefox) $('.nsc-global').removeClass('nsc-global');
    if (window.core.is_chrome) {
        chrome.commands.getAll(function (commands) {
            for (let command of commands) {
                $('[data-command-name="' + command.name + '"]').text(command.shortcut)
            }
        });
    }
});