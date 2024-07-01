import { Bot, CommandContext, Context, GrammyError, NextFunction } from 'grammy'
import { settings } from '../../settings'
import { MenuTemplate, MenuMiddleware } from 'grammy-inline-menu'
import { config } from '../config'
import { IMode, ISettings } from 'src/typings'
import { allowedTelegramUsers } from '.'
import { InlineKeyboardButton, Message } from 'grammy/types'
import { TextBody } from 'grammy-inline-menu/dist/source/body'
import { dynamic } from '../shared'
import { getIsWeekend } from '../night/static'

const bot = new Bot(config.tgApiKey)

const formatBool = (val: boolean, text: string) => val && text

const menuTemplate = new MenuTemplate<Context>(ctx =>
	[
		new Date().toLocaleString('en', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: false }),
		formatBool(dynamic.isAway, 'away'),
		formatBool(dynamic.isNight, 'night'),
		formatBool(getIsWeekend() > 0, 'weekend'),
	]
		.filter(el => el)
		.join('\n')
)

type IBooleanSettingsKeys = { [k in keyof ISettings]: ISettings[k] extends boolean ? k : never }[keyof ISettings]

const toggleTemplate = (title: string, key: IBooleanSettingsKeys) =>
	menuTemplate.toggle(title, key, {
		formatState: (ctx, text, state) => `${state ? '✅ ' : ''}${text}`,
		isSet: () => settings[key] as boolean,
		set: async (ctx, val) => {
			settings[key] = val
			await ctx.answerCallbackQuery(`${title} ${val ? 'on' : 'off'}`)

			return true
		},
	})

toggleTemplate('Night override', 'nightOverride')
toggleTemplate('GEO override', 'geoOverride')
toggleTemplate('Mix color with noise', 'mixColorWithNoise')

menuTemplate.select(
	'select_mode',
	{
		[IMode.Disabled]: 'off',
		[IMode.Rainbow]: 'rainbow',
		[IMode.Progress]: 'progress',
		[IMode.White]: 'white',
		[IMode.Noise]: 'noise',
		[IMode.Color]: 'color',
	},
	{
		columns: 2,
		isSet: (ctx, key) => settings.mode === parseInt(key),
		set: async (ctx, key) => {
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
let lastContext: CommandContext<Context> | undefined
let lastMenu: Message.TextMessage | undefined
let lastReact = 0

bot.command('start', async ctx => {
	if (allowedTelegramUsers.has(ctx.chat.id)) {
		await ctx.deleteMessages([ctx.message?.message_id, lastMenu?.message_id].filter(el => el) as number[])
		lastContext = ctx
		lastMenu = (await menuMiddleware.replyToContext(lastContext!)) as Message.TextMessage
	} else {
		const now = Date.now()
		const diff = now - lastReact
		if (diff > 500) {
			lastReact = now
			await ctx.react(diff > 1000 ? '👎' : '🤬')
		}
	}
})

bot.use(async (ctx: Context, next: NextFunction) => {
	const authorized = allowedTelegramUsers.has(ctx.chat!.id)
	if (!authorized) {
		await ctx.answerCallbackQuery('Unauthorized')
	} else {
		lastContext = ctx as CommandContext<Context>
		lastMenu = ctx.callbackQuery?.message as Message.TextMessage
		await next()
	}
}).use(menuMiddleware)

export async function updateKeyboard() {
	if (!lastContext || !lastMenu) return

	const keyboard = await menuTemplate.renderKeyboard(lastContext, '/')
	try {
		await bot.api.editMessageReplyMarkup(lastMenu.chat.id, lastMenu.message_id, {
			reply_markup: { inline_keyboard: keyboard as InlineKeyboardButton[][] },
		})
	} catch (error) {
		if (
			'description' in (error as any) &&
			!(error as GrammyError).description.endsWith('are exactly the same as a current content and reply markup of the message')
		)
			throw error
	}
}

export async function updateMessage() {
	if (!lastContext || !lastMenu) return

	const body = await menuTemplate.renderBody(lastContext, '/')
	const text = typeof body === 'string' ? body : (body as TextBody).text
	const keyboard = await menuTemplate.renderKeyboard(lastContext, '/')
	try {
		await bot.api.editMessageText(lastMenu.chat.id, lastMenu.message_id, text, {
			reply_markup: { inline_keyboard: keyboard as InlineKeyboardButton[][] },
		})
	} catch (error) {
		if (
			'description' in (error as any) &&
			!(error as GrammyError).description.endsWith('are exactly the same as a current content and reply markup of the message')
		)
			throw error
	}
}

export function startTelegram() {
	if (import.meta.env.PROD) {
		bot.start().catch(err => console.error(err))
	}
}
