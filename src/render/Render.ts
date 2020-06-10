export interface RenderConfig {
	canvas: HTMLCanvasElement,
	audioCtx: AudioContext,
	w: number,
	h: number,
}

class Render {
	private static fftSize: number = 2048;

	private WIDTH: number;

	private HEIGHT: number;

	private audioCtx: AudioContext;

	private analyser: AnalyserNode;

	private bufferLength: number;

	private dataArray: Uint8Array;

	private container: HTMLElement;

	private canvas: HTMLCanvasElement;

	private canvasCtx: CanvasRenderingContext2D;
	
	private drawVisual: number;

	

	constructor(config: RenderConfig) {
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


	public draw = (): void => {
		this.drawVisual = requestAnimationFrame(this.draw);

		this.analyser.getByteTimeDomainData(this.dataArray);

		this.canvasCtx.fillStyle = 'rgb(200, 200, 200)';
		this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

		this.canvasCtx.lineWidth = 2;
		this.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

		this.canvasCtx.beginPath();

		var sliceWidth = this.WIDTH * 1.0 / this.bufferLength;
		var x = 0;

		for(var i = 0; i < this.bufferLength; i++) {

			var v = this.dataArray[i] / 128.0;
			var y = v * this.HEIGHT/2;

			if(i === 0) {
				this.canvasCtx.moveTo(x, y);
			} else {
				this.canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		this.canvasCtx.lineTo(this.canvas.width, this.canvas.height/2);
		this.canvasCtx.stroke();
	}

}


export default Render;

// https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L128-L205
