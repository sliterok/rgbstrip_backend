import { createLogger, format, transports } from 'winston'
import chalk from 'chalk'

chalk.level = 3

const service = 'rgbstrip'

const useColors = true

function formatMeta(meta: Record<string, unknown>) {
	const entries = Object.entries(meta)
		.filter(([key]) => key !== 'service')
		.map(([key, val]) => {
			const v = typeof val === 'object' ? JSON.stringify(val) : String(val)
			return `${useColors ? chalk.magenta(key) : key}=${useColors ? chalk.cyan(v) : v}`
		})
	return entries.length ? ' ' + entries.join(' ') : ''
}

const baseFormat = format.combine(
	format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	format.errors({ stack: true }),
	format.splat(),
	format.printf((info: any) => {
		const { timestamp, level, message, stack, service, ...meta } = info
		const lvlColor =
			level === 'error'
				? chalk.redBright
				: level === 'warn'
				? chalk.yellowBright
				: level === 'info'
				? chalk.greenBright
				: level === 'debug'
				? chalk.cyanBright
				: (v: string) => v
		const msg = stack || message
		const metaStr = formatMeta(meta)
		const time = useColors ? chalk.whiteBright(`[${timestamp}]`) : `[${timestamp}]`
		const lvl = useColors ? lvlColor(level) : level
		return `${time} ${lvl}: ${msg}${metaStr}`
	})
)

export const logger = createLogger({
	level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
	defaultMeta: { service },
	transports: [new transports.Console({ format: baseFormat })],
})

export function childLogger(meta: Record<string, unknown>) {
	return logger.child(meta)
}
