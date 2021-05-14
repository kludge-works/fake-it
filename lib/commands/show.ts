import { CommandContext, CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { info } from "@atomist/skill/lib/log";
import stringify = require("json-stable-stringify");
import { bold, SlackMessage } from "@atomist/slack-messages";
import { Contextual } from "@atomist/skill/src/lib/handler/index";

export const name = "show";

interface BranchAction {
	owner: string;
	name: string;
	branch: string;
	apiUrl: string;
	defaultBranch: string;
	msgId: string;
	cfg: string;
	channels: string;
	action: "ignore" | "delete" | "raise_pr";
}

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

	if (
		msg === undefined ||
		["error", "info", "success", "warning"].includes(msg)
	) {
		const message = showSimpleMessage(msg, ctx);
		await ctx.message.respond(message);
	} else if (msg === "question") {
		const params = await ctx.parameters.prompt<BranchAction>({
			owner: {},
			name: {},
			branch: {},
			msgId: {},
			cfg: {},
			defaultBranch: {},
			apiUrl: {},
			channels: {},
			action: {},
		});
		await info(`params: ${params}`);
	}

	return {
		code: 0,
		reason: "Success",
	};
};

// function showQuestionMessage(ctx: CommandContext): SlackMessage {
// 	// const msg = slack.questionMessage(
// 	// 	"question title",
// 	// 	"question message",
// 	// 	ctx,
// 	// 	{
// 	// 		footer: footer(ctx),
// 	// 	},
// 	// );
// 	// msg.attachments[0].actions = [
// 	// 	{
// 	// 		name: "action1_name",
// 	// 		value: "action1_value",
// 	// 		text: "text for action 1",
// 	// 		// confirm:
// 	// 		options: [
// 	// 			{ value: "confirm", text: "confirm" },
// 	// 			{ value: "cancel", text: "cancel" },
// 	// 		],
// 	// 	} as slack.Action,
// 	// ];
//
// 	return msg;
// }

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
			${bold("@atomist")} show question
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

function footer(ctx: Contextual<any, any>): string {
	return `${ctx.skill.namespace}/${ctx.skill.name}:${ctx.skill.version}`;
}
