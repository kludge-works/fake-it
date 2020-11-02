import {
	CommandContext,
	EventContext,
	HandlerStatus,
	slack,
	Step,
	StepListener,
} from "@atomist/skill";
import { fakeConfiguration } from "./fakeConfiguration";
import { OnPushSubscription } from "@atomist/skill/lib/definition/subscription/typings/types";

export function sleep(
	stepName: string,
	sleepTime: number,
): Step<CommandContext> {
	return {
		name: stepName,
		run: async (ctx, params) => {
			await ctx.audit.log(`stepname: ${stepName}`);
			await ctx.audit.log(`sleepTime: ${sleepTime * 1000}`);
			await new Promise(r => setTimeout(r, sleepTime * 1000));
			await ctx.audit.log("task completed");
			return {
				code: 0,
				reason: "Success",
			};
		},
	};
}

export const sleep2: Step<CommandContext> = {
	name: "sleep2",
	run: async (ctx, params) => {
		await new Promise(r => setTimeout(r, 60 * 1000));
		await ctx.audit.log("sleep2 task completed");
		return {
			code: 0,
			reason: "Success",
		};
	},
};

export async function slackUpdate<
	C extends EventContext<OnPushSubscription, fakeConfiguration>
>(
	ctx: C,
	steps: Array<Step<any>>,
	title: string,
	channels?: string[],
): Promise<StepListener<any>> {
	let text = "";
	let fullRender = "";
	const stepCount = steps.length;
	let finishedCount = 0;

	return {
		starting: async (step: Step<any>): Promise<void> => {
			await updateSlackState(
				title,
				text,
				ctx,
				stepCount,
				finishedCount,
				SkillStepState.InProcess,
				channels,
				fullRender,
			);
		},
		skipped: async (step: Step<any>): Promise<void> => {
			text += `Skipped: ${step.name}.\n`;
			finishedCount++;
			await updateSlackState(
				title,
				text,
				ctx,
				stepCount,
				finishedCount,
				SkillStepState.Skipped,
				channels,
				fullRender,
			);
		},
		failed: async (step: Step<any>, error: Error): Promise<void> => {
			finishedCount++;
			text += `Failed: ${step.name}.\n${error.message}\n`;
			await updateSlackState(
				title,
				text,
				ctx,
				stepCount,
				finishedCount,
				SkillStepState.Failure,
				channels,
				fullRender,
			);
		},
		completed: async (
			step: Step<any>,
			result: undefined | HandlerStatus,
		): Promise<void> => {
			finishedCount++;
			if (result.visibility !== "hidden") {
				if (!!result && result.code !== 0) {
					text += `Failed: ${step.name}.\n\n${result.reason}\n`;
					await updateSlackState(
						title,
						text,
						ctx,
						stepCount,
						finishedCount,
						SkillStepState.Failure,
						channels,
						fullRender,
					);
				} else if (!!result && result.reason) {
					text += `Completed: ${step.name}.\n`;
					fullRender += `\n\n${result.reason}`;
					await updateSlackState(
						title,
						text,
						ctx,
						stepCount,
						finishedCount,
						SkillStepState.Success,
						channels,
						fullRender,
					);
				} else {
					text += `Completed: ${step.name}.\n`;
					await updateSlackState(
						title,
						text,
						ctx,
						stepCount,
						finishedCount,
						SkillStepState.Success,
						channels,
						fullRender,
					);
				}
			}
		},
	};
}

export async function updateSlackState(
	title: string,
	text: string,
	ctx: EventContext<OnPushSubscription>,
	stepCount: number,
	currentStep: number,
	state: SkillStepState,
	channels: string[],
	fullRender: string,
): Promise<void> {
	const notify = {
		type: "channel",
		value: channels,
	};

	// TODO: Gotta be a better way here.   Need to test if this context is from a push or from a command handler
	const msgId = Object.keys(ctx).includes("data")
		? ctx.correlationId
		: (ctx as any).msgId;
	await ctx.message.send(
		buildMessage(
			title,
			ctx as any,
			slack.codeBlock(text) + fullRender,
			currentStep,
			stepCount,
			state,
		),
		{ users: [], channels: notify.value },
		{ id: msgId },
	);
}

export enum SkillStepState {
	Success = "success",
	Approved = "approved",
	Failure = "failure",
	Stopped = "stopped",
	Planned = "planned",
	InProcess = "in_process",
	Skipped = "skipped",
	Canceled = "canceled",
}

export function buildMessage(
	msgTitle: string,
	ctx: CommandContext,
	text: string,
	step: number,
	steps: number,
	state: SkillStepState,
): slack.SlackMessage {
	let header: string;

	const finalState =
		step === steps || state === SkillStepState.Failure
			? state
			: SkillStepState.InProcess;

	const color = state === SkillStepState.Failure ? "cc0000" : "5f43e9";
	return {
		attachments: [
			{
				text: header ? header + text : text,
				color: "#5f43e9",
				author_name: slack.url(
					`https://go.atomist.com/log/${ctx.workspaceId}/${ctx.correlationId}`,
					msgTitle,
				),
				author_icon:
					"https://www.terraform.io/assets/images/og-image-8b3e4f7d.png",
				fallback: msgTitle,
				footer: slack.url(
					`https://go.atomist.com/manage/` +
						`${ctx.workspaceId}/skills/configure/${ctx.skill.id}/${ctx.configuration[0].name}`,
					`${ctx.skill.namespace}/${ctx.skill.name}@${ctx.skill.version}`,
				),
				thumb_url: `https://badge.atomist.com/v2/progress/${finalState}/${step}/${steps}?image=no&counter=no&color=${color}`,
				footer_icon: `https://images.atomist.com/rug/atomist.png`,
				ts: Math.floor(Date.now() / 1000),
			},
		],
	};
}
