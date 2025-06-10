import { settings } from 'src/settings'
import { logger } from 'src/backend/logger'

export async function get(): Promise<Response> {
	settings.alive = new Date()
	logger.info('alive:', settings.alive)
	return new Response('ok')
}
