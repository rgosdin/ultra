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
'use strict';

var isLog = true;
var MediaStream = window.MediaStream;
var Storage = {};
var isChrome = true;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
    MediaStream = webkitMediaStream;
}

if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
    MediaStream.prototype.stop = function () {
        this.getAudioTracks().forEach(function (track) {
            track.stop();
        });

        this.getVideoTracks().forEach(function (track) {
            track.stop();
        });
    };
}

if (typeof AudioContext !== 'undefined') {
    Storage.AudioContext = AudioContext;
} else if (typeof webkitAudioContext !== 'undefined') {
    Storage.AudioContext = webkitAudioContext;
}

function isMediaRecorderCompatible() {
    return true;
}

iconService.setDefault();

var videoRecorder = (function () {
    var streamVideo = null;
    var streamAudio = null;
    var typeCapture, tabSound, micSound, videoCamera, deawingTools, videoSize, audioBitrate, videoBitrate, videoFps,
        audioPlayer, context;
    var countdown = 0;
    var timer = null;
    var activeTab = null;
    var recorder = null;
    var isRecording = false;
    var timeStart = null;
    var timePause = null;

    function mediaAccess(data) {
        capture({
            type: data.typeCapture,
            media_access: true
        });
    }

    function failure_handler(error) {
        console.log(error);
    }

    function startRecord(videoStream, audioStream) {
        if (isLog) console.log('startRecord', arguments);

        if (typeCapture !== 'camera') {
            injectionCursor();
            injectionVideoPanel();
            injectionWatermarkVideo();
        }

        if (typeCapture === 'tab' || typeCapture === 'camera') {
            injectionWebCamera();
        }

        let recorder_option = {
            type: 'video',
            disableLogs: false,
            mimeType: 'video/webm\;codecs=vp8',
            audioBitsPerSecond: audioBitrate,
            videoBitsPerSecond: videoBitrate
        };

        if (audioStream) {
            let finalStream = new MediaStream();
            let mixedAudioStream = getMixedAudioStream([audioStream, videoStream]);

            mixedAudioStream.getAudioTracks().forEach(function (audioTrack) {
                finalStream.addTrack(audioTrack);
            });

            videoStream.getVideoTracks().forEach(function (videoTrack) {
                finalStream.addTrack(videoTrack);
            });

            videoStream = finalStream;
        }

        recorder = RecordRTC(videoStream, recorder_option);
        recorder.startRecording();

        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {operation: 'status_video', status: getStatus(), state: getState()});
        });

        iconService.setRec();
        screenshot.changeVideoButton();
        timeStart = Date.now();
    }

    function preRecord(stream) {
        if (isLog) console.log('preRecord', arguments, 'micSound', micSound);
        if (chrome.runtime.lastError) {
            if (/activeTab/.test(chrome.runtime.lastError.message)) {
                isRecording = false;
                alert(chrome.i18n.getMessage('notificationErrorActiveTab'));
            }
            console.error(chrome.runtime.lastError.message);
        } else {
            streamVideo = stream;

            streamVideo.onended = function () {
                streamVideo.onended = function () {
                };

                console.log('stream.onended');
                streamAudio && streamAudio.active && streamAudio.stop();
                stopRecord()
            };

            streamVideo.getVideoTracks()[0].onended = function () {
                if (streamVideo && streamVideo.onended) {
                    streamVideo.onended();
                }
            };

            if (micSound) {
                const constraints = {audio: {deviceId: localStorage.selectedMicrophone ? {exact: localStorage.selectedMicrophone} : undefined}};
                window.navigator.getUserMedia(constraints, function (stream_audio) {
                    streamAudio = stream_audio;
                    startRecord(streamVideo, streamAudio);
                }, function (err) {
                    isRecording = false;
                    console.error('not access mic', err)
                })
            } else {
                startRecord(streamVideo);
            }

            if (tabSound) {
                let audio = new Audio();
                try {
                    audio.srcObject = stream;
                } catch (error) {
                    audio.src = window.URL.createObjectURL(stream);
                }
                audio.volume = 1;
                audio.play();
            }
        }
    }

    function countdownRun(cb) {
        (function () {
            function time() {
                if (countdown > 0) {
                    iconService.showBadge(countdown);
                    countdown--;
                    timer = setTimeout(time, 1000);
                } else {
                    iconService.setDefault();
                    timer = null;
                    cb && cb();
                }
            }

            time();
        })()
    }

    function captureTab() {
        if (isLog) console.log('captureTab', arguments);

        chrome.tabCapture.capture({
            audio: tabSound,
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    maxFrameRate: videoFps,
                    maxWidth: typeof videoSize !== 'object' ? activeTab.width : videoSize.width,
                    maxHeight: typeof videoSize !== 'object' ? activeTab.height : videoSize.height
                }
            }
        }, preRecord);
    }

    function captureCamera() {
        if (isLog) console.log('captureCamera', arguments);
        window.navigator.getUserMedia({
            video: {
                width: 1280,
                height: 720,
                deviceId: localStorage.selectedVideoCamera ? {exact: localStorage.selectedVideoCamera} : undefined
            }
        }, preRecord, failure_handler);
    }

    function captureDesktop() {
        if (isLog) console.log('captureDesktop', arguments);
        chrome.desktopCapture.chooseDesktopMedia(["screen", "window"/*, "audio"*/], function (streamId) {
            if (!streamId) {
                isRecording = false;
            } else {
                const constraints = {
                    // audio: {
                    //     mandatory: {
                    //         chromeMediaSource: 'desktop',
                    //         chromeMediaSourceId: streamId
                    //     }
                    // },
                    video: {
                        // width: 160,
                        // height: 120,
                        // frameRate: 15,

                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: streamId,
                            maxFrameRate: videoFps,
                            maxWidth: typeof videoSize !== 'object' ? window.screen.width : videoSize.width,
                            maxHeight: typeof videoSize !== 'object' ? window.screen.height : videoSize.height
                        }
                    }
                };
                countdownRun(function () {
                    window.navigator.getUserMedia(constraints, preRecord, failure_handler);
                })
            }
        });
    }

    function capture(param) {
        if (isLog) console.log('capture', arguments);
        if (isRecording) return;
        isRecording = true;

        localStorage.typeVideoCapture = typeCapture = param.type || 'tab';
        countdown = +localStorage.videoCountdown;
        videoCamera = localStorage.videoCamera === 'true';
        micSound = localStorage.micSound === 'true';
        tabSound = localStorage.tabSound === 'true';
        deawingTools = localStorage.deawingTools === 'true';
        videoSize = localStorage.videoSize === 'auto';
        audioBitrate = +localStorage.audioBitrate;
        videoBitrate = +localStorage.videoBitrate;
        videoFps = +localStorage.videoFps;
        switch (localStorage.videoSize) {
            case '4k':
                videoSize = {
                    width: 3840,
                    height: 2160
                };
                break;
            case 'full-hd':
                videoSize = {
                    width: 1920,
                    height: 1080
                };
                break;
            case 'hd':
                videoSize = {
                    width: 1280,
                    height: 720
                };
                break;
        }

        if (typeCapture === 'desktop' || typeCapture === 'camera') {
            tabSound = false;
            deawingTools = false;
            videoCamera = false;
        }

        if (isLog) console.log('typeCapture', typeCapture, 'tabSound', tabSound, 'micSound', micSound, 'videoCamera', videoCamera, 'deawingTools', deawingTools);

        if (typeCapture === 'tab' || typeCapture === 'camera') {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                if (!activeTab && (!tabs.length || /^chrome/.test(tabs[0].url))) {
                    isRecording = false;
                    alert(chrome.i18n.getMessage('notificationErrorChromeTab'));
                } else {
                    if (!activeTab) activeTab = tabs[0];
                    if ((micSound || videoCamera || typeCapture === 'camera') && !param.media_access) {
                        isRecording = false;
                        let constraints = {};
                        if (micSound) constraints.audio = {deviceId: localStorage.selectedMicrophone ? {exact: localStorage.selectedMicrophone} : undefined};
                        if (videoCamera || typeCapture === 'camera') constraints.video = {deviceId: localStorage.selectedVideoCamera ? {exact: localStorage.selectedVideoCamera} : undefined};

                        if (isLog) console.log('getUserMedia constraints', constraints);

                        window.navigator.getUserMedia(constraints, function () {
                            capture({type: typeCapture, media_access: true});
                        }, function () {
                            if (micSound && (videoCamera || typeCapture === 'camera')) {
                                chrome.tabs.create({url: 'media_access/camera_and_mic.html?' + typeCapture});
                            } else if (videoCamera || typeCapture === 'camera') {
                                chrome.tabs.create({url: 'media_access/camera.html?' + typeCapture});
                            } else {
                                chrome.tabs.create({url: 'media_access/mic.html?' + typeCapture});
                            }
                        });
                    } else if (countdown > 0 && !param.not_timer) {
                        isRecording = false;
                        chrome.tabs.update(activeTab.id, {active: true}, function () {
                            timerContent.set(countdown, typeCapture)
                        });
                    } else {
                        if (typeCapture === 'tab') {
                            chrome.tabs.update(activeTab.id, {active: true}, captureTab)
                        } else {
                            chrome.tabs.update(activeTab.id, {active: true}, captureCamera)
                        }
                    }
                }
            });
        } else {
            if (micSound && !param.media_access) {
                isRecording = false;
                let constraints = {};
                if (micSound) constraints.audio = {deviceId: localStorage.selectedMicrophone ? {exact: localStorage.selectedMicrophone} : undefined};
                if (isLog) console.log('getUserMedia constraints', constraints);
                window.navigator.getUserMedia(constraints, function () {
                    capture({type: typeCapture, media_access: true});
                }, function () {
                    chrome.tabs.create({url: 'media_access/mic.html?' + typeCapture});
                });
            } else {
                captureDesktop();
            }
        }
    }

    function stopStream() {
        if (isLog) console.log('stopStream', streamVideo, streamAudio, recorder);

        window.setTimeout(function () {
            if (recorder.state !== 'recording') {
                timePause = null;
                recorder.resumeRecording();
                iconService.setRec();
            }
            stopRecord();
        }, 1000);
    }

    function stopRecord() {
        if (isLog) console.log('stopRecord', arguments);

        recorder.stopRecording(function () {
            try {
                streamVideo.stop();
                streamAudio.stop();
                audioPlayer && (audioPlayer = undefined);
                context && (context.close());
                context = undefined;
            } catch (e) {
                console.log(e)
            }

            if (timer) {
                clearInterval(timer);
                countdown = 0;
                timer = null;
            }

            chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {operation: 'status_video', status: getStatus(), state: getState()});
            });

            timeStart = null;
            activeTab = null;
            isRecording = false;
            iconService.setDefault();
            screenshot.changeVideoButton();

            let blob = recorder.getBlob();

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(window.PERSISTENT, 10 * 1024 * 1024 * 1024, function (fs) {
                    let truncated = false;
                    fs.root.getFile('video.webm', {create: true}, function (fileEntry) {
                        fileEntry.createWriter(function (writer) {
                            writer.onwriteend = function (progress) {
                                if (!truncated) {
                                    truncated = true;
                                    this.truncate(this.position);
                                    return;
                                }
                                console.log("Write completed", progress);
                                screenshot.createEditPage('video');
                            };

                            writer.onerror = function (err) {
                                console.error("Write failed", err);
                            };
                            writer.write(blob);

                        }, function (err) {
                            console.error("Create Writer failed", err);
                        });
                    }, function (err) {
                        console.error("Get File failed", err);
                    });
                },
                function (err) {
                    console.error("File System failed", err);
                }
            );
        });

    }

    function pauseRecord() {
        if (isLog) console.log('pauseRecord', arguments);

        if (recorder.state === 'recording') {
            timePause = Date.now();
            recorder.pauseRecording();
            iconService.setPause();
        } else {
            timePause = null;
            recorder.resumeRecording();
            iconService.setRec();
        }

        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {operation: 'status_video', status: getStatus(), state: getState()});
        })
    }

    function getState() {
        return (recorder && recorder.state);
    }

    function getStatus() {
        return timer || (streamVideo && !!streamVideo.active);
    }

    function getMixedAudioStream(arrayOfAudioStreams) {
        let audioContext = new AudioContext();

        let audioSources = [];

        let gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0;

        let audioTracksLength = 0;
        arrayOfAudioStreams.forEach(function (stream) {
            if (!stream.getAudioTracks().length) {
                return;
            }

            audioTracksLength++;

            let audioSource = audioContext.createMediaStreamSource(stream);
            audioSource.connect(gainNode);
            audioSources.push(audioSource);
        });

        if (!audioTracksLength) {
            return;
        }

        let audioDestination = audioContext.createMediaStreamDestination();
        audioSources.forEach(function (audioSource) {
            audioSource.connect(audioDestination);
        });
        return audioDestination.stream;
    }

    function getTimeRecord() {
        const date = Date.now();
        timeStart = timeStart + (timePause ? date - timePause : 0);
        timePause = timePause ? date : null;
        return timeStart ? (date - timeStart) : 0;
    }

    function injectionCursor() {
        // if (localStorage.cursorAnimate !== 'true') return;
        // if (!activeTab) return;
        // chrome.tabs.insertCSS(activeTab.id, {file: "css/new-style.css"});
        // chrome.tabs.executeScript(activeTab.id, {file: "js/content-cursor.js"}, function () {
        //     chrome.tabs.sendMessage(activeTab.id, {cursor: true, cursorAnimate: localStorage.cursorAnimate === 'true'}, function () {
        //         activeTab.injectionCursor = true;
        //     });
        // });
    }

    function injectionVideoPanel() {
        if (!activeTab) return;
        chrome.tabs.sendMessage(activeTab.id, {operation: 'nsc_video_panel_is'}, function (status) {
            if (!status) {
                chrome.tabs.insertCSS(activeTab.id, {file: "css/flex.css"});
                chrome.tabs.insertCSS(activeTab.id, {file: "css/icons.css"});
                chrome.tabs.insertCSS(activeTab.id, {file: "css/video-panel.css"});
                chrome.tabs.executeScript(activeTab.id, {file: "js/lib/jquery-3.3.1.js"}, function () {
                    chrome.tabs.executeScript(activeTab.id, {file: "js/video-editor.js"}, function () {
                        chrome.tabs.executeScript(activeTab.id, {code: "var deawingTools = " + deawingTools + ", deleteDrawing = " + +localStorage.deleteDrawing + ", videoEditorTools='" + localStorage.videoEditorTools + "';"}, function () {
                            chrome.tabs.executeScript(activeTab.id, {file: "js/video-panel.js"});
                        });
                    });
                });
            }
        });
    }

    function injectionWebCamera() {
        if (!activeTab) return;

        chrome.tabs.sendMessage(activeTab.id, {operation: 'nsc_web_camera_is'}, function (status) {
            if (!status) {
                chrome.tabs.insertCSS(activeTab.id, {file: "css/flex.css"});
                chrome.tabs.insertCSS(activeTab.id, {file: "css/icons.css"});
                chrome.tabs.insertCSS(activeTab.id, {file: "css/video-panel.css"});
                chrome.tabs.executeScript(activeTab.id, {file: "js/lib/jquery-3.3.1.js"}, function () {
                    chrome.tabs.executeScript(activeTab.id, {code: "var videoCameraPosition = " + localStorage.videoCameraPosition + ", selectedVideoCamera = " + localStorage.selectedVideoCamera + ", typeCapture='" + typeCapture + "', videoCamera=" + videoCamera + ";"}, function () {
                        chrome.tabs.executeScript(activeTab.id, {file: "js/content-camera.js"});
                    });
                });
            }
        });
    }

    function injectionWatermarkVideo() {
        console.log('injectionWatermarkVideo', activeTab)
        if (!activeTab) return;

        let checkAndSend = function () {
            core.checkWaterMark(function (check) {
                console.log('checkWaterMark', check);
                if (check) {
                    core.getWaterMark();

                    window.setTimeout(function () {
                        core.getWaterMark(function (watermark) {
                            console.log('getWaterMark', watermark);
                            core.sendMessage({
                                operation: 'set_watermark_video',
                                dataUrl: watermark.toDataURL(),
                                position: localStorage.positionWatermark
                            })
                        })
                    }, 0);
                }
            })
        };
        chrome.tabs.executeScript(activeTab.id, {file: "js/lib/jquery-3.3.1.js"}, function () {
            chrome.tabs.executeScript(activeTab.id, {file: "js/content-watermark.js"}, checkAndSend);
        });
    }

    chrome.tabs.onUpdated.addListener(function (tabId, info) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            if (info.status === "loading" && tabs[0].id && tabs[0].url && activeTab &&
                tabs[0].id === tabId && activeTab.id === tabId && !/^chrome/.test(tabs[0].url)) {
                injectionCursor();
                injectionVideoPanel();
                injectionWebCamera();
                injectionWatermarkVideo();
            }
        });
    });

    chrome.tabs.onRemoved.addListener(function (tabId, info) {
        if (activeTab && activeTab.id === tabId) {
            stopStream();
        }
    });

    return {
        capture: capture,
        captureTab: captureTab,
        captureDesktop: captureDesktop,
        stopRecord: stopStream,
        pauseRecord: pauseRecord,
        getStatus: getStatus,
        getState: getState,
        getTimeRecord: getTimeRecord,
        mediaAccess: mediaAccess
    }
})
();