import { settings } from 'src/settings'
import { info } from '../../logger'

export async function get(): Promise<Response> {
	settings.alive = new Date()
	info('alive:', settings.alive)
	return new Response('ok')
}
