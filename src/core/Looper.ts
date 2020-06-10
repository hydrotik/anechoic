
interface ConfigInterface {
	loop?: boolean;
}

class Looper {
    private audioObj: HTMLAudioElement;
    
    private config: ConfigInterface;

    private audioCtx: AudioContext;

    private scriptNode: ScriptProcessorNode;

    private audioData: any;

    private source: AudioBufferSourceNode;

    private isWebKit: boolean;

    private loops: number = 0;

    private loopIndex: number = 0;

    private playButton: HTMLElement;

	constructor(config: ConfigInterface) {
		this.config = config;
        this.audioData = [];
        
        this.isWebKit = (window.webkitAudioContext) ? true : false;
	}

	public loopAudio = (url: string, loops?: number, playButton?: any): string => {
        this.loops = loops;
        this.playButton = playButton;
        var AudioContext = window.AudioContext
            || window.webkitAudioContext
            || false; 

        if (AudioContext) {
            this.audioCtx = new AudioContext;
        } else {
            alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
        }

        this.source = this.audioCtx.createBufferSource();
        
        const loadData = () => {
            const request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            
            request.onload = () => {
                const r = request.response;
                this.audioData = r;
                handAudioDecode(this.loopIndex);
            }


            request.send();
            
        }

        const handAudioDecode = (index: number) => {
            const i = index;
            const ad = this.audioData;
            const s = this.source;
            
            this.audioCtx.decodeAudioData(ad, (buffer) => {
                    s.buffer = buffer;
            
                    s.connect(this.audioCtx.destination);
                    s.loop = false;

                    startLoop(i);
                },
                function(e){ console.log(`Error with decoding audio data ${e}`); }
            );

            this.source.onended = () => { 
                console.log('Ended');
                this.loopIndex = i + 1;
            }
        }

        const startLoop = (index: number) => {
            this.source.start(0);

            this.audioCtx.onstatechange = () => console.log(`state change: ${this.audioCtx.state}`);
        }

        loadData();
        
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
