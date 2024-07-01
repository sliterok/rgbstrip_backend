import fs from 'fs'
import fsp from 'fs/promises'

export const deeplinkUsers = getDeeplinkUsers()

function getDeeplinkUsers(): number[] {
	try {
		return JSON.parse(fs.readFileSync('./deeplinkUsers.json', 'utf8'))
	} catch (error) {
		return []
	}
}

export function addDeeplinkUser(user: number) {
	if (!deeplinkUsers.includes(user)) return fsp.writeFile('./deeplinkUsers.json', JSON.stringify([...deeplinkUsers, user]))
}
