import EventEmitter , { Emitter } from '../events/EventEmitter';
import {
    ON_LOOP_COMPLETE,
    ON_SEQUENCE_COMPLETE,
    ON_RESUMED,
    ON_DECODE_ERROR,
    ON_STATE_CHANGED,
} from '../events/Events';

interface ConfigInterface {
	loop?: boolean;
}

class Looper extends EventEmitter {
    private audioObj: HTMLAudioElement | undefined;
    
    private config: ConfigInterface;

    private audioCtx: AudioContext = new (window.AudioContext || window.webkitAudioContext)();

    private audioData: any;

    private source: AudioBufferSourceNode | undefined;

    private bufferArray: Array<AudioBuffer>;

    private isWebKit: boolean;

    private loops: number | Array<number> | undefined;

    private currentIndex: number = 0;

    private loadIndex: number = 0;

    private loadLength: number = 0;

    private currentLoopLength: number = 0;

    private playButton: HTMLElement | undefined;

	constructor(config: ConfigInterface) {
        super();
		this.config = config;
        this.audioData = [];
        this.bufferArray = [];
        this.isWebKit = (window.webkitAudioContext) ? true : false;
	}

	public loopAudio = (url: string | Array<string>, loops?: number | Array<number>, playButton?: any): string => {
        this.loops = loops;
        this.playButton = playButton;
        if (Array.isArray(url)) {
            this.loadLength = url.length;
        }else{
            this.loadLength = 1;
        }
       
        
        const loadData = (u: string, index) => {
            const request = new XMLHttpRequest();
            request.open('GET', u, true);
            request.responseType = 'arraybuffer';
            
            request.onload = async () => {
                const r = request.response;
                this.audioData = r;
                await handAudioDecode(r, index);
            }

            request.send();
            
        }

        const handAudioDecode = (r, index) => {
            this.audioCtx?.decodeAudioData(r, (buffer) => {
                    if (Array.isArray(this.loops)) {
                        for (let i = 0; i < this.loops[index]; i += 1) {
                            this.bufferArray.push(buffer);
                        }
                    } else {
                        this.bufferArray.push(buffer);
                    }
                    if (this.loadIndex == this.loadLength - 1){
                        this.audioCtx.onstatechange = () => {
                            this.emit(
                                ON_STATE_CHANGED,
                                {
                                    type: ON_STATE_CHANGED,
                                    state: this.audioCtx?.state
                                }
                            );
                        }
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
                            message: `Error decoding audio data ${e}`
                        }
                    );
                }
            );

            
        }

        const onAudioEnded = () => {
            if(this.currentIndex < this.bufferArray.length){
                startAudio(this.currentIndex);
                this.emit(
                    ON_LOOP_COMPLETE,
                    {
                        type: ON_LOOP_COMPLETE,
                        currentIndex: this.currentIndex,
                        loopCount: (this.loops.hasOwnProperty('length')) ? (this.loops as Array<number>).length : this.loops
                    }
                );
            } else {
                this.emit(
                    ON_SEQUENCE_COMPLETE,
                    {
                        type: ON_SEQUENCE_COMPLETE,
                        currentIndex: this.currentIndex,
                        loopCount: (this.loops.hasOwnProperty('length')) ? (this.loops as Array<number>).length : this.loops
                    }
                );
            }
            this.currentIndex = this.currentIndex + 1;
        }

        const startAudio = (index: number) => {
            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = this.bufferArray[index];
            this.source.connect(this.audioCtx.destination);
            this.source.onended = onAudioEnded;
            this.source.start(0);
        }

        if (Array.isArray(url)) {
            for(let i = 0; i < url.length; i += 1) {
                loadData(url[i], i);
            }
        } else {
            loadData(url, 0);
        }
        
        if(this.isWebKit && this.playButton) {
            this.playButton.addEventListener('click', (event) => {
                event.preventDefault();

                this.audioCtx.resume().then(() => {
                    this.emit(
                        ON_RESUMED,
                        {
                            type: ON_RESUMED,
                            currentIndex: this.currentIndex,
                            loopCount: (this.loops.hasOwnProperty('length')) ? (this.loops as Array<number>).length : this.loops
                        }
                    );
                });
            
            }, false);
        }

        return `Playing: ${url}`;
    }
    
    public getAudioCtx = (url: string): AudioContext => {
        return this.audioCtx;
    }

    private appendBuffer = (buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer => {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    };

}


export default Looper;
