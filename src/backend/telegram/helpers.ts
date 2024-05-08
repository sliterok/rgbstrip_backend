import crypto from 'node:crypto'
import { config } from 'src/backend/config'

export function urlSafeDecode(urlencoded: string): string {
	try {
		return decodeURIComponent(urlencoded.replace(/\+/g, '%20'))
	} catch (e) {
		return urlencoded
	}
}

export function urlParseQueryString(queryString: string): { [key: string]: string | null } {
	const params: { [key: string]: string | null } = {}
	if (!queryString.length) {
		return params
	}

	const queryStringParams = queryString.split('&')
	for (let i = 0; i < queryStringParams.length; i++) {
		const param = queryStringParams[i].split('=')
		const paramName = urlSafeDecode(param[0])
		const paramValue = param[1] ? urlSafeDecode(param[1]) : null
		params[paramName] = paramValue
	}

	return params
}

export function urlParseHashParams(locationHash: string): { [key: string]: string | null } {
	locationHash = locationHash.replace(/^#/, '')
	const params: { [key: string]: string | null } = {}
	if (!locationHash.length) {
		return params
	}

	if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
		params._path = urlSafeDecode(locationHash)
		return params
	}

	const qIndex = locationHash.indexOf('?')
	if (qIndex >= 0) {
		const pathParam = locationHash.slice(0, qIndex)
		params._path = urlSafeDecode(pathParam)
		locationHash = locationHash.slice(qIndex + 1)
	}

	const query_params = urlParseQueryString(locationHash)
	for (const k in query_params) {
		params[k] = query_params[k]
	}

	return params
}

interface ITelegramProfile {
	allows_write_to_pm: true
	first_name: string
	id: number
	language_code: string
	last_name: string
	username: string
}

export function getVerifiedUser(telegramInitData: string): ITelegramProfile | void {
	const urlParams = new URLSearchParams(telegramInitData)

	const hash = urlParams.get('hash')
	urlParams.delete('hash')
	urlParams.sort()

	let dataCheckString = ''
	for (const [key, value] of urlParams.entries()) {
		dataCheckString += `${key}=${value}\n`
	}
	dataCheckString = dataCheckString.slice(0, -1)

	const secret = crypto.createHmac('sha256', 'WebAppData').update(config.tgApiKey)
	const calculatedHash = crypto.createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex')

	return calculatedHash === hash ? JSON.parse(urlParams.get('user')!) : undefined
}
