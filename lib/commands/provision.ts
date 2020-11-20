import { CommandHandler } from "@atomist/skill";
import { ts } from "@atomist/skill/lib/slack";
import { slack } from "@atomist/skill";
import {
	ActionsBlock,
	InputBlock,
	PlainTextElement,
	SlackModal,
} from "@atomist/slack-messages";

// interface ProvisionAction {
// 	users: string;
// 	environmentName: string;
// 	action: "ignore" | "delete";
// 	numberMachines: number;
// }

export const handler: CommandHandler = async ctx => {
	// const channel = _.get(ctx.trigger.source, "slack.channel.name");
	await ctx.audit.log(JSON.stringify(ctx));

	const msgId = ts();
	const msg = buildMessage();
	const response = await ctx.message.respond(msg, {
		id: msgId.toString(),
		ts: msgId,
	});

	await ctx.audit.log(JSON.stringify(response));

	// const response = await ctx.parameters.prompt<ProvisionAction>(
	// 	{
	// 		environmentName: {
	// 			displayName: "environment Name",
	// 		} as ParameterObjectValue,
	// 		users: { defaultValue: "boris" },
	// 		action: {},
	// 		numberMachines: {
	// 			description: "Number of Machines",
	// 			type: "number",
	// 		},
	// 	},
	// 	{},
	// );
	// await ctx.audit.log(JSON.stringify(response));
	// await ctx.message
	// 	.send(
	// 		buildMessage(),
	// 		{ users: [], channels: channel },
	// 		{ id: msgId.toString(), ts: msgId },
	// 	)
	// 	.then(async response => {
	// 		await ctx.audit.log("response");
	// 		await ctx.audit.log(JSON.stringify(response));
	// 	});
	// await ctx.audit.log("after send");
	//
	// return {
	// 	code: 0,
	// 	reason: "Success",
	// };
};

function buildMessage(): slack.SlackMessage {
	return {
		title: {
			type: "plain_text",
			text: "Modal Title",
		},
		submit: {
			type: "plain_text",
			text: "Submit",
		},
		blocks: [
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "title",
					placeholder: {
						type: "plain_text",
						text: "What do you want to ask of the world?",
					},
				},
				label: {
					type: "plain_text",
					text: "Title",
				},
			} as InputBlock,
			{
				type: "input",
				element: {
					type: "multi_channels_select",
					action_id: "channels",
					placeholder: {
						type: "plain_text",
						text: "Where should the poll be sent?",
					},
				},
				label: {
					type: "plain_text",
					text: "Channel(s)",
				},
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "option_1",
					placeholder: {
						type: "plain_text",
						text: "First option",
					},
				} as PlainTextElement,
				label: {
					type: "plain_text",
					text: "Option 1",
				},
			} as InputBlock,
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "option_2",
					placeholder: {
						type: "plain_text",
						text: "How many options do they need, really?",
					},
				},
				label: {
					type: "plain_text",
					text: "Option 2",
				},
			} as InputBlock,
			{
				type: "actions",
				elements: [
					{
						type: "button",
						action_id: "add_option",
						text: {
							type: "plain_text",
							text: "Add another option  ",
						},
					},
				],
			} as ActionsBlock,
		],
		type: "modal",
	} as SlackModal;
}

// function buildMessage(): slack.SlackMessage {
// 	return {
// 		blocks: [
// 			{
// 				type: "header",
// 				text: {
// 					type: "plain_text",
// 					text: "Provision training environment",
// 				},
// 			} as HeaderBlock,
// 			{
// 				type: "divider",
// 			},
// 			{
// 				type: "section",
// 				text: {
// 					type: "mrkdwn",
// 					text: "People Responsible",
// 				},
// 				accessory: {
// 					type: "multi_users_select",
// 					placeholder: {
// 						type: "plain_text",
// 						text: "Select a user",
// 						emoji: true,
// 					},
// 					action_id: "users_select-action",
// 				},
// 			} as SectionBlock,
// 			{
// 				type: "section",
// 				text: {
// 					type: "mrkdwn",
// 					text: "Number of machines",
// 				},
// 				accessory: {
// 					type: "static_select",
// 					placeholder: {
// 						type: "plain_text",
// 						text: "Select an item",
// 						emoji: true,
// 					},
// 					options: [
// 						{
// 							text: {
// 								type: "plain_text",
// 								text: "1",
// 								emoji: true,
// 							},
// 							value: "1",
// 						},
// 						{
// 							text: {
// 								type: "plain_text",
// 								text: "2",
// 								emoji: true,
// 							},
// 							value: "2",
// 						},
// 						{
// 							text: {
// 								type: "plain_text",
// 								text: "3",
// 								emoji: true,
// 							},
// 							value: "3",
// 						},
// 					],
// 					action_id: "static_select-action",
// 				},
// 			} as SectionBlock,
// 			{
// 				type: "section",
// 				text: {
// 					type: "mrkdwn",
// 					text: "Date machines available",
// 				},
// 				accessory: {
// 					type: "datepicker",
// 					initial_date: "1990-04-28",
// 					placeholder: {
// 						type: "plain_text",
// 						text: "Select a date",
// 						emoji: true,
// 					},
// 					action_id: "datepicker-action",
// 				},
// 			} as SectionBlock,
// 			{
// 				type: "section",
// 				text: {
// 					type: "mrkdwn",
// 					text: "Date machines discarded	",
// 				},
// 				accessory: {
// 					type: "datepicker",
// 					initial_date: "1990-04-28",
// 					placeholder: {
// 						type: "plain_text",
// 						text: "Select a date",
// 						emoji: true,
// 					},
// 					action_id: "datepicker-action",
// 				},
// 			} as SectionBlock,
// 			{
// 				type: "divider",
// 			},
// 			{
// 				type: "actions",
// 				elements: [
// 					{
// 						type: "button",
// 						text: {
// 							type: "plain_text",
// 							text: "Click Me",
// 							emoji: true,
// 						},
// 						value: "click_me_123",
// 						action_id: "actionId-0",
// 						style: "primary",
// 					},
// 				],
// 			} as ActionsBlock,
// 		],
// 	};
// }
