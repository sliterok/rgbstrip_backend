import { default as axios } from 'axios'
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

		// console.log(headers)
		// console.log(await jar.getCookies('http://192.168.1.1/auth'))
		const authRes = await client.post('/auth', { ...auth, password: sha256 }).catch(err => {
			// console.log(err)
			return err.response
		})
		// console.log(authRes.headers)
		// console.log(await jar.getCookies('http://192.168.1.1/auth'))
	} catch (err) {
		console.error(err)
	}
}

init()

export async function phoneLastSeen() {
	try {
		const devicesRes = await client.get('/rci/show/ip/hotspot?mac=***REMOVED***')
		const myPhone = devicesRes.data.host.find(item => item.name.includes('***REMOVED***'))
		// console.log(myPhone)
		return myPhone?.['last-seen']
	} catch (err) {
		console.error(err)
	}
}
