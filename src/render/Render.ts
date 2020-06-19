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
	private static fftSize: number = 2048;

	private WIDTH: number;

	private HEIGHT: number;

	private container: HTMLElement;

	private canvas: HTMLCanvasElement;

	private canvasCtx: CanvasRenderingContext2D;

	private drawVisual: number;

	private type: string;
	
	private bgColor: string = '#FFFFFF';
	
	private lineColor: string = '#000000';

	private running: boolean = false;

	constructor(config: RenderConfig) {
		this.canvasCtx = config.canvas.getContext("2d");
		this.canvas = config.canvas;
		if (config.w) this.WIDTH = config.w;
		if (config.h) this.HEIGHT = config.h;
		if (config.bgColor) this.bgColor = config.bgColor;
		if (config.lineColor) this.lineColor = config.lineColor;
		this.type = ( config && config.type) ? config.type : 'wave';
	}


	public visualizer = (audioCtx, source) => {
		this.WIDTH = this.WIDTH | this.canvas.width;
		this.HEIGHT = this.HEIGHT | this.canvas.height;

		const analyser = audioCtx.createAnalyser();

		analyser.fftSize = 2048;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		analyser.getByteTimeDomainData(dataArray);

		source.connect(analyser);
		analyser.connect(audioCtx.destination);
		
		this.running = true;
		

		if (this.type === "wave") {
			this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

			var draw = () => {
				if(this.running) this.drawVisual = requestAnimationFrame(draw);
				
				analyser.getByteTimeDomainData(dataArray);
				
				this.canvasCtx.fillStyle = this.bgColor;
				this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

				this.canvasCtx.lineWidth = 2;
				this.canvasCtx.strokeStyle = this.lineColor;

				this.canvasCtx.beginPath();

				const sliceWidth = this.canvas.width * 1.0 / bufferLength;
				let x = 0;

				for (var i = 0; i < bufferLength; i++) {

					const v = dataArray[i] / 128.0;
					const y = v * this.canvas.height / 2;

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

		} else if (this.type == "bars") {
			analyser.fftSize = 256;
			var bufferLengthAlt = analyser.frequencyBinCount;
			console.log(bufferLengthAlt);
			var dataArrayAlt = new Uint8Array(bufferLengthAlt);

			this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

			var drawAlt = () => {
				this.drawVisual = requestAnimationFrame(drawAlt);

				analyser.getByteFrequencyData(dataArrayAlt);

				this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
				this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

				var barWidth = (this.WIDTH / bufferLengthAlt) * 2.5;
				var barHeight;
				var x = 0;

				for (var i = 0; i < bufferLengthAlt; i++) {
					barHeight = dataArrayAlt[i];

					this.canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
					this.canvasCtx.fillRect(x, this.HEIGHT - barHeight / 2, barWidth, barHeight / 2);

					x += barWidth + 1;
				}
			};

			drawAlt();

		} else if (this.type == "off") {
			this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
			this.canvasCtx.fillStyle = "red";
			this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		}

	}

	public stop = () => {
		cancelAnimationFrame(this.drawVisual);
		this.running = false;
		this.drawVisual = undefined;
	}

}


export default Render;

// https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L128-L205
