import { CommandHandler, slack } from "@atomist/skill";
import {
	ActionsBlock,
	ButtonElement,
	InputBlock,
	SectionBlock,
	SlackModal,
} from "@atomist/slack-messages";
import {
	buttonForModal,
	elementForCommand,
} from "@atomist/skill/lib/slack/block";
import _ = require("lodash");

export const handler: CommandHandler = async ctx => {
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	// const payload = _.get(ctx.message, "request");

	// const msgId = ts();
	// const msg = buildMessage();
	// const response = await ctx.message.respond(msg, {
	// 	id: msgId.toString(),
	// 	ts: msgId,
	// });

	await ctx.audit.log(JSON.stringify(ctx));
	// const baseMsg = buildButtonMessage();
	const msg = buildModalMessage();
	const response = await ctx.message.send(msg, {
		users: [],
		channels: channel,
	});
	await ctx.audit.log(JSON.stringify(response));
};

function buildModalMessage(): slack.SlackMessage {
	const modal = {
		type: "modal",
		title: {
			type: "plain_text",
			text: "Greeting",
		},
		blocks: [
			{
				type: "input",
				dispatch_action: true,
				block_id: "message",
				label: {
					type: "plain_text",
					text: "Message",
				},
				element: {
					type: "plain_text_input",
					action_id: "input",
					placeholder: {
						type: "plain_text",
						text: "Your message",
					},
					multiline: true,
				},
			} as InputBlock,
		],
		close: {
			type: "plain_text",
			text: "Cancel",
		},
		submit: {
			type: "plain_text",
			text: "Send",
		},
	} as SlackModal;

	return {
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: ":wave: Hello World",
				},
			} as SectionBlock,
			{
				type: "actions",
				elements: [
					elementForCommand(
						{
							type: "button",
							text: {
								type: "plain_text",
								text: "Say hi!",
							},
						} as ButtonElement,
						"provision",
						{ response: "hi" },
					),
					buttonForModal(
						{
							type: "button",
							text: {
								type: "plain_text",
								text: "Respond",
							},
						},
						"provision",
						modal,
					),
				],
			} as ActionsBlock,
		],
	};
}
