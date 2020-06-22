import { downSampleArray } from '../utils/DownSample';

export interface RenderConfig {
	canvas: HTMLCanvasElement,
	audioCtx: AudioContext,
	w: number,
	h: number,
	type: string,
	bgColor: string,
	lineColor: string,
}

class Render {
	private static fftSize = 2048;

	private WIDTH = 0;

	private HEIGHT = 0;

	private canvas: HTMLCanvasElement;

	private canvasCtx: CanvasRenderingContext2D;

	private drawVisual = 0;

	private type: string;

	private bgColor = '#FFFFFF';

	private lineColor = '#000000';

	private running = false;

	constructor(config: RenderConfig) {
		this.canvasCtx = config.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.canvas = config.canvas;
		if (config.w) this.WIDTH = config.w;
		if (config.h) this.HEIGHT = config.h;
		if (config.bgColor) this.bgColor = config.bgColor;
		if (config.lineColor) this.lineColor = config.lineColor;
		this.type = (config && config.type) ? config.type : 'wave';
	}


	public preview = (audioCtx: AudioContext, source: AudioBufferSourceNode): void => {
		// eslint-disable-next-line no-console
		console.log('Render :: preview()');
		// eslint-disable-next-line no-console
		console.log(source.buffer);
		const ab: AudioBuffer | null = source.buffer;

		if (ab) {
			const anotherArray = new Float32Array(ab.length);
			ab.copyFromChannel(anotherArray, 1, 0);
			// eslint-disable-next-line no-console
			// console.log(`new buffer: ${anotherArray.length}`);
			// eslint-disable-next-line no-console
			// console.log(anotherArray);

			// const ds = largestTriangleThreeBuckets(anotherArray, 150);
			const ds = downSampleArray(anotherArray, 1200);
			// eslint-disable-next-line no-console
			// console.log(ds.length);
			// eslint-disable-next-line no-console
			// console.log(ds);

			this.canvasCtx.fillStyle = this.bgColor;
			this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			this.canvasCtx.lineWidth = 1;
			this.canvasCtx.strokeStyle = this.lineColor;

			this.canvasCtx.beginPath();

			const sliceWidth = 0.5; // (this.canvas.width * 1.0) / bufferLength;
			let x = 0;

			for (let i = 0; i < 4; i += 1) {
				for (let l = 0; l < ds.length; l += 1) {
					const v = ds[l] * 1.25;
					const y = ((v * this.canvas.height) / 2) + (this.canvas.height / 2);

					if (l === 0 && i === 0) {
						this.canvasCtx.moveTo(x, y);
					} else {
						this.canvasCtx.lineTo(x, y);
					}

					x += sliceWidth / 8;
				}
			}

			// this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
			this.canvasCtx.stroke();
		}
	}

	public visualizer = (audioCtx: AudioContext, source: AudioBufferSourceNode): void => {
		if (!this.WIDTH) this.WIDTH = this.canvas.width;
		if (!this.HEIGHT) this.HEIGHT = this.canvas.height;

		const analyser = audioCtx.createAnalyser();

		analyser.fftSize = 2048;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		analyser.getByteTimeDomainData(dataArray);

		source.connect(analyser);
		analyser.connect(audioCtx.destination);

		this.running = true;

		if (this.type === 'wave') {
			this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

			const draw = () => {
				if (this.running) this.drawVisual = requestAnimationFrame(draw);

				analyser.getByteTimeDomainData(dataArray);

				this.canvasCtx.fillStyle = this.bgColor;
				this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

				this.canvasCtx.lineWidth = 2;
				this.canvasCtx.strokeStyle = this.lineColor;

				this.canvasCtx.beginPath();

				const sliceWidth = (this.canvas.width * 1.0) / bufferLength;
				let x = 0;

				for (let i = 0; i < bufferLength; i += 1) {
					const v = dataArray[i] / 128.0;
					const y = (v * this.canvas.height) / 2;

					if (i === 0) {
						this.canvasCtx.moveTo(x, y);
					} else {
						this.canvasCtx.lineTo(x, y);
					}

					x += sliceWidth;
				}

				// this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
				this.canvasCtx.stroke();
			};

			draw();
		} else if (this.type === 'bars') {
			analyser.fftSize = 256;
			const bufferLengthAlt = analyser.frequencyBinCount;

			const dataArrayAlt = new Uint8Array(bufferLengthAlt);

			this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

			const drawAlt = () => {
				this.drawVisual = requestAnimationFrame(drawAlt);

				analyser.getByteFrequencyData(dataArrayAlt);

				this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
				this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

				const barWidth = (this.WIDTH / bufferLengthAlt) * 2.5;
				let barHeight;
				let x = 0;

				for (let i = 0; i < bufferLengthAlt; i += 1) {
					barHeight = dataArrayAlt[i];

					this.canvasCtx.fillStyle = `rgb(${(barHeight + 100)},50,50)`;
					this.canvasCtx.fillRect(x, this.HEIGHT - barHeight / 2, barWidth, barHeight / 2);

					x += barWidth + 1;
				}
			};

			drawAlt();
		} else if (this.type === 'off') {
			this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
			this.canvasCtx.fillStyle = 'red';
			this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		}
	}

	public stop = (): void => {
		cancelAnimationFrame(this.drawVisual);
		this.running = false;
		this.drawVisual = 0;
	}
}

export default Render;

// https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L128-L205
