var Anechoic = (function () {
    'use strict';

    var Render = (function () {
        function Render(config) {
            var _this = this;
            this.draw = function () {
                _this.drawVisual = requestAnimationFrame(_this.draw);
                _this.analyser.getByteTimeDomainData(_this.dataArray);
                _this.canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                _this.canvasCtx.fillRect(0, 0, _this.WIDTH, _this.HEIGHT);
                _this.canvasCtx.lineWidth = 2;
                _this.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
                _this.canvasCtx.beginPath();
                var sliceWidth = _this.WIDTH * 1.0 / _this.bufferLength;
                var x = 0;
                for (var i = 0; i < _this.bufferLength; i++) {
                    var v = _this.dataArray[i] / 128.0;
                    var y = v * _this.HEIGHT / 2;
                    if (i === 0) {
                        _this.canvasCtx.moveTo(x, y);
                    }
                    else {
                        _this.canvasCtx.lineTo(x, y);
                    }
                    x += sliceWidth;
                }
                _this.canvasCtx.lineTo(_this.canvas.width, _this.canvas.height / 2);
                _this.canvasCtx.stroke();
            };
            this.canvasCtx = config.canvas.getContext("2d");
            this.audioCtx = config.audioCtx;
            this.canvas = config.canvas;
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = Render.fftSize;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.analyser.getByteTimeDomainData(this.dataArray);
            this.WIDTH = config.w;
            this.HEIGHT = config.h;
        }
        Render.fftSize = 2048;
        return Render;
    }());

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

    var Looper = (function () {
        function Looper(config) {
            var _this = this;
            this.loopIndex = 0;
            this.loadIndex = 0;
            this.loadLength = 0;
            this.currentLoopLength = 0;
            this.loopAudio = function (url, loops, playButton) {
                _this.loops = loops;
                _this.playButton = playButton;
                if (Array.isArray(url)) {
                    _this.loadLength = url.length;
                }
                else {
                    _this.loadLength = 1;
                }
                var AudioContext = window.AudioContext
                    || window.webkitAudioContext
                    || false;
                if (AudioContext) {
                    _this.audioCtx = new AudioContext;
                }
                else {
                    alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
                }
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
                                    return [4, handAudioDecode(r, index)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); };
                    request.send();
                };
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
                        if (_this.loadIndex == _this.loadLength - 1) {
                            _this.audioCtx.onstatechange = function () { return console.log("state change: " + _this.audioCtx.state); };
                            startAudio(0);
                        }
                        else {
                            _this.loadIndex += 1;
                        }
                    }, function (e) { console.log("Error with decoding audio data " + e); });
                };
                var onAudioEnded = function () {
                    console.log("Ended Index: " + _this.loopIndex + " - Loops: " + _this.loops);
                    _this.loopIndex = _this.loopIndex + 1;
                    if (_this.loopIndex < _this.bufferArray.length)
                        startAudio(_this.loopIndex);
                };
                var startAudio = function (index) {
                    _this.source = _this.audioCtx.createBufferSource();
                    _this.source.buffer = _this.bufferArray[index];
                    _this.source.connect(_this.audioCtx.destination);
                    _this.source.onended = onAudioEnded;
                    _this.source.start(0);
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
                            console.log('Playback resumed successfully');
                        });
                    }, false);
                }
                return "Playing: " + url;
            };
            this.getAudioCtx = function (url) {
                return _this.audioCtx;
            };
            this.appendBuffer = function (buffer1, buffer2) {
                var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
                tmp.set(new Uint8Array(buffer1), 0);
                tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
                return tmp.buffer;
            };
            this.config = config;
            this.audioData = [];
            this.bufferArray = [];
            this.isWebKit = (window.webkitAudioContext) ? true : false;
        }
        return Looper;
    }());

    var Anechoic = (function () {
        function Anechoic(config) {
            var _this = this;
            this.getLooper = function (config) {
                return _this.looper = (_this.looper || new Looper(config));
            };
            this.getRender = function (config) {
                return _this.render = (_this.render || new Render(config));
            };
            this.config = config;
        }
        return Anechoic;
    }());

    return Anechoic;

}());
