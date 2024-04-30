import Datagram from 'dgram'

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
	color: [number, number, number]
	progress: { current: number; total: number; lastUpdate: Date | null }
	nightOverride: boolean
	geoOverride: boolean
	away: boolean
	alive: Date
}

export interface IDynamicDto {
	disabledColor: [number, number, number]
	offset: number
	hasConnections: boolean
	lastMessage?: number
	target?: Datagram.RemoteInfo
}

export interface IConfig {
	TZ?: string
	routerMac: string
	routerDevice: string
	routerEndpoint: string
	tgAllowedUsers: string
	tgApiKey: string
	routerPassword: string
}
