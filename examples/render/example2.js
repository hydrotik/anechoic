(() => {
	window.addEventListener('DOMContentLoaded', () => {
		console.log('Loading Example 2');

		const playButton = document.querySelector('#play-button');
		const canvasViz = document.getElementById('visualizer-container');
		const canvasPreview = document.getElementById('preview-container');

		const anechoic = new Anechoic({});

		const looper = anechoic.getLooper();

		const RenderVisualizer = anechoic.getRender({
			canvas: canvasViz,
			w: 350,
			h: 150,
			bgColor: '#F2F2F2',
			lineColor: '#D95032',
		});

		const RenderPreview = anechoic.getRender({
			canvas: canvasPreview,
			w: 600,
			h: 150,
			bgColor: '#323232',
			lineColor: '#32df32',
		});

		looper.on('onLoopStart', (params) => {
			RenderVisualizer.visualizer(params.audioCtx, params.source);
			RenderPreview.preview(params.audioCtx, params.source);
		});
		looper.on('onLoopComplete', (params) => {
			// console.log(params);
		});
		looper.on('onSequenceComplete', (params) => {
			console.log(params);
			RenderVisualizer.stop();
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
