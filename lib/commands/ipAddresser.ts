import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { Action, Attachment, bold, user } from "@atomist/slack-messages";

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const userId = _.get(ctx.message, "source.slack.user.id");

	await ctx.audit.log(`ctx.message: ${JSON.stringify(ctx.message)}`);
	await ctx.audit.log(`ctx.parameters: ${JSON.stringify(ctx.parameters)}`);
	await ctx.audit.log(`ctx.trigger: ${JSON.stringify(ctx.trigger)}`);
	await ctx.audit.log(`raw_message: ${raw_message}`);
	await ctx.audit.log(`userId: ${userId}`);

	const {
		groups: { ipAddress },
	} = /^allow (jenkins|nexus) access for (?<ipAddress>.*)$/.exec(raw_message);
	await ctx.audit.log(`ipAddress: ${ipAddress}`);

	if ("127.0.0.1" === ipAddress) {
		await ctx.message.respond(
			slack.errorMessage("Theres no place like", bold("no"), ctx),
		);
	} else {
		const response = await ctx.message.respond(
			slack.questionMessage(
				"hmm I don't know you",
				`${user("U018XUBKWAF")} can I give ${user(
					userId,
				)} firewall access?`,
				ctx,
				addConfirmationButtons(),
			),
		);
		await ctx.audit.log(`response: ${JSON.stringify(response)}`);
	}

	return {
		code: 0,
		reason: "Success",
	};
};

function addConfirmationButtons(): Partial<Attachment> {
	return {
		actions: [
			{
				text: "yes",
				name: "confirmation",
				type: "button",
				value: "true",
			} as Action,
			{
				text: "no",
				name: "confirmation",
				type: "button",
				value: "false",
			} as Action,
		],
	};
}
