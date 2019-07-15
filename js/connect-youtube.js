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
 - author: hasesanches
 - date: 04.07.16
 - http://hase.su
 **/

var youtubeShare = {
    type: null,
    channel: null,
    getAccessToken: function () {
        return localStorage.access_token_youtube || false;
    },
    removeAccessToken: function () {
        localStorage.removeItem('access_token_youtube');
    },
    refreshToken: function (type) {
        youtubeShare.type = type;
        if (!youtubeShare.getAccessToken()) {
            chrome.runtime.sendMessage({msg: 'oauth2_youtube'});
        } else {
            chrome.runtime.sendMessage({msg: 'oauth2_youtube_refresh'});
        }
    },
    clearData: function () {
        if (youtubeShare.getAccessToken()) {
            googleShare.httpRequest('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + youtubeShare.getAccessToken(), false);
            youtubeShare.removeAccessToken();
            $('#nsc_done_youtube').css('display', 'none');
            localStorage.youtubePanel = 'false';
        }
    },
    httpRequest: function (method, url, data, headers, cb, popup) {
        if (typeof headers === 'function') {
            popup = cb;
            cb = headers;
            headers = null;
        }

        if (typeof data === 'function') {
            popup = headers;
            cb = data;
            data = null;
            headers = null;
        }

        if (popup === undefined) popup = false;

        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + youtubeShare.getAccessToken());

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
            // console.log(response);
            switch (xhr.status) {
                case 200:	// success
                    cb && cb(null, res, xhr);
                    break;
                case 401: // login fail
                    cb && cb(res, res, xhr);
                    popup && $.ambiance({
                        message: chrome.i18n.getMessage("notificationLoginFail"),
                        type: "error",
                        timeout: 2
                    });
                    youtubeShare.clearData();
                    break;

                default: 	// network error
                    cb && cb(res, res, xhr);
                    popup && $.ambiance({
                        message: chrome.i18n.getMessage("notificationWrong"),
                        type: "error",
                        timeout: 2
                    });
            }
        };
        xhr.send(data);
    },
    viewPlaylist: function () {
        let $playlist = $('#nsc_youtube_playlist');
        $playlist.find('li').remove();

        youtubeShare.httpRequest('GET', 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', function (err, res) {
            if (err) return;
            for (let len = res.items.length; len--;) {
                $playlist.append(
                    $('<li>').append(
                        $('<a>').attr({
                            'href': '#',
                            'data-id': res.items[len].id
                        }).on('click', function (e) {
                            let channelId = $(this).data('id');
                            localStorage.youtubePlaylist = channelId;
                            chrome.runtime.sendMessage({
                                operation: 'set_option',
                                key: 'youtubePlaylist',
                                value: channelId
                            });
                            $playlist.find('li').removeClass('nsc-aside-list-selected');
                            $(this).closest('li').addClass('nsc-aside-list-selected');
                            return false;
                        }).text(res.items[len].snippet.title)
                    ).append(
                        $('<span>').attr({
                            'class': 'nsc-icon nsc-fast-send',
                            'title': chrome.i18n.getMessage("tooltipUploadTo") + ' ' + res.items[len].snippet.title,
                            'data-id': res.items[len].id
                        }).on('click', function (e) {
                            $('#nsc_send').data('channel', $(this).data('id')).trigger('click');
                        })
                    )
                );
            }
            localStorage.youtubePlaylist = undefined;

            if (res.items.length > 0) {
                if (!localStorage.youtubePlaylist) {
                    localStorage.youtubePlaylist = res.items[0].id;
                } else {
                    let search = false;
                    for (let len2 = res.items.length; len2--;) {
                        if (localStorage.youtubePlaylist === res.items[len2].id) search = true;
                    }
                    if (!search) localStorage.youtubePlaylist = res.items[0].id;
                }
            }

            if (localStorage.youtubePlaylist) {
                $('#nsc_youtube_playlist').find('[data-id=' + localStorage.youtubePlaylist + ']').closest('li').addClass('nsc-aside-list-selected');
            }
        });
    },
    save: function () {
        const privacy = $('input[name=youtubePrivacy]:checked').val() || 'public';
        const name = $('#nsc_done_youtube_name').val() || nimbus_screen.getFileName();
        let location;
        let length = 1024 * 1024;
        let file = nimbus_screen.info.file.blob;
        let mime_type = ((nimbus_screen.info.file.format === 'mp4' || nimbus_screen.info.file.format === 'webm') ? 'video' : 'image') + '/' + nimbus_screen.info.file.format;

        let setLink = function (id) {
            $('#nsc_loading_upload_file').removeClass('visible').text('');
            $.ambiance({message: 'Upload has completed', timeout: 5});
            if (privacy !== 'private') {
                const url = 'https://youtu.be/' + id;
                $('#nsc_linked').addClass('visible').find('input').val(url);
                renderClassRoomButton(url);
                nimbus_screen.copyTextToClipboard(url);
            }

            if (nimbus_screen.getLocationParam() === 'video') {
                tracker.send(VIDEO_UPLOAD);
            }
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

        let data = JSON.stringify({
            "snippet": {
                "title": name,
                "description": "Video uploaded using Nimbus Screenshot & Screen Video Recorder",
                "categoryId": '22'
            },
            "status": {
                "privacyStatus": privacy
            }
        });

        let headers = {
            'x-upload-content-length': nimbus_screen.info.file.size,
            'X-Upload-Content-Type': mime_type
        };

        youtubeShare.httpRequest('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails', data, headers, function (err, res, xhr) {
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
                if (err) return;
                if (localStorage.youtubePlaylist) {
                    data = JSON.stringify({
                        "snippet": {
                            "playlistId": localStorage.youtubePlaylist,
                            "resourceId": {
                                "kind": "youtube#video",
                                "videoId": res.id
                            }
                        }
                    });
                    youtubeShare.httpRequest('POST', 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', data, function (err, res) {
                        if (err) return;
                        setLink(res.snippet.resourceId.videoId);
                    });
                } else {
                    setLink(res.id);
                }
            });
        });
    },
    sendVideo: function (playlist) {
        $('#nsc_message_view_uploads, #nsc_message_view_uploads_dropbox, #nsc_linked').removeClass('visible');
        $('#nsc_loading_upload_file').addClass('visible');

        playlist = playlist || localStorage.youtubePlaylist;
        const privacy = $('input[name=youtubePrivacy]:checked').val() || 'public';
        const name = $('#nsc_done_youtube_name').val() || nimbus_screen.getFileName();

        let setLink = function (id) {
            $.ambiance({message: 'Upload has completed', timeout: 5});
            if (privacy !== 'private') {
                const url = 'https://youtu.be/' + id;
                $('#nsc_linked').addClass('visible').find('input').val(url);
                renderClassRoomButton(url);
                nimbus_screen.copyTextToClipboard(url);
            }

            if (nimbus_screen.getLocationParam() === 'video') {
                tracker.send(VIDEO_UPLOAD);
            }
        };

        let data = JSON.stringify({
            "snippet": {
                "title": name,
                "description": "Video uploaded using Nimbus Screenshot & Screen Video Recorder",
                "categoryId": '22'
            },
            "status": {
                "privacyStatus": privacy
            }
        });

        let headers = {
            //'Content-Length': nimbus_screen.info.file.data.size,
            'x-upload-content-length': nimbus_screen.info.file.data.size,
            'X-Upload-Content-Type': 'video/*'
        };

        youtubeShare.httpRequest('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails', data, headers, function (err, res, xhr) {
            if (err) return;
            let location = xhr.getResponseHeader('Location');

            headers = {
                'Content-Type': 'video/*',
                //'Content-Length': nimbus_screen.info.file.data.size
            };

            youtubeShare.httpRequest('PUT', location, nimbus_screen.info.file.data, headers, function (err, res) {
                if (playlist && !err) {
                    data = JSON.stringify({
                        "snippet": {
                            "playlistId": playlist,
                            "resourceId": {
                                "kind": "youtube#video",
                                "videoId": res.id
                            }
                        }
                    });
                    youtubeShare.httpRequest('POST', 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', data, function (err, res) {
                        $('#nsc_loading_upload_file').removeClass('visible');
                        if (err) return;
                        setLink(res.snippet.resourceId.videoId);
                    });
                } else {
                    $('#nsc_loading_upload_file').removeClass('visible');
                    if (err) return;
                    setLink(res.id);
                }
            });
        });
    }
};