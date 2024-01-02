<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let offset = 0;
	export let limit = 10;
	export let total = 0;

	let dispatch = createEventDispatcher();
</script>

<div class="join">
	<button
		class="join-item btn"
		disabled={offset === 0}
		on:click={() => {
			offset -= limit;
			dispatch("change", { offset, limit });
		}}
	>
		<i class="fas fa-angle-left"></i>
	</button>

	{#if Math.ceil(total / limit) > 7}
		{#if offset / limit < 3}
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit === 0}
				on:click={() => {
					offset = 0;
					dispatch("change", { offset, limit });
				}}
			>
				1
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit === 1}
				on:click={() => {
					offset = limit;
					dispatch("change", { offset, limit });
				}}
			>
				2
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit === 2}
				on:click={() => {
					offset = 2 * limit;
					dispatch("change", { offset, limit });
				}}
			>
				3
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit === 3}
				on:click={() => {
					offset = 3 * limit;
					dispatch("change", { offset, limit });
				}}
			>
				4
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit === 4}
				on:click={() => {
					offset = 4 * limit;
					dispatch("change", { offset, limit });
				}}
			>
				5
			</button>
			<button class="join-item btn btn-disabled">
				<i class="fas fa-ellipsis-h"></i>
			</button>
			<button
				class="join-item btn"
				on:click={() => {
					offset = (Math.ceil(total / limit) - 1) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{Math.ceil(total / limit)}
			</button>
		{:else if offset / limit + 4 >= Math.ceil(total / limit)}
			<button
				class="join-item btn"
				on:click={() => {
					offset = 0;
					dispatch("change", { offset, limit });
				}}
			>
				1
			</button>
			<button class="join-item btn btn-disabled">
				<i class="fas fa-ellipsis-h"></i>
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit ===
					Math.ceil(total / limit) - 5}
				on:click={() => {
					offset = (Math.ceil(total / limit) - 5) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{Math.ceil(total / limit) - 4}
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit ===
					Math.ceil(total / limit) - 4}
				on:click={() => {
					offset = (Math.ceil(total / limit) - 4) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{Math.ceil(total / limit) - 3}
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit ===
					Math.ceil(total / limit) - 3}
				on:click={() => {
					offset = (Math.ceil(total / limit) - 3) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{Math.ceil(total / limit) - 2}
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit ===
					Math.ceil(total / limit) - 2}
				on:click={() => {
					offset = (Math.ceil(total / limit) - 2) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{Math.ceil(total / limit) - 1}
			</button>
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit ===
					Math.ceil(total / limit) - 1}
				on:click={() => {
					offset = (Math.ceil(total / limit) - 1) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{Math.ceil(total / limit)}
			</button>
		{:else}
			<button
				class="join-item btn"
				on:click={() => {
					offset = 0;
					dispatch("change", { offset, limit });
				}}
			>
				1
			</button>
			<button class="join-item btn btn-disabled">
				<i class="fas fa-ellipsis-h"></i>
			</button>
			<button
				class="join-item btn"
				on:click={() => {
					offset -= limit;
					dispatch("change", { offset, limit });
				}}
			>
				{offset / limit}
			</button>
			<button class="join-item btn btn-neutral">
				{offset / limit + 1}
			</button>
			<button
				class="join-item btn"
				on:click={() => {
					offset += limit;
					dispatch("change", { offset, limit });
				}}
			>
				{offset / limit + 2}
			</button>
			<button class="join-item btn btn-disabled">
				<i class="fas fa-ellipsis-h"></i>
			</button>
			<button
				class="join-item btn"
				on:click={() => {
					offset = (Math.ceil(total / limit) - 1) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{Math.ceil(total / limit)}
			</button>
		{/if}
	{:else}
		{#each Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1) as page}
			<button
				class="join-item btn"
				class:btn-neutral={offset / limit + 1 === page}
				on:click={() => {
					offset = (page - 1) * limit;
					dispatch("change", { offset, limit });
				}}
			>
				{page}
			</button>
		{/each}
	{/if}

	<button
		class="join-item btn"
		disabled={offset + limit >= total}
		on:click={() => {
			offset += limit;
			dispatch("change", { offset, limit });
		}}
	>
		<i class="fas fa-angle-right"></i>
	</button>
</div>
