/**
 * Created by hasesanches on 14.07.2017.
 */
var editor = {
    canvas: {
        common: {},
        background: {},
        animate: {},
        current: {}
    },
    isDraw: false,
    colorTools: {
        pen: '#00FF00',
        arrow: '#FF0000',
        square: '#0000FF'
    },
    notif: {
        red: null,
        blue: null,
        green: null
    },
    currentTools: 'arrow',
    history: {
        memory: [],
        save: function () {
            editor.history.memory.push(Object.assign({}, {
                date: Date.now(),
                data: editor.canvas.current.ctx.getImageData(0, 0, editor.canvas.common.width, editor.canvas.common.height),
                tools: editor.currentTools
            }));
        },
        remove: function (index) {
            editor.history.memory.splice(index, 1);
        },
        removeAll: function () {
            editor.history.memory.splice(0, editor.history.memory.length);
        },
        draw: function () {
            editor.canvas.background.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            for (var i = 0, len = editor.history.memory.length; i < len; i++) {
                var item_history = editor.history.memory[i];
                editor.canvas.current.ctx.putImageData(item_history.data, 0, 0);
                editor.canvas.background.ctx.drawImage(editor.canvas.current.canvas[0], 0, 0);
                editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            }
        }
    },
    preloader: function () {
        function check() {
            for (let key in editor.notif) {
                let notif = editor.notif[key];
                if (!notif) {
                    load(key);
                    return;
                }
            }
        }

        function load(name) {
            let image = new Image();
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            image.src = chrome.runtime.getURL('images/video/notif_' + name + '.svg');
            image.crossOrigin = "Anonymous";
            image.onload = function () {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.clearRect(0, 0, image.width, image.height);
                ctx.drawImage(image, 0, 0, image.width, image.height);
                editor.notif[name] = canvas.toDataURL();
                check && check();
            };
        }

        check();
    },
    initialize: function (container) {
        editor.canvas.common.width = $(container).width();
        editor.canvas.common.height = $(container).height();
        editor.canvas.common.container = $(container);
        // editor.canvas.common.container = $(editor.canvas.common.container);

        editor.canvas.background.canvas = $(document.createElement('canvas'))
            .attr('width', editor.canvas.common.width)
            .attr('height', editor.canvas.common.height)
            .css({width: editor.canvas.common.width, height: editor.canvas.common.height, position: 'absolute', top: '0', left: '0', zIndex: '0'});

        editor.canvas.animate.canvas = $(document.createElement('canvas'))
            .attr('width', editor.canvas.common.width)
            .attr('height', editor.canvas.common.height)
            .css({width: editor.canvas.common.width, height: editor.canvas.common.height, position: 'absolute', top: '0', left: '0', zIndex: '1'});

        editor.canvas.current.canvas = $(document.createElement('canvas'))
            .attr('width', editor.canvas.common.width)
            .attr('height', editor.canvas.common.height)
            .css({width: editor.canvas.common.width, height: editor.canvas.common.height, position: 'absolute', top: '0', left: '0', zIndex: '2'});

        editor.canvas.background.ctx = editor.canvas.background.canvas[0].getContext('2d');
        editor.canvas.animate.ctx = editor.canvas.animate.canvas[0].getContext('2d');
        editor.canvas.current.ctx = editor.canvas.current.canvas[0].getContext('2d');

        editor.canvas.common.container.append(editor.canvas.background.canvas);
        editor.canvas.common.container.append(editor.canvas.animate.canvas);
        editor.canvas.common.container.append(editor.canvas.current.canvas);
        editor.canvas.common.container.addClass('events');

        $('html body')
        // .css({/*cursor: 'url( ' + chrome.runtime.getURL('images/video/ic-cursor.svg') + ') 0 0, pointer', */'user-select': 'none'})
            .on('mousedown', function (e) {
                if (!$(e.target).closest('.nsc-panel-compact').length && !$(e.target).hasClass('nsc-panel-compact').length && !$(e.target).closest('.nsc-content-camera').length && !$(e.target).hasClass('nsc-content-camera')) {
                    editor.draw.start(e);
                }
            })
            .on('mousemove', function (e) {
                if (!$(e.target).closest('.nsc-panel-compact').length && !$(e.target).hasClass('nsc-panel-compact').length && !$(e.target).closest('.nsc-content-camera').length && !$(e.target).hasClass('nsc-content-camera')) {
                    editor.draw.move(e);
                }
            })
            .on('mouseup', function (e) {
                if (!$(e.target).closest('.nsc-panel-compact').length && !$(e.target).hasClass('nsc-panel-compact').length && !$(e.target).closest('.nsc-content-camera').length && !$(e.target).hasClass('nsc-content-camera')) {
                    editor.draw.end(e);
                }
            });

        editor.canvas.common.container.on('nimbus-editor-active-tools', function (e, tool) {
            if (editor.draw[tool] !== undefined && tool !== 'clearAll') {
                if (tool === 'cursorDefault' || tool === 'cursorShadow' || tool === 'cursorRing') {
                    $('html body').css({'user-select': 'auto'});
                    editor.canvas.common.container.addClass('events')
                } else {
                    $('html body').css({'user-select': 'none'});
                    editor.canvas.common.container.removeClass('events')
                }
                if (tool === 'cursorNone') {
                    $('html body').css({cursor: 'none'});
                } else if (tool === 'cursorShadow') {
                    $('html body').css({cursor: 'none'});
                    editor.draw.cursorShadow(editor.draw.startPoint, editor.getPosition(e));
                } else {
                    $('html body').css({cursor: 'auto'});
                }

                editor.currentTools = tool;
                container.trigger('nimbus-editor-change', [editor.currentTools, editor.colorTools[editor.currentTools]]);
                editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                // $('html body').css({cursor: 'url( ' + chrome.runtime.getURL('images/video/ic-cursor.svg') + ') 0 0, pointer'});
            } else if (tool === 'clearAll') {
                editor.draw.clearAll();
            } else if (!tool) {
                editor.currentTools = false;
                console.error('Tool clear!')
            } else {
                console.error('Tool not found!')
            }
        });

        editor.canvas.common.container.on('nimbus-editor-active-color', function (e, color) {
            if (editor.colorTools[editor.currentTools]) {
                editor.colorTools[editor.currentTools] = color;
                container.trigger('nimbus-editor-change', [editor.currentTools, editor.colorTools[editor.currentTools]]);
            } else {
                console.error('Can not set color!')
            }
        });

        editor.canvas.common.container.on('nimbus-editor-remove-old', function (e) {
            editor.history.remove(0);
            editor.history.draw();
        });

        editor.preloader();

        return container;
    },
    getPosition: function (e) {
        const a = editor.canvas.current.canvas[0].getBoundingClientRect();
        return {
            x: e.clientX - a.left,
            y: e.clientY - a.top
        };
    },
    draw: {
        startPoint: {},
        start: function (e) {
            editor.isDraw = true;
            editor.draw.startPoint = editor.getPosition(e);

            switch (editor.currentTools) {
                case 'cursorRing':
                case 'notifGreen':
                case 'notifRed':
                case 'notifBlue':
                    editor.draw[editor.currentTools](editor.draw.startPoint, editor.getPosition(e));
                    break;
            }
        },
        move: function (e) {
            if (editor.isDraw && editor.currentTools) {
                editor.draw[editor.currentTools](editor.draw.startPoint, editor.getPosition(e));
            }

            switch (editor.currentTools) {
                case 'cursorShadow':
                    editor.draw[editor.currentTools](editor.draw.startPoint, editor.getPosition(e));
                    break;
            }
        },
        end: function () {
            editor.isDraw = false;
            editor.draw.startPoint = {};
            switch (editor.currentTools) {
                case 'pen':
                case 'square':
                case 'arrow':
                case 'notifGreen':
                case 'notifRed':
                case 'notifBlue':
                    editor.history.save();
                    editor.canvas.background.ctx.drawImage(editor.canvas.current.canvas[0], 0, 0);
                    editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                    break;
            }
        },
        cursorDefault: function (start, end) {
            // var image = new Image();
            // image.src = "./images/video/ic-cursor.svg";
            // image.onload = function () {
            //     editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            //     editor.canvas.current.ctx.drawImage(image, end.x, end.y);
            // };
        },
        cursorNone: function (start, end) {

        },
        cursorRing: function (start, end) {
            let ringCounter = 0, ringRadius;

            function easeInCubic(now, startValue, deltaValue, duration) {
                return deltaValue * (now /= duration) * now * now + startValue;
            }

            function easeOutCubic(now, startValue, deltaValue, duration) {
                return deltaValue * ((now = now / duration - 1) * now * now + 1) + startValue;
            }

            function animate() {
                if (ringCounter > 200) {
                    return;
                }

                window.requestAnimationFrame(animate);

                if (ringCounter < 100) {
                    ringRadius = easeInCubic(ringCounter, 0, 20, 100);
                } else {
                    ringRadius = easeOutCubic(ringCounter - 100, 20, -20, 100);
                }

                editor.canvas.animate.ctx.lineWidth = 1;
                editor.canvas.animate.ctx.strokeStyle = 'red';
                editor.canvas.animate.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                editor.canvas.animate.ctx.beginPath();
                editor.canvas.animate.ctx.arc(end.x, end.y, ringRadius, 0, Math.PI * 2);
                editor.canvas.animate.ctx.stroke();
                ringCounter += 5;
            }

            window.requestAnimationFrame(animate);
        },
        cursorShadow: function (start, end) {
            editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.globalAlpha = 0.6;
            editor.canvas.current.ctx.fillStyle = '#000';
            editor.canvas.current.ctx.fillRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.globalAlpha = 1;
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.globalCompositeOperation = 'destination-out';
            editor.canvas.current.ctx.filter = "blur(10px)";
            editor.canvas.current.ctx.arc(end.x, end.y, 75, 0, 2 * Math.PI, true);
            editor.canvas.current.ctx.fill();
            editor.canvas.current.ctx.globalCompositeOperation = 'source-over';
            editor.canvas.current.ctx.filter = "none";
        },
        clear: function (start, end) {
            editor.canvas.background.ctx.beginPath();
            editor.canvas.background.ctx.globalCompositeOperation = 'destination-out';
            editor.canvas.background.ctx.arc(end.x, end.y, 20, 0, Math.PI * 2, true);
            editor.canvas.background.ctx.fill();
            editor.canvas.background.ctx.globalCompositeOperation = 'source-over';
        },
        clearAll: function (start, end) {
            editor.history.removeAll();
            editor.canvas.background.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
        },
        notif: function (start, end, name) {
            let image = new Image();
            const ratio = 2;
            image.src = editor.notif[name];
            // image.src = chrome.runtime.getURL('images/video/notif_' + name + '.svg');
            // image.crossOrigin = "Anonymous";
            image.onload = function () {
                editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                editor.canvas.current.ctx.drawImage(
                    image, 0, 0, image.width, image.height,
                    Math.round(end.x - image.width / ratio),
                    Math.round(end.y - image.height / ratio),
                    Math.round(image.width / ratio),
                    Math.round(image.height / ratio)
                );
            };
        },
        notifGreen: function (start, end) {
            editor.draw.notif(start, end, 'green');
        },
        notifRed: function (start, end) {
            editor.draw.notif(start, end, 'red');
        },
        notifBlue: function (start, end) {
            editor.draw.notif(start, end, 'blue');
        },
        pen: function (start, end) {
            editor.canvas.current.ctx.lineWidth = 3;
            editor.canvas.current.ctx.strokeStyle = editor.colorTools.pen;
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.moveTo(start.x, start.y);
            editor.canvas.current.ctx.lineTo(end.x, end.y);
            editor.canvas.current.ctx.stroke();
            editor.draw.startPoint = {x: end.x, y: end.y};
        },
        arrow: function (start, end) {
            var dx = start.x - end.x;
            var dy = start.y - end.y;
            var angle = Math.atan2(dy, dx) + Math.PI;
            var head_length = 15;
            editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.lineWidth = 3;
            editor.canvas.current.ctx.strokeStyle = editor.colorTools.arrow;
            editor.canvas.current.ctx.fillStyle = editor.colorTools.arrow;
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.moveTo(start.x, start.y);
            editor.canvas.current.ctx.lineTo(end.x, end.y);
            editor.canvas.current.ctx.stroke();
            editor.canvas.current.ctx.moveTo(end.x, end.y);
            editor.canvas.current.ctx.lineTo(end.x - head_length * Math.cos(angle - Math.PI / 7), end.y - head_length * Math.sin(angle - Math.PI / 7));
            editor.canvas.current.ctx.lineTo(end.x - head_length * Math.cos(angle + Math.PI / 7), end.y - head_length * Math.sin(angle + Math.PI / 7));
            editor.canvas.current.ctx.lineTo(end.x, end.y);
            editor.canvas.current.ctx.lineTo(end.x - head_length * Math.cos(angle - Math.PI / 7), end.y - head_length * Math.sin(angle - Math.PI / 7));
            editor.canvas.current.ctx.fill();
        },
        square: function (start, end) {
            editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.lineWidth = 3;
            editor.canvas.current.ctx.strokeStyle = editor.colorTools.square;
            editor.canvas.current.ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
    }
};

$.fn.videoEditor = function (method) {
    return editor.initialize(this);
};