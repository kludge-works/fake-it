import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { sleep } from "../longRunningTasks";

export const handler: CommandHandler = async ctx => {
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const msgId = _.get(ctx.trigger.source, "slack.message.id");

	await ctx.message.send(
		slack.progressMessage(
			"A progress message",
			"Some progress",
			{
				state: "requested",
				total: 1,
				count: 1,
			},
			ctx,
		),
		{ channels: channel, users: [] },
		{ msgId },
	);
	await sleep(10);
	await ctx.message.send(
		slack.progressMessage(
			"A progress message",
			"approved",
			{
				state: "approved",
				total: 1,
				count: 1,
			},
			ctx,
		),
		{ channels: channel, users: [] },
		{ msgId },
	);
	await sleep(10);
	await ctx.message.send(
		slack.progressMessage(
			"A progress message",
			"n process",
			{
				state: "in_process",
				total: 1,
				count: 1,
			},
			ctx,
		),
		{ channels: channel, users: [] },
		{ msgId },
	);
	await sleep(10);
	await ctx.message.send(
		slack.progressMessage(
			"A progress message",
			"n process",
			{
				state: "success",
				total: 1,
				count: 1,
			},
			ctx,
		),
		{ channels: channel, users: [] },
		{ msgId },
	);

	return {
		code: 0,
		reason: "Success",
	};
};
