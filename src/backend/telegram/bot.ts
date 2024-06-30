import { Bot, CommandContext, Context, GrammyError } from 'grammy'
import { settings } from '../../settings'
import { MenuTemplate, MenuMiddleware } from 'grammy-inline-menu'
import { config } from '../config'
import { IMode, ISettings } from 'src/typings'
import { allowedTelegramUsers } from '.'
import { InlineKeyboardButton, Message } from 'grammy/types'

const bot = new Bot(config.tgApiKey)

const menuTemplate = new MenuTemplate<Context>(ctx => `hi ${ctx?.from?.first_name}`)

type IBooleanSettingsKeys = { [k in keyof ISettings]: ISettings[k] extends boolean ? k : never }[keyof ISettings]

const toggleTemplate = (title: string, key: IBooleanSettingsKeys) =>
	menuTemplate.toggle(title, key, {
		formatState: (ctx, text, state) => `${state ? '✅ ' : ''}${text}`,
		isSet: () => settings[key] as boolean,
		set: async (ctx, val) => {
			if (!allowedTelegramUsers.has(ctx.chat!.id)) {
				await ctx.answerCallbackQuery('Unauthorized')
				return false
			}

			settings[key] = val
			await ctx.answerCallbackQuery(`${title} ${val ? 'on' : 'off'}`)

			return true
		},
	})

toggleTemplate('Night override', 'nightOverride')
toggleTemplate('GEO override', 'geoOverride')
toggleTemplate('Force away', 'forceAway')
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
let lastContext: CommandContext<Context> | undefined
let lastMenu: Message.TextMessage | undefined

bot.command('start', async ctx => {
	if (allowedTelegramUsers.has(ctx.chat.id)) {
		lastContext = ctx
		lastMenu = (await menuMiddleware.replyToContext(lastContext!)) as Message.TextMessage
	}
})
bot.use(menuMiddleware)

export async function updateLastContext() {
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

export function startTelegram() {
	if (import.meta.env.PROD) {
		bot.start().catch(err => console.error(err))
	}
}
