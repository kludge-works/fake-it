import {
	CommandContext,
	CommandHandler,
	Contextual,
	slack,
} from "@atomist/skill";
import * as _ from "lodash";
import { info } from "@atomist/skill/lib/log";
import stringify = require("json-stable-stringify");
import { bold, SlackMessage } from "@atomist/slack-messages";

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

function getMessageId(ctx: CommandContext) {
	return _.get(ctx.trigger.source, "msteams.message.conversation_id");
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
	if (
		msgType === undefined ||
		["error", "info", "success", "warning"].includes(msgType)
	) {
		const message = showSimpleMessage(msgType, ctx);
		await ctx.message.respond(message);
	} else if (msgType === "prompt") {
		await showPromptMessage(ctx);
	} else if (msgType === "replace") {
		await showReplaceMessage(ctx);
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

	await ctx.message.respond(
		slack.successMessage("Here's what you sent in", lines, ctx, {
			footer: footer(ctx),
		}),
	);
}

function showSimpleMessage(which_msg, ctx: CommandContext): SlackMessage {
	let message;
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
			`${bold("@atomist")} show error
			${bold("@atomist")} show info
			${bold("@atomist")} show prompt
			${bold("@atomist")} show replace
			${bold("@atomist")} show success
			${bold("@atomist")} show warning`,
			ctx,
			{
				footer: footer(ctx),
			},
		);
	}
	return message;
}

interface PromptParams {
	owner;
	action;
	a_hidden_value;
	// notes;
	// a_number;
	// a_boolean;
	// a_short_value;
	// a_longer_value;
	// a_pattern;
}

async function showPromptMessage(ctx: CommandContext) {
	const response = await ctx.parameters.prompt<PromptParams>({
		owner: { required: false, description: "The owner or something" },
		action: {
			displayName: "the action",
			type: {
				options: [
					{ value: "ignore", description: "Ignore action" },
					{ value: "delete", description: "Delete action" },
				],
			},
		},
		a_hidden_value: {
			displayable: false,
			defaultValue: "a hidden default value",
			required: false,
		},
		// notes: { control: "textarea", required: false },
		// a_number: { type: "number" },
		// a_boolean: { type: "boolean", description: "Must notify" },
		// a_short_value: { maxLength: 2, defaultValue: "ha" },
		// a_longer_value: { minLength: 4 },
		// a_pattern: {
		// 	pattern: /^(seconds|minutes|hours|days|months)$/im,
		// 	description: "days, minutes, hours, days, months",
		// },
	});

	await info(`showPromptMessage: ${stringify(response)}`);
}

async function showReplaceMessage(ctx: CommandContext) {
	await ctx.message.respond(
		slack.infoMessage("badoom", "Work in progress", ctx, {
			footer: footer(ctx),
		}),
	);
}

function footer(ctx: Contextual<any, any>): string {
	return `${ctx.skill.namespace}/${ctx.skill.name}:${ctx.skill.version}`;
}
