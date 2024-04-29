import { ISettings } from './typings'

declare module 'rakkasjs' {
	interface ServerSideLocals {
		settings: ISettings
	}

	interface PageLocals {
		settings: ISettings
	}
}
