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
import { info } from "@atomist/skill/lib/log";

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

	let msg;
	let msgOptions = {};
	if (parameters === undefined || parameters.length == 0) {
		msg = buildModalMessage();
	} else {
		msgOptions = { id: msgId, ts: msgId };
		const stateValues = _.first(
			_.filter(parameters, ["name", "stateValues"]),
		);
		const msgInput = _.get(
			stateValues,
			"value.message.message_input.value",
		);
		await info(msgInput);
		msg = {
			response_action: "errors",
			errors: {
				message_input: "You may not select a due date in the past",
			},
		};
	}
	await info(JSON.stringify(msgOptions));
	const response = await ctx.message.send(
		msg,
		{
			users: [],
			channels: channel,
		},
		msgOptions,
	);
	await info(JSON.stringify(response));
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
				block_id: "message",
				label: {
					type: "plain_text",
					text: "Message",
				},
				element: {
					type: "plain_text_input",
					action_id: "message_input",
					placeholder: {
						type: "plain_text",
						text: "Your message",
					},
					multiline: true,
				},
			} as InputBlock,
			{
				type: "actions",
				elements: [
					{
						type: "conversations_select",
						placeholder: {
							type: "plain_text",
							text: "Select private conversation",
							emoji: true,
						},
						response_url_enabled: true,
						default_to_current_conversation: true,
						action_id: "actionId-0",
					},
				],
			},
			// {
			// 	action_id: "my_action_id",
			// 	type: "conversations_select",
			// 	response_url_enabled: true,
			// },
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
