(() => {
	window.addEventListener('DOMContentLoaded', () => {
		console.log('Loading Example 2');

		const playButton = document.querySelector('#play-button');
		const canvas = document.getElementById('render-container');

		const anechoic = new Anechoic({});

		const looper = anechoic.getLooper();

		const render = anechoic.getRender({
			canvas,
			w: 350,
			h: 150,
			bgColor: '#F2F2F2',
			lineColor: '#D95032',
		});

		looper.on('onLoopStart', (params) => {
			console.log(params);
			render.visualizer(params.audioCtx, params.source);
		});
		looper.on('onLoopComplete', (params) => {
			console.log(params);
		});
		looper.on('onSequenceComplete', (params) => {
			console.log(params);
			render.stop();
		});
		looper.on('onResumed', (params) => {
			console.warn(params);
		});
		looper.on('onStateChanged', (params) => {
			console.log(params);
		});
		looper.on('onDecodeError', (params) => {
			console.warn(params);
		});
		looper.loopAudio('../audio-files/djdonovan-eclipse-loop-1.wav', [4], playButton);
		// looper.loopAudio('../audio-files/kai-illumination.mp3', [1], playButton);
	});
})();
