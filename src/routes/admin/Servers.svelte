<script lang="ts">
	import CreateServerModal from "../../components/modals/CreateServerModal.svelte";
	import Error from "../../components/Error.svelte";
	import { escapeRegExp } from "../../utils/misc";
	import { getAllServers, serverStatus } from "../../utils/server";
	import { CONFIG } from "../../utils/config";

	let loadTime = Date.now();
	let servers: any;
	let iSearch: HTMLInputElement;
	let error = false;
	let forbidden = false;
	let loaded = false;

	(async () => {
		let serversQuery = await getAllServers();
		if (serversQuery.error) {
			if (serversQuery.error == "FORBIDDEN") return (forbidden = true);

			error = true;
		} else {
			servers = serversQuery.response.map((server: any) => {
				return {
					...server,
					display: true,
				};
			});
		}

		loaded = forbidden ? false : true;
		loadTime = Date.now() - loadTime;
	})();

	function search() {
		let search = iSearch.value.toLowerCase();
		servers = servers.map((server: any) => {
			if (
				("#" + server.serverId.toLowerCase()).includes(search) ||
				server.name.toLowerCase().includes(search) ||
				server.ownerName.toLowerCase().includes(search) ||
				server.nodeName.toLowerCase().includes(search)
			)
				server.display = true;
			else server.display = false;
			return server;
		});
	}
</script>

