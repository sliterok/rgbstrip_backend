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
	Noise,
	Color,
}

export interface ISettings {
	mode: IMode
	color: IArrColor
	progress: { current: number; total: number; lastUpdate: Date | null }
	nightOverride: boolean
	geoOverride: boolean
	forceAway: boolean
	mixColorWithNoise: boolean
	mixRatio: number
	alive: Date
}

export interface IDynamicDto {
	disabledColor: IArrColor
	hasConnections: boolean
	isNight: boolean
	isAway: boolean
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
