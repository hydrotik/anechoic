import EventEmitter from '../events/EventEmitter';
import {
	ON_LOOP_START,
	ON_LOOP_COMPLETE,
	ON_SEQUENCE_COMPLETE,
	ON_RESUMED,
	ON_DECODE_ERROR,
	ON_STATE_CHANGED,
} from '../events/Events';

export interface LooperConfig {
	loop?: boolean;
}

class Looper extends EventEmitter {
	private audioObj: HTMLAudioElement | undefined;

	private config: LooperConfig;

	private audioCtx: AudioContext = new (window.AudioContext || window.webkitAudioContext)();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private audioData: any;

	private bufferArray: Array<AudioBuffer>;

	private isWebKit: boolean;

	private loops: number | Array<number> | undefined;

	private currentIndex = 0;

	private loadIndex = 0;

	private loadLength = 0;

	private currentLoopLength = 0;

	private playButton: HTMLElement | undefined;

	constructor(config: LooperConfig) {
		super();
		this.config = config;
		this.audioData = [];
		this.bufferArray = [];
		this.isWebKit = !!(window.webkitAudioContext);
	}

	public loopAudio = (
		url: string | Array<string>,
		loops?: number | Array<number>,
		playButton?: HTMLElement,
	): string => {
		this.loops = loops;
		this.playButton = playButton;
		if (Array.isArray(url)) {
			this.loadLength = url.length;
		} else {
			this.loadLength = 1;
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

		let startAudio: (index: number) => void;

		const handAudioDecode = (r: ArrayBuffer, index: number) => {
			this.audioCtx.decodeAudioData(r, (buffer) => {
				if (Array.isArray(this.loops)) {
					for (let i = 0; i < this.loops[index]; i += 1) {
						this.bufferArray.push(buffer);
					}
				} else {
					this.bufferArray.push(buffer);
				}
				if (this.loadIndex === this.loadLength - 1) {
					this.audioCtx.onstatechange = (): void => {
						this.emit(
							ON_STATE_CHANGED,
							{
								type: ON_STATE_CHANGED,
								state: this.audioCtx?.state,
							},
						);
					};
					startAudio(0);
				} else {
					this.loadIndex += 1;
				}
			},
			(e) => {
				this.emit(
					ON_DECODE_ERROR,
					{
						type: ON_DECODE_ERROR,
						message: `Error decoding audio data ${e}`,
					},
				);
			});
		};

		const loadData = (u: string, index: number) => {
			const request = new XMLHttpRequest();
			request.open('GET', u, true);
			request.responseType = 'arraybuffer';

			request.onload = async () => {
				const r = request.response;
				this.audioData = r;
				await handAudioDecode(r, index);
			};

			request.send();
		};

		const onAudioEnded = () => {
			if (this.currentIndex < this.bufferArray.length - 1) {
				startAudio(this.currentIndex);
				this.emit(
					ON_LOOP_COMPLETE,
					{
						type: ON_LOOP_COMPLETE,
						currentIndex: this.currentIndex,
						loopCount: (this.loops?.hasOwnProperty('length')) ? (this.loops as Array<number>).length : this.loops,
					},
				);
			} else {
				this.emit(
					ON_SEQUENCE_COMPLETE,
					{
						type: ON_SEQUENCE_COMPLETE,
						currentIndex: this.currentIndex,
						loopCount: (this.loops?.hasOwnProperty('length')) ? (this.loops as Array<number>).length : this.loops,
					},
				);
			}
			this.currentIndex += 1;
		};

		startAudio = (index: number): void => {
			const source: AudioBufferSourceNode = this.audioCtx.createBufferSource();
			source.buffer = this.bufferArray[index];
			source.connect(this.audioCtx.destination);
			source.onended = onAudioEnded;
			this.emit(
				ON_LOOP_START,
				{
					type: ON_LOOP_START,
					currentIndex: this.currentIndex,
					loopCount: (this.loops?.hasOwnProperty('length')) ? (this.loops as Array<number>).length : this.loops,
					audioCtx: this.audioCtx,
					source,
				},
			);
			source.start(0);
		};

		if (Array.isArray(url)) {
			for (let i = 0; i < url.length; i += 1) {
				loadData(url[i], i);
			}
		} else {
			loadData(url, 0);
		}

		if (this.isWebKit && this.playButton) {
			this.playButton.addEventListener('click', (event) => {
				event.preventDefault();

				this.audioCtx.resume().then(() => {
					this.emit(
						ON_RESUMED,
						{
							type: ON_RESUMED,
							currentIndex: this.currentIndex,
							loopCount: (this.loops?.hasOwnProperty('length')) ? (this.loops as Array<number>).length : this.loops,
						},
					);
				});
			}, false);
		}

		return `Playing: ${url}`;
	}


	private appendBuffer = (buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer => {
		const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
		tmp.set(new Uint8Array(buffer1), 0);
		tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
		return tmp.buffer;
	};
}


export default Looper;
