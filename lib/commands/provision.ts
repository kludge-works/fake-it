import { CommandHandler, MessageOptions, slack } from "@atomist/skill";
import * as _ from "lodash";
import { HeaderBlock, InputBlock } from "@atomist/slack-messages";
import { ts } from "@atomist/skill/lib/slack";

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
		buildMessage(),
		{ users: [], channels: channel },
		msgOptions,
	);

	return {
		code: 0,
		reason: "Success",
	};
};

function buildMessage(): slack.SlackMessage {
	return {
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "Provision training environment",
				},
			} as HeaderBlock,
			{
				type: "divider",
			},
			{
				type: "input",
				label: {
					type: "plain_text",
					text: "Name",
				},
				element: {
					type: "plain_text_input",
					action_id: "plain_input",
					placeholder: {
						type: "plain_text",
						text: "environment name",
					},
				},
			} as InputBlock,
		],
	};
}
