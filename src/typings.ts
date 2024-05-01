import Datagram from 'dgram'

export type IColorGetter = (frameIndex: number, index: number) => [number, number, number]

export enum IMode {
	Disabled,
	Rainbow,
	Progress,
	White,
	Away,
	Noise,
	Color,
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
	isNight: boolean
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
