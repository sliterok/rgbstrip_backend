import { AxiosError, default as axios } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import crypto from 'crypto'

const jar = new CookieJar()
const client = wrapper(axios.create({ jar, baseURL: 'https://***REMOVED***' }))
const auth = { login: 'api', password: '***REMOVED***' }

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
