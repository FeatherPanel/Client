<script lang="ts">
	import { SvelteComponent } from "svelte";
	import Error from "../../components/Error.svelte";
	import MinecraftPlugins from "../../components/games/minecraft/MinecraftPlugins.svelte";

	export let server: any;
	export let extra: string;

	let games: {
		[key: string]: typeof SvelteComponent<any>;
	} = {
		minecraft: MinecraftPlugins,
	};
</script>

{#if !server.game || !games[server.game]}
	<Error
		code="500"
		message="Une erreur interne est survenue.<br/>Veuillez réessayer plus tard."
	/>
{:else}
	<svelte:component this={games[server.game]} {server} {extra} />
{/if}
