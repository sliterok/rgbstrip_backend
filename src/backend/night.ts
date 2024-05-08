import { dynamic } from './shared'
import { CronJob } from 'cron'
import { config } from './config'

interface ICronTime {
	minutes: number
	hours: number
	time: number
}

const nightUpdateTimes: ICronTime[] = []

function getTime(hours: number, minutes: number, store = false) {
	const time = hours + minutes / 60
	if (store) nightUpdateTimes.push({ minutes, hours, time })
	return time
}

const preWakeupTime = getTime(7, 30, true)
const wakeupTime = getTime(8, 50, true)
const sleepTime = getTime(23, 30, true)
const wakeupTimeWeekend = getTime(10, 0, true)
const sleepTimeWeekend = getTime(23, 58, true)

export function startNightChecks() {
	for (const { minutes, hours, time } of nightUpdateTimes) {
		CronJob.from({
			cronTime: `${minutes} ${hours} * * *`,
			onTick: () => updateNightStatus(time),
			start: true,
			timeZone: config.TZ,
		})
	}
}

function updateNightStatus(time: number) {
	const d = new Date()
	const day = d.getDay()
	const isWeekend = [6, 7].includes(day)

	if (time >= (isWeekend ? sleepTimeWeekend : sleepTime)) dynamic.isNight = true
	else if (time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) dynamic.isNight = true
	else {
		dynamic.isNight = false
		return
	}

	updateDisabledColor(time, isWeekend)
}

function updateDisabledColor(time: number, isWeekend: boolean) {
	if (time >= preWakeupTime && time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) {
		if (dynamic.disabledColor[1] !== 1) dynamic.disabledColor = [0, 1, 0]
	} else {
		if (dynamic.disabledColor[2] !== 1) dynamic.disabledColor = [0, 0, 1]
	}
}
