import { Bot, Context } from 'grammy'
import { settings } from '../settings'
import { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } from 'grammy-inline-menu'
import { config } from './config'

const bot = new Bot(config.tgApiKey)

const menuTemplate = new MenuTemplate<Context>(ctx => `hi ${ctx?.from?.first_name}`)

const allowedUsers = config.tgAllowedUsers.split(',').map(el => parseInt(el))

menuTemplate.interact('night', 'nightOverride', {
	do: async ctx => {
		settings.nightOverride = !settings.nightOverride
		await ctx.answerCallbackQuery(`Night override ${settings.nightOverride ? 'on' : 'off'}`)
		return false
	},
})

menuTemplate.interact('geo', 'geoOverride', {
	do: async ctx => {
		settings.geoOverride = !settings.geoOverride
		await ctx.answerCallbackQuery(`GEO override ${settings.geoOverride ? 'on' : 'off'}`)
		return false
	},
})

const modesMenu = new MenuTemplate('select mode')
menuTemplate.submenu('modes', 'modes', modesMenu)
modesMenu.select(
	'select_mode',
	{ 0: 'off', 1: 'rainbow', 2: 'progress', 3: 'white', 4: 'away', 5: 'noise', 6: 'color' },
	{
		isSet: (ctx, key) => settings.mode === parseInt(key),
		set: /** @param {CommandContext<Context>} ctx */ (ctx, key) => {
			// eslint-disable-next-line no-console
			console.log('selected mode:', settings.mode)
			settings.mode = parseInt(key)
			// if (settings.mode === 6) return ctx.answerCallbackQuery() TODO: context menu
			return true
		},
	}
)
modesMenu.manualRow(createBackMainMenuButtons('back'))

const menuMiddleware = new MenuMiddleware('/', menuTemplate)
bot.command('start', ctx => {
	if (allowedUsers.includes(ctx.chat.id)) menuMiddleware.replyToContext(ctx)
})
bot.use(menuMiddleware)

export function startTelegram() {
	if (import.meta.env.PROD) bot.start().catch(err => console.error(err))
}
