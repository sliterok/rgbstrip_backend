import { Bot, CommandContext, Context, NextFunction } from 'grammy'
import { MenuMiddleware } from 'grammy-inline-menu'
import { Message } from 'grammy/types'
import { config } from '../config'
import { createMenuTemplate } from './menu'
import { handleStartCommand, handleDeeplink } from './commands'
import { isAllowedUser } from './auth'

export const bot = new Bot(config.tgApiKey)

export const menuTemplate = createMenuTemplate()
export const menuMiddleware = new MenuMiddleware('/', menuTemplate)

export const userData: Map<number, { ctx: CommandContext<Context>; menu: Message.TextMessage }> = new Map()

bot.command('start', handleStartCommand)
bot.hears(/(?:(?:https:\/\/t.me\/)|(?:@))(.+)/, handleDeeplink)

bot.use(async (ctx: Context, next: NextFunction) => {
	if (!ctx.chat || !isAllowedUser(ctx.chat.id)) {
		if (ctx.callbackQuery) await ctx.answerCallbackQuery('Unauthorized')
	} else {
		const menu = ctx.callbackQuery?.message as Message.TextMessage
		userData.set(ctx.chat.id, {
			ctx: ctx as CommandContext<Context>,
			menu,
		})
		await next()
	}
})

bot.use(menuMiddleware)

export function startTelegram() {
	if (process.env.NODE_ENV !== 'test') {
		bot.start()
			.then(() => console.log('Telegram bot started'))
			.catch(err => console.error(err))
	}
}
