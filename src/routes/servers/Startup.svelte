<script lang="ts">
	import { SvelteComponent } from "svelte";
	import Error from "../../components/Error.svelte";
	import MinecraftStartup from "../../components/games/minecraft/MinecraftStartup.svelte";

	export let server: any;
	export let extra: string;

	let games: {
		[key: string]: typeof SvelteComponent<any>;
	} = {
		minecraft: MinecraftStartup,
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
