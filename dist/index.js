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

    var Looper = (function () {
        function Looper(config) {
            var _this = this;
            this.loops = 0;
            this.loopIndex = 0;
            this.loopAudio = function (url, loops, playButton) {
                _this.loops = loops;
                _this.playButton = playButton;
                var AudioContext = window.AudioContext
                    || window.webkitAudioContext
                    || false;
                if (AudioContext) {
                    _this.audioCtx = new AudioContext;
                }
                else {
                    alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
                }
                _this.source = _this.audioCtx.createBufferSource();
                var loadData = function () {
                    var request = new XMLHttpRequest();
                    request.open('GET', url, true);
                    request.responseType = 'arraybuffer';
                    request.onload = function () {
                        var r = request.response;
                        _this.audioData = r;
                        handAudioDecode(_this.loopIndex);
                    };
                    request.send();
                };
                var handAudioDecode = function (index) {
                    var i = index;
                    var ad = _this.audioData;
                    var s = _this.source;
                    _this.audioCtx.decodeAudioData(ad, function (buffer) {
                        s.buffer = buffer;
                        s.connect(_this.audioCtx.destination);
                        s.loop = false;
                        startLoop();
                    }, function (e) { console.log("Error with decoding audio data " + e); });
                    _this.source.onended = function () {
                        console.log('Ended');
                        _this.loopIndex = i + 1;
                    };
                };
                var startLoop = function (index) {
                    _this.source.start(0);
                    _this.audioCtx.onstatechange = function () { return console.log("state change: " + _this.audioCtx.state); };
                };
                loadData();
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
