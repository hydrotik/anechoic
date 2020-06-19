import Render, { RenderConfig } from './render/Render';
import Looper, { LooperConfig } from './core/Looper';

interface ConfigInterface {
	loop?: boolean;
}

class Anechoic {
	private looper: Looper | undefined;

	private render: Render | undefined;

	private config: ConfigInterface;

	constructor(config: ConfigInterface) {
		this.config = config;
	}

	public getLooper = (config: LooperConfig): Looper => {
		this.looper = (this.looper || new Looper(config));
		return this.looper;
	}

	public getRender = (config: RenderConfig): Render => {
		this.render = (this.render || new Render(config));
		return this.render;
	}
}

export default Anechoic;
