const hot_keys_map = {
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    65: 'A',
    66: 'B',
    67: 'C',
    68: 'D',
    69: 'E',
    70: 'F',
    72: 'G',
    73: 'H',
    74: 'J',
    75: 'K',
    76: 'L',
    77: 'M',
    78: 'N',
    79: 'O',
    80: 'P',
    81: 'Q',
    82: 'R',
    83: 'S',
    84: 'T',
    85: 'U',
    86: 'V',
    87: 'W',
    88: 'X',
    89: 'Y',
    90: 'Z',
    0: 'disable'
};

let t = null;

$('#capture_options').hide();
$('#record_options').hide();
$('#record_status').hide();
$('#record_setting').hide();

function setOption(key, value) {
    if (window.core.is_chrome) return;
    chrome.runtime.sendMessage({operation: 'set_option', key: key, value: value});
}

function checkRecord() {
    chrome.runtime.sendMessage({operation: 'get_info_record'}, function (res) {
        if (res.status) {
            showTime(res.time);
            showRecordStatus();
        } else {
            showCaptureOptions();
            clearTimeout(t)
        }
        t = setTimeout(checkRecord, 500);
    });
}

function showCaptureOptions() {
    $('#capture_options').show();
    $('#record_options').hide();
    $('#record_status').hide();
    $('#record_setting').hide();

    $('body').removeClass('resize');
}

function showRecordOptions() {
    $('#capture_options').hide();
    $('#record_options').show();
    $('#record_status').hide();
    $('#record_setting').hide();

    $('body').removeClass('resize');
}

function showRecordSetting() {
    $('#capture_options').hide();
    $('#record_options').hide();
    $('#record_status').hide();
    $('#record_setting').show();

    $('body').removeClass('resize');
}

function showRecordStatus() {
    $('#capture_options').hide();
    $('#record_options').hide();
    $('#record_status').show();
    $('#record_setting').hide();

    $('body').addClass('resize');
}

function showTime(date) {
    let time = new Date(date),
        m = time.getUTCMonth(),
        d = time.getUTCDate() - 1,
        h = time.getUTCHours(),
        M = time.getUTCMinutes(),
        s = time.getUTCSeconds(),
        time_str = '';
    if (m > 0) time_str += ('0' + y).slice(-2) + ':';
    if (d > 0) time_str += ('0' + d).slice(-2) + ':';
    if (h > 0) time_str += ('0' + h).slice(-2) + ':';
    time_str += ('0' + M).slice(-2) + ':';
    time_str += ('0' + s).slice(-2);

    $('#record_time').text(time_str);
}

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

function setDevices(devices) {
    let $camera = $('select[name=selected-video-camera]');
    let $microphone = $('select[name=selected-microphone]');
    let mic_is = false, cam_is = false;

    for (let i = 0; i !== devices.length; ++i) {
        const device = devices[i];
        let $option = $('<option>').val(device.deviceId);
        if (device.kind === 'audioinput') {
            if (localStorage.selectedMicrophone === device.deviceId) {
                $option.attr('selected', 'selected');
                mic_is = true;
            }
            $microphone.append($option.text(device.label));
        } else if (device.kind === 'videoinput') {
            if (localStorage.selectedVideoCamera === device.deviceId) {
                $option.attr('selected', 'selected');
                cam_is = true;
            }
            $camera.append($option.text(device.label));
        } else {
            console.log('Some other kind of source/device: ', device);
        }
    }

    if (!mic_is) localStorage.removeItem('selectedMicrophone');
    if (!cam_is) localStorage.removeItem('selectedVideoCamera');
}

