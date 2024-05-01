import { settings } from 'src/settings'
import { dynamic } from './shared'
import { IMode } from 'src/typings'
import { CronJob } from 'cron'
import { config } from './config'

const nightUpdateTimes: [number, number][] = []
function getTime(hours: number, minutes: number, store = false) {
	if (store) nightUpdateTimes.push([minutes, hours])
	return hours + minutes / 60
}

const preWakeupTime = getTime(7, 30)
const wakeupTime = getTime(8, 50, true)
const sleepTime = getTime(23, 30, true)
const wakeupTimeWeekend = getTime(10, 0, true)
const sleepTimeWeekend = getTime(23, 58, true)

export function startNightChecks() {
	updateNightStatus()
	updateDisabledColor()
	setInterval(updateDisabledColor, 60000)
	for (const [minutes, hours] of nightUpdateTimes) {
		CronJob.from({
			cronTime: `${minutes} ${hours} * * *`,
			onTick: updateNightStatus,
			start: true,
			timeZone: config.TZ,
		})
	}
}

function getTimeAndIsWeekend() {
	const d = new Date()
	const day = d.getDay()
	const isWeekend = [6, 7].includes(day)
	const time = getTime(d.getHours(), d.getMinutes())

	return { isWeekend, time }
}

function updateNightStatus() {
	const { time, isWeekend } = getTimeAndIsWeekend()
	if (time >= (isWeekend ? sleepTimeWeekend : sleepTime)) dynamic.isNight = true
	else if (time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) dynamic.isNight = true
	else dynamic.isNight = false
}

function updateDisabledColor() {
	if (settings.mode === IMode.Disabled || dynamic.isNight) return

	const { time, isWeekend } = getTimeAndIsWeekend()
	if (time >= preWakeupTime && time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) {
		if (dynamic.disabledColor[1] !== 1) dynamic.disabledColor = [0, 1, 0]
	} else {
		if (dynamic.disabledColor[2] !== 1) dynamic.disabledColor = [0, 0, 1]
	}
}
