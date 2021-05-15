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
import { buttonForCommand, ts } from "@atomist/skill/lib/slack";

export const name = "show";

export const handler: CommandHandler = async ctx => {
	const raw_message = getRawMessage(ctx);
	const response = getResponse(ctx);

	await info(`raw_message: ${raw_message}`);
	await info(`requestingUserId: ${getUserId(ctx)}`);
	await info(`parentMsg: ${getMessageId(ctx)}`);
	await info(`channel: ${getChannelName(ctx)}`);
	await info(`ctx.message: ${stringify(ctx.message)}`);
	await info(`ctx.parameters: ${stringify(ctx.parameters)}`);
	await info(`ctx.trigger: ${stringify(ctx.trigger)}`);
	await info(`request.parameters: ${stringify(response)}`);

	const regexArray = /show\s+(?<msg>\w+)\s*(?<args>.*)$/.exec(raw_message);
	const msgType = regexArray?.groups.msg;
	const args = regexArray?.groups.args;

	await info(`groups.msg: ${msgType}`);
	await info(`groups.args: ${args}`);

	await info(`isInitialMessage: ${isInitialMessage(response)}`);
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

function getChannelId(ctx: CommandContext) {
	return _.get(ctx.trigger.source, "msteams.channel.id");
}

// function getConversationId(ctx: CommandContext) {
// 	return _.get(ctx.trigger.source, "msteams.conversation_id");
// }

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
	await info(`showResponse: ${lines}`);

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

	await ctx.message.send(
		msg,
		{ channels: getChannelId(ctx) },
		{
			id: getMessageId(ctx),
			ts: getMessageId(ctx),
		},
	);
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
			${bold("@atomist")} show command
			${bold("@atomist")} show delete ${italic("- not working")}
			${bold("@atomist")} show error
			${bold("@atomist")} show field
			${bold("@atomist")} show info
			${bold("@atomist")} show prompt ${italic("- not working")}
			${bold("@atomist")} show replace ${italic("- not working")}
			${bold("@atomist")} show success
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
 * This doesnt work on teams, or at least the semantics are different than slack.
 * If validation fails the original message isn't updated but a new one is appended, this doesn't seem correct.
 * Notes on what parameters work can be found inline.
 * @param ctx
 */
async function promptMessage(ctx: CommandContext) {
	// <PromptParams> doesn't need to be provided in this case, may have
	// uses in other places
	const response = await ctx.parameters.prompt<PromptParams>({
		// defaultValue doesn't seem to be provided
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
		// doesn't seem to force this value to be a number.
		a_number: { type: "number" },
		a_boolean: { type: "boolean", description: "Must notify" },
		// defaultValue doesn't seem to be provided
		// maxLength doesn't seem to be respected
		a_short_value: { maxLength: 2, defaultValue: "ha" },
		// minLength doesn't seem to be respected
		a_longer_value: { minLength: 4 },
		a_pattern: {
			pattern: /^(seconds|minutes|hours|days|months)$/im,
			description: "days, minutes, hours, days, months",
		},
	});

	await info(`showPromptMessage: ${stringify(response)}`);
}

/**
 * This doesnt work on teams, or at least the semantics are different than slack
 * @param ctx
 */
async function replaceMessage(ctx: CommandContext) {
	await info("send replaceMessage");
	await ctx.message.send(
		slack.infoMessage("badoom", "Work in progress", ctx, {
			footer: footer(ctx),
			ts: null,
		}),
		{
			channels: getChannelName(ctx),
		},
		{ id: getMessageId(ctx) },
	);
}

/**
 * This doesnt work on teams, or at least the semantics are different than slack
 * @param ctx
 */
async function deleteMessage(ctx: CommandContext) {
	await info("deleteMessage");
	await ctx.message.delete(
		{ channels: getChannelName(ctx) },
		{ id: getMessageId(ctx) },
	);
}

async function commandMessage(ctx: CommandContext) {
	await info("commandMessage");

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
							responseFrom: "command",
							a_boolean: true,
							a_number: 42,
						},
					),
				],
				footer_icon:
					"https://images.atomist.com/logo/atomist-black-mark-xsmall.png",
				ts: ts(),
				footer: footer(ctx),
			},
		],
	};

	await ctx.message.send(msg, { channels: getChannelName(ctx) });
}

async function actionMessage(ctx: CommandContext) {
	await info("actionMessage");

	const msg: SlackMessage = {
		attachments: [
			{
				author_icon: `https://images.atomist.com/rug/question.png`,
				author_name: "author name",
				text: "text body",
				fallback: "fallback text",
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
						name: "select_2",
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

	await ctx.message.send(msg, { channels: getChannelName(ctx) });
}

async function fieldMessage(ctx: CommandContext) {
	await info("actionMessage");

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
