import { settings } from 'src/settings'
import { logger } from 'src/logger'

export async function get(): Promise<Response> {
	settings.alive = new Date()
	logger.debug('alive', { time: settings.alive })
	return new Response('ok')
}
