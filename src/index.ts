import Render, { RenderConfig } from './render/Render';
import Looper, { LooperConfig } from './core/Looper';

interface ConfigInterface {
	loop?: boolean;
}

class Anechoic {
	// private looper: Looper | undefined;

	// private render: Render | undefined;

	private config: ConfigInterface;

	constructor(config: ConfigInterface) {
		this.config = config;
	}

	public getLooper = (config: LooperConfig): Looper => new Looper(config);

	public getRender = (config: RenderConfig): Render => new Render(config)
}

export default Anechoic;
