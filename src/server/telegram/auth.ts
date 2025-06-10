import { config } from '../config'
import fs from 'fs'
import fsp from 'fs/promises'

const hardcodedUsers = new Set(config.tgAllowedUsers.split(',').map(el => parseInt(el)))
let deeplinkUsers: number[] = []

try {
	deeplinkUsers = JSON.parse(fs.readFileSync('./deeplinkUsers.json', 'utf8'))
} catch {
	/* empty */
}

export function isAllowedUser(userId: number): boolean {
	return hardcodedUsers.has(userId) || deeplinkUsers.includes(userId)
}

export function isAdmin(userId: number): boolean {
	return hardcodedUsers.has(userId)
}

export async function addDeeplinkUser(userId: number) {
	if (!deeplinkUsers.includes(userId)) {
		deeplinkUsers.push(userId)
		await fsp.writeFile('./deeplinkUsers.json', JSON.stringify(deeplinkUsers))
	}
}
