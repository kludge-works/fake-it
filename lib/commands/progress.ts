import { CommandHandler, MessageOptions, slack } from "@atomist/skill";
import * as _ from "lodash";
import { ContextBlock, HeaderBlock } from "@atomist/slack-messages";
import { ts } from "@atomist/skill/lib/slack";
import { sleep } from "../longRunningTasks";

export const handler: CommandHandler = async ctx => {
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const rawMessage = _.get(ctx.trigger, "raw_message");
	const parentMsg = _.get(ctx.trigger.source, "slack.message.id");

	const msgId = ts();
	const msgOptions = { id: msgId.toString(), ts: msgId } as MessageOptions;
	if (rawMessage.includes("thread")) {
		msgOptions.thread = parentMsg;
	}

	await ctx.message.send(
		listOfTasks(
			"new version check",
			":arrow_forward: Checking hub.docker.com for new versions \n" +
				":black_circle_for_record: Updating quay.io with new versions of nginx and Ubuntu\n" +
				":black_circle_for_record: Updating repositories",
		),
		{ users: [], channels: channel },
		msgOptions,
	);

	await sleep(10);

	await ctx.message.send(
		listOfTasks(
			"update quay.io",
			":white_check_mark: Checking hub.docker.com for new versions \n" +
				":arrow_forward: Updating quay.io with new versions of nginx and Ubuntu\n" +
				":black_circle_for_record: Updating repositories",
		),
		{ users: [], channels: channel },
		{
			id: msgId.toString(),
			ts: msgId,
			msgOptions,
		},
	);

	await sleep(10);

	await ctx.message.send(
		listOfTasks(
			"update repositories",
			":white_check_mark: Checking hub.docker.com for new versions \n" +
				":white_check_mark: Updating quay.io with new versions of nginx and Ubuntu\n" +
				":arrow_forward: Updating repositories",
		),
		{ users: [], channels: channel },
		{
			id: msgId.toString(),
			ts: msgId,
			msgOptions,
		},
	);

	await sleep(10);

	await ctx.message.send(
		listOfTasks(
			"Tasks completed",
			":white_check_mark: Checking hub.docker.com for new versions \n" +
				":white_check_mark: Updating quay.io with new versions of nginx and Ubuntu\n" +
				":white_check_mark: Updating repositories",
		),
		{ users: [], channels: channel },
		{
			id: msgId.toString(),
			ts: msgId,
			msgOptions,
		},
	);

	return {
		code: 0,
		reason: "Success",
	};
};

function listOfTasks(header: string, content: string): slack.SlackMessage {
	return {
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: header,
				},
			} as HeaderBlock,
			{
				type: "divider",
			},
			{
				type: "context",
				elements: [
					{
						type: "plain_text",
						text: content,
					},
				],
			} as ContextBlock,
		],
	};
}
