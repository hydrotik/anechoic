(() => {
	window.addEventListener('DOMContentLoaded', (event) => {
		console.log('Loading Example 2');

		const playButton = document.querySelector('#play-button');
		const canvas = document.getElementById('render-container')

		const anechoic = new Anechoic({});

		const looper = anechoic.getLooper();

		const render = anechoic.getRender({
			canvas: canvas,
			w: 500,
			h: 250
		});

		

		looper.on('onLoopStart', (params) => {
			console.log(params);
			render.visualize(params.audioCtx, params.source);
		});
		looper.on('onLoopComplete', (params) => {
			console.log(params);
			render.stop();
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
		looper.loopAudio('../audio-files/kai-illumination.mp3', [1], playButton);

		
	});
})();
