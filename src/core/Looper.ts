
interface ConfigInterface {
	loop?: boolean;
}

class Looper {
    private audioObj: HTMLAudioElement;
    
    private config: ConfigInterface;

    private audioCtx: AudioContext;

    private audioData: any;

    private source: AudioBufferSourceNode;

    private bufferArray: Array<AudioBuffer>;

    private isWebKit: boolean;

    private loops: number = 0;

    private loopIndex: number = 0;

    private loadIndex: number = 0;

    private loadLength: number = 0;

    private playButton: HTMLElement;

	constructor(config: ConfigInterface) {
		this.config = config;
        this.audioData = [];
        this.bufferArray = [];
        this.isWebKit = (window.webkitAudioContext) ? true : false;
	}

	public loopAudio = (url: string | Array<string>, loops?: number, playButton?: any): string => {
        this.loops = loops;
        this.playButton = playButton;
        if (Array.isArray(url)) {
            this.loadLength = url.length;
        }else{
            this.loadLength = 1;
        }
        var AudioContext = window.AudioContext
            || window.webkitAudioContext
            || false; 

        if (AudioContext) {
            this.audioCtx = new AudioContext;
        } else {
            alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
        }
        
        const loadData = (u: string) => {
            const request = new XMLHttpRequest();
            request.open('GET', u, true);
            request.responseType = 'arraybuffer';
            
            request.onload = async () => {
                const r = request.response;
                this.audioData = r;
                await handAudioDecode(r);
            }

            request.send();
            
        }

        const handAudioDecode = (r) => {
            this.audioCtx.decodeAudioData(r, (buffer) => {
                    this.bufferArray.push(buffer);
                    if (this.loadIndex == this.loadLength - 1){
                        this.audioCtx.onstatechange = () => console.log(`state change: ${this.audioCtx.state}`);
                        startAudio(0);
                    } else {
                        this.loadIndex += 1;
                    }
                },
                function(e){ console.log(`Error with decoding audio data ${e}`); }
            );

            
        }

        const onAudioEnded = () => {
            console.log(`Ended Index: ${this.loopIndex} - Loops: ${this.loops}`);
            this.loopIndex = this.loopIndex + 1;
            if(this.loopIndex < this.loops) startAudio(this.loopIndex);
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
                loadData(url[i]);
            }
        } else {
            loadData(url);
        }
        
        if(this.isWebKit && this.playButton) {
            this.playButton.addEventListener('click', (event) => {
                event.preventDefault();

                this.audioCtx.resume().then(() => {
                    console.log('Playback resumed successfully');
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
