import { AxiosError, default as axios } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import crypto from 'crypto'
import { config } from './config'
import { dynamic } from './shared'
import { updateMessage } from './telegram/updates'

const jar = new CookieJar()
const client = wrapper(axios.create({ jar, baseURL: config.routerEndpoint }))

async function auth() {
	try {
		const initCookieRes = await client.get('/auth').catch(err => err.response)
		const headers = initCookieRes.headers
		let md5 = 'api:' + headers['x-ndm-realm'] + ':' + config.routerPassword
		md5 = crypto.createHash('md5').update(md5).digest('hex')

		const sha256 = crypto
			.createHash('sha256')
			.update(headers['x-ndm-challenge'] + md5)
			.digest('hex')

		await client.post('/auth', { login: 'api', password: sha256 })
	} catch (err) {
		console.error('router login failed', (err as AxiosError).response?.data)
	}
}

const initted = auth()

interface IHost {
	name: string
	'last-seen': number
}

export async function phoneLastSeen() {
	try {
		await initted
		const devicesRes = await client.get(`/rci/show/ip/hotspot?mac=${config.routerMac}`)
		const hosts = devicesRes.data.host as IHost[]
		const myPhone = hosts.filter(item => item.name.includes(config.routerDevice)).sort((a, b) => (a['last-seen'] - b['last-seen']) && +Number.isInteger(a))[0]
		return myPhone?.['last-seen']
	} catch (err) {
		const error = err as AxiosError
		if (error.response?.status === 401) {
			await auth()
			return phoneLastSeen()
		} else {
			console.error('phone last seen failed', error.response?.data)
		}
	}
}

let seenTimeout: NodeJS.Timeout | null = null
async function updatePhoneLastSeen() {
	const lastSeen = await phoneLastSeen()
	// eslint-disable-next-line no-console
	console.log('phone last seen:', lastSeen)
	if (lastSeen === undefined || lastSeen > 150) {
		if (!seenTimeout)
			seenTimeout = setTimeout(() => {
				if (!dynamic.isAway) {
					dynamic.isAway = true
					updateMessage()
				}
			}, 50_000)
	} else {
		if (seenTimeout) clearTimeout(seenTimeout)
		seenTimeout = null
		if (dynamic.isAway) {
			dynamic.isAway = false
			updateMessage()
		}
	}
}

export function startRouterIntegration() {
	setInterval(updatePhoneLastSeen, 30_000)
	updatePhoneLastSeen()
}
