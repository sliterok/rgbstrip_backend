import crypto from 'node:crypto'
import { config } from 'src/backend/config'
import { allowedTelegramUsers } from '.'

interface ITelegramProfile {
	allows_write_to_pm: true
	first_name: string
	id: number
	language_code: string
	last_name: string
	username: string
}

export function isVerifiedUser(telegramInitData: string): boolean {
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

	if (calculatedHash !== hash) return false

	const user = JSON.parse(urlParams.get('user')!) as ITelegramProfile

	return allowedTelegramUsers.has(user.id)
}
