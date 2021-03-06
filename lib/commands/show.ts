import {
	CommandContext,
	CommandHandler,
	Contextual,
	slack,
} from "@atomist/skill";
import * as _ from "lodash";
import { info } from "@atomist/skill/lib/log";
import { bold, italic, SlackMessage } from "@atomist/slack-messages";
import stringify = require("json-stable-stringify");
import { buttonForCommand, menuForCommand, ts } from "@atomist/skill/lib/slack";
import {
	InputBlock,
	PlainTextElement,
} from "@atomist/slack-messages/lib/SlackMessages";

export const name = "show";

export const handler: CommandHandler = async ctx => {
	const raw_message = getRawMessage(ctx);
	const response = getResponse(ctx);

	info(`raw_message: ${raw_message}`);
	info(`requestingUserId: ${getUserId(ctx)}`);
	info(`parentMsg: ${getMessageId(ctx)}`);
	info(`channel: ${getChannelName(ctx)}`);
	info(`ctx.message: ${stringify(ctx.message)}`);
	info(`ctx.parameters: ${stringify(ctx.parameters)}`);
	info(`ctx.trigger: ${stringify(ctx.trigger)}`);
	info(`request.parameters: ${stringify(response)}`);

	const regexArray = /show\s+(?<msg>\w+)\s*(?<args>.*)$/.exec(raw_message);
	const msgType = regexArray?.groups.msg;
	const args = regexArray?.groups.args;

	info(`groups.msg: ${msgType}`);
	info(`groups.args: ${args}`);

	info(`isInitialMessage: ${isInitialMessage(response)}`);
	if (isInitialMessage(response)) {
		await initialMessage(msgType, ctx);
	} else {
		await showResponse(response, ctx);
	}
	return {
		code: 0,
		reason: "Success",
	};
};

function getUserId(ctx: CommandContext<any>) {
	return _.get(ctx.message, "source.msteams.user.id");
}

function getChannelName(ctx: CommandContext) {
	return _.get(ctx.trigger.source, "msteams.channel.name");
}

// function getChannelId(ctx: CommandContext) {
// 	return _.get(ctx.trigger.source, "msteams.channel.id");
// }

function getConversationId(ctx: CommandContext) {
	return _.get(ctx.trigger.source, "msteams.conversation_id");
}

function createMessageId(classifier?: string) {
	return `kl${classifier ? `-${classifier}` : ""}-${ts()}`;
}

function getMessageId(ctx: CommandContext) {
	return _.get(ctx.trigger.source, "msteams.message_id");
}

function getResponse(ctx: CommandContext) {
	return _.get(ctx.message, "request.parameters") as Array<{
		name: string;
		value: string;
	}>;
}

function getRawMessage(ctx: CommandContext) {
	return _.get(ctx.message, "request.raw_message");
}

function isInitialMessage(response: Array<{ name: string; value: string }>) {
	return !response.length;
}

async function initialMessage(msgType: string, ctx: CommandContext) {
	if (msgType === "action") {
		await actionMessage(ctx);
	} else if (msgType === "block") {
		await blockMessage(ctx);
	} else if (msgType === "command") {
		await commandMessage(ctx);
	} else if (msgType === "delete") {
		await deleteMessage(ctx);
	} else if (msgType === "field") {
		await fieldMessage(ctx);
	} else if (msgType === "prompt") {
		await promptMessage(ctx);
	} else if (msgType === "replace") {
		await replaceMessage(ctx);
	} else if (msgType === "user") {
		await userMessage(ctx);
	} else {
		await simpleMessage(msgType, ctx);
	}
}

async function showResponse(
	response: Array<{ name: string; value: string }>,
	ctx: CommandContext,
) {
	const lines = response
		.map(it => {
			return `${bold(it.name)}: ${it.value}`;
		})
		.join("\n");
	info(`showResponse: ${lines}`);

	const msg: SlackMessage = {
		attachments: [
			{
				author_icon: `https://images.atomist.com/rug/info.png`,
				text: lines,
				fallback: lines,
				mrkdwn_in: ["text"],
				footer: footer(ctx),
				footer_icon:
					"https://images.atomist.com/logo/atomist-black-mark-xsmall.png",
			},
		],
	};

	let msgId = response.find(it => it.name === "msgId")?.value;
	if (msgId == undefined) {
		msgId = getConversationId(ctx);
	}
	await ctx.message.respond(msg, {
		id: msgId,
	});
}

