import { settings } from 'src/settings'

export async function get(): Promise<Response> {
	settings.alive = new Date()
	// eslint-disable-next-line no-console
	console.log('alive:', settings.alive)
	return new Response('ok')
}
