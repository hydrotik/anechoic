var Anechoic = (function () {
    'use strict';

    /* eslint-disable @typescript-eslint/no-explicit-any */
    var downSampleArray = function (array, newLength) {
        if (newLength >= array.length) {
            return array.slice();
        }
        var factor = array.length / (array.length - newLength);
        return array.filter(function (e, i) { return Math.floor(i % factor); });
    };

    var Render = /** @class */ (function () {
        function Render(config) {
            var _this = this;
            this.WIDTH = 0;
            this.HEIGHT = 0;
            this.drawVisual = 0;
            this.bgColor = '#FFFFFF';
            this.lineColor = '#000000';
            this.running = false;
            this.preview = function (audioCtx, source) {
                // eslint-disable-next-line no-console
                console.log('Render :: preview()');
                // eslint-disable-next-line no-console
                console.log(source.buffer);
                var ab = source.buffer;
                if (ab) {
                    var anotherArray = new Float32Array(ab.length);
                    ab.copyFromChannel(anotherArray, 1, 0);
                    // eslint-disable-next-line no-console
                    console.log("new buffer: " + anotherArray.length);
                    // eslint-disable-next-line no-console
                    // console.log(anotherArray);
                    // const ds = largestTriangleThreeBuckets(anotherArray, 150);
                    var ds = downSampleArray(anotherArray, 1200);
                    // eslint-disable-next-line no-console
                    console.log(ds.length);
                    // eslint-disable-next-line no-console
                    console.log(ds);
                    _this.canvasCtx.fillStyle = _this.bgColor;
                    _this.canvasCtx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
                    _this.canvasCtx.lineWidth = 1;
                    _this.canvasCtx.strokeStyle = _this.lineColor;
                    _this.canvasCtx.beginPath();
                    var sliceWidth = 0.5; // (this.canvas.width * 1.0) / bufferLength;
                    var x = 0;
                    for (var i = 0; i < ds.length; i += 1) {
                        var v = ds[i];
                        var y = ((v * _this.canvas.height) / 2) + (_this.canvas.height / 2);
                        if (i === 0) {
                            _this.canvasCtx.moveTo(x, y);
                        }
                        else {
                            _this.canvasCtx.lineTo(x, y);
                        }
                        x += sliceWidth;
                    }
                    // this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
                    _this.canvasCtx.stroke();
                }
            };
            this.visualizer = function (audioCtx, source) {
                if (!_this.WIDTH)
                    _this.WIDTH = _this.canvas.width;
                if (!_this.HEIGHT)
                    _this.HEIGHT = _this.canvas.height;
                var analyser = audioCtx.createAnalyser();
                analyser.fftSize = 2048;
                var bufferLength = analyser.frequencyBinCount;
                var dataArray = new Uint8Array(bufferLength);
                analyser.getByteTimeDomainData(dataArray);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                _this.running = true;
                if (_this.type === 'wave') {
                    _this.canvasCtx.clearRect(0, 0, _this.WIDTH, _this.HEIGHT);
                    var draw_1 = function () {
                        if (_this.running)
                            _this.drawVisual = requestAnimationFrame(draw_1);
                        analyser.getByteTimeDomainData(dataArray);
                        _this.canvasCtx.fillStyle = _this.bgColor;
                        _this.canvasCtx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
                        _this.canvasCtx.lineWidth = 2;
                        _this.canvasCtx.strokeStyle = _this.lineColor;
                        _this.canvasCtx.beginPath();
                        var sliceWidth = (_this.canvas.width * 1.0) / bufferLength;
                        var x = 0;
                        for (var i = 0; i < bufferLength; i += 1) {
                            var v = dataArray[i] / 128.0;
                            var y = (v * _this.canvas.height) / 2;
                            if (i === 0) {
                                _this.canvasCtx.moveTo(x, y);
                            }
                            else {
                                _this.canvasCtx.lineTo(x, y);
                            }
                            x += sliceWidth;
                        }
                        // this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
                        _this.canvasCtx.stroke();
                    };
                    draw_1();
                }
                else if (_this.type === 'bars') {
                    analyser.fftSize = 256;
                    var bufferLengthAlt_1 = analyser.frequencyBinCount;
                    var dataArrayAlt_1 = new Uint8Array(bufferLengthAlt_1);
                    _this.canvasCtx.clearRect(0, 0, _this.WIDTH, _this.HEIGHT);
                    var drawAlt_1 = function () {
                        _this.drawVisual = requestAnimationFrame(drawAlt_1);
                        analyser.getByteFrequencyData(dataArrayAlt_1);
                        _this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                        _this.canvasCtx.fillRect(0, 0, _this.WIDTH, _this.HEIGHT);
                        var barWidth = (_this.WIDTH / bufferLengthAlt_1) * 2.5;
                        var barHeight;
                        var x = 0;
                        for (var i = 0; i < bufferLengthAlt_1; i += 1) {
                            barHeight = dataArrayAlt_1[i];
                            _this.canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
                            _this.canvasCtx.fillRect(x, _this.HEIGHT - barHeight / 2, barWidth, barHeight / 2);
                            x += barWidth + 1;
                        }
                    };
                    drawAlt_1();
                }
                else if (_this.type === 'off') {
                    _this.canvasCtx.clearRect(0, 0, _this.WIDTH, _this.HEIGHT);
                    _this.canvasCtx.fillStyle = 'red';
                    _this.canvasCtx.fillRect(0, 0, _this.WIDTH, _this.HEIGHT);
                }
            };
            this.stop = function () {
                cancelAnimationFrame(_this.drawVisual);
                _this.running = false;
                _this.drawVisual = 0;
            };
            this.canvasCtx = config.canvas.getContext('2d');
            this.canvas = config.canvas;
            if (config.w)
                this.WIDTH = config.w;
            if (config.h)
                this.HEIGHT = config.h;
            if (config.bgColor)
                this.bgColor = config.bgColor;
            if (config.lineColor)
                this.lineColor = config.lineColor;
            this.type = (config && config.type) ? config.type : 'wave';
        }
        Render.fftSize = 2048;
        return Render;
    }());
    // https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L128-L205

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var EventEmitter = /** @class */ (function () {
        function EventEmitter() {
            this.events = {};
        }
        EventEmitter.prototype.on = function (event, listener) {
            var _this = this;
            if (typeof this.events[event] !== 'object') {
                this.events[event] = [];
            }
            this.events[event].push(listener);
            return function () { return _this.removeListener(event, listener); };
        };
        EventEmitter.prototype.removeListener = function (event, listener) {
            if (typeof this.events[event] === 'object') {
                var idx = this.events[event].indexOf(listener);
                if (idx > -1) {
                    this.events[event].splice(idx, 1);
                }
            }
        };
        EventEmitter.prototype.emit = function (event) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (typeof this.events[event] === 'object') {
                this.events[event].forEach(function (listener) { return listener.apply(_this, args); });
            }
        };
        EventEmitter.prototype.once = function (event, listener) {
            var _this = this;
            var remove = this.on(event, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                remove();
                listener.apply(_this, args);
            });
        };
        return EventEmitter;
    }());

    var ON_LOOP_START = 'onLoopStart';
    var ON_LOOP_COMPLETE = 'onLoopComplete';
    var ON_SEQUENCE_COMPLETE = 'onSequenceComplete';
    var ON_RESUMED = 'onResumed';
    var ON_STATE_CHANGED = 'onStateChanged';
    var ON_DECODE_ERROR = 'onDecodeError';

    var Looper = /** @class */ (function (_super) {
        __extends(Looper, _super);
        function Looper(config) {
            var _this = _super.call(this) || this;
            _this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            _this.currentIndex = 0;
            _this.loadIndex = 0;
            _this.loadLength = 0;
            _this.currentLoopLength = 0;
            _this.loopAudio = function (url, loops, playButton) {
                _this.loops = loops;
                _this.playButton = playButton;
                if (Array.isArray(url)) {
                    _this.loadLength = url.length;
                }
                else {
                    _this.loadLength = 1;
                }
                /*
                // https://developers.google.com/web/updates/2012/02/HTML5-audio-and-the-Web-Audio-API-are-BFFs
                //
                // Wait for window.onload to fire. See crbug.com/112368
                window.addEventListener('load', function(e) {
                    // Our <audio> element will be the audio source.
                    var source = context.createMediaElementSource(audio);
                    source.connect(analyser);
                    analyser.connect(context.destination);
        
                    // ...call requestAnimationFrame() and render the analyser's output to canvas.
                }, false);
                */
                var startAudio;
                var handAudioDecode = function (r, index) {
                    _this.audioCtx.decodeAudioData(r, function (buffer) {
                        if (Array.isArray(_this.loops)) {
                            for (var i = 0; i < _this.loops[index]; i += 1) {
                                _this.bufferArray.push(buffer);
                            }
                        }
                        else {
                            _this.bufferArray.push(buffer);
                        }
                        if (_this.loadIndex === _this.loadLength - 1) {
                            _this.audioCtx.onstatechange = function () {
                                var _a;
                                _this.emit(ON_STATE_CHANGED, {
                                    type: ON_STATE_CHANGED,
                                    state: (_a = _this.audioCtx) === null || _a === void 0 ? void 0 : _a.state,
                                });
                            };
                            startAudio(0);
                        }
                        else {
                            _this.loadIndex += 1;
                        }
                    }, function (e) {
                        _this.emit(ON_DECODE_ERROR, {
                            type: ON_DECODE_ERROR,
                            message: "Error decoding audio data " + e,
                        });
                    });
                };
                var loadData = function (u, index) {
                    var request = new XMLHttpRequest();
                    request.open('GET', u, true);
                    request.responseType = 'arraybuffer';
                    request.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                        var r;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    r = request.response;
                                    this.audioData = r;
                                    return [4 /*yield*/, handAudioDecode(r, index)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    request.send();
                };
                var onAudioEnded = function () {
                    var _a, _b;
                    if (_this.currentIndex < _this.bufferArray.length - 1) {
                        startAudio(_this.currentIndex);
                        _this.emit(ON_LOOP_COMPLETE, {
                            type: ON_LOOP_COMPLETE,
                            currentIndex: _this.currentIndex,
                            loopCount: ((_a = _this.loops) === null || _a === void 0 ? void 0 : _a.hasOwnProperty('length')) ? _this.loops.length : _this.loops,
                        });
                    }
                    else {
                        _this.emit(ON_SEQUENCE_COMPLETE, {
                            type: ON_SEQUENCE_COMPLETE,
                            currentIndex: _this.currentIndex,
                            loopCount: ((_b = _this.loops) === null || _b === void 0 ? void 0 : _b.hasOwnProperty('length')) ? _this.loops.length : _this.loops,
                        });
                    }
                    _this.currentIndex += 1;
                };
                startAudio = function (index) {
                    var _a;
                    var source = _this.audioCtx.createBufferSource();
                    source.buffer = _this.bufferArray[index];
                    source.connect(_this.audioCtx.destination);
                    source.onended = onAudioEnded;
                    _this.emit(ON_LOOP_START, {
                        type: ON_LOOP_START,
                        currentIndex: _this.currentIndex,
                        loopCount: ((_a = _this.loops) === null || _a === void 0 ? void 0 : _a.hasOwnProperty('length')) ? _this.loops.length : _this.loops,
                        audioCtx: _this.audioCtx,
                        source: source,
                    });
                    source.start(0);
                };
                if (Array.isArray(url)) {
                    for (var i = 0; i < url.length; i += 1) {
                        loadData(url[i], i);
                    }
                }
                else {
                    loadData(url, 0);
                }
                if (_this.isWebKit && _this.playButton) {
                    _this.playButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        _this.audioCtx.resume().then(function () {
                            var _a;
                            _this.emit(ON_RESUMED, {
                                type: ON_RESUMED,
                                currentIndex: _this.currentIndex,
                                loopCount: ((_a = _this.loops) === null || _a === void 0 ? void 0 : _a.hasOwnProperty('length')) ? _this.loops.length : _this.loops,
                            });
                        });
                    }, false);
                }
                return "Playing: " + url;
            };
            _this.appendBuffer = function (buffer1, buffer2) {
                var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
                tmp.set(new Uint8Array(buffer1), 0);
                tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
                return tmp.buffer;
            };
            _this.config = config;
            _this.audioData = [];
            _this.bufferArray = [];
            _this.isWebKit = !!(window.webkitAudioContext);
            return _this;
        }
        return Looper;
    }(EventEmitter));

    var Anechoic = /** @class */ (function () {
        function Anechoic(config) {
            this.getLooper = function (config) { return new Looper(config); };
            this.getRender = function (config) { return new Render(config); };
            this.config = config;
        }
        return Anechoic;
    }());

    return Anechoic;

}());
