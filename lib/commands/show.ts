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
import { Options } from "@atomist/skill/lib/prompt";

export const name = "show";

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const requestingUserId = _.get(ctx.message, "source.slack.user.id");
	const parentMsg = _.get(ctx.trigger.source, "slack.message.id");
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const response = _.get(ctx.message, "request.parameters") as Array<{
		name: string;
		value: string;
	}>;

	await info(`raw_message: ${raw_message}`);
	await info(`requestingUserId: ${requestingUserId}`);
	await info(`parentMsg: ${parentMsg}`);
	await info(`channel: ${channel}`);
	await info(`ctx.message: ${stringify(ctx.message)}`);
	await info(`ctx.parameters: ${stringify(ctx.parameters)}`);
	await info(`ctx.trigger: ${stringify(ctx.trigger)}`);
	await info(`request.parameters: ${stringify(response)}`);

	const regexArray = /show\s+(?<msg>\w+)\s*(?<args>.*)$/.exec(raw_message);
	const msg = regexArray?.groups.msg;
	const args = regexArray?.groups.args;

	await info(`groups.msg: ${msg}`);
	await info(`groups.args: ${args}`);

	if (isInitialMessage(response)) {
		await initialMessage(msg, ctx);
	} else {
		await showResponse(response, ctx);
	}
	return {
		code: 0,
		reason: "Success",
	};
};

function isInitialMessage(response: Array<{ name: string; value: string }>) {
	return !response.length;
}

async function initialMessage(msg, ctx: CommandContext) {
	if (
		msg === undefined ||
		["error", "info", "success", "warning"].includes(msg)
	) {
		const message = showSimpleMessage(msg, ctx);
		await ctx.message.respond(message);
	} else if (msg === "prompt") {
		await showPromptMessage(ctx);
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
	notes;
}

async function showPromptMessage(ctx: CommandContext) {
	const opts = {
		options: [
			{ value: "ignore", description: "Ignore action" },
			{ value: "delete", description: "Delete action" },
		],
	} as Options;
	await ctx.parameters.prompt<PromptParams>({
		owner: { required: true, description: "The owner of something" },
		action: { type: opts, displayName: "the action" },
		a_hidden_value: {
			displayable: false,
			defaultValue: "a hidden default value",
		},
		notes: { control: "textarea", required: false },
	});
}

function footer(ctx: Contextual<any, any>): string {
	return `${ctx.skill.namespace}/${ctx.skill.name}:${ctx.skill.version}`;
}
