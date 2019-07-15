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
 * Created by hasesanches on 16.12.2016.
 */

var googleShare = {
    fList: {},
    fParents: {},
    fCurrent: 'root',
    getUploadFolder: function () {
        return JSON.parse(localStorage.getItem("google_upload_folder") || '{"id": "root", "title": "Main folder"}');
    },
    setUploadFolder: function (folder) {
        localStorage.setItem('google_upload_folder', JSON.stringify(folder));
    },
    getAccessToken: function () {
        return localStorage.getItem("access_token_google");
    },
    removeAccessToken: function () {
        localStorage.removeItem('access_token_google');
    },
    addFolder: function (folder) {
        $('<li>', {
            'html': '<img src="' + chrome.runtime.getURL('images/icon_folder.png') + '">' + folder.title,
            'data-id': folder.id
        }).on('click', function () {
            var cur = $(this).data('id');
            googleShare.fParents[cur] = googleShare.fCurrent;
            googleShare.getFolders(cur);
        }).appendTo('.nsc-file-manager-folders-list');
    },
    setParent: function (folder) {
        $('.nsc-file-manager-folders .parent').empty().append(
            $('<div>', {
                'html': '<img src="' + chrome.runtime.getURL('images/icon_folder.png') + '">' + folder.title,
                'data-id': folder.id
            }).on('click', function () {
                googleShare.getFolders($(this).data('id'));
            }))
    },
    setCurrent: function (folder) {
        $('.nsc-file-manager-folders .current').empty().append(
            $('<div>', {
                'html': '<img src="images/icon_folder.png "><span>' + folder.title + '</span>',
                'data-id': folder.id
            }));
        $('.nsc-file-manager-future').html(chrome.i18n.getMessage("gDriveLabelFolders") + '&nbsp;<b>' + folder.title + '</b>');
    },
    setRootFolder: function () {
        $('.nsc-file-manager-folders .parent').empty().append(
            $('<div>', {
                'html': chrome.i18n.getMessage("gDriveMainFolder"),
                'data-id': 'root'
            }).on('click', function () {
                googleShare.getFolders($(this).data('id'));
            }))
    },
    getGoogleApi: function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + googleShare.getAccessToken());
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            if (xhr.readyState !== 4) return;
            var res = JSON.parse(xhr.response);
            switch (xhr.status) {
                case 200:	// success
                    cb && cb(null, res);
                    break;

                case 401: // login fail
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationLoginFail"),
                        type: "error",
                        timeout: 2
                    });
                    googleShare.clearData();
                    cb && cb(new Error('Login Fail'), null);
                    break;

                default: 	// network error
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationWrong"),
                        type: "error",
                        timeout: 2
                    });
                    googleShare.clearData();
                    cb && cb(new Error('Network Error'), null);
            }
        };
        xhr.send(null);
    },
    getFolderInfo: function (folderID, callback) {
        if (googleShare.fList[folderID] === undefined) {
            googleShare.getGoogleApi("https://www.googleapis.com/drive/v2/files/" + folderID, function (err, res) {
                if (err) return;
                googleShare.fList[folderID] = res;
                callback(res);
            });
        } else {
            callback(googleShare.fList[folderID]);
        }
    },
    getParentFolder: function (folder, callback) {
        if (googleShare.fParents[folder] === undefined) {
            googleShare.getGoogleApi("https://www.googleapis.com/drive/v2/files/" + folder + "/parents", function (err, res) {
                if (err) return;
                if (res.items.length > 0) {
                    googleShare.fParents[folder] = res.items[0].id;
                    callback(res.items[0].id);
                } else {
                    googleShare.setRootFolder();
                }
                $('#nsc_file_manager').show();
                $('#nsc_loading_upload_file').removeClass('visible');
            });
        } else {
            callback(googleShare.fParents[folder]);
        }
    },
    getFolders: function (folder) {
        folder = folder || 'root';

        $('#nsc_file_manager').fadeIn("fast");
        $('.nsc-file-manager-folders-list').html('').addClass('loading');

        googleShare.fCurrent = folder;
        googleShare.getParentFolder(folder, function (id) {
            googleShare.getFolderInfo(id, function (info) {
                googleShare.setParent(info);
            });
        });

        googleShare.getFolderInfo(folder, function (info) {
            googleShare.setCurrent(info);
        });

        googleShare.getGoogleApi("https://www.googleapis.com/drive/v2/files/" + folder + "/children?q=mimeType = 'application/vnd.google-apps.folder'", function (err, res) {
            $('.nsc-file-manager-folders-list').removeClass('loading');
            if (err) {
                $('#nsc_file_manager').fadeOut("fast");
            } else {
                var l = res.items.length;
                if (l > 0) {
                    for (var i = l - 1; i >= 0; i--) {
                        googleShare.getFolderInfo(res.items[i].id, function (info) {
                            googleShare.addFolder(info);
                        })
                    }
                } else {
                    $('.nsc-file-manager-folders-list').append('<span>' + chrome.i18n.getMessage("gDriveNoItems") + '</span>');
                }
            }
        });
    },
    setPublicGdrive: function (fileId) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/drive/v2/files/' + fileId + '/permissions');
        xhr.setRequestHeader('Authorization', 'Bearer ' + googleShare.getAccessToken());
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            "role": "reader",
            "type": "anyone"
        }));
    },
    clearData: function () {
        if (googleShare.getAccessToken()) {
            googleShare.getGoogleApi('https://accounts.google.com/o/oauth2/revoke?token=' + googleShare.getAccessToken());
            googleShare.removeAccessToken();
            googleShare.setUploadFolderTooltip();
            $('#nsc_loading_upload_file').removeClass('visible').text('');
        }
    },
    refreshToken: function (type) {
        googleShare.type = type;
        if (!googleShare.getAccessToken()) {
            chrome.runtime.sendMessage({msg: 'oauth2_google'});
        } else {
            chrome.runtime.sendMessage({msg: 'oauth2_google_refresh'});
        }
    },
    httpRequest: function (method, url, data, headers, cb) {
        if (typeof headers === 'function') {
            cb = headers;
            headers = null;
        }

        if (typeof data === 'function') {
            cb = data;
            data = null;
            headers = null;
        }

        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + googleShare.getAccessToken());

        if (!headers || (headers && !headers.hasOwnProperty('Content-Type'))) {
            xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        }
        if (headers) {
            for (let key in headers) {
                if (!headers.hasOwnProperty(key)) {
                    return;
                }
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        xhr.onload = function () {
            if (xhr.readyState !== 4) return;
            let res = JSON.parse(xhr.response || '{}');
            switch (xhr.status) {
                case 200:	// success
                    cb && cb(null, res, xhr);
                    break;
                case 401: // login fail
                    cb && cb(res, res, xhr);
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationLoginFail"),
                        type: "error",
                        timeout: 2
                    });
                    googleShare.clearData();
                    break;

                default:
                    cb && cb(res, res, xhr);
            }
        };
        xhr.send(data);
    },
    save: function () {
        let location;
        let length = 1024 * 1024;
        let file = nimbus_screen.info.file.blob;
        let mime_type = ((nimbus_screen.info.file.format === 'mp4' || nimbus_screen.info.file.format === 'webm') ? 'video' : 'image') + '/' + nimbus_screen.info.file.format;

        let data = JSON.stringify({
            "name": nimbus_screen.getFileName('format'),
            "description": "Video uploaded using " + chrome.i18n.getMessage('appName'),
            "parents": [googleShare.getUploadFolder().id]
        });

        let headers = {
            'x-upload-content-length': nimbus_screen.info.file.size,
            'X-Upload-Content-Type': mime_type
        };

        let send = function (location, file, headers, cb) {
            googleShare.httpRequest('PUT', location, file, headers, function (err, res, xhr) {
                if (xhr.status === 308) {
                    let range = +xhr.getResponseHeader('range').match(/\d+$/);
                    let next_range = range + length;

                    if (next_range > nimbus_screen.info.file.size) {
                        next_range = nimbus_screen.info.file.size;
                    }
                    headers = {
                        'Content-Range': 'bytes ' + range + '-' + (next_range - 1) + '/' + nimbus_screen.info.file.size
                    };

                    $('#nsc_loading_upload_file').text(Math.ceil(next_range / nimbus_screen.info.file.size * 100) + '%');

                    file = nimbus_screen.info.file.blob.slice(range, next_range);
                    send(location, file, headers, cb)
                } else {
                    cb && cb(err, res, xhr);
                }
            });
        };

        googleShare.httpRequest('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', data, headers, function (err, res, xhr) {
            if (err) return;
            location = xhr.getResponseHeader('Location');

            if (nimbus_screen.info.file.size > length) {
                $('#nsc_loading_upload_file').text('0%');

                if (nimbus_screen.info.file.size / length > 100) {
                    length = Math.ceil(nimbus_screen.info.file.size / 100);
                    if (length > 1024 * 1024 * 256) {
                        length = 1024 * 1024 * 256;
                    }
                }

                headers = {
                    'Content-Range': 'bytes 0-' + (length - 1) + '/' + nimbus_screen.info.file.size
                };
                file = nimbus_screen.info.file.blob.slice(0, length);
            } else {
                headers = {};
            }

            send(location, file, headers, function (err, res) {
                $('#nsc_loading_upload_file').removeClass('visible').text('');

                $.ambiance({message: 'Upload has completed', timeout: 5});
                if (localStorage.shareOnGoogle === 'true') {
                    googleShare.setPublicGdrive(res.id);
                    nimbusShare.shortUrl('https://drive.google.com/file/d/' + res.id, function (url) {
                        $('#nsc_linked').addClass('visible').find('input').val(url);
                        renderClassRoomButton(url);
                        nimbus_screen.copyTextToClipboard(url);
                    });
                }
            })
        });
    },
    setUploadFolderTooltip: function () {
        if (googleShare.getAccessToken()) {
            $('.nsc-trigger-panel-container.google-drive').addClass('is_trigger');
            $('#nsc_button_google_drive').attr('title', chrome.i18n.getMessage("gDriveSendTo") + ': ' + googleShare.getUploadFolder().title);
            $('#nsc_google_drive_share').prop('checked', localStorage.shareOnGoogle !== 'true');
            $('#nsc_google_drive_open_folders').html('<img src="' + chrome.runtime.getURL('images/icon_folder.png') + '">&nbsp;' + googleShare.getUploadFolder().title);
        } else {
            $('.nsc-trigger-panel-container.google-drive').removeClass('is_trigger');
            $('#nsc_button_google_drive').attr('title', '');
        }
    }
};