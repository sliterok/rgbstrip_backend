import { IMode, ISettings } from './typings'

export const settings: ISettings = {
	mode: IMode.Disabled,
	color: [255, 0, 255],
	progress: { current: 0, total: 0, lastUpdate: null },
	nightOverride: false,
	geoOverride: false,
	forceAway: false,
	mixRatio: 0,
	mixColorWithNoise: false,
	alive: new Date(),
}
