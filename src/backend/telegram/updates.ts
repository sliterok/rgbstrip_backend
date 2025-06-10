import { bot, menuTemplate, userData } from './bot'
import { GrammyError } from 'grammy'
import { TextBody } from 'grammy-inline-menu/dist/source/body'
import { InlineKeyboardButton } from 'grammy/types'
import { error } from '../../logger'

export async function updateKeyboard(except?: number) {
	for (const [userId, { ctx: lastContext, menu: lastMenu }] of userData.entries()) {
		if (userId === except) continue

		const keyboard = await menuTemplate.renderKeyboard(lastContext, '/')
		try {
			await bot.api.editMessageReplyMarkup(lastMenu.chat.id, lastMenu.message_id, {
				reply_markup: { inline_keyboard: keyboard as InlineKeyboardButton[][] },
			})
		} catch (err) {
			if (
				err instanceof GrammyError &&
				!err.description.endsWith('are exactly the same as a current content and reply markup of the message')
			) {
				error(err)
			}
		}
	}
}

export async function updateMessage(except?: number) {
	for (const [userId, { ctx: lastContext, menu: lastMenu }] of userData.entries()) {
		if (userId === except) continue

		const body = await menuTemplate.renderBody(lastContext, '/')
		const text = typeof body === 'string' ? body : (body as TextBody).text
		const keyboard = await menuTemplate.renderKeyboard(lastContext, '/')
		try {
			await bot.api.editMessageText(lastMenu.chat.id, lastMenu.message_id, text, {
				reply_markup: { inline_keyboard: keyboard as InlineKeyboardButton[][] },
			})
		} catch (err) {
			if (
				err instanceof GrammyError &&
				!err.description.endsWith('are exactly the same as a current content and reply markup of the message')
			) {
				error(err)
			}
		}
	}
}
