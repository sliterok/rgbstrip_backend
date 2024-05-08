import { Bot, Context } from 'grammy'
import { settings } from '../../settings'
import { MenuTemplate, MenuMiddleware } from 'grammy-inline-menu'
import { config } from '../config'
import { IMode } from 'src/typings'
import { allowedTelegramUsers } from '.'

const bot = new Bot(config.tgApiKey)

const menuTemplate = new MenuTemplate<Context>(ctx => `hi ${ctx?.from?.first_name}`)

menuTemplate.interact('Night override', 'nightOverride', {
	do: async ctx => {
		if (!allowedTelegramUsers.has(ctx.chat!.id)) {
			await ctx.answerCallbackQuery('Unauthorized')
		} else {
			settings.nightOverride = !settings.nightOverride
			await ctx.answerCallbackQuery(`Night override ${settings.nightOverride ? 'on' : 'off'}`)
		}
		return false
	},
})

menuTemplate.interact('GEO override', 'geoOverride', {
	do: async ctx => {
		if (!allowedTelegramUsers.has(ctx.chat!.id)) {
			await ctx.answerCallbackQuery('Unauthorized')
		} else {
			settings.geoOverride = !settings.geoOverride
			await ctx.answerCallbackQuery(`GEO override ${settings.geoOverride ? 'on' : 'off'}`)
		}
		return false
	},
})

menuTemplate.select(
	'select_mode',
	{ 0: 'off', 1: 'rainbow', 2: 'progress', 3: 'white', 4: 'away', 5: 'noise', 6: 'color' },
	{
		columns: 2,
		isSet: (ctx, key) => settings.mode === parseInt(key),
		set: async (ctx, key) => {
			if (!allowedTelegramUsers.has(ctx.chat!.id)) {
				await ctx.answerCallbackQuery('Unauthorized')
				return false
			}
			settings.mode = parseInt(key)
			const selectedMode = IMode[settings.mode]
			// eslint-disable-next-line no-console
			console.log('selected mode:', selectedMode)
			await ctx.answerCallbackQuery(`Selected mode: ${selectedMode}`)

			return true
		},
	}
)

menuTemplate.manual({
	web_app: {
		url: config.externalUrl,
	},
	text: 'select color',
})

const menuMiddleware = new MenuMiddleware('/', menuTemplate)
bot.command('start', ctx => {
	if (allowedTelegramUsers.has(ctx.chat.id)) menuMiddleware.replyToContext(ctx)
})
bot.use(menuMiddleware)

export function startTelegram() {
	if (import.meta.env.PROD) {
		bot.start().catch(err => console.error(err))
	}
}
