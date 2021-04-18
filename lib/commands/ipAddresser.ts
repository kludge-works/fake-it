import { CommandHandler, MessageOptions, slack } from "@atomist/skill";
import * as _ from "lodash";
import {
	ActionsBlock,
	bold,
	ButtonElement,
	ContextBlock,
	HeaderBlock,
	SectionBlock,
	SlackMessage,
} from "@atomist/slack-messages";
import { ts } from "@atomist/skill/lib/slack";
import { Contextual } from "@atomist/skill/src/lib/handler";
import { elementForCommand } from "@atomist/skill/lib/slack/block";
import JSON = Mocha.reporters.JSON;

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const userId = _.get(ctx.message, "source.slack.user.id");
	const parentMsg = _.get(ctx.trigger.source, "slack.message.id");
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const response = _.get(ctx.message, "request.parameters");

	let reason: string;

	const msgId = ts();
	const msgOptions = {
		id: msgId.toString(),
		ts: msgId,
		thread: parentMsg,
	} as MessageOptions;

	await ctx.audit.log(`raw_message: ${raw_message}`);
	await ctx.audit.log(`userId: ${userId}`);
	await ctx.audit.log(`parentMsg: ${parentMsg}`);
	await ctx.audit.log(`channel: ${channel}`);
	await ctx.audit.log(`msgOptions: ${JSON.stringify(msgOptions)}`);
	await ctx.audit.log(`ctx.message: ${JSON.stringify(ctx.message)}`);
	await ctx.audit.log(`ctx.parameters: ${JSON.stringify(ctx.parameters)}`);
	await ctx.audit.log(`ctx.trigger: ${JSON.stringify(ctx.trigger)}`);
	await ctx.audit.log(`request.parameters: ${JSON.stringify(response)}`);

	if (response.length) {
		const confirmation = response[0].value;
		await ctx.audit.log(`confirmation: ${JSON.stringify(confirmation)}`);
	} else {
		const {
			groups: { ipAddress },
		} = /^allow (jenkins|nexus) access for (?<ipAddress>.*)$/.exec(
			raw_message,
		);
		await ctx.audit.log(`ipAddress: ${ipAddress}`);

		if ("127.0.0.1" === ipAddress) {
			await ctx.message.respond(
				slack.errorMessage("Theres no place like", bold("no"), ctx),
			);
			reason = "Declined for 127.0.0.1 IP Address";
		} else {
			const response = await ctx.message.send(
				questionMessage(ctx),
				{ users: [], channels: channel },
				msgOptions,
			);
			await ctx.audit.log(`response: ${JSON.stringify(response)}`);
			reason = "Prompted for access permission";
		}
	}

	return {
		code: 0,
		reason: reason,
	};
};

function questionMessage(ctx: Contextual<any, any>): SlackMessage {
	return {
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "hmm I don't know you :thinking_face:",
					emoji: true,
				},
			} as HeaderBlock,
			{
				type: "section",
				text: {
					type: "plain_text",
					text: "This is a plain text section block.",
					emoji: true,
				},
			} as SectionBlock,
			{
				type: "actions",
				elements: [
					elementForCommand(
						{
							type: "button",
							style: "primary",
							text: {
								type: "plain_text",
								text: ":white_check_mark",
								emoji: true,
							},
						} as ButtonElement,
						"ipAddresser",
						{ confirmation: "CONFIRMED" },
					),
					elementForCommand(
						{
							type: "button",
							text: {
								type: "plain_text",
								text: ":no_entry:",
								emoji: true,
							},
						} as ButtonElement,
						"ipAddresser",
						{ confirmation: "DENIED" },
					),
				],
			} as ActionsBlock,
			{
				type: "divider",
			},
			{
				type: "context",
				elements: [
					{
						type: "plain_text",
						text: footer(ctx),
						emoji: true,
					},
				],
			} as ContextBlock,
		],
	};
}

export function footer(ctx: Contextual<any, any>): string {
	return `${ctx.skill.namespace}/${ctx.skill.name}:${ctx.skill.version}`;
}
