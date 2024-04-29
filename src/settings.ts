import { IMode, ISettings } from './typings'

export const settings: ISettings = {
	mode: IMode.Disabled,
	color: '#ff00ff',
	progress: { current: 0, total: 0, lastUpdate: null },
	nightOverride: false,
	geoOverride: false,
	away: false,
	alive: new Date(),
}
