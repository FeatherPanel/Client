<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import Error from "../../components/Error.svelte";
	import { getNode } from "../../utils/node";
	import { API } from "../../utils/config";

	export let id: number;

	let node: any;
	let filteredCpus: any[] = [];
	let error = false;
	let forbidden = false;
	let loaded = false;

	(async () => {
		let nodeQuery = await getNode(id);
		if (nodeQuery.error) {
			if (nodeQuery.error == "NODE_NOT_FOUND") return history.back();
			if (nodeQuery.error == "FORBIDDEN") return (forbidden = true);

			error = true;
		} else {
			node = nodeQuery.response;
		}

		if (node.os && node.os.cpus)
			filteredCpus = node.os.cpus.filter(
				(cpu: any, index: number) =>
					node.os.cpus.findIndex((c: any) => c.model == cpu.model) ==
					index,
			);

		loaded = true;
	})();

	async function deleteNode() {
		await fetch(`${API()}/admin/nodes/delete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				nodeId: node.id,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					toast.success(
						"La machine a été supprimée de la base de données.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
					history.back();
				} else {
					if (res.error && res.error == "NODE_HAS_SERVERS")
						return toast.error(
							"Vous ne pouvez pas supprimer une machine qui possède des serveurs.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);

					toast.error(
						"Une erreur est survenue lors de la supression de la machine.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error(
					"Une erreur est survenue lors de la supression de la machine.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}
</script>

{#if loaded}
	{#if forbidden}
		<Error
			code="403"
			message="Vous n'êtes pas autorisé à accéder à cette page."
		/>
	{:else if error}
		<div class="alert alert-error w-10/12 mx-auto mt-10">
			<i class="fas fa-exclamation-circle mr-2" />
			<span>Une erreur est survenue lors de la connexion au serveur.</span
			>
		</div>
	{:else}
		<h1 class="text-3xl font-light text-center mt-10">
			Machine {node.id}: <b class="font-semibold">{node.name}</b>
		</h1>

		<div class="flex flex-col xl:flex-row mt-10 w-8/12">
			<div
				class="stats stats-vertical w-full xl:w-1/2 mx-auto my-2 {node.online
					? 'xl:rounded-r-none'
					: ''}"
			>
				<div class="stat w-full">
					<div class="stat-title">Adresse</div>
					<div class="stat-value max-sm:text-lg">{node.address}</div>
				</div>
				<div class="stat w-full">
					<div class="stat-title">Localisation</div>
					<div class="stat-value max-sm:text-lg">{node.location}</div>
				</div>
				<div class="stat w-full">
					<div class="stat-title">Statut</div>
					<div class="stat-value max-sm:text-lg">
						{node.online ? "En Ligne" : "Hors Ligne"}
					</div>
				</div>
				<div class="stat w-full">
					<div class="stat-title">Serveurs</div>
					<div class="stat-value max-sm:text-lg">
						{node.serverCount}
					</div>
				</div>
			</div>
			{#if node.online}
				<div
					class="stats stats-vertical w-full xl:w-1/2 mx-auto my-2 xl:rounded-l-none border-l border-gray-200 dark:border-gray-700"
				>
					<div class="stat w-full">
						<div class="stat-title">Version du Daemon</div>
						<div class="stat-value max-sm:text-lg">
							{node.daemon.version}
						</div>
					</div>
					<div class="stat w-full">
						<div class="stat-title">Système</div>
						<div class="stat-value max-sm:text-lg">
							{node.os.type}
							{node.os.arch}
						</div>
					</div>
					<div class="stat w-full">
						<div class="stat-title">CPU(s)</div>
						<div
							class="stat-value max-sm:text-lg overflow-y-auto"
							style="height: calc(100% + 1px)"
						>
							{#each filteredCpus as cpu}
								{node.os.cpus.findLastIndex(
									// @ts-ignore
									(c) => c.model == cpu.model,
								) -
									node.os.cpus.findIndex(
										// @ts-ignore
										(c) => c.model == cpu.model,
									) +
									1}
								x
								<span
									class="font-light text-lg break-word"
									style="max-width: 100%"
								>
									{cpu.model}
								</span>
								<br />
							{/each}
						</div>
					</div>
					<div class="stat w-full">
						<div class="stat-title">RAM</div>
						<div class="stat-value max-sm:text-lg">
							{Math.round(node.os.totalmem / 1024 / 1024 / 1024)} Go
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- DELETE BUTTON -->
		<button
			class="btn btn-error my-10"
			on:click={() => {
				if (node.serverCount > 0) {
					toast.error(
						"Vous ne pouvez pas supprimer une machine qui possède des serveurs.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
					return;
				}

				eval("deleteModal.showModal()");
			}}
		>
			<i class="fas fa-trash mr-2" />
			<span>Supprimer cette machine</span>
		</button>

		<dialog id="deleteModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<div class="space-y-2">
					<h3 class="font-bold text-lg">Supprimer cette machine ?</h3>
					<p class="text-sm">
						Vous êtes sur le point de supprimer cette machine. Cette
						action est irréversible.
					</p>
					<p class="text-sm text-gray-500">
						Cette machine sera supprimée de la base de données.
						Néanmoins, si vous relancez le daemon, elle sera
						recréée.
					</p>
				</div>

				<div class="modal-action flex justify-end space-x-2">
					<button class="btn btn-error" on:click={deleteNode}
						>Supprimer</button
					>
					<button class="btn btn-ghost">Annuler</button>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>Fermer</button>
			</form>
		</dialog>
	{/if}
{:else}
	<div
		class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
	>
		<span class="loading loading-spinner loading-lg" />
	</div>
{/if}
<Toaster />
