import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { ContextBlock, HeaderBlock } from "@atomist/slack-messages";
import { ts } from "@atomist/skill/lib/slack";
import { sleep } from "../longRunningTasks";

export const handler: CommandHandler = async ctx => {
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const rawMessage = _.get(ctx.trigger, "raw_message");

	const msgId = ts();
	await ctx.message.send(
		listOfTasks("first header"),
		{ users: [], channels: channel },
		{ id: msgId.toString(), ts: msgId },
	);

	await sleep(10);

	await ctx.message.send(
		listOfTasks("updated header"),
		{ users: [], channels: channel },
		{
			id: msgId.toString(),
			ts: msgId,
			thread: rawMessage.includes("thread"),
		},
	);

	return {
		code: 0,
		reason: "Success",
	};
};

function listOfTasks(header: string): slack.SlackMessage {
	return {
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: header,
					emoji: true,
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
						text:
							":black_circle_for_record: planned task \n:arrow_forward: task in progress \n:white_check_mark: task completed \n:x: task failed",
						emoji: true,
					},
				],
			} as ContextBlock,
		],
	};
}
