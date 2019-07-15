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

window.slackShare = {
    data: null,
    login: function () {
        chrome.runtime.sendMessage({
            operation: 'open_page',
            url: 'https://slack.com/oauth/authorize?client_id=17258488439.50405596566&scope=files:write:user,channels:read,users:read'
        });
    },
    logout: function () {
        chrome.runtime.sendMessage({msg: 'slack_logout'});
        slackShare.data = null;
        $('#nsc_done_slack').css('display', 'none');
        localStorage.slackPanel = false;

        nimbusShare.server.user.authState(function (res) {
            if (res.errorCode === 0 && res.body && res.body.authorized) {
                $('#nsc_send').data('type', 'nimbus').trigger('change-type');
            } else {
                $('#nsc_send').data('type', '').trigger('change-type');
            }
        });
    },
    setView: function (data) {
        if (!data.channels || !data.users) {
            return;
        }
        var $channel = $('#nsc_slack_channel');
        var $user = $('#nsc_slack_user');
        $channel.find('li').remove();
        data.channels.sort(function (a, b) {
            if (a.name < b.name) {
                return 1;
            }
            if (a.name > b.name) {
                return -1;
            }
            return 0;
        });
        for (var chanlen = data.channels.length; chanlen--;) {
            $channel.append(
                $('<li>').append(
                    $('<a>').attr({
                        'href': '#',
                        //'title':   data.channels[chanlen].name,
                        'data-id': data.channels[chanlen].id
                    }).on('click', function (e) {
                        chrome.runtime.sendMessage({
                            operation: 'set_option',
                            key: 'slackChannel',
                            value: +$(this).data('id')
                        });
                        $('#nsc_slack_list_group').find('li').removeClass('nsc-aside-list-selected');
                        $(this).closest('li').addClass('nsc-aside-list-selected');
                        return false;
                    }).text(data.channels[chanlen].name)
                ).append(
                    $('<span>').attr({
                        'class': 'nsc-icon nsc-fast-send',
                        'title': chrome.i18n.getMessage("tooltipUploadTo") + ' ' + data.channels[chanlen].name,
                        'data-id': data.channels[chanlen].id
                    }).on('click', function (e) {
                        $('#nsc_send').data('channel', $(this).data('id')).trigger('click');
                    })
                )
            );
        }

        $user.find('li').remove();
        for (var uselen = data.users.length; uselen--;) {
            $user.append(
                $('<li>').append(
                    $('<a>').attr({
                        'href': '#',
                        'title': data.users[uselen].name,
                        'data-id': data.users[uselen].id
                    }).on('click', function (e) {
                        chrome.runtime.sendMessage({
                            operation: 'set_option',
                            key: 'slackChannel',
                            value: +$(this).data('id')
                        });
                        $('#nsc_slack_list_group').find('li').removeClass('nsc-aside-list-selected');
                        $(this).closest('li').addClass('nsc-aside-list-selected');
                        return false;
                    }).text(data.users[uselen].name)
                ).append(
                    $('<span>').attr({
                        'class': 'nsc-icon nsc-fast-send',
                        'title': chrome.i18n.getMessage("tooltipUploadTo") + ' ' + data.users[uselen].name,
                        'data-id': data.users[uselen].id
                    }).on('click', function (e) {
                        $('#nsc_send').data('channel', $(this).data('id')).trigger('click');
                    })
                )
            );
        }

        if (data.channel) {
            $('#nsc_slack_list_group').find('[data-id=' + data.channel + ']').closest('li').addClass('nsc-aside-list-selected');
        } else {
            $('#nsc_slack_list_group').find('li:eq(0)').addClass('nsc-aside-list-selected');
        }

        $('#nsc_slack_team_name').text(data.oauth.team_name);
    },
    sendScreenshot: function (dataURL, channel) {
        var comment = $('#nsc_comment').val();
        var fd = new FormData();
        var file = nimbus_screen.dataURLtoBlob(dataURL);

        if (channel) {
            comment = comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/) ? comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/)[2] : '';
        }

        fd.append("token", slackShare.data.oauth.access_token);
        fd.append("file", file, nimbus_screen.getFileName('format'));
        fd.append("filename", 'Directly uploaded via Nimbus Capture for Chrome ' + nimbus_screen.getFileName('format'));
        fd.append("initial_comment", comment);
        fd.append("channels", channel || $('#nsc_slack_list_group .nsc-aside-list-selected a').data('id'));

        $('#nsc_loading_upload_file').addClass('visible');
        $.ajax({
            type: 'POST',
            url: 'https://slack.com/api/files.upload',
            data: fd,
            processData: false,
            contentType: false,
            success: function (data, textStatus, jqXHR) {
                $('#nsc_loading_upload_file').removeClass('visible');
                if (!data.ok) {
                    $.ambiance({message: 'error upload to slack', type: 'error', timeout: 5});
                } else {
                    $.ambiance({message: 'Upload has completed', timeout: 5});
                }
            }
        });
    },
    init: function () {
        if (slackShare.data) {
            slackShare.setView(slackShare.data);
        }
    }
};