async function simpleMessage(which_msg, ctx: CommandContext) {
	let message: SlackMessage;
	if (which_msg === "error") {
		message = slack.errorMessage("Error title", "Error message", ctx, {
			footer: footer(ctx),
		});
	} else if (which_msg === "info") {
		message = slack.infoMessage("Info title", "Info message", ctx, {
			footer: footer(ctx),
		});
	} else if (which_msg === "success") {
		message = slack.successMessage(
			"Success title",
			"Success message",
			ctx,
			{
				footer: footer(ctx),
			},
		);
	} else if (which_msg === "warning") {
		message = slack.warningMessage(
			"Warning title",
			"Warning message",
			ctx,
			{
				footer: footer(ctx),
			},
		);
	} else {
		message = slack.infoMessage(
			"Here's some ideas",
			`${bold("@atomist")} show action
			${bold("@atomist")} show block ${italic("- slack only")}
			${bold("@atomist")} show command
			${bold("@atomist")} show delete ${italic("- not working")}
			${bold("@atomist")} show error
			${bold("@atomist")} show field
			${bold("@atomist")} show info
			${bold("@atomist")} show prompt
			${bold("@atomist")} show replace
			${bold("@atomist")} show success
			${bold("@atomist")} show user
			${bold("@atomist")} show warning`,
			ctx,
			{
				footer: footer(ctx),
			},
		);
	}
	await ctx.message.respond(message);
}

interface PromptParams {
	owner;
	action;
	second_action;
	a_hidden_value;
	notes;
	a_number;
	a_boolean;
	a_short_value;
	a_longer_value;
	a_pattern;
}

/**
 * Notes on what parameters work can be found inline.
 * @param ctx
 */
async function promptMessage(ctx: CommandContext) {
	// <PromptParams> doesn't need to be provided in this case, may have
	// uses in other places
	const response = await ctx.parameters.prompt<PromptParams>(
		{
			owner: {
				required: false,
				description: "The owner or something",
				defaultValue: "Barry",
			},
			action: {
				displayName: "the action",
				type: {
					options: [
						{ value: "ignore", description: "Ignore action" },
						{ value: "delete", description: "Delete action" },
					],
				},
			},
			second_action: {
				description: "Second action",
				type: {
					kind: "multiple",
					options: [
						{ value: "one", description: "First action" },
						{ value: "two", description: "Second action" },
						{ value: "three", description: "Third action" },
						{ value: "four", description: "Fourth action" },
						{ value: "five", description: "Fifth action" },
					],
				},
			},
			// setting a value as `displayable: false` means that you need to set `required: false`
			// false as well.
			// but this value then doesn't get returned in the response
			a_hidden_value: {
				displayable: false,
				defaultValue: "a hidden default value",
				required: false,
			},
			notes: { control: "textarea", required: false },
			a_number: { type: "number" },
			a_boolean: { type: "boolean", description: "Must notify" },
			a_short_value: { maxLength: 2 },
			a_longer_value: { minLength: 4 },
			a_pattern: {
				pattern: /^(seconds|minutes|hours|days|months)$/im,
				description: "days, minutes, hours, days, months",
			},
		},
		{
			thread: true,
		},
	);

	info(`showPromptMessage: ${stringify(response)}`);
}

async function replaceMessage(ctx: CommandContext) {
	const msgId = createMessageId();
	info(`replaceMessage with msgId: ${msgId}`);

	const filled = "█";
	const unfilled = "░";

	for (let i = 1; i <= 10; i++) {
		const text = `${filled.repeat(i)}${unfilled.repeat(10 - i)}`;
		await ctx.message.send(
			slack.infoMessage("Replace message contents", text, ctx, {
				footer: footer(ctx),
			}),
			{
				channels: getChannelName(ctx),
			},
			{ id: msgId },
		);
		await new Promise(resolve => setTimeout(resolve, 3000));
	}

	info("replaceMessage complete");
}

/**
 * This doesnt work on teams, or at least the semantics are different than slack
 * @param ctx
 */
async function deleteMessage(ctx: CommandContext) {
	const msgId = createMessageId("deleteMessage");
	info(`deleteMessage with msgId: ${msgId}`);

	await ctx.message.send(
		{
			attachments: [
				{
					author_icon: `https://images.atomist.com/rug/info.png`,
					author_name: "Message will delete",
					text: "After 10 seconds this message should disappear",
					fallback:
						"After 10 seconds this message should disappear (but it doesn't...)",
					mrkdwn_in: ["text"],
					footer: footer(ctx),
					footer_icon:
						"https://images.atomist.com/logo/atomist-black-mark-xsmall.png",
				},
			],
		},
		{
			// channels: getChannelName(ctx),
		},
		{ id: msgId },
	);

	await new Promise(resolve => setTimeout(resolve, 10000));
	info(`delete sent message with msgId : ${msgId}`);

	await ctx.message.delete(
		{
			// channels: getChannelName(ctx) },
		},
		{ id: msgId },
	);
}

async function userMessage(ctx: CommandContext) {
	const msgId = createMessageId("deleteMessage");
	info("userMessage");
	const users = getUserId(ctx);
	info(`userId: ${users}`);

	await ctx.message.send(
		slack.infoMessage("Info title", "Message sent directly to user", ctx, {
			footer: footer(ctx),
		}),
		{ channels: msgId },
		{ msgId },
	);
}

async function blockMessage(ctx: CommandContext) {
	info("blockMessage");

	const msg: SlackMessage = {
		blocks: [
			{
				element: {} as PlainTextElement,
				label: { text: "the label" },
			} as InputBlock,
		],
	};

	await ctx.message.send(msg, { channels: getChannelName(ctx) });
}

