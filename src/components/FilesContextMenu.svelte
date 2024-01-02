<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import { getPermissions } from "../utils/permissions";

	export let posX: number = 0;
	export let posY: number = 0;
	export let file: any;

	let permissions = getPermissions();

	const dispatch = createEventDispatcher();

	let container: HTMLDivElement;

	onMount(() => {
		posX -= document
			.getElementById("filesContainer")!
			.parentElement!.getBoundingClientRect().left;
		posY -= document
			.getElementById("filesContainer")!
			.parentElement!.getBoundingClientRect().top;

		if (
			posX + container.clientWidth >
			document.getElementById("filesContainer")!.parentElement!
				.clientWidth
		) {
			posX -= container.clientWidth;
		}

		if (
			posY + container.clientHeight >
			document.getElementById("filesContainer")!.parentElement!
				.clientHeight
		) {
			posY -= container.clientHeight;
		}
	});
</script>

<div
	class="absolute z-40 flex flex-col items-center justify-center w-fit h-fit py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg"
	style="top: {posY}px; left: {posX}px;"
	bind:this={container}
>
	<div class="flex flex-col justify-start items-start min-w-[300px]">
		{#if file}
			{#if file.type == "d"}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 text-left"
					on:click={() => dispatch("open", { file })}
				>
					Ouvrir
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						Entrée
					</span>
				</button>
			{:else if permissions.includes("server.files.read")}
				{#if permissions.includes("server.files.write")}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 text-left"
						on:click={() => dispatch("open", { file })}
					>
						Afficher / Éditer
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Entrée
						</span>
					</button>
				{:else}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 text-left"
						on:click={() => dispatch("open", { file })}
					>
						Afficher
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Entrée
						</span>
					</button>
				{/if}
			{:else}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 text-left opacity-50 cursor-not-allowed"
					disabled
				>
					Afficher
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						Entrée
					</span>
				</button>
			{/if}
			{#if file.type == "d"}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 text-left"
					on:click={() =>
						dispatch("open", {
							file,
							newTab: true,
						})}
				>
					Ouvrir dans un nouvel onglet
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						Ctrl+Entrée
					</span>
				</button>
			{/if}
			{#if file.type !== "d"}
				{#if permissions.includes("server.files.copy")}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left"
						on:click={() => dispatch("copy", { file })}
					>
						Copier
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Ctrl+C
						</span>
					</button>
				{:else}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left opacity-50 cursor-not-allowed"
						disabled
					>
						Copier
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Ctrl+C
						</span>
					</button>
				{/if}
			{/if}
			<button
				class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1"
				on:click={() => dispatch("copyPath", { file })}
			>
				Copier le chemin
			</button>
			{#if permissions.includes("server.files.rename")}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left"
					on:click={() => dispatch("rename", { file })}
				>
					Renommer
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						F2
					</span>
				</button>
			{:else}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left opacity-50 cursor-not-allowed"
					disabled
				>
					Renommer
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						F2
					</span>
				</button>
			{/if}
			{#if file.type !== "d"}
				{#if permissions.includes("server.files.read")}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left"
						on:click={() => dispatch("download", { file })}
					>
						Télécharger
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Ctrl+S
						</span>
					</button>
				{:else}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left opacity-50 cursor-not-allowed"
						disabled
					>
						Télécharger
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Ctrl+S
						</span>
					</button>
				{/if}
			{/if}
			{#if permissions.includes("server.files.delete")}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left"
					on:click={() => dispatch("delete", { file })}
				>
					Supprimer
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						Suppr
					</span>
				</button>
			{:else}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left opacity-50 cursor-not-allowed"
					disabled
				>
					Supprimer
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						Suppr
					</span>
				</button>
			{/if}
		{:else}
			{#if permissions.includes("server.files.write")}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 text-left"
					on:click={() => dispatch("newFolder")}
				>
					Nouveau dossier
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						Ctrl+Shift+N
					</span>
				</button>
			{:else}
				<button
					class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 text-left opacity-50 cursor-not-allowed"
					disabled
				>
					Nouveau dossier
					<span
						class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
					>
						Ctrl+Shift+N
					</span>
				</button>
			{/if}
			{#if sessionStorage.getItem("filesClipboard")}
				{#if permissions.includes("server.files.copy")}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left"
						on:click={() => dispatch("paste")}
					>
						Coller
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Ctrl+V
						</span>
					</button>
				{:else}
					<button
						class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left opacity-50 cursor-not-allowed"
						disabled
					>
						Coller
						<span
							class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
						>
							Ctrl+V
						</span>
					</button>
				{/if}
			{/if}
			<button
				class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left"
				on:click={() => dispatch("copyPath", { file: "" })}
			>
				Copier le chemin
			</button>
			<button
				class="group w-full flex justify-between items-center hover:bg-blue-500 hover:text-white px-6 py-1 border-t border-gray-200 dark:border-gray-700 text-left"
				on:click={() => dispatch("selectAll")}
			>
				Tout sélectionner
				<span
					class="text-sm text-gray-500 group-hover:text-white float-right ml-2"
				>
					Ctrl+A
				</span>
			</button>
		{/if}
	</div>
</div>
