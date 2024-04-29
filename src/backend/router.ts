import { AxiosError, default as axios } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import crypto from 'crypto'
import { settings } from 'src/settings'
import { config } from './config'

const jar = new CookieJar()
const client = wrapper(axios.create({ jar, baseURL: config.routerEndpoint }))
const auth = { login: 'api', password: config.routerPassword }

async function init() {
	try {
		const initCookieRes = await client.get('/auth').catch(err => err.response)
		const headers = initCookieRes.headers
		let md5 = auth.login + ':' + headers['x-ndm-realm'] + ':' + auth.password
		md5 = crypto.createHash('md5').update(md5).digest('hex')

		const sha256 = crypto
			.createHash('sha256')
			.update(headers['x-ndm-challenge'] + md5)
			.digest('hex')

		await client.post('/auth', { ...auth, password: sha256 })
	} catch (err) {
		console.error('router login failed', (err as AxiosError).response?.data)
	}
}

const initted = init()

interface IHost {
	name: string
	'last-seen': number
}

export async function phoneLastSeen() {
	try {
		await initted
		const devicesRes = await client.get('/rci/show/ip/hotspot?mac=***REMOVED***')
		const hosts = devicesRes.data.host as IHost[]
		const myPhone = hosts.find(item => item.name.includes('***REMOVED***'))
		return myPhone?.['last-seen']
	} catch (err) {
		console.error('phone last seen failed', (err as AxiosError).response?.data)
	}
}

let seenTimeout: NodeJS.Timeout | null = null
async function updatePhoneLastSeen() {
	const lastSeen = await phoneLastSeen()
	// eslint-disable-next-line no-console
	console.log('phone last seen:', lastSeen)
	if (lastSeen === undefined || lastSeen > 120) {
		if (!seenTimeout) seenTimeout = setTimeout(() => (settings.away = true), 120000)
	} else {
		if (seenTimeout) clearTimeout(seenTimeout)
		seenTimeout = null
		settings.away = false
	}
}

export function startRouterIntegration() {
	setInterval(updatePhoneLastSeen, 120000)
	updatePhoneLastSeen()
}
