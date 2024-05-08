import { config } from '../config'

export const allowedTelegramUsers = new Set(config.tgAllowedUsers.split(',').map(el => parseInt(el)))
