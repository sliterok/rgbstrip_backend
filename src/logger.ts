export function info(...args: unknown[]) {
	console.log(new Date().toISOString(), '- INFO -', ...args)
}

export function warn(...args: unknown[]) {
	console.warn(new Date().toISOString(), '- WARN -', ...args)
}

export function error(...args: unknown[]) {
	console.error(new Date().toISOString(), '- ERROR -', ...args)
}
