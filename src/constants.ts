export const LANGUAGES: { [key: string]: string } = {
	fr: "Français",
};
export const IS_DARK = matchMedia("(prefers-color-scheme: dark)").matches;
export const FP_HOME_URL = "https://featherpanel.natoune.fr";
export const FP_DOCS_URL = "https://featherpanel.natoune.fr/docs";
export const FP_RESOURCES_URL = "https://featherpanel.natoune.fr";
export const MODRINTH_API = "https://api.modrinth.com/v2";

export const GAMES = {
	minecraft: {
		id: "minecraft",
		name: "Minecraft: Java Edition",
		icon: "minecraft",
		enablePlugins: true,
		enableCustomStartup: true,
	},
};
