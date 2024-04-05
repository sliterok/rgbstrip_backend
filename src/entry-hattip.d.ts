import { ISettings } from './backend'

declare module 'rakkasjs' {
	interface ServerSideLocals {
		settings: ISettings
	}

	interface PageLocals {
		settings: ISettings
	}
}