async function commandMessage(ctx: CommandContext) {
	const msgId = createMessageId();
	info(`commandMessage with msgId: ${msgId}`);

	const msg: SlackMessage = {
		attachments: [
			{
				author_icon: `https://images.atomist.com/rug/question.png`,
				author_name: "author name",
				text: "text body",
				fallback: "fallback text",
				mrkdwn_in: ["text"],
				actions: [
					buttonForCommand(
						{
							text: "button text",
						},
						name,
						{
							responseFrom: "button",
							a_boolean: true,
							a_number: 42,
							msgId,
						},
					),
					menuForCommand(
						{
							text: "select option",
							// options: [{ text: "option1", value: "option2" }],
							options: "users",
						},
						name,
						"my_select_static",
						{
							responseFrom: "static_select",
							a_boolean: true,
							a_number: 42,
							msgId,
						},
					),
				],
				footer_icon:
					"https://images.atomist.com/logo/atomist-black-mark-xsmall.png",
				footer: footer(ctx),
			},
		],
	};

	await ctx.message.send(
		msg,
		{ channels: getChannelName(ctx) },
		{ id: msgId },
	);
}

async function actionMessage(ctx: CommandContext) {
	const callbackId = createMessageId("callback");
	const msgId = createMessageId();
	info("actionMessage");

	const msg: SlackMessage = {
		attachments: [
			{
				author_icon: `https://images.atomist.com/rug/question.png`,
				author_name: "author name",
				text: "text body",
				fallback: "fallback text",
				callback_id: callbackId,
				color: "#B5B5B5",
				mrkdwn_in: ["text"],
				footer_icon:
					"https://images.atomist.com/logo/atomist-black-mark-xsmall.png",
				ts: ts(),
				actions: [
					{
						text: "action 1",
						type: "button",
						name: "button_1",
						style: "good", // not sure what these should be?
						confirm: {
							text: "confirmation text",
							title: "confirmation title",
							dismiss_text: "dismay",
							ok_text: "dokey",
						},
					},
					{
						text: "action 2",
						type: "button",
						name: "button_2",
						style: "warning",
					},
					{
						text: "static data_source",
						type: "select",
						name: "select_1",
						data_source: "static",
						options: [
							{ text: "option1", value: "option1" },
							{ text: "option2", value: "option2" },
							{ text: "option3", value: "option3" },
							{ text: "option4", value: "option4" },
						],
					},
					{
						text: "users data_source",
						type: "select",
						name: "user_select",
						data_source: "users", // users don't show
					},
					{
						text: "option group",
						type: "select",
						name: "select_3",
						option_groups: [
							{
								text: "option_group_1",
								options: [
									{ text: "option1_1", value: "option1_1" },
									{ text: "option1_2", value: "option1_2" },
									{ text: "option1_3", value: "option1_3" },
									{ text: "option1_4", value: "option1_4" },
								],
							},
							{
								text: "option_group_2",
								options: [
									{ text: "option2_1", value: "option2_1" },
									{ text: "option2_2", value: "option2_2" },
									{ text: "option2_3", value: "option2_3" },
									{ text: "option2_4", value: "option2_4" },
								],
							},
						],
					},
					{
						text: "channels data_source",
						type: "select",
						name: "select_3",
						data_source: "channels", // channels don't show
					},
					{
						text: "conversations data_source",
						type: "select",
						name: "select_4",
						data_source: "conversations", // conversations don't show
					},
				],
				footer: footer(ctx),
			},
		],
	};

	const response = await ctx.message.send(
		msg,
		{ channels: getChannelName(ctx) },
		{
			id: msgId,
			actions: [
				{
					id: "blah-1",
					command: name,
					parameter_name: "blah-name",
					parameters: [
						{ name: "blah 1", value: "blah1" },
						{ name: "blah 2", value: "blah2" },
					],
				},
			],
		},
	);

	info(`actionMessage: ${stringify(response)}`);
}

async function fieldMessage(ctx: CommandContext) {
	info("actionMessage");

	const msg: SlackMessage = {
		attachments: [
			{
				author_icon: `https://images.atomist.com/rug/question.png`,
				author_name: "author name",
				text: "text body",
				fallback: "fallback text",
				color: "#f50000", // doesn't seem to work?
				mrkdwn_in: ["text"],
				footer_icon:
					"https://images.atomist.com/logo/atomist-black-mark-xsmall.png",
				ts: ts(),
				fields: [
					{
						value: "value1",
						short: true,
						title: "title1",
					},
					{
						value: "value2",
						short: true,
						title: "title2",
					},
					{
						value: "value3",
						short: false,
						title: "title3",
					},
				],
				footer: footer(ctx),
			},
		],
	};

	await ctx.message.send(msg, { channels: getChannelName(ctx) });
}

function footer(ctx: Contextual<any, any>): string {
	return `${ctx.skill.namespace}/${ctx.skill.name}:${ctx.skill.version}`;
}
