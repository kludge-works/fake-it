import { CommandHandler, MessageOptions, slack } from "@atomist/skill";
import * as _ from "lodash";
import {
	ActionsBlock,
	bold,
	ButtonElement,
	ContextBlock,
	emoji,
	HeaderBlock,
	SectionBlock,
	SlackMessage,
} from "@atomist/slack-messages";
import { ts } from "@atomist/skill/lib/slack";
import { Contextual } from "@atomist/skill/src/lib/handler";
import { elementForCommand } from "@atomist/skill/lib/slack/block";
import stringify = require("json-stable-stringify");

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const userId = _.get(ctx.message, "source.slack.user.id");
	const parentMsg = _.get(ctx.trigger.source, "slack.message.id");
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const response = _.get(ctx.message, "request.parameters") as Array<{
		name: string;
		value: string;
	}>;

	let reason: string;

	await ctx.audit.log(`raw_message: ${raw_message}`);
	await ctx.audit.log(`userId: ${userId}`);
	await ctx.audit.log(`parentMsg: ${parentMsg}`);
	await ctx.audit.log(`channel: ${channel}`);
	await ctx.audit.log(`ctx.message: ${stringify(ctx.message)}`);
	await ctx.audit.log(`ctx.parameters: ${stringify(ctx.parameters)}`);
	await ctx.audit.log(`ctx.trigger: ${stringify(ctx.trigger)}`);
	await ctx.audit.log(`request.parameters: ${stringify(response)}`);

	if (response.length) {
		const confirmation = response.find(
			param => param.name === "confirmation",
		).value;
		const ipAddress = response.find(param => param.name === "ipAddress")
			.value;
		const messageId = response.find(param => param.name === "messageId")
			.value;

		await ctx.audit.log(`confirmation: ${stringify(confirmation)}`);
		await ctx.audit.log(`ipAddress: ${stringify(ipAddress)}`);
		await ctx.audit.log(`messageId: ${stringify(messageId)}`);

		if ("CONFIRMED" === confirmation) {
			await ctx.message.respond(
				slack.successMessage(
					"ELB Access granted",
					`for ${ipAddress}/32`,
					ctx,
				),
			);
			reason = `ELB Access granted for ${ipAddress}/32`;
		} else {
			await ctx.message.respond(
				slack.errorMessage(
					"ELB Access denied",
					`for ${ipAddress}/32`,
					ctx,
				),
			);
			reason = `ELB Access denied for ${ipAddress}/32`;
		}
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
			const msgId = ts();
			const msgOptions = {
				id: msgId.toString(),
				ts: msgId,
				thread: parentMsg,
			} as MessageOptions;

			const response = await ctx.message.send(
				questionMessage(ctx, ipAddress, msgId),
				{ users: [], channels: channel },
				msgOptions,
			);
			await ctx.audit.log(`response: ${stringify(response)}`);
			reason = "Prompted for access permission";
		}
	}

	return {
		code: 0,
		reason: reason,
	};
};

function questionMessage(
	ctx: Contextual<any, any>,
	ipAddress: string,
	msgId: number,
): SlackMessage {
	return {
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: `hmm I don't know you ${emoji("thinking_face")}`,
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
							// style: "primary",
							text: {
								type: "plain_text",
								text: emoji("white_check_mark"),
								emoji: true,
							},
						} as ButtonElement,
						"ipAddresser",
						{
							confirmation: "CONFIRMED",
							ipAddress: ipAddress,
							messageId: msgId,
						},
					),
					elementForCommand(
						{
							type: "button",
							text: {
								type: "plain_text",
								text: emoji("no_entry"),
								emoji: true,
							},
						} as ButtonElement,
						"ipAddresser",
						{
							confirmation: "DENIED",
							ipAddress: ipAddress,
							messageId: msgId,
						},
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
