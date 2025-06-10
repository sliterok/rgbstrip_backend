import { CommandContext, Context } from 'grammy'
import { menuMiddleware, userData } from './bot'
import { isAllowedUser, addDeeplinkUser, isAdmin } from './auth'
import { generateDeeplinkHash } from './deeplink'
import { Message } from 'grammy/types'

export async function handleStartCommand(ctx: CommandContext<Context>) {
	let deeplinked = false
	if (ctx.match && ctx.from?.username) {
		try {
			if (generateDeeplinkHash(ctx.from.username) === ctx.match) {
				await addDeeplinkUser(ctx.from.id)
				deeplinked = true
			}
		} catch (error) {
			return console.error(error)
		}
	}

	if (deeplinked || isAllowedUser(ctx.chat.id)) {
		const user = userData.get(ctx.chat.id)
		try {
			await ctx.deleteMessages([ctx.message?.message_id, user?.menu?.message_id].filter(el => el) as number[])
		} catch (err) {
			console.error('failed to delete menu', err)
		}
		const menu = (await menuMiddleware.replyToContext(ctx!)) as Message.TextMessage
		userData.set(ctx.chat.id, { ctx, menu })
	} else {
		await ctx.react('👎')
	}
}

export async function handleDeeplink(ctx: Context) {
	if (ctx.chat && isAdmin(ctx.chat.id)) {
		const [, username] = ctx.match!
		await ctx.reply(`[control lights](https://t.me/${ctx.me.username}?start=${generateDeeplinkHash(username)})`, { parse_mode: 'MarkdownV2' })
	}
}