{#if forbidden}
	<Error
		code="403"
		message="Vous n'êtes pas autorisé à accéder à cette page."
	/>
{:else}
	<h1 class="text-3xl font-semibold text-center mt-10">
		Liste des serveurs de {CONFIG().app.name}
	</h1>

	<div class="relative w-full xl:w-10/12 px-4 mt-8">
		<div class="w-2/5 md:w-1/3 float-left">
			<button
				class="btn btn-outline btn-sm"
				on:click={() => eval("addModal.showModal()")}
				>Créer un serveur</button
			>
			<CreateServerModal />
		</div>
		<div class="flex items-center w-2/5 md:w-1/3 float-right m-1 mb-10">
			<label for="search" class="sr-only">Rechercher</label>
			<div class="relative w-full">
				<div
					class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
				>
					<i class="fas fa-search text-gray-400" />
				</div>
				<input
					type="text"
					id="search"
					bind:this={iSearch}
					class="input input-sm w-full pl-10"
					placeholder="Tapez pour rechercher..."
					on:keyup={search}
					on:change={search}
				/>
			</div>
		</div>

		<span class="absolute left-5 top-8 mt-4 mr-4 text-sm text-gray-500">
			{#if loaded}
				{servers.length} serveur{servers.length > 1 ? "s" : ""} chargé{servers.length >
				1
					? "s"
					: ""} en {loadTime / 1000} seconde{loadTime / 1000 > 1
					? "s"
					: ""}
			{/if}
		</span>

		<div class="overflow-x-scroll w-full">
			<table
				class="table bg-white dark:bg-gray-800 shadow-md rounded-md my-5"
			>
				<thead>
					<tr>
						<th>ID</th>
						<th>Nom</th>
						<th>Propriétaire</th>
						<th>Machine</th>
						<th>RAM</th>
						<th>CPU</th>
						<th>Disque</th>
						<th>Statut</th>
					</tr>
				</thead>
				<tbody>
					{#if loaded}
						{#if error}
							<tr>
								<td colspan="7" class="text-center">
									<span
										class="text-error-content font-semibold"
									>
										<i
											class="fas fa-exclamation-circle mr-2"
										/>
										Une erreur est survenue lors du chargement
										des serveurs.
									</span>
								</td>
							</tr>
						{/if}
						{#if servers && servers.length > 0}
							{#each servers as server}
								{#if server.display}
									<tr
										class="hover hover:cursor-pointer h-12"
										on:click={() =>
											(location.href = `/admin/servers/${server.serverId}`)}
									>
										<th
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											{#if iSearch.value.trim().length > 0 && ("#" + server.serverId.toLowerCase()).includes(iSearch.value.toLowerCase())}
												{#each ("#" + server.serverId).split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
													{#if part.toLowerCase() === iSearch.value.toLowerCase()}
														<span
															class="bg-yellow-200 dark:bg-yellow-700"
															>{part}</span
														>
													{:else}
														{part}
													{/if}
												{/each}
											{:else}
												#{server.serverId}
											{/if}
										</th>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											{#if iSearch.value.trim().length > 0 && server.name
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each server.name.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
													{#if part.toLowerCase() === iSearch.value.toLowerCase()}
														<span
															class="bg-yellow-200 dark:bg-yellow-700"
															>{part}</span
														>
													{:else}
														{part}
													{/if}
												{/each}
											{:else}
												{server.name}
											{/if}
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											{#if iSearch.value.trim().length > 0 && server.ownerName
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each server.ownerName.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
													{#if part.toLowerCase() === iSearch.value.toLowerCase()}
														<span
															class="bg-yellow-200 dark:bg-yellow-700"
															>{part}</span
														>
													{:else}
														{part}
													{/if}
												{/each}
											{:else}
												{server.ownerName}
											{/if}
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											{#if iSearch.value.trim().length > 0 && server.nodeName
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each server.nodeName.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
													{#if part.toLowerCase() === iSearch.value.toLowerCase()}
														<span
															class="bg-yellow-200 dark:bg-yellow-700"
															>{part}</span
														>
													{:else}
														{part}
													{/if}
												{/each}
											{:else}
												{server.nodeName}
											{/if}
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2 relative"
										>
											<progress
												class="progress progress-primary w-full max-xl:hidden"
												value={(server.ramUsage /
													server.ramLimit) *
													100}
												max="100"
											/>
											<span
												class="absolute z-10 left-1/2 -translate-x-1/2 top-0 max-xl:top-1/2 max-xl:-translate-y-1/2 text-sm font-semibold"
												>{(
													(server.ramUsage /
														server.ramLimit) *
													100
												).toFixed(2)}%</span
											>
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2 relative"
										>
											<progress
												class="progress progress-secondary w-full max-xl:hidden"
												value={server.cpuUsage}
												max="100"
											/>
											<span
												class="absolute z-10 left-1/2 -translate-x-1/2 top-0 max-xl:top-1/2 max-xl:-translate-y-1/2 text-sm font-semibold"
												>{server.cpuUsage.toFixed(
													2,
												)}%</span
											>
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2 relative"
										>
											<progress
												class="progress progress-tertiary w-full max-xl:hidden"
												value={(server.diskUsage /
													server.diskLimit) *
													100}
												max="100"
											/>
											<span
												class="absolute z-10 left-1/2 -translate-x-1/2 top-0 max-xl:top-1/2 max-xl:-translate-y-1/2 text-sm font-semibold"
												>{(
													(server.diskUsage /
														server.diskLimit) *
													100
												).toFixed(2)}%</span
											>
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											<span
												class="badge badge-{serverStatus[
													server.status
												].color || 'neutral'}"
											>
												{@html serverStatus[
													server.status
												].display.replaceAll(
													" ",
													"&nbsp;",
												)}
											</span>
										</td>
									</tr>
								{/if}
							{/each}
						{:else}
							<tr class="h-12">
								<th
									class="border border-gray-200 dark:border-gray-700 px-4 py-2"
									colspan="7"
								>
									<span
										class="text-center text-gray-500 font-semibold"
									>
										Aucun serveur n'a été trouvé.
									</span>
								</th>
							</tr>
						{/if}
					{:else}
						<tr class="h-12">
							<td colspan="7" class="text-center">
								<span class="sr-only">Chargement...</span>
								<span class="loading loading-dots loading-md" />
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
{/if}
