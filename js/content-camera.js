(function () {
    $.get(chrome.runtime.getURL('template/panel-video-camera.html'), function (data) {
        $('body').append(data);

        let videoCameraX = videoCameraPosition.x;
        let videoCameraY = videoCameraPosition.y;
        let videoCameraXFull = 0;
        let videoCameraYFull = 0;
        let videoCameraMove = false;
        let videoCameraShiftX = 0;
        let videoCameraShiftY = 0;
        let videoCameraW = 0;
        let videoCameraH = 0;

        let $content_camera = $('.nsc-content-camera');
        let $content_camera_container = $('.nsc-content-camera-container');
        let $camera_collapse = $('#nsc_video_camera_collapse');
        let $camera_expand = $('#nsc_video_camera_expand');
        let $camera_close = $('#nsc_video_camera_close');

        let nsc_content_camera = {
            viewCamera: function () {
                if ($content_camera_container.find('iframe').length) return;

                $content_camera.removeClass('hide');
                let $iframe = $('<iframe>')
                    .attr('allow', 'camera; microphone;')
                    .attr('src', chrome.runtime.getURL('template/frame-video-camera.html?' + location.origin + '') + (selectedVideoCamera ? '&' + selectedVideoCamera : ''));

                $content_camera_container.prepend($iframe);
            },
            hideCamera: function () {
                if (!$content_camera_container.find('iframe').length) return;

                $content_camera.addClass('hide');
                $content_camera.find('iframe').remove();
            },
            miniCamera: function () {
                $content_camera.removeClass('full').css({top: videoCameraY, left: videoCameraX}).find('iframe').css({width: 300, height: 300 / (videoCameraW / videoCameraH)});

                $camera_collapse.hide();
                $camera_expand.show();
            },
            fullCamera: function () {
                $content_camera.addClass('full').css({top: 10, left: 10});

                let width = $(window).width() - 40;
                let height = $(window).height() - 40;

                if (width / (videoCameraW / videoCameraH) > height) {
                    $content_camera.find('iframe').css({width: height * (videoCameraW / videoCameraH), height: height});
                } else {
                    $content_camera.find('iframe').css({width: width, height: height});
                }

                $camera_collapse.show();
                $camera_expand.hide();
            },
            move: function (e) {
                // e.preventDefault();

                if (videoCameraMove) {
                    let pageX = event.pageX - videoCameraShiftX;
                    let pageY = event.pageY - videoCameraShiftY;
                    videoCameraShiftX = event.pageX;
                    videoCameraShiftY = event.pageY;

                    if ($content_camera.hasClass('full')) {
                        pageX = videoCameraXFull = pageX + videoCameraXFull > 0 ? pageX + videoCameraXFull : 0;
                        pageY = videoCameraYFull = pageY + videoCameraYFull > 0 ? pageY + videoCameraYFull : 0;
                    } else {
                        pageX = videoCameraX = pageX + videoCameraX > 0 ? pageX + videoCameraX : 0;
                        pageY = videoCameraY = pageY + videoCameraY > 0 ? pageY + videoCameraY : 0;
                    }

                    let pageLeft = 10;
                    let pageTop = 10;
                    let pageRight = $(window).width() - $content_camera.width() - 10;
                    let pageBottom = $(window).height() - $content_camera.height() - 10;

                    if (pageX < pageLeft) pageX = 10;
                    if (pageY < pageTop) pageY = 10;
                    if (pageX > pageRight) pageX = pageRight;
                    if (pageY > pageBottom) pageY = pageBottom;

                    $content_camera.css({top: pageY, left: pageX});
                }
            },
            startMove: function (e) {
                e.preventDefault();

                videoCameraMove = true;
                videoCameraShiftX = event.pageX;
                videoCameraShiftY = event.pageY;
                $content_camera.addClass('move');
            },
            endMove: function (e) {
                // e.preventDefault();

                videoCameraMove = false;
                if ($content_camera.hasClass('full')) return;

                chrome.runtime.sendMessage({
                    operation: "save_position_video_camera",
                    position: {x: videoCameraX, y: videoCameraY}
                });
                $content_camera.removeClass('move');
            },
            messageFrame: function (e) {
                videoCameraW = (e.data.message && e.data.message.w) ? e.data.message.w : 720;
                videoCameraH = (e.data.message && e.data.message.h) ? e.data.message.h : 360;
                // if (event.origin === location.origin) {

                $content_camera.find('iframe').css({opacity: 1});

                if (typeCapture === 'camera') {
                    nsc_content_camera.fullCamera()
                } else {
                    nsc_content_camera.miniCamera()
                }
                // }
            }
        };

        $content_camera
            .on('mousedown', nsc_content_camera.startMove)
            .on('mouseup', nsc_content_camera.endMove);

        $(window)
            .on('mousemove', nsc_content_camera.move)
            .on('mouseup', nsc_content_camera.endMove);

        $camera_collapse.on('click', nsc_content_camera.miniCamera);
        $camera_expand.on('click', nsc_content_camera.fullCamera);
        $camera_close.on('click', nsc_content_camera.hideCamera);
        window.addEventListener('message', nsc_content_camera.messageFrame, false);

        // if (typeCapture === 'camera') {
        //     $camera_expand.trigger('click')
        // } else {
        $content_camera.css({top: videoCameraY, left: videoCameraX});
        // }

        if (videoCamera || typeCapture === 'camera') nsc_content_camera.viewCamera();

        chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
            if (req.operation === 'status_video') {
                console.log(req)
                if (!req.status) {
                    // nsc_content_camera.hideCamera()

                    // TODO: Доработать возобновление работы
                    $('.nsc-content-camera').remove();
                    $(window)
                        .off('mousemove', nsc_content_camera.move)
                        .off('mouseup', nsc_content_camera.endMove);
                    chrome.runtime.onMessage.removeListener(arguments.callee);
                    window.removeListener('message', nsc_content_camera.messageFrame);
                } else if (req.status) {
                    nsc_content_camera.viewCamera();
                } else if (req.state === 'recording') {
                    nsc_content_camera.viewCamera();
                } else {
                    nsc_content_camera.hideCamera()
                }
            }
            if (req.operation === 'web_camera_toggle') {
                if ($content_camera.hasClass('hide')) {
                    nsc_content_camera.viewCamera()
                } else {
                    nsc_content_camera.hideCamera()
                }
            }
            if (req.operation === 'nsc_web_camera_is') {
                sendResponse(true)
            }
        });

    });

})();

