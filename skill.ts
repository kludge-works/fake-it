import {
	Category,
	ParameterType,
	ParameterVisibility,
	resourceProvider,
	skill,
} from "@atomist/skill";

export const Skill = skill<{ schedule: any }>({
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
	},
});