$(document).ready(function () {
    const main_menu_item = JSON.parse(localStorage.mainMenuItem);

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

    $('[data-i18n-attr="title"]').tooltip({
        position: {my: "center top+10", at: "center bottom"}
    });

    $("button").on('click', function () {
        switch (this.name) {
            case 'capture-visible':
            case 'capture-fragment':
            case 'capture-selected':
            case 'capture-delayed':
            case 'capture-scroll':
            case 'capture-entire':
            case 'capture-window':
            case 'capture-blank':
                chrome.runtime.sendMessage({operation: 'activate_capture', 'value': this.name});
                break;
            case 'nimbus-capture-desktop':
                if (window.core.is_windows) chrome.runtime.sendMessage({
                    operation: 'open_page',
                    'url': 'https://nimbusweb.me/nimbus-capture-windows.php'
                });
                else chrome.runtime.sendMessage({
                    operation: 'open_page',
                    'url': 'https://itunes.apple.com/us/app/nimbus-capture-screenshots/id1125725441?ls=1&mt=12'
                });
                break;
            case 'open-option':
                chrome.runtime.sendMessage({operation: 'open_page', 'url': 'options.html'});
                break;
            case 'capture-video':
                showRecordOptions();
                break;
            case 'back-to-capture':
                showCaptureOptions();
                break;
            case 'back-to-capture-setting':
                showRecordOptions();
                break;
            case 'record-start':
                const value = $('input[name=record-type]:checked').val();
                localStorage.videoCountdown = $('#video_countdown').val();
                setOption('videoCountdown', localStorage.videoCountdown);
                chrome.runtime.sendMessage({operation: 'activate_record', 'key': 'start', 'value': value});
                break;
            case 'record-stop':
                chrome.runtime.sendMessage({operation: 'activate_record', 'key': 'stop'});
                break;
            case 'record-pause':
                chrome.runtime.sendMessage({operation: 'activate_record', 'key': 'pause'});
                chrome.runtime.sendMessage({operation: 'get_info_record'}, function (res) {
                    $('button[name=record-pause] .nsc-button-layout').text(res.state === 'recording' ? chrome.i18n.getMessage("popupBtnStopPause") : chrome.i18n.getMessage("popupBtnStopResume"));
                });
                break;
            case 'video-setting':
                showRecordSetting();
                break;
            case 'open-help':
                if (window.navigator.language === 'ru') {
                    chrome.runtime.sendMessage({
                        operation: 'open_page',
                        'url': 'https://everhelper.desk.com/customer/en/portal/articles/2376166-%D0%9A%D0%B0%D0%BA-%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D1%8B%D0%B2%D0%B0%D1%82%D1%8C-%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE-%D0%B2-google-chrome-'
                    });
                } else {
                    chrome.runtime.sendMessage({
                        operation: 'open_page',
                        'url': 'https://everhelper.desk.com/customer/en/portal/articles/2137491-how-to-record-video-from-screen-screencasts---quick-guide'
                    });
                }
                break;
            case 'open-extensions':
                    chrome.runtime.sendMessage({operation: 'open_page','url': 'chrome://extensions/?id=bpconcjcammlapcogcnnelfmaeghhagj'});
                break;
            case 'open-nimbus-client':
                chrome.runtime.sendMessage({operation: 'open_page', 'url': 'https://nimbus.everhelper.me/client/'});
                break;
            case 'reset-video-setting':
                localStorage.videoSize = 'auto';
                localStorage.videoBitrate = '4000000';
                localStorage.audioBitrate = '96000';
                localStorage.videoFps = '24';
                localStorage.deleteDrawing = '6';

                setOption('videoSize', localStorage.videoSize);
                setOption('videoBitrate', localStorage.videoBitrate);
                setOption('audioBitrate', localStorage.audioBitrate);
                setOption('videoFps', localStorage.videoFps);
                setOption('deleteDrawing', localStorage.deleteDrawing);

                $("input[name=video-size]").prop('checked', false).filter('[value=' + localStorage.videoSize + ']').prop('checked', true);
                $("select[name=audio-bitrate]").val(localStorage.audioBitrate);
                $("select[name=video-bitrate]").val(localStorage.videoBitrate);
                $("select[name=video-fps]").val(localStorage.videoFps);
                $("select[name=delete-drawing]").val(localStorage.deleteDrawing);
                break;
        }

        if ($(this).data('closeWindow')) {
            window.close();
        }
    });

    $("input").on('change', function () {
        switch (this.name) {
            case 'record-type':
                if ($(this).val() === 'desktop' || $(this).val() === 'camera') {
                    $('input[name=record-tab-sound]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopTabSound")).addClass('disabled');
                    $('input[name=show-drawing-tools]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation")).addClass('disabled');
                    $('input[name=record-camera]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation")).addClass('disabled');
                } else {
                    $('input[name=record-tab-sound]').prop("checked", localStorage.tabSound !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                    $('input[name=show-drawing-tools]').prop("checked", localStorage.deawingTools !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                    $('input[name=record-camera]').prop("checked", localStorage.videoCamera !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                }
                localStorage.recordType = $(this).val();
                setOption('recordType', localStorage.recordType);
                break;
            case 'record-mic':
                localStorage.micSound = $(this).prop("checked");
                setOption('micSound', localStorage.micSound);
                break;
            case 'record-camera':
                localStorage.videoCamera = $(this).prop("checked");
                setOption('videoCamera', localStorage.videoCamera);
                break;
            case 'record-tab-sound':
                localStorage.tabSound = $(this).prop("checked");
                setOption('tabSound', localStorage.tabSound);
                break;
            case 'show-drawing-tools':
                localStorage.deawingTools = $(this).prop("checked");
                setOption('deawingTools', localStorage.deawingTools);
                break;
            case 'enable-watermark':
                if (localStorage.enableWatermark === 'false' || (!localStorage.fileWatermark && localStorage.typeWatermark === 'image')) {
                    $(this).prop("checked", false);
                    chrome.runtime.sendMessage({operation: 'open_page', 'url': 'options.html?watermark'});
                } else {
                    localStorage.enableWatermark = $(this).prop("checked");
                    window.core.setOption('enableWatermark', localStorage.enableWatermark);
                }
                break;
            case 'video-size':
                localStorage.videoSize = $(this).val();
                setOption('videoSize', localStorage.videoSize);
                break;
            case 'video-re-encoding':
                localStorage.videoReEncoding = $(this).prop("checked");
                setOption('videoReEncoding', localStorage.videoReEncoding);
                break;
        }
    }).filter('[name=record-mic]').prop('checked', localStorage.micSound !== 'false').end()
        .filter('[name=record-camera]').prop('checked', localStorage.videoCamera !== 'false').end()
        .filter('[name=record-tab-sound]').prop('checked', localStorage.tabSound !== 'false').end()
        .filter('[name=show-drawing-tools]').prop('checked', localStorage.deawingTools !== 'false').end()
        .filter('[name=enable-watermark]').prop('checked', localStorage.enableWatermark !== 'false').end()
        .filter('[name=video-re-encoding]').prop('checked', localStorage.videoReEncoding !== 'false').end()
        .filter('[name=record-type][value=' + localStorage.recordType + ']').prop('checked', true).end()
        .filter('[name=video-size][value=' + localStorage.videoSize + ']').prop('checked', true);

    if (localStorage.recordType === 'desktop' || localStorage.recordType === 'camera') {
        $('input[name=record-tab-sound]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopTabSound")).addClass('disabled');
        $('input[name=show-drawing-tools]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation")).addClass('disabled');
        $('input[name=record-camera]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation")).addClass('disabled');
    }

    $("select[name=audio-bitrate]").val(localStorage.audioBitrate).on("change", function (e) {
        localStorage.audioBitrate = e.target.value;
        setOption('audioBitrate', localStorage.audioBitrate);
    });

    $("select[name=video-bitrate]").val(localStorage.videoBitrate).on("change", function (e) {
        localStorage.videoBitrate = e.target.value;
        setOption('videoBitrate', localStorage.videoBitrate);
    });

    $("select[name=video-fps]").val(localStorage.videoFps).on("change", function (e) {
        localStorage.videoFps = e.target.value;
        setOption('videoFps', localStorage.videoFps);
    });

    $("select[name=edit-before]").val(localStorage.enableEdit).on("change", function (e) {
        localStorage.enableEdit = e.target.value;
        setOption('enableEdit', localStorage.enableEdit);
    });

    $("select[name=delete-drawing]").val(localStorage.deleteDrawing).on("change", function (e) {
        localStorage.deleteDrawing = e.target.value;
        setOption('deleteDrawing', localStorage.deleteDrawing);
    });

    $("select[name=selected-video-camera]").on("change", function (e) {
        localStorage.selectedVideoCamera = e.target.value;
        setOption('selectedVideoCamera', localStorage.selectedVideoCamera);
    });

    $("select[name=selected-microphone]").on("change", function (e) {
        localStorage.selectedMicrophone = e.target.value;
        setOption('selectedMicrophone', localStorage.selectedMicrophone);
    });

    $('#video_countdown').val(localStorage.videoCountdown).on('input', function () {
        if (this.value < 0) this.value = 0;
        if (this.value > 9999) this.value = 9999;
        localStorage.videoCountdown = this.value;
        setOption('videoCountdown', localStorage.videoCountdown);
    });

    $('#nsc_open_option_watermark').on('click', function () {
        chrome.runtime.sendMessage({operation: 'open_page', 'url': 'options.html?watermark'});
    });

    navigator.mediaDevices.enumerateDevices().then(setDevices).catch(handleError);

    for (let key in main_menu_item) {
        if (!main_menu_item[key]) {
            $('button[name=\'capture-' + key + '\']').hide()
        }
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log('request', request);
        if (request.operation === 'check_tab_action' && request.action === 'back_is_page') {
            const actions = JSON.parse(request.value);

            chrome.extension.isAllowedFileSchemeAccess(function (access) {
                if (/^file/.test(actions.url) && !access) {
                    $('#capture_options').hide();
                    $('#capture_message').show();
                    return true;
                }
            });

            let $nsc_button_main = $('.nsc-button-main');

            if (actions.chrome) $nsc_button_main.not('[name=capture-window], [name=capture-blank], [name=nimbus-capture-desktop]').attr('disabled', 'disabled').css({opacity: 0.7});
            if (actions.fragment) $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-fragment]').css({opacity: 0.7});
            if (actions.crop) $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-area]').css({opacity: 0.7});
            if (actions.scroll_crop) $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-scroll]').css({opacity: 0.7});

            if (localStorage.quickCapture !== 'false') {
                $('button[name=\'capture-' + localStorage.quickCaptureType + '\']').click();
            }
        }
    });

    chrome.runtime.sendMessage({operation: 'check_tab_action', 'action': 'insert_page'});

    if (window.core.is_chrome) {
        chrome.runtime.sendMessage({operation: 'get_info_record'}, function (res) {
            if (res.status) checkRecord();
            else showCaptureOptions();

            $('button[name=record-pause] .nsc-button-layout').text(res.state === 'recording' ? chrome.i18n.getMessage("popupBtnStopPause") : chrome.i18n.getMessage("popupBtnStopResume"));
        });
    }
});