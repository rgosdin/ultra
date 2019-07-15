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

nimbus_screen.editDoneInit = function () {
    nimbus_screen.dom.$button_done.on('click', function () {
        const done_height = $(window).innerHeight() - 215 - 120 - 65;
        $('.nsc-done-content').height((done_height < 500 ? 500 : done_height));

        nimbus_screen.dom.$nsc_done_page.show();
        nimbus_screen.dom.$nsc_redactor_page.hide();

        slackShare.init();
        nimbusShare.init();
        nimbus_screen.rate_popup.init();
        nimbus_screen.account_popup.init();

        nimbusShare.checkPremium(function (err, premium) {
            if (!err && premium.capture && nimbus_screen.getLocationParam() === 'video' && window.core.is_chrome) {
                $('#nsc_manage_devices').show();
                $('#nsc_increase_limit').show();
            }
            if (err || !premium.capture) {
                $('#nsc_upgrade_nimbus_pro').show();
            }
        }, false);

        if (nimbus_screen.getLocationParam() === 'video' && window.core.is_chrome) {
            $('.nsc-trigger-panel-container.save-from-disk').hide();
            $('#nsc_button_slack').hide();
            $('#nsc_button_print').hide();
            $('#nsc_button_back').hide();

            $('#nsc_button_save_video').show();
            nimbus_screen.dom.$app_title.text(chrome.i18n.getMessage("nimbusSaveScreencast"));
            nimbus_screen.dom.$nsc_indicator.addClass('video');
            nimbus_screen.dom.$preview_loading.show().find('[data-i18n]').text(chrome.i18n.getMessage('labelPreviewLoading'));
            localStorage.filePatch = nimbus_screen.path + 'video.webm';

            nacl_module.init(function () {
                nimbus_screen.viewFilePreview();
            });
        } else {
            $('#nsc_button_youtube').hide();
            $('#nsc_preview_img').hide();
            $('#nsc_button_save_video').hide();

            nimbus_screen.dom.$app_title.text(chrome.i18n.getMessage("nimbusSaveScreenshot"));
            nimbus_screen.dom.$nsc_indicator.addClass('screen');
            nimbus_screen.dom.$preview_loading.show().find('[data-i18n]').text(chrome.i18n.getMessage('labelPreviewLoading'));

            nimbus_screen.createCanvasDone()
        }
    });

    $('#nsc_enable_watermark').on('change', function () {
        if (localStorage.enableWatermark === 'false' || (!localStorage.fileWatermark && localStorage.typeWatermark === 'image')) {
            $(this).prop("checked", false);
            chrome.runtime.sendMessage({operation: 'open_page', 'url': 'options.html?watermark'});
        } else {
            $('#nsc_preview_img').hide();
            nimbus_screen.dom.$nsc_indicator.hide();
            nimbus_screen.dom.$preview_loading.show();

            localStorage.enableWatermark = $(this).prop("checked");

            if (nimbus_screen.canvasManager) {
                nimbus_screen.setWaterMark(localStorage.enableWatermark === 'true', function () {
                    nimbus_screen.createCanvasDone();
                })
            } else {
                nimbus_screen.createCanvasDone();
            }
        }
    }).prop('checked', localStorage.enableWatermark !== 'false');

    $('#nsc_open_watermark_option').on('click', function () {
        chrome.runtime.sendMessage({operation: 'open_page', 'url': 'options.html?watermark'});
    });

    $('#nsc_nimbus_folder').click(function (e) {
        e.preventDefault();
        nimbus.foldersShowManager();
    });

    $('#nsc_button_back').click(function () {
        nimbus_screen.dom.$nsc_redactor_page.show();
        nimbus_screen.dom.$nsc_done_page.hide();

        if (!nimbus_screen.canvasManager) {
            nimbus_screen.dom.$nsc_pre_load.show();
            nimbus_screen.initScreenPage(nimbus_screen.info.file.origin_patch);
        }
    });

    $('#nsc_button_save_pdf').on('click', function () {
        if (window.core.is_chrome) {
            $(window).off('beforeunload', nimbus_screen.beforeUnload);
            nimbus_screen.pdf.addImage(nimbus_screen.info.file.data, 'JPEG', 0, 0);
            nimbus_screen.pdf.save(nimbus_screen.getFileName() + ".pdf");
            $(this).closest('.nsc-trigger-panel-container').removeClass('active')
        }
    });

    $('#nsc_button_save_image, #nsc_button_save_video, #nsc_main_title').on('click', function () {
        $(window).off('beforeunload', nimbus_screen.beforeUnload);
        chrome.downloads.download({
            url: window.URL.createObjectURL(nimbus_screen.info.file.blob),
            filename: nimbus_screen.getFileName('format'),
            saveAs: localStorage.enableSaveAs !== 'false'
        })
    });

    $('#nsc_button_copy_to_clipboard').click(function () {
        $(window).off('beforeunload', nimbus_screen.beforeUnload);
        chrome.runtime.sendMessage({operation: 'copy_to_clipboard', dataUrl: nimbus_screen.info.file.data});
    });

    $('#nsc_button_print').click(function () {
        $(window).off('beforeunload', nimbus_screen.beforeUnload);
        let f = $("iframe#print")[0],
            c = f.contentDocument,
            d = f.contentWindow,
            i = c.getElementById("image"),
            t = c.getElementById("link");
        i.onload = function () {
            this.style.width = 718 < this.width ? "100%" : "auto";

            const date = new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate();
            const month = new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
            const year = new Date().getFullYear();
            const pageinfo = JSON.parse(localStorage.pageinfo);

            if (localStorage.showInfoPrint === 'true') t.innerHTML = nimbus_screen.getFileName() + '<br>' + pageinfo.url + '<br>' + date + '.' + month + '.' + year;

            d.focus();
            d.print();
            i.setAttribute("src", '');
        };
        i.setAttribute("src", nimbus_screen.info.file.data);
    });

    let $nsc_video_convert = $('#nsc_video_convert');
    let $nsc_video_convert_frame_rate = $('#nsc_video_convert_frame_rate');
    $nsc_video_convert.find('button').on('click', function (e) {
        if (e.currentTarget.name === 'editor') {
            if (nimbus_screen.info.file.format === 'gif') {
                alert('The editor works only with video files.');
                return;
            }
            $('#nsc_stream_video').hide()[0].pause();
            $('#nsc_preview_img').hide();
            nimbus_screen.dom.$nsc_done_page.hide();
            nimbus_screen.dom.$nsc_video_page.show();
            nimbus_screen.dom.$nsc_pre_load.show();

            $('#nsc_video_player').attr('src', nimbus_screen.info.file.patch + '?' + Date.now());
            nimbus_screen.info.file.last_video_name = nimbus_screen.info.file.patch.match('video[^/.]+')[0];
            nimbus_screen.info.file.last_video_format = nimbus_screen.info.file.format;

            if (!localStorage.videoEditor) {
                $('#nsc_popup_video_editor').show().find('button.primary').on('click', function () {
                    localStorage.videoEditor = true;
                });
                return;
            }
        }
        if (e.currentTarget.name === 'menu') {
            $nsc_video_convert.find('.nsc-convert-menu').toggle()
        }

        if (e.currentTarget.name === 'convert') {
            nimbusShare.checkPremium(function (err, premium) {
                if (err || !premium.capture) return;

                const format = $nsc_video_convert.find('input[name=format]:checked').val();
                const size = nacl_module.video_resolution[$nsc_video_convert.find('input[name=size]').val()];
                const frame_rate = nacl_module.frame_rate[$nsc_video_convert.find('input[name=frame-rate]').val()];

                $(window).on('beforeunload', nimbus_screen.beforeUnload);

                $('#nsc_stream_video').hide()[0].pause();
                $('#nsc_preview_img').hide();
                nimbus_screen.dom.$nsc_indicator.hide();
                nimbus_screen.dom.$preview_loading.show().find('[data-i18n]').text(chrome.i18n.getMessage('labelPreviewLoadingVideo'));
                nacl_module.convert({format: format, size: size, frame_rate: frame_rate},
                    function () {
                        nimbus_screen.viewFilePreview()
                    },
                    function (text) {
                        nimbus_screen.dom.$preview_loading.find('[data-i18n]').text(text);
                    });

                $nsc_video_convert.find('.nsc-convert-menu').hide()
            });
        }
    }).end().find('input').on('change', function (e) {
        if (e.currentTarget.name === 'size') {
            const size = nacl_module.video_resolution[e.currentTarget.value];
            localStorage.videoConvertResolution = e.currentTarget.value;
            $('#nsc_video_convert_size').text(size.width + 'x' + size.height + 'px')
        }

        if (e.currentTarget.name === 'format' && e.currentTarget.value === 'gif') {
            $nsc_video_convert_frame_rate.closest('.nsc-convert-menu-size').show();
        } else if (e.currentTarget.name === 'format' && e.currentTarget.value !== 'gif') {
            $nsc_video_convert_frame_rate.closest('.nsc-convert-menu-size').hide();
        }

        if (e.currentTarget.name === 'frame-rate') {
            const frame_rate = nacl_module.frame_rate[e.currentTarget.value];
            localStorage.videoConvertFrameRate = e.currentTarget.value;
            $nsc_video_convert_frame_rate.text(frame_rate)
        }
    }).filter('[name=size]').val(localStorage.videoConvertResolution || 1).trigger('change')
        .end().filter('[name=frame-rate]').val(localStorage.videoConvertFrameRate || 1).trigger('change');

    $('body').on('click', function (e) {
        if (!$(e.target).closest('.nsc-indicator-convert-action').length) $nsc_video_convert.find('.nsc-convert-menu').hide()
    });

    $('.nsc-popup-close button, .nsc-popup a').on('click', function (e) {
        $(this).closest('.nsc-popup').hide();
    });

    $('.nsc-rate-us-close button').on('click', function () {
        $(this).closest('.nsc-rate-us').hide();
    });

    $('#nsc_nimbus_rate button[name=feedback]').on('click', nimbus_screen.rate_popup.feedback);
    $('#nsc_nimbus_rate button[name=not-show-more]').on('click', nimbus_screen.rate_popup.not_show_more);

    $('#nsc_nimbus_private_share').change(function () {
        localStorage.setItem('nimbusShare', this.checked);
    });

    $('#nsc_form_login_nimbus').on("submit", function () {
        var wrong = false;
        var $form = $(this);
        var email = this.elements['email'];
        var password = this.elements['password'];

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
                    nimbusShare.init();
                    nimbus_screen.togglePanel('nimbus');
                } else if (res.errorCode === -26) {
                    $form.find('input').val('');
                    $('.nsc-popup').hide();
                    $('#nsc_popup_connect_nimbus_challenge').show().find('input[name=state]').val(res.body.challenge.state);
                    if (res.body.challenge.type === 'otp') {
                        $('#nsc_popup_connect_nimbus_challenge').find('img').attr('src', '')
                    } else {
                        $('#nsc_popup_connect_nimbus_challenge').find('img').attr('src', 'data:image/png;base64,' + res.body.challenge.image)
                    }
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

    $('#nsc_form_login_nimbus_challenge').on("submit", function () {
        var wrong = false;
        var $form = $(this);
        var state = this.elements['state'];
        var code = this.elements['code'];

        if (code.value.length < 0) {
            $(password).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassInfo"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbusShare.server.user.challenge(state.value, code.value, function (res) {
                if (res.errorCode === 0) {
                    $form.find('input').val('');
                    $('.nsc-popup').hide();
                    nimbusShare.init();
                    nimbus_screen.togglePanel('nimbus');
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationLoginFail"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    });

    $('#nsc_form_register_nimbus').on("submit", function () {
        var wrong = false;
        var $form = $(this);
        var email = this.elements['email'];
        var password = this.elements['password'];
        var password_repeat = this.elements['pass-repeat'];

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
                    $form.find('input').val('');
                    $('.nsc-popup').hide();
                    nimbusShare.init();
                    nimbus_screen.togglePanel('nimbus');
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

    $('#nsc_form_remind_password_nimbus').on("submit", function () {
        let wrong = false;
        let email = this.elements['email'];

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbusShare.server.user.remindPassword(email.value, function (res) {
                if (res.errorCode === 0) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationRestoreSent"), timeout: 5});
                    $('.nsc-popup').hide();
                    $('#nsc_popup_login_nimbus').show()
                        .find('input[name="email"]').val(email.value).end()
                        .find('input[name="password"]').val('').focus();
                } else {
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationEmailIncorrect"),
                        type: "error",
                        timeout: 5
                    });
                }
            });
        }
        return false;
    }).find('input').bind('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 1 || !/\S+@\S+\.\S+/.test($(this).val())) {
            $(this).addClass('wrong');
        }
    });

    $('#nsc_button_nimbus').on('click', function () {
        nimbusShare.init(function (auth) {
            if (!auth) {
                $('#nsc_popup_connect_nimbus').show();
            } else {
                if ($('#nsc_done_nimbus').css('display') === 'flex') {
                    $('#nsc_send').trigger('click');
                } else {
                    nimbus_screen.togglePanel('nimbus');
                }
            }
        });
    });

    $('#nsc_nimbus_logout').on('click', function (e) {
        nimbusShare.server.user.logout(function (req) {
            $('#nsc_done_nimbus').css('display', 'none');
            if (slackShare.data) {
                $('#nsc_send').data('type', 'slack').trigger('change-type');
            } else {
                $('#nsc_send').data('type', '').trigger('change-type');
            }
        });
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

    $('.nsc-open-popup-remind-pass-nimbus').on('click', function () {
        $('.nsc-popup').hide();
        $('#nsc_popup_remind_password_nimbus').show();
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

    $("#nsc_copy_url").click(function () {
        nimbus_screen.copyTextToClipboard($('#nsc_linked input').val());
    });

    /* slack */

    $('#nsc_button_slack').click(function () {
        if (!slackShare.data) {
            var $nsc_slack_connect = $('#nsc_slack_connect');
            var $nsc_preview_img = $('#nsc_preview_img');
            $nsc_slack_connect.show();
            var top = ($nsc_preview_img.outerHeight() - $nsc_slack_connect.find('.nsc-popup-box').outerHeight()) / 2 + $nsc_preview_img.offset().top;
            $nsc_slack_connect.find('.nsc-popup-box').css({transform: 'translate(-50%,0)', top: top + 'px'});
        } else {
            slackShare.init();
            nimbus_screen.togglePanel('slack');
        }
    });
    $('#nsc_button_connect_slack').click(function () {
        $('#nsc_slack_connect').hide();
        slackShare.login();
    });
    $('.nsc-slack-connect-close').click(function () {
        $('#nsc_slack_connect').hide();
    });
    $('#nsc_slack_logout').click(slackShare.logout);

    $('#nsc_slack_toggle').click(function (e) {
        chrome.runtime.sendMessage({operation: 'set_option', key: 'slackPanel', value: false});
        $('#nsc_done_slack').css('display', 'none');
        return false;
    });

    $('#nsc_slack_channel_search').on('keyup', function (e) {
        let $nsc_slack_list_group = $('#nsc_slack_list_group');
        let $list = $nsc_slack_list_group.find('li:visible');
        let index = $list.index($('.nsc-slack-list-selected'));
        $list.eq(index).removeClass('nsc-slack-list-selected');

        if (index === $list.length - 1) {
            index = -1
        }

        if (e.keyCode === 40 /*ArrowDown*/) {
            $list.eq(index + 1).addClass('nsc-slack-list-selected');
        } else if (e.keyCode === 38 /*ArrowUp*/) {
            $list.eq(index - 1).addClass('nsc-slack-list-selected');
        } else {
            let search_text = $(this).val();
            let is_first_item = false;
            $('#nsc_slack_channel, #nsc_slack_user').find('li').each(function () {
                let text = $(this).find('a').text();
                $(this).removeClass('nsc-slack-list-selected');
                if (search_text !== '' && !new RegExp('^' + search_text, 'i').test(text)) {
                    $(this).hide();
                } else {
                    $(this).show();
                    if (!is_first_item) {
                        is_first_item = !is_first_item;
                        $(this).addClass('nsc-slack-list-selected');
                    }
                }
            });
        }
        let $item_active = $('#nsc_slack_list_group .nsc-slack-list-selected');
        if ($item_active.length) {
            let top_active_elem = $item_active.position().top;
            $nsc_slack_list_group.scrollTop(top_active_elem + $nsc_slack_list_group.scrollTop());
        }
    });

    /* end slack */

    /* youtube */

    $('#nsc_button_youtube').on('click', function () {
        nimbusShare.checkPremium(function (err, premium) {
            if (err || !premium.capture) return;

            if (youtubeShare.getAccessToken()) {
                if ($('#nsc_done_youtube').css('display') === 'flex') {
                    $('#nsc_send').trigger('click');
                } else {
                    nimbus_screen.togglePanel('youtube');
                    youtubeShare.viewPlaylist();
                }
            } else {
                youtubeShare.refreshToken('panel');
            }
        });
    });

    $('#nsc_youtube_logout').on('click', youtubeShare.clearData);

    $('#nsc_youtube_playlist_add').find('button[name=cleared]').on('click', function () {
        $('#nsc_youtube_playlist_add').hide();
        $('#nsc_youtube_playlist_show_add').show();
    });

    $('#nsc_youtube_playlist_add').find('button[name=add]').on('click', function (e) {
        var name = $('#nsc_youtube_playlist_add').find('input[name=name]').val();
        if (name === '') return;

        youtubeShare.httpRequest('POST', 'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', JSON.stringify({
            "snippet": {
                "title": name
            }
        }), function () {
            $('#nsc_youtube_playlist_add').show().find('input[name=name]').val('');
            window.setTimeout(function () {
                youtubeShare.viewPlaylist();
            }, 500);
        });
    });

    $('#nsc_youtube_playlist_add').find('input[name=name]').on('keypress', function (e) {
        if (e.keyCode === 13) $('#nsc_youtube_playlist_add').find('button[name=add]').trigger('click')
    });

    $('#nsc_youtube_playlist_show_add').on('click', function () {
        $('#nsc_youtube_playlist_add').show().find('input[name=name]').focus();
        $('#nsc_youtube_playlist_show_add').hide();
    });

    $('input[name=youtubePrivacy]').on('change', function () {
        localStorage.youtubePrivacy = this.value;
    }).filter('[value=' + (localStorage.youtubePrivacy || 'public') + ']').prop('checked', true);

    /* end youtube */

    /* dropbox */

    $('#nsc_button_dropbox').on('click', function () {
        nimbusShare.checkPremium(function (err, premium) {
            if (err || !premium.capture) return;
            if (dropboxShare.getAccessToken()) {
                dropboxShare.saveToDropbox(nimbus_screen.info.file.blob)
            } else {
                dropboxShare.login();
            }
        });
    });

    $('#nsc_dropbox_open_folders').click(function () {
        dropboxShare.getFolders();
    });

    $('#nsc_dropbox_logout').click(function () {
        if ($(this).closest('.nsc-trigger-panel-container').hasClass('active')) {
            $(this).closest('.nsc-trigger-panel-container').removeClass('active')
        }
        dropboxShare.logout();
    });

    dropboxShare.setUploadFolderTooltip();

    /* end dropbox */

    /**/

    $('#nsc_button_google_drive').on('click', function () {
        if (nimbus_screen.getLocationParam() === 'video') {
            nimbusShare.checkPremium(function (err, premium) {
                if (err || !premium.capture) return;

                if (googleShare.getAccessToken()) {
                    googleShare.refreshToken('send')
                } else {
                    googleShare.refreshToken()
                }
            });
        } else {
            if (googleShare.getAccessToken()) {
                googleShare.refreshToken('send')
            } else {
                googleShare.refreshToken()
            }
        }
    });

    googleShare.setUploadFolderTooltip();

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.nsc-trigger-panel-container').length) {
            $('.nsc-trigger-panel-container').removeClass('active')
        }
        if ($(e.target).hasClass('nsc-choose-trigger-panel')) {
            $(e.target).closest('.nsc-trigger-panel-container').toggleClass('active')
        }
    });

    $('#nsc_google_drive_logout').click(function () {
        if ($(this).closest('.nsc-trigger-panel-container').hasClass('active')) {
            $(this).closest('.nsc-trigger-panel-container').removeClass('active')
        }
        googleShare.clearData();
        googleShare.setUploadFolder({"id": "root", "title": "Main folder"});
    });

    $('#nsc_google_drive_share').on('change', function () {
        localStorage.shareOnGoogle = !$(this).prop('checked');
    });

    $('#nsc_google_drive_open_folders').click(function () {
        googleShare.getFolders(googleShare.getUploadFolder().id);
    });

    $('#nsc_file_manager button[name=done]').on('click', function () {
        if ($('#nsc_file_manager').hasClass('is_dropbox')) {
            let info = {path: $('.current').find('div').data('path'), name: $('.current').find('div').data('name')};
            dropboxShare.setUploadFolder(info);
            dropboxShare.setUploadFolderTooltip();
        } else {
            let info = {id: $('.current').find('div').data('id'), title: $('.current').find('span').text()};
            googleShare.setUploadFolder(info);
            googleShare.setUploadFolderTooltip();
        }
        $('#nsc_file_manager').fadeOut("fast");
    });

    /**/

    $('#nsc_environment_info').on('change', function () {
        window.scrollTo(0, 10000);
        const checked = $(this).prop('checked');
        const pageinfo = JSON.parse(localStorage.pageinfo);
        const userAgent = navigator.userAgent;
        let browserName = navigator.appName;
        let platform = navigator.platform;
        let fullVersion = '' + parseFloat(navigator.appVersion);
        let verOffset;
        let $comment = $('#nsc_comment');
        if ((verOffset = userAgent.indexOf("Opera")) !== -1) {
            browserName = "Opera";
            fullVersion = userAgent.substring(verOffset + 6);
            if ((verOffset = userAgent.indexOf("Version")) !== -1) fullVersion = userAgent.substring(verOffset + 8);
        } else if ((verOffset = userAgent.indexOf("Chrome")) !== -1) {
            browserName = "Chrome";
            fullVersion = userAgent.substring(verOffset + 7);
        }
        let info = '\n\n-----------------\n' +
            chrome.i18n.getMessage("nimbusInfoPage") + ': ' + pageinfo.url + '\n' +
            chrome.i18n.getMessage("nimbusInfoScreen") + ': ' + screen.width + 'x' + screen.height + '\n' +
            chrome.i18n.getMessage("nimbusInfoBrowser") + ': ' + browserName + ' ' + fullVersion + '\n' +
            chrome.i18n.getMessage("nimbusInfoAgent") + ': ' + userAgent + '\n' +
            chrome.i18n.getMessage("nimbusInfoPlatform") + ': ' + platform;

        localStorage.setItem('environmentInfo', checked);
        if (checked) {
            $comment.val($comment.val() + info).outerHeight(220);
        } else {
            $comment.val($comment.val().match(/([\s|\S]+)?\n\n-----------------[\s|\S]+/)[1]).height(22);
        }

    });

    $('#nsc_send').on('change-type', function () {
        let self = this;
        switch ($(self).data('type')) {
            case 'youtube':
                $(self).find('span').text(chrome.i18n.getMessage("nimbusYoutubeSend"));
                break;
            case 'slack':
                $(self).find('span').text(chrome.i18n.getMessage("nimbusSlackSend"));
                break;
            default :
                $(self).find('span').text(chrome.i18n.getMessage("nimbusSend"));
                break;
        }
    })
        .trigger('change-type')
        .on('click', function () {
            $(window).off('beforeunload', nimbus_screen.beforeUnload);

            let channel = false;
            if ($(this).data('channel')) {
                channel = $(this).data('channel');
                $(this).data('channel', false);
            }

            if ($(this).data('type') === 'youtube') {
                if (nimbus_screen.info.file.format === 'gif') {
                    alert('Youtube doesn\'t support GIF');
                } else {
                    if (channel) localStorage.youtubePlaylist = channel;
                    youtubeShare.refreshToken('send');
                }
            } else if ($(this).data('type') === 'slack') {
                slackShare.sendScreenshot(nimbus_screen.info.file.data, channel);
            } else {
                nimbusShare.server.user.authState(function (res) {
                    if (res.errorCode === 0 && res.body && res.body.authorized) {
                        if (nimbus_screen.getLocationParam() === 'video') {
                            if (nimbus_screen.info.file.format === 'gif') {
                                nimbusShare.startUploadScreen(nimbus_screen.info.file.blob, channel);
                            } else {
                                nimbusShare.startUploadVideo(nimbus_screen.info.file.blob, channel);
                            }
                        } else {
                            nimbusShare.startUploadScreen(nimbus_screen.info.file.blob, channel);
                        }
                    } else {
                        $('#nsc_popup_connect_nimbus').show();
                    }
                });
            }
        });

    $('#nsc_screen_name').val(nimbus_screen.getFileName());
    $('#nsc_done_youtube_name').val(nimbus_screen.getFileName());

    if (localStorage.getItem('environmentInfo') === 'true') {
        $('#nsc_environment_info').prop('checked', true).trigger('change');
    }

    if (localStorage.slackPanel === 'true' && nimbus_screen.getLocationParam() !== 'video') {
        chrome.runtime.sendMessage({msg: 'get_slack_data'}, function (data) {
            if (data) {
                slackShare.data = data;
                slackShare.init();
                nimbus_screen.togglePanel('slack');
            }
            if (nimbus_screen.getLocationParam() === 'slack') {
                $('#nsc_button_slack').click();
            }
        });
    }

    if (localStorage.youtubePanel === 'true' && nimbus_screen.getLocationParam() === 'video') {
        youtubeShare.refreshToken('panel')
    }

    if (window.core.language === 'ru') {
        $('#nsc_link_twitter').hide();
        $('#nsc_link_facebook').hide();
        $('.nsc-heading-actions').append('<span><a href="https://nimbusweb.co/jobs.php" target="_blank"><b>Мы ищем таланты!</b></a></span>')
    }

    chrome.runtime.onMessage.addListener(function (req) {
        if (req.action === 'slack_auth') {
            slackShare.data = req;
            slackShare.init();
            nimbus_screen.togglePanel('slack');
        }
        if (req.action === 'access_nimbus') {
            nimbusShare.show.info();
            nimbusShare.show.folders();
            nimbus_screen.togglePanel('nimbus');
        }
        if (req.action === 'access_dropbox') {
            dropboxShare.setUploadFolderTooltip();
        }
        if (req.operation === 'access_youtube') {
            if (youtubeShare.type === 'panel') {
                youtubeShare.viewPlaylist();
                nimbus_screen.togglePanel('youtube');
            } else {
                $('#nsc_message_view_uploads, #nsc_message_view_uploads_dropbox, #nsc_linked').removeClass('visible');
                $('#nsc_loading_upload_file').addClass('visible').text('');

                youtubeShare.save();
            }
            youtubeShare.type = undefined;
        }
        if (req.operation === 'access_google') {
            googleShare.setUploadFolderTooltip();
            if (googleShare.type === 'send') {
                $(window).off('beforeunload', nimbus_screen.beforeUnload);

                $('#nsc_message_view_uploads, #nsc_message_view_uploads_dropbox, #nsc_linked').removeClass('visible');
                $('#nsc_loading_upload_file').addClass('visible').text('');

                googleShare.save()
            }
            googleShare.type = undefined;
        }
    });

};