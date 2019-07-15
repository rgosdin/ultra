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

var nacl_module = {
    listener: null,
    path: 'filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/persistent/',
    video_resolution: {
        1: {width: 640, height: 360},
        2: {width: 960, height: 540},
        3: {width: 1280, height: 720},
        4: {width: 1600, height: 900},
        5: {width: 1920, height: 1080},
        6: {width: 2048, height: 1152},
        7: {width: 3200, height: 1800},
        8: {width: 3840, height: 2160}
    },
    frame_rate: {
        1: 5,
        2: 10,
        3: 15,
        4: 20,
        5: 25
    },
    init: function (cb, progress) {
        /* else if (localStorage.videoReEncoding !== 'true') {
            nimbus_screen.info.file.patch = nimbus_screen.path + 'video.webm';
            nimbus_screen.info.file.format = 'webm';
            cb && cb()
        }*/
        if (nimbus_screen.info.file.patch !== localStorage.filePatch && (nimbus_screen.info.file.format === 'webm' || nimbus_screen.info.file.format === 'mp4')) {
            cb && cb()
        } else if (localStorage.videoReEncoding === 'true') {
            nacl_module.reEncoding(cb, progress);
        } else {
            nimbus_screen.info.file.patch = nimbus_screen.path + 'video.webm';
            nimbus_screen.info.file.format = 'webm';
            nimbus_screen.urlToBlob(nimbus_screen.info.file.patch, function (blob) {
                nimbus_screen.info.file.blob = blob;
                nimbus_screen.info.file.size = Math.floor(blob.size);
                tracker.send(VIDEO_USING);
                cb && cb()
            });
        }
    },
    reEncoding: function (cb, progress) {
        nacl_module.convert({format: 'encoding'}, function () {
            nacl_module.setWaterMark(function (set, params) {
                if (set) nacl_module.convert({format: 'watermark', params: params}, cb, progress);
                else cb && cb();
            });
        }, progress);
    },
    createPalette: function (req, cb) {
        console.log('--createPalette--');

        let params = [];
        params.push("-i");
        params.push("/html5_persistent/video.webm");
        params.push("-vf");
        params.push("fps=" + req.frame_rate + ",scale=" + req.size.width + ":-1:flags=lanczos,palettegen");
        params.push("/html5_persistent/palette.png");

        let ffmpeg_convert = new FFMPEG_CONVERT();

        ffmpeg_convert.start(params, null,
            function (f) {
                if (f) cb && cb();
            }, function () {

            });
    },
    setWaterMark: function (cb) {
        core.checkWaterMark(function (check) {
            if (check && (localStorage.typeVideoCapture === 'camera' || localStorage.typeVideoCapture === 'desktop')) {
                new FFMPEG_CONVERT().info(nimbus_screen.info.file.patch, function (info) {
                    core.getWaterMark(function (watermark) {
                        if (localStorage.typeWatermark === 'text') {
                            const c = document.createElement('canvas');
                            const ctx = c.getContext("2d");
                            c.width = watermark.width;
                            c.height = watermark.height;
                            console.log(localStorage.colorWatermark, inversion(localStorage.colorWatermark))
                            ctx.fillStyle = inversion(localStorage.colorWatermark);
                            ctx.fillRect(0, 0, watermark.width, watermark.height);
                            ctx.drawImage(watermark, 0, 0, watermark.width, watermark.height);
                            watermark = c;
                        }

                        let x, y, shift = 10;
                        switch (localStorage.positionWatermark) {
                            case 'lt':
                                x = shift;
                                y = shift;
                                break;
                            case 'rt':
                                x = info.quality.width - watermark.width - shift;
                                y = shift;
                                break;
                            case 'lb':
                                x = shift;
                                y = info.quality.height - watermark.height - shift;
                                break;
                            case 'rb':
                                x = info.quality.width - watermark.width - shift;
                                y = info.quality.height - watermark.height - shift;
                                break;
                            case 'c':
                                x = Math.floor((info.quality.width - watermark.width) / 2);
                                y = Math.floor((info.quality.height - watermark.height) / 2);
                                break;
                        }

                        nimbus_screen.dataURLToFile(watermark.toDataURL('image/jpeg', 1), 'watermark.jpg', function () {
                            let params = [];
                            params.push("-i");
                            params.push("/fs/watermark.jpg");
                            params.push("-filter_complex");

                            let flt = "[0:v]scale=" + info.quality.width + ":-2[bg];";
                            flt += "[1:v]scale=" + watermark.width + ":" + watermark.height + "[wm];";
                            flt += "[bg][wm]overlay=" + x + ":" + y;

                            params.push(flt);

                            return cb && cb(true, params)
                        })
                    });
                });
            } else {
                return cb && cb(false, [])
            }
        });
    },
    trim: function (start, finish, duration, cb, progress) {
        // nacl_module.convert({format: 'encoding+'},
        //     function () {
        let s = 0;
        let f = 0;

        if (start === 0 || finish === 0) {
            if (finish === 0) {
                f = start;
            } else {
                s = finish;
                f = duration - finish;
            }
            nacl_module.convert({format: 'trim', trim: {start: s, finish: f}}, cb);
        } else {
            f = start;
            let blob = new Blob(["file '/fs/video-trim1." + nimbus_screen.info.file.last_video_format + "'\nfile '/fs/video-trim2." + nimbus_screen.info.file.last_video_format + "'"], {type: 'text/plain'});
            window.core.saveFile('list.txt', blob, function () {
                progress && progress(chrome.i18n.getMessage('labelPreviewLoadingVideo').replace('-', 20));
                nacl_module.convert({format: 'trim1', trim: {start: s, finish: f}},
                    function () {
                        s = finish;
                        f = duration - finish;
                        progress && progress(chrome.i18n.getMessage('labelPreviewLoadingVideo').replace('-', 50));
                        nacl_module.convert({format: 'trim2', trim: {start: s, finish: f}},
                            function () {
                                progress && progress(chrome.i18n.getMessage('labelPreviewLoadingVideo').replace('-', 75));
                                nacl_module.convert({format: 'concat'}, cb);
                            });
                    });
            });
        }
        // }, progress);
    },
    convert: function (req, cb, progress) {
        console.log('--start convert--', req);

        let params = [];
        let format = req.format;
        let name = nimbus_screen.info.file.last_video_name;

        if (req.trim) {
            params.push('-ss');
            params.push(req.trim.start);
        }

        if (req.format !== 'concat' && req.format !== 'encoding') {
            params.push("-i");
        }
        if (req.format === 'concat') {
            params.push("-f");
            params.push("concat");
            params.push("-safe");
            params.push("0");
            params.push("-i");
            params.push("/fs/list.txt");
        } else if (req.format !== 'encoding') {
            params.push("/fs/" + name + '.' + nimbus_screen.info.file.last_video_format);
        }

        if (req.size) {
            params.push("-filter:v");
            params.push("scale=" + req.size.width + ":-2");
        }

        if (req.format === 'watermark') {
            params = params.concat(req.params);
            format = nimbus_screen.info.file.format;
        } else if (req.format === 'encoding+') {
            params.push("-c:v");
            params.push("libvpx");
            params.push("-lossless");
            params.push("1");
            params.push("-quality");
            params.push("good");
            params.push("-cpu-used");
            params.push("7");
            params.push("-threads");
            params.push("7");
            params.push("-preset");
            params.push("veryfast");
            params.push("-level");
            params.push("3.0");
            params.push("-qmin");
            params.push("0");
            params.push("-qmax");
            params.push("50");
            params.push("-minrate");
            params.push("1M");
            params.push("-maxrate");
            params.push("1M");
            params.push("-c:a");
            params.push("copy");
            params.push("-b:a");
            params.push("128k");
            format = nimbus_screen.info.file.format;
        } else if (req.format === 'encoding') {
            params.push("-fflags");
            params.push("+genpts");
            params.push("-i");
            params.push("/fs/video.webm");
            params.push("-c:a");
            params.push("copy");
            params.push("-c:v");
            params.push("copy");
        } else if (req.format === 'mp4') {
            params.push("-c:v");
            params.push("libx264");
            params.push("-fflags");
            params.push("+genpts");
            params.push("-r");
            params.push("60");
            params.push("-q:v");
            params.push("10");
            params.push("-crf");
            params.push("20");
            params.push("-cpu-used");
            params.push("7");
            params.push("-threads");
            params.push("7");
            params.push("-preset");
            params.push("ultrafast");
            params.push("-profile:v");
            params.push("baseline");
            params.push("-tune");
            params.push("zerolatency,fastdecode");
            params.push("-x264opts");
            params.push("no-mbtree:sliced-threads:sync-lookahead=0");
            params.push("-level");
            params.push("3.0");
            params.push("-c:a");
            params.push("aac");
            params.push("-b:a");
            params.push("128k");
        } else if (req.format === 'gif') {
            params.push("-pix_fmt");
            params.push("pal8");
            params.push("-r");
            if (req.frame_rate) {
                params.push(req.frame_rate);
            }
        } else if (req.format === 'webm') {
            params.push("-c:v");
            params.push("libvpx");
            params.push("-lossless");
            params.push("1");
            params.push("-quality");
            params.push("good");
            params.push("-cpu-used");
            params.push("7");
            params.push("-threads");
            params.push("7");
            params.push("-preset");
            params.push("veryfast");
            params.push("-level");
            params.push("3.0");
            params.push("-qmin");
            params.push("0");
            params.push("-qmax");
            params.push("50");
            params.push("-minrate");
            params.push("1M");
            params.push("-maxrate");
            params.push("1M");
            params.push("-b:v");
            params.push("1M");
            params.push("-c:a");
            params.push("copy");
            params.push("-b:a");
            params.push("128k");
        } else if (req.format === 'concat') {
            // params.push("-c:v");
            // if (nimbus_screen.info.file.last_video_format === 'webm') {
            //     params.push("libvpx");
            // } else {
            //     params.push("libx264");
            // }
            params.push("-c:a");
            params.push("copy");
            params.push("-c:v");
            params.push("copy");
            params.push("-cpu-used");
            params.push("7");
            params.push("-threads");
            params.push("7");
            params.push("-preset");
            params.push("veryfast");
            format = nimbus_screen.info.file.format;
        } else if (req.trim) {
            // params.push('-ss');
            // params.push(req.trim.start);
            // params.push("-c:v");
            // params.push("copy");
            // if (nimbus_screen.info.file.last_video_format === 'webm') {
            //     params.push("libvpx");
            // } else {
            //     params.push("libx264");
            // }
            // params.push("-c:a");
            // params.push("copy");
            params.push("-c:a");
            params.push("copy");
            params.push("-c:v");
            params.push("copy");
            params.push("-cpu-used");
            params.push("7");
            params.push("-threads");
            params.push("7");
            params.push("-preset");
            params.push("veryfast");
            params.push('-t');
            params.push(req.trim.finish);
            format = nimbus_screen.info.file.format;
        } else if (req.crop) {
            params.push('-filter:v');
            params.push('crop=' + req.crop.w + ':' + req.crop.h + ':' + req.crop.x + ':' + req.crop.y);
            params.push("-c:a");
            params.push("copy");

            if (nimbus_screen.info.file.last_video_format === 'webm') {
                params.push("-c:v ");
                params.push("libvpx");
                params.push("-lossless");
                params.push("1");
                params.push("-quality");
                params.push("good");
                params.push("-level");
                params.push("3.0");
                params.push("-qmin");
                params.push("-0");
                params.push("-qmax");
                params.push("50");
                params.push("-b:v");
                params.push("1M");
            } else {
                params.push("-c:v");
                params.push("libx264");
                params.push("-fflags");
                params.push("+genpts");
                params.push("-r");
                params.push("60");
                params.push("-q:v");
                params.push("10");
                params.push("-crf");
                params.push("20");
                params.push("-preset");
                params.push("ultrafast");
                params.push("-profile:v");
                params.push("baseline");
                params.push("-tune");
                params.push("zerolatency,fastdecode");
                params.push("-x264opts");
                params.push("no-mbtree:sliced-threads:sync-lookahead=0");
                params.push("-level");
                params.push("3.0");
            }

            params.push("-cpu-used");
            params.push("7");
            params.push("-threads");
            params.push("7");
            params.push("-preset");
            params.push("veryfast");
            format = nimbus_screen.info.file.format;
        }

        if (req.format === 'encoding') {
            params.push('/fs/video-encode.webm');
            name = 'video-encode';
            format = 'webm'
        } else {
            if (req.format === 'trim' || req.format === 'concat' || req.format === 'crop') {
                if ('video-encode' === nimbus_screen.info.file.last_video_name || 'video-convert' === nimbus_screen.info.file.last_video_name) {
                    name = 'video-convert-redactor1';
                } else if ('video-convert-redactor1' === nimbus_screen.info.file.last_video_name) {
                    name = 'video-convert-redactor2';
                } else if ('video-convert-redactor2' === nimbus_screen.info.file.last_video_name) {
                    name = 'video-convert-redactor1';
                }
            } else if (req.format === 'trim1') {
                name = 'video-trim1';
            } else if (req.format === 'trim2') {
                name = 'video-trim2';
            } else {
                name = 'video-convert';
            }
            params.push('/fs/' + name + '.' + format);
        }

        console.log(params);
        let duration_video = false;
        let ffmpeg_convert = new FFMPEG_CONVERT();
        ffmpeg_convert.start(params, null,
            function (f) {
                if (f) {
                    if (req.format === 'encoding') {
                        nimbus_screen.info.file.patch = nacl_module.path + name + '.' + format;
                        nimbus_screen.info.file.format = format;
                        nimbus_screen.info.file.last_video_name = name;
                        nimbus_screen.info.file.last_video_format = format;
                    } else {
                        nimbus_screen.info.file.patch = nacl_module.path + name + '.' + format;
                        if (req.format === 'trim' || req.format === 'concat' || req.format === 'crop' || req.format === 'encoding+') {
                            nimbus_screen.info.file.last_video_name = name;
                            nimbus_screen.info.file.last_video_format = format;
                        }
                        nimbus_screen.info.file.format = format;
                    }

                    nimbus_screen.urlToBlob(nimbus_screen.info.file.patch, function (blob) {
                        nimbus_screen.info.file.blob = blob;
                        nimbus_screen.info.file.size = Math.floor(blob.size);
                        tracker.send(VIDEO_CONVERT);

                        console.log(nimbus_screen.info.file)
                        cb && cb()
                    });
                }
            },
            function (msg) {
                console.log(msg);
                if (msg === 'timeout') {
                    progress && progress('Error convert. Please refresh page and try again.')
                } else {
                    ffmpeg_convert.set_active();
                    let duration = msg.match(/^([0-9]+):([0-9]+):([0-9]+)\.([0-9]+)/i);
                    if (duration) {
                        duration_video = +duration[1] * 3600 + +duration[2] * 60 + +duration[3];
                    }
                    let duration_convert = msg.match(/^frame.+([0-9]+):([0-9]+):([0-9]+)\.([0-9]+)/i);
                    if (duration_video && duration_convert) {
                        duration_convert = +duration_convert[1] * 3600 + +duration_convert[2] * 60 + +duration_convert[3];
                        duration_convert = Math.ceil(duration_convert / duration_video * 100) + '%';
                        progress && progress(chrome.i18n.getMessage('labelPreviewLoadingVideo').replace('-', duration_convert))
                    }
                }
            });
    }
};



