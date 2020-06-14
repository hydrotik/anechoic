import EventEmitter , { Emitter } from '../events/EventEmitter';

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

    private loopIndex: number = 0;

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
                            this.emit('onStateChange', {state: this.audioCtx?.state});
                        }
                        startAudio(0);
                    } else {
                        this.loadIndex += 1;
                    }
                },
                function(e){ console.log(`Error with decoding audio data ${e}`); }
            );

            
        }

        const onAudioEnded = () => {
            this.emit('onLoopComplete', {loopIndex: this.loopIndex, loopCount: this.loops});
            this.loopIndex = this.loopIndex + 1;
            if(this.loopIndex < this.bufferArray.length) startAudio(this.loopIndex);
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
                    this.emit('onResumed', {loopIndex: this.loopIndex, loopCount: this.loops});
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
