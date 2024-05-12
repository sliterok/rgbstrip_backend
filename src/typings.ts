import Datagram from 'dgram'

export type IArrColor = [number, number, number]
export type IStaticColorGetter = () => IArrColor
export type IColorGetter = (index: number) => IArrColor
export type IColorMapper = () => IArrColor[]

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
	color: IArrColor
	progress: { current: number; total: number; lastUpdate: Date | null }
	nightOverride: boolean
	geoOverride: boolean
	away: boolean
	alive: Date
}

export interface IDynamicDto {
	disabledColor: IArrColor
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
	externalUrl: string
}
