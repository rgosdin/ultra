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
let num_error = 0;

var nimbusShare = {
    client_software: 'screens_chrome',
    user_email: '',
    user_temp_pass: '',
    can_upload: true,
    info: {
        usage: {
            current: 0,
            max: 0
        },
        limits: {
            NOTES_MAX_SIZE: 0,
            NOTES_MONTH_USAGE_QUOTA: 0,
            NOTES_MAX_ATTACHMENT_SIZE: 0
        },
        premium: false
    },
    getUploadFolder: function () {
        var obj = {id: 'default', title: 'My Notes'};
        if (localStorage.getItem('nimbus_screen_upload_folder_' + nimbusShare.user_email)) {
            obj = JSON.parse(localStorage.getItem('nimbus_screen_upload_folder_' + nimbusShare.user_email));
        }
        return obj;
    },
    setUploadFolder: function (folder) {
        localStorage.setItem('nimbus_screen_upload_folder_' + nimbusShare.user_email, JSON.stringify(folder));
    },
    getSelectFolder: function () {
        return localStorage.getItem('nimbus_screen_select_folder') || 'default';
    },
    setSelectFolder: function (folder) {
        localStorage.setItem('nimbus_screen_select_folder', folder);
    },
    getUserInfo: function () {
        var obj = {
            login: '',
            premium: false,
            current_size: 0,
            max_size: 0,
            MAX_SIZE: 0,
            MONTH_USAGE_QUOTA: 0,
            MAX_ATTACHMENT_SIZE: 0
        };

        try {
            obj = JSON.parse(localStorage.getItem('nimbus_screen_user_info'));
        } catch (e) {
        }
        return obj;
    },
    kbToMb: function (size, n, text) {
        return +((size) / 1024 / 1024).toFixed(n || 0) + (!text ? ' MB' : text);
    },
    send: function (url, data, success, error) {
        if (typeof url === 'object') {
            error = success;
            success = data;
            data = url;
            url = false;
        }
        // console.log('EverHelper-Session-ID', localStorage.numbusSessionId)
        $.ajax({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-client-software': 'screens_chrome',
                // 'EverHelper-Session-ID': localStorage.numbusSessionId
            },
            type: 'POST',
            url: url || 'https://sync.everhelper.me',
            data: JSON.stringify(data),
            dataType: 'json',
            async: true,
            xhrFields: {
                withCredentials: true
            },
            success: success,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.readyState === 4) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationNetworkError"), timeout: 5}); // server
                } else if (XMLHttpRequest.readyState === 0) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationNetworkError"), timeout: 5}); // network connect
                } else {
                    error && error();
                }
            }
        });
    },
    sendNew: function (action, data, success, error) {
        $.ajax({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-client-software': 'screens_chrome'
            },
            type: 'POST',
            url: 'https://everhelper.me/auth/api/' + action,
            data: JSON.stringify(data),
            dataType: 'json',
            async: true,
            xhrFields: {
                withCredentials: true
            },
            success: success,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.readyState === 4) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationNetworkError"), timeout: 5}); // server
                } else if (XMLHttpRequest.readyState === 0) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationNetworkError"), timeout: 5}); // network connect
                } else {
                    error && error();
                }
            }
        });
    },
    shortUrl: function (url, cb) {
        if (localStorage.autoShortUrl !== 'false') {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://nimb.ws/dantist_api.php', true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onload = function () {
                const obj = jQuery.parseJSON(this.responseText);
                cb && cb(obj.short_url)
            };
            xhr.send('url=' + encodeURIComponent(url));
        } else {
            cb && cb(url)
        }

    },
    checkPremium: function (cb, popup) {
        popup = (popup === undefined ? true : !!popup);
        nimbusShare.server.user.info(function (res) {
            if (res.errorCode === 0) {
                let premium = {
                    note: !!res.body.premium.active,
                    capture: true
                };
                $.ajax({
                    type: 'POST',
                    url: 'https://capture-pro.everhelper.me/v1/premium',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-client-software': 'screens_chrome'
                    },
                    // data: JSON.stringify({
                    //     "device": {
                    //         "globalId": localStorage.globalId,
                    //         "fingerprint": localStorage.fingerprint
                    //     }
                    // }),
                    data: JSON.stringify({
                        "device": {
                            "globalId": localStorage.fingerprint
                        }
                    }),
                    dataType: 'json',
                    async: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function () {
                        cb && cb(null, premium)
                    },
                    error: function (jqXHR) {
                        const res = JSON.parse(jqXHR.responseText);
                        if (jqXHR.status === 403) {
                            if (res.reason === 'banned') {
                                popup && $('#nsc_capture_pro_device').show().find('.nsc-popup-actions-title').text(chrome.i18n.getMessage("nimbusBannedDeviceDestruction"));
                                cb && cb('banned', premium);
                            } else if (res.reason === 'devicequota') {
                                popup && $('#nsc_capture_pro_device').show().find('.nsc-popup-actions-title').text(chrome.i18n.getMessage("nimbusLimitDeviceDestruction"));
                                cb && cb('devicequota', premium);
                            }
                        } else if (jqXHR.status === 404) {
                            popup && $('#nsc_buy_pro').show();
                            premium.capture = false;
                            cb && cb(null, premium);
                        } else {
                            $.ambiance({message: chrome.i18n.getMessage("notificationNetworkError"), timeout: 5});
                            cb && cb('server', {});
                        }
                    }
                });
            } else {
                popup && $('#nsc_buy_pro').show();
                cb && cb('server', {});
            }
        });
    },
    startUploadVideo: function (blob, channel) {
        nimbusShare.server.user.info(function (info) {
            if (info.errorCode !== 0) return;

            nimbusShare.info.premium = !!info.body.premium.active;
            nimbusShare.info.usage.current = +info.body.usage.notes.current;
            nimbusShare.info.usage.max = +info.body.usage.notes.max;
            nimbusShare.info.limits.NOTES_MAX_SIZE = +info.body.limits.NOTES_MAX_SIZE;
            nimbusShare.info.limits.NOTES_MONTH_USAGE_QUOTA = +info.body.limits.NOTES_MONTH_USAGE_QUOTA;
            nimbusShare.info.limits.NOTES_MAX_ATTACHMENT_SIZE = +info.body.limits.NOTES_MAX_ATTACHMENT_SIZE;

            if (nimbus_screen.info.file.size > nimbusShare.info.limits.NOTES_MAX_ATTACHMENT_SIZE) {
                if (nimbusShare.info.premium) {
                    $('#nsc_popup_limit').show();
                } else {
                    $('#nsc_popup_limit_free').show();
                }
                return;
            }

            if (nimbusShare.info.usage.current + nimbus_screen.info.file.size > nimbusShare.info.usage.max) {
                $('#nsc_popup_pro').show();
                return;
            }

            $('#nsc_message_view_uploads, #nsc_message_view_uploads_dropbox, #nsc_linked').removeClass('visible');
            $('#nsc_loading_upload_file').addClass('visible');

            let fd = new FormData();
            fd.append("video", blob, nimbus_screen.getFileName('format'));

            $.ajax({
                url: 'https://sync.everhelper.me/files:preupload',
                type: "POST",
                data: fd,
                processData: false,
                contentType: false,
                xhrFields: {
                    withCredentials: true
                },
            }).done(function (res) {
                if (res.errorCode === 0) {
                    nimbusShare.notesUpdate(res.body.files["video"], 'video', channel);
                    $.ambiance({message: chrome.i18n.getMessage("notificationUploaded"), timeout: 5});
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }
                $('#nsc_loading_upload_file').removeClass('visible');
            });
        });
    },
    startUploadScreen: function (dataURL, channel, cb) {
        nimbusShare.server.user.info(function (info) {
            if (info.errorCode !== 0) return;

            nimbusShare.info.premium = !!info.body.premium.active;
            nimbusShare.info.usage.current = +info.body.usage.notes.current;
            nimbusShare.info.usage.max = +info.body.usage.notes.max;
            nimbusShare.info.limits.NOTES_MAX_SIZE = +info.body.limits.NOTES_MAX_SIZE;
            nimbusShare.info.limits.NOTES_MONTH_USAGE_QUOTA = +info.body.limits.NOTES_MONTH_USAGE_QUOTA;
            nimbusShare.info.limits.NOTES_MAX_ATTACHMENT_SIZE = +info.body.limits.NOTES_MAX_ATTACHMENT_SIZE;

            if (nimbus_screen.info.file.size > nimbusShare.info.limits.NOTES_MAX_ATTACHMENT_SIZE) {
                if (nimbusShare.info.premium) {
                    $('#nsc_popup_limit').show();
                } else {
                    $('#nsc_popup_limit_free').show();
                }
                return;
            }

            if (nimbusShare.info.usage.current + nimbus_screen.info.file.size > nimbusShare.info.usage.max) {
                $('#nsc_popup_pro').show();
                return;
            }

            $('#nsc_message_view_uploads, #nsc_message_view_uploads_dropbox, #nsc_linked').removeClass('visible');
            $('#nsc_loading_upload_file').addClass('visible');

            let fd = new FormData();
            fd.append("screens", dataURL, nimbus_screen.getFileName('format'));

            $.ajax({
                url: 'https://sync.everhelper.me/files:preupload',
                type: "POST",
                data: fd,
                processData: false,
                contentType: false,
                xhrFields: {
                    withCredentials: true
                },
            }).done(function (res) {
                if (res.errorCode === 0) {
                    nimbusShare.screenSave(res.body.files["screens"], channel, cb);
                    $.ambiance({message: chrome.i18n.getMessage("notificationUploaded"), timeout: 5});
                } else {
                    $('#nsc_loading_upload_file').removeClass('visible');
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }

            });
        });
    },
    screenSave: function (tempname, channel, cb) {
        const share = nimbusShare.notesIsShared();
        const pageinfo = JSON.parse(localStorage.pageinfo);
        let comment = nimbusShare.notesGetComment();
        if (channel) {
            comment = comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/) ? comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/)[2] : '';
        }
        nimbusShare.send({
            "action": "screenshots:save",
            "body": {
                "screen": {
                    "commentText": comment,
                    "title": nimbusShare.notesGetFileName(),
                    "tempname": tempname,
                    "parent_id": nimbusShare.getUploadFolder().id,
                    "url": window.core.is_chrome ? pageinfo.url : ''
                },
                "share": share
            },
            "_client_software": nimbusShare.client_software

        }, function (msg) {
            $('#nsc_loading_upload_file').removeClass('visible');
            $('#nsc_nimbus_folder .nsc-aside-list-selected a').trigger('click');
            if (msg.errorCode === 0) {
                if (share) {
                    nimbusShare.shortUrl(msg.body.location, function (url) {
                        $('#nsc_linked').addClass('visible').find('input').val(url);
                        renderClassRoomButton(url);
                        nimbus_screen.copyTextToClipboard(url);
                    });
                } else {
                    $('#nsc_message_view_uploads').addClass('visible');
                }
            } else {
                if (msg.errorCode === -20) {
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationReachedLimit"),
                        type: "error",
                        timeout: 5
                    });
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }
            }

            cb && cb();
        });
    },
    notesGenerateId: function () {
        var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var string = '';
        var min = 0;
        var max = chars.length;

        for (var i = 0; i < 3; i++) {
            var n = Math.floor(Math.random() * (max - min)) + min;
            string += chars[n];
        }

        return string + (new Date()).getTime();
    },
    notesUpdate: function (tempname, type, channel) {
        const notesId = nimbusShare.notesGenerateId();
        const pageinfo = JSON.parse(localStorage.pageinfo);
        let comment = nimbusShare.notesGetComment();
        if (channel) {
            comment = comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/) ? comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/)[2] : '';
        }
        nimbusShare.send({
            "action": "notes:update",
            "body": {
                "store": {
                    "notes": [
                        {
                            "global_id": notesId,
                            "parent_id": nimbusShare.getUploadFolder().id,
                            "index": 1,
                            "type": "note",
                            "role": "video",
                            "title": nimbusShare.notesGetFileName(),
                            "text": comment,
                            "url": window.core.is_chrome ? pageinfo.url : '',
                            "tags": ["screens", "chrome"],
                            "attachements": [
                                {
                                    "global_id": nimbusShare.notesGenerateId(),
                                    "type": type || "image",
                                    "tempname": tempname
                                }
                            ]
                        }
                    ]
                }
            }
        }, function (res) {
            if (res.errorCode === '-20') {
                $.ambiance({message: chrome.i18n.getMessage("notificationReachedLimit"), type: "error", timeout: 5});
            } else {
                $('#nsc_nimbus_folder .nsc-aside-list-selected a').trigger('click');
                if (nimbusShare.notesIsShared()) {
                    nimbusShare.notesShare([notesId]);
                } else {
                    $('#nsc_message_view_uploads').addClass('visible');
                }
            }
        });
    },
    notesIsShared: function () {
        return localStorage.nimbusShare === 'false';
    },
    notesShare: function (id) {
        this.send({
            "action": "notes:share",
            "body": {
                "global_id": id
            }
        }, function (msg) {
            nimbusShare.shortUrl(msg.body[id[0]], function (url) {
                $('#nsc_linked').addClass('visible').find('input').val(url);
                renderClassRoomButton(url);
                nimbus_screen.copyTextToClipboard(url);
            });
        }, function (error) {
            console.log(error);
        });
    },
    notesGet: function () {
        this.send({
            "action": "notes:get",
            "body": {
                "last_update_time": 1366090275
            }
        });
    },
    notesGetComment: function () {
        return $('#nsc_comment').val();
    },
    notesGetFileName: function () {
        return $('#nsc_screen_name').val();
    },
    notesGetFolders: function (cb) {
        nimbusShare.send({
            "action": "notes:getFolders",
            "body": {}
        }, cb, cb);
    },
    server: {
        user: {
            auth: function (login, password, cb) {
                (login && password) && nimbusShare.sendNew('auth', {
                    "login": login,
                    "password": password
                }, function (res) {
                    nimbusShare.send('https://nimbusweb.me/auth/api/applyAuth', {"sessionId": res.body.sessionId});
                    cb && cb(res)
                }, cb);
            },
            logout: function (cb) {
                nimbusShare.send({
                    "action": "user:logout",
                    "_client_software": nimbusShare.client_software
                }, cb, cb);
            },
            register: function (login, password, cb) {
                (login && password) && nimbusShare.sendNew('register', {
                    "login": login,
                    "password": password,
                    "service": "nimbus",
                    "languages": [navigator.language]
                }, function (res) {
                    nimbusShare.send('https://nimbusweb.me/auth/api/applyAuth', {"sessionId": res.body.sessionId});
                    cb && cb(res)
                }, cb);
            },
            challenge: function (state, answer, cb) {
                nimbusShare.sendNew('challenge', {
                    "state": state,
                    "answer": answer,
                }, function (res) {
                    nimbusShare.send('https://nimbusweb.me/auth/api/applyAuth', {"sessionId": res.body.sessionId});
                    cb && cb(res)
                }, cb);
            },
            info: function (cb) {
                nimbusShare.send({
                    "action": "user:info"
                }, cb, cb);
            },
            authState: function (cb) {
                nimbusShare.send({
                    "action": "user:authstate"
                }, cb, cb);
            },
            remindPassword: function (email, cb) {
                email && nimbusShare.send({
                    "action": "remind_password",
                    "email": email
                }, cb, cb);
            }
        }
    },
    show: {
        folders: function (cb) {
            nimbusShare.notesGetFolders(function (res) {
                if (res.errorCode === -19) {
                    num_error = +num_error;
                    if (num_error < 5) {
                        window.setTimeout(function () {
                            nimbusShare.show.folders(cb);
                        }, 1000);
                    }
                    return;
                }
                if (res.errorCode !== 0) return;

                $('#nsc_nimbus_folder_loader').hide();
                $('#nsc_nimbus_folder_group').show();

                var $nimbus_folders = $('#nsc_nimbus_folder');
                $nimbus_folders.find('li').remove();
                for (var i = 0, l = res.body.notes.length, folder; i < l; i++) {
                    folder = res.body.notes[i];
                    $nimbus_folders.append(
                        $('<li>', {
                            'class': nimbusShare.getSelectFolder() === folder.global_id ? 'nsc-aside-list-selected' : ''
                        }).append(
                            $('<a>', {
                                'href': '#',
                                'text': folder.title,
                                'data-id': folder.global_id
                            }).on('click', function () {
                                $(this).closest('ul').find('li').removeClass('nsc-aside-list-selected');
                                $(this).closest('li').addClass('nsc-aside-list-selected');
                                nimbusShare.setUploadFolder({id: $(this).data('id'), title: $(this).text()});
                                nimbusShare.setSelectFolder($(this).data('id'));
                                return false;
                            })
                        ).append(
                            $('<span>').attr({
                                'class': 'nsc-icon nsc-fast-send',
                                'title': chrome.i18n.getMessage("tooltipUploadTo") + ' ' + folder.title,
                                'data-id': folder.global_id
                            }).on('click', function (e) {
                                $('#nsc_send').data('channel', $(this).data('id')).trigger('click');
                                nimbusShare.setUploadFolder({id: $(this).data('id'), title: $(this).data('text')});
                            })
                        )
                    );
                }
                cb && cb();
            });
        },
        info: function (cb) {
            nimbusShare.server.user.info(function (info) {
                if (info.errorCode !== 0) return;

                var can_upload = (info.body.usage.notes.current + nimbus_screen.info.file.size) < info.body.usage.notes.max;
                var progress = info.body.usage.notes.current / info.body.usage.notes.max * 100;
                var $usage_group = $('#nsc_nimbus_usage_group').show();

                $usage_group.find('.nsc-aside-usage-text').text(chrome.i18n.getMessage("nimbusLimitUsage") + ' ' + nimbusShare.kbToMb(info.body.usage.notes.current, 1) + ' ' + chrome.i18n.getMessage("nimbusLimitOf") + ' ' + nimbusShare.kbToMb(info.body.usage.notes.max));
                $usage_group.find('.nsc-aside-usage-line-colored').width(progress);
                $('#nsc_nimbus_email').text(info.body.login);
                $('#nsc_nimbus_private_share').prop('checked', localStorage.nimbusShare === 'true');

                if (!can_upload && !info.body.premium.active) $('#nsc_popup_pro').show();
                if (progress > 90) {
                    $('#nsc_nimbus_upgrade_pro').show();
                    $usage_group.find('.nsc-aside-usage-line-colored').css({background: '#ff0000'});
                }
                // if (can_upload) {
                //     if (info.body.premium.active) {
                //         $('#nsc_nimbus_upgrade_pro').hide();
                //     } else {
                //         $('#nsc_nimbus_upgrade_pro').show();
                //     }
                //     // $('#nsc_popup_pro').hide();
                // } else {
                //     $('#nsc_popup_pro').show();
                // }

                cb && cb();
            });
        }
    },
    init: function (cb) {
        nimbusShare.server.user.authState(function (res) {
            if (res.errorCode === 0 && res.body && res.body.authorized) {
                nimbusShare.show.info();
                nimbusShare.show.folders();
                if (localStorage.getItem('nimbusPanel') === 'true') {
                    nimbus_screen.togglePanel('nimbus');
                }
                cb && cb(true)
            } else cb && cb(false)
        });

    }
};