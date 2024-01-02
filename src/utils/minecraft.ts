import { FP_RESOURCES_URL } from "../constants";

export async function parseMinecraftJavaVersions(
	type: string,
	version?: string,
	version2?: string
): Promise<any[]> {
	const url = version2
		? `${FP_RESOURCES_URL}/minecraft/${type}/${version}/${version2}/versions.json`
		: version
		? `${FP_RESOURCES_URL}/minecraft/${type}/${version}/versions.json`
		: `${FP_RESOURCES_URL}/minecraft/${type}/versions.json`;

	try {
		const res = await fetch(url);
		const data = await res.json();

		if (!data.versions) return [];

		return data.versions;
	} catch (err) {
		return [];
	}
}

export const loaders: Record<
	string,
	{ name: string; icon?: string; project_types: string[] }
> = {
	fabric: {
		name: "Fabric",
		project_types: ["mod", "modpack"],
	},
	forge: {
		name: "Forge",
		project_types: ["mod", "modpack"],
	},
	neoforge: {
		name: "NeoForge",
		project_types: ["mod", "modpack"],
	},
	quilt: {
		name: "Quilt",
		project_types: ["mod", "modpack"],
	},
	liteloader: {
		name: "LiteLoader",
		project_types: ["mod"],
	},
	modloader: {
		name: "Risugami's ModLoader",
		project_types: ["mod"],
	},
	rift: {
		name: "Rift",
		project_types: ["mod"],
	},
	bukkit: {
		name: "Bukkit",
		project_types: ["plugin"],
	},
	folia: {
		name: "Folia",
		project_types: ["plugin"],
	},
	paper: {
		name: "Paper",
		project_types: ["plugin"],
	},
	purpur: {
		name: "Purpur",
		project_types: ["plugin"],
	},
	spigot: {
		name: "Spigot",
		project_types: ["plugin"],
	},
	sponge: {
		name: "Sponge",
		project_types: ["plugin"],
	},
	bungeecord: {
		name: "BungeeCord",
		project_types: ["plugin"],
	},
	velocity: {
		name: "Velocity",
		project_types: ["plugin"],
	},
	waterfall: {
		name: "Waterfall",
		project_types: ["plugin"],
	},
};
