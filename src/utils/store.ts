import { writable } from "svelte/store";

// Used in src/components/games/minecraft-java/MinecraftPlugins.svelte and src/components/games/minecraft-java/MinecraftPluginModal.svelte
export let selectedMinecraftPlugin = writable({
	slug: "",
	type: "",
});
