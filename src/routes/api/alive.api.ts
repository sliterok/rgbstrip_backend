import { RequestContext } from 'rakkasjs'
import { settings } from 'src/entry-hattip'

export async function get(ctx: RequestContext): Promise<Response> {
	settings.alive = new Date()
	console.log('alive:', settings.alive)
	return new Response('ok')
}
