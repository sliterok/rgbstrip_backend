import { createLogger, format, transports } from 'winston'

const service = 'rgbstrip'

export const logger = createLogger({
	level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
	defaultMeta: { service },
	format: format.combine(format.timestamp(), format.errors({ stack: true }), format.splat(), format.json()),
	transports: [
		new transports.Console({
			format: process.env.NODE_ENV === 'production' ? format.json() : format.combine(format.colorize(), format.simple()),
		}),
	],
})

export function childLogger(meta: Record<string, unknown>) {
	return logger.child(meta)
}
