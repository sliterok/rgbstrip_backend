import Datagram from 'dgram'

export type IArrColor = [number, number, number]
export interface IRgbLabColor {
	rgb: IArrColor
	lab: IArrColor
}
export type IStaticColorGetter = () => IArrColor

export type IColorGetter<T = never> = (index: number, time: number, batchData: T) => IArrColor
export type IColorMapper = () => IArrColor[][]

export enum IMode {
	Disabled,
	Rainbow,
	Progress,
	White,
	Color,
	Noise,
	Plasma,
	Breathe,
	Wave,
	Heartbeat,
	Strobe,
	Pulse,
	GradientPulse,
	MultiPulse,
	Ripple,
	MusicRipple,
	FftRipple,
}

export interface ISettings {
	mode: IMode
	color: IArrColor
	progress: { current: number; total: number; lastUpdate: Date | null }
	nightOverride: boolean
	geoOverride: boolean
	mixColorWithNoise: boolean
	syncToMusic: boolean
	mixRatio: number
	effectSpeed: number
	alive: Date
}

export interface IDynamicDto {
	disabledColor: IArrColor
	hasConnections: boolean
	isNight: boolean
	isAway: boolean
	lastMessage: number
	nightChanged: number
	awayChanged: number
	overrideRatio: number
	breatheHue?: number
	target?: Datagram.RemoteInfo
	transition?: { from: IMode; start: number }
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
