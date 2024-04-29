import grammy from 'grammy'
const { Bot, Context, CommandContext } = grammy
import { settings } from '../settings'

const bot = new Bot('***REMOVED***:***REMOVED***')
import { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } from 'grammy-inline-menu'

const menuTemplate = new MenuTemplate(ctx => `привет ${ctx.from.first_name}`)

const allowedUsers = [***REMOVED***]

menuTemplate.interact('ночь', 'nightOverride', {
	do: async ctx => {
		settings.nightOverride = !settings.nightOverride
		await ctx.answerCallbackQuery(`Переопределение ночи ${settings.nightOverride ? 'включено' : 'выключено'}`)
		return false
	},
})

menuTemplate.interact('geo', 'geoOverride', {
	do: async ctx => {
		settings.geoOverride = !settings.geoOverride
		await ctx.answerCallbackQuery(`Переопределение GEO ${settings.geoOverride ? 'включено' : 'выключено'}`)
		return false
	},
})

const modesMenu = new MenuTemplate('выбери режим')
menuTemplate.submenu('режимы', 'modes', modesMenu)
modesMenu.select(
	'select_mode',
	{ 0: 'выкл', 1: 'радуга', 2: 'прогрессбар', 3: 'белый', 4: 'ушел', 5: 'шум', 6: 'цвет' },
	{
		isSet: (ctx, key) => settings.mode === parseInt(key),
		set: /** @param {CommandContext<Context>} ctx */ (ctx, key) => {
			console.log(settings.mode)
			settings.mode = parseInt(key)
			// if (settings.mode === 6) return ctx.answerCallbackQuery() TODO: context menu
			return true
		},
	}
)
modesMenu.manualRow(createBackMainMenuButtons('назад'))

const menuMiddleware = new MenuMiddleware('/', menuTemplate)
bot.command('start', ctx => {
	if (allowedUsers.includes(ctx.chat.id)) menuMiddleware.replyToContext(ctx)
})
bot.use(menuMiddleware)

export function initTg() {
	console.log('init tg')
	bot.start().catch(err => console.error(err)) //test
}
