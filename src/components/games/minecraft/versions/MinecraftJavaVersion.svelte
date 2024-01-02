<script lang="ts">
	import { onMount } from "svelte";
	import { parseMinecraftJavaVersions } from "../../../../utils/minecraft";
	import { createEventDispatcher } from "svelte";

	export let type: string;
	export let name = type;

	let select: HTMLSelectElement;
	let versions: string[] = [];

	const dispatch = createEventDispatcher();

	onMount(async () => {
		versions = await parseMinecraftJavaVersions(type);
		dispatch("versions", versions);
	});
</script>

<div class="form-control">
	<label class="label" for="minecraftJavaVersion"
		><span class="label-text"
			>Version de {name.charAt(0).toUpperCase() + name.slice(1)}</span
		></label
	>
	<select
		id="minecraftJavaVersion"
		bind:this={select}
		on:change={() => dispatch("change", select.value)}
		class="select select-bordered w-full max-w-xs"
	>
		{#if versions.length === 0}
			<option value="loading">Loading...</option>
		{:else}
			{#each versions as version}
				{#if ["bungeecord"].includes(type)}
					<option value={version}>#{version}</option>
				{:else}
					<option value={version}>{version}</option>
				{/if}
			{/each}
		{/if}
	</select>
</div>
