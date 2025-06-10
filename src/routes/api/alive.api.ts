import { touchAlive } from 'src/backend/alive'

export async function get(): Promise<Response> {
	touchAlive()
	return new Response('ok')
}
