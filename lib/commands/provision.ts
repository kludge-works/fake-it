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
	const msgId = _.get(ctx.trigger.source, "slack.message.id");

	// const msgId = ts();
	// const msg = buildMessage();
	// const response = await ctx.message.respond(msg, {
	// 	id: msgId.toString(),
	// 	ts: msgId,
	// });

	// await ctx.audit.log(JSON.stringify(ctx));
	const parameters = _.get(ctx.message, "request.parameters");
	// await ctx.audit.log(JSON.stringify(parameters));
	// const msg;
	// const msgOptions = {};
	// if (parameters === undefined || parameters.length == 0) {
	// 	msg = buildModalMessage();
	// 	msg = { msg, errors };
	// } else {
	// 	msgOptions = { id: msgId, ts: msgId };
	// 	const stateValues = _.first(
	// 		_.filter(parameters, ["name", "stateValues"]),
	// 	);
	// 	const msgInput = _.get(
	// 		stateValues,
	// 		"value.message.message_input.value",
	// 	);
	// 	await ctx.audit.log(msgInput);
	// 	msg = errors;
	// }

	const msgOptions = { id: msgId, ts: msgId };
	const msg = buildModalMessage();

	await ctx.audit.log(JSON.stringify(msgOptions));
	const response = await ctx.message.send(
		msg,
		{
			users: [],
			channels: channel,
		},
		msgOptions,
	);
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
				element: {
					type: "users_select",
					placeholder: {
						type: "plain_text",
						text: "Select users",
						emoji: true,
					},
					action_id: "multi_users_select-action",
				},
				label: {
					type: "plain_text",
					text: "Label",
					emoji: true,
				},
			} as InputBlock,
			{
				type: "input",
				element: {
					type: "datepicker",
					initial_date: "1990-04-28",
					placeholder: {
						type: "plain_text",
						text: "Select a date",
						emoji: true,
					},
					action_id: "datepicker-action",
				},
				label: {
					type: "plain_text",
					text: "Label",
					emoji: true,
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
					// elementForCommand(
					// 	{
					// 		type: "button",
					// 		text: {
					// 			type: "plain_text",
					// 			text: "Say hi!",
					// 		},
					// 	} as ButtonElement,
					// 	"provision",
					// 	{ response: "hi" },
					// ),
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
