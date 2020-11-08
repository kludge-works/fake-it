import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { ContextBlock } from "@atomist/slack-messages";

export const handler: CommandHandler = async ctx => {
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const msgId = _.get(ctx.trigger.source, "slack.message.id");

	await ctx.message.send(
		listOfTasks(),
		{ users: [], channels: channel },
		{ id: msgId },
	);

	return {
		code: 0,
		reason: "Success",
	};
};

function listOfTasks(): slack.SlackMessage {
	return {
		blocks: [
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
