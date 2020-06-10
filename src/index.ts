import Render, { RenderConfig } from 'render/Render';
import Looper from 'core/Looper';

interface ConfigInterface {
	loop?: boolean;
}

class Anechoic {
	private looper: Looper;
	private render: Render;
	private config: ConfigInterface;

	constructor(config: ConfigInterface) {
		this.config = config;
	}

	public getLooper = (config: object): Looper => {
		return this.looper = (this.looper || new Looper(config));
	}

	public getRender = (config: RenderConfig): Render => {
		return this.render = (this.render ||  new Render(config));
	}
}

export default Anechoic;
