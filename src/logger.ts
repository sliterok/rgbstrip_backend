import { createLogger, format, transports } from 'winston'

const service = 'rgbstrip'

const baseFormat = format.combine(
	format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	format.errors({ stack: true }),
	format.splat(),
	format.printf(info => {
		const { timestamp, level, message, stack, ...meta } = info
		const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
		return `[${timestamp}] ${level}: ${stack || message}${metaStr}`
	})
)

export const logger = createLogger({
	level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
	defaultMeta: { service },
	transports: [
		new transports.Console({
			format: process.env.NODE_ENV === 'production' ? baseFormat : format.combine(format.colorize({ all: true }), baseFormat),
		}),
	],
})

export function childLogger(meta: Record<string, unknown>) {
	return logger.child(meta)
}
