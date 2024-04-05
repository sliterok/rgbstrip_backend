export enum IMode {
	Disabled,
	Rainbow,
	Progress,
	White,
	Away,
	Noise,
	Color,
}

export const ModeToWord = {
	[IMode.Disabled]: 'выкл',
	[IMode.Rainbow]: 'радуга',
	[IMode.Progress]: 'прогрессбар',
	[IMode.White]: 'белый',
	[IMode.Away]: 'ушел',
	[IMode.Noise]: 'шум',
	[IMode.Color]: 'цвет',
}

export interface ISettings {
	mode: IMode
	color: string
	progress: { current: number; total: number; lastUpdate: Date | null }
	nightOverride: boolean
	geoOverride: boolean
	away: boolean
	alive: Date
}
