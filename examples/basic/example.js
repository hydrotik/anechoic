(() => {
	window.addEventListener('DOMContentLoaded', () => {
		console.log('Loading Example 1');

		const playButton = document.querySelector('#play-button');

		const anechoic = new Anechoic({});
		const looper = anechoic.getLooper();

		looper.on('onLoopComplete', (params) => {
			console.log(params);
		});
		looper.on('onSequenceComplete', (params) => {
			console.log(params);
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
		looper.loopAudio(
			[
				'../audio-files/djdonovan-eclipse-loop-1.wav',
				'../audio-files/djdonovan-eclipse-loop-2.wav',
				'../audio-files/djdonovan-eclipse-loop-3.wav',
			],
			[
				8,
				4,
				4,
			],
			playButton,
		);
	});
})();
