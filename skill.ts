import {
	Category,
	ParameterType,
	ParameterVisibility,
	resourceProvider,
	skill,
} from "@atomist/skill";
import { fakeConfiguration } from "./lib/fakeConfiguration";

export const Skill = skill<fakeConfiguration & { schedule: any }>({
	name: "fake-it-skill",
	namespace: "kludge-works",
	displayName: "Fake It",
	author: "kludge-works",
	categories: [Category.DevOps],
	license: "Apache-2.0",

	runtime: {
		memory: 512,
		timeout: 540,
	},

	resourceProviders: {
		chat: resourceProvider.chat({ minRequired: 1 }),
	},

	parameters: {
		schedule: {
			type: ParameterType.Schedule,
			displayName: "Cron check interval",
			defaultValue: "15 * * * *",
			description: "Cron expression to check docker registries",
			required: false,
			visibility: ParameterVisibility.Normal,
		},
		someProperty: {
			type: ParameterType.String,
			displayName: "Some property",
			description: "Some property",
			placeHolder: "Some value",
			required: false,
			visibility: ParameterVisibility.Hidden,
		},
	},

	subscriptions: ["@atomist/skill/onSchedule"],

	commands: [
		{
			name: "guestSpeaker",
			displayName: "The guest speaker",
			description: "Test responding to a command with a slack message",
			pattern: /^guest speaker.*$/,
		},
		{
			name: "runLongRunningTasks",
			displayName: "Long running tasks",
			description: "some long running tasks",
			pattern: /^long tasks.*$/,
		},
		{
			name: "progress",
			displayName: "Understand progress",
			description: "Understand progress",
			pattern: /^progress.*$/,
		},
		{
			name: "provision",
			displayName: "provision env",
			description: "provision env",
			pattern: /^provision.*$/,
		},
	],
});
