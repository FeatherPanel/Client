<script lang="ts">
	import Footer from "../components/Footer.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import { getServers, serverStatus } from "../utils/server";
	import { escapeRegExp } from "../utils/misc";

	let servers: any;
	let iSearch: HTMLInputElement;
	let error = false;
	let loaded = false;

	(async () => {
		let serversQuery = await getServers();
		if (serversQuery.error) error = true;
		else
			servers = serversQuery.response.map((server: any) => {
				return {
					...server,
					display: true,
				};
			});

		loaded = true;
	})();

	function search() {
		let search = iSearch.value.toLowerCase();
		servers = servers.map((server: any) => {
			if (
				("#" + server.serverId.toLowerCase()).includes(search) ||
				server.name.toLowerCase().includes(search)
			)
				server.display = true;
			else server.display = false;
			return server;
		});
	}
</script>

<Sidebar active="servers" />
<div
	class="relative flex flex-col items-center justify-start md:ml-64 mt-14"
	style="min-height: calc(100vh - 3.5rem);"
>
	<h1 class="text-3xl font-semibold text-center mt-10">Vos serveurs</h1>

	<div class=" w-11/12 xl:w-10/12 mt-8 max-md:hidden flex flex-col">
		<div>
			<div class="flex items-center w-2/5 lg:w-1/3 float-right m-1 mb-4">
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
		</div>
		<div class="overflow-x-scroll w-full">
			<table
				class="table table-auto bg-white dark:bg-gray-800 shadow-md rounded-md"
			>
				<thead>
					<tr>
						<th>ID</th>
						<th>Nom</th>
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
								<td colspan="6" class="text-center">
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
										class="relative {server.suspended
											? ''
											: 'hover hover:cursor-pointer'} h-12"
										on:click={() => {
											if (server.suspended) return;
											location.href = `/servers/${server.serverId}`;
										}}
									>
										<th
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											{#if server.suspended}
												<div
													class="absolute left-0 top-0 w-full h-full z-20 bg-black bg-opacity-50 flex items-center justify-center"
												>
													<div
														class="tooltip tooltip-error absolute"
														data-tip="
												Votre serveur a été suspendu par un administrateur.
											"
													>
														<span
															class="text-error-content font-semibold bg-gray-200 dark:bg-gray-800 px-10 py-2 rounded-md"
														>
															<i
																class="fas fa-exclamation-circle mr-2"
															/>
															Serveur suspendu
														</span>
													</div>
												</div>
											{/if}

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
									colspan="6"
								>
									<span
										class="text-center text-gray-500 font-semibold"
									>
										Vous n'avez aucun serveur.
									</span>
								</th>
							</tr>
						{/if}
					{:else}
						<tr class="h-12">
							<td colspan="6" class="text-center">
								<span class="sr-only">Chargement...</span>
								<span class="loading loading-dots loading-md" />
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<div
		class="flex flex-col w-full items-center justify-center mt-10 md:hidden"
	>
		{#if loaded}
			{#if error}
				<div
					class="alert alert-error flex flex-row justify-center w-11/12"
				>
					<i class="fas fa-exclamation-circle mr-2" />
					<span>
						Une erreur est survenue lors du chargement des serveurs.
					</span>
				</div>
			{/if}

			{#if servers}
				{#each servers as server}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="card w-10/12 bg-base-100 shadow-xl mt-3 mb-3 cursor-pointer"
						on:click={() =>
							(location.href = `/servers/${server.serverId}`)}
					>
						<div class="card-body">
							<h2 class="card-title">{server.name}</h2>
							<div class="flex flex-row justify-between">
								<span
									class="text-sm text-gray-500 font-semibold"
									>#{server.serverId}</span
								>
								<span
									class="badge badge-{serverStatus[
										server.status
									].color || 'neutral'}"
								>
									{@html serverStatus[
										server.status
									].display.replaceAll(" ", "&nbsp;")}
								</span>
							</div>
							<div class="divider" />
							<div class="flex flex-row justify-between">
								<div class="flex flex-col">
									<span
										class="text-sm text-gray-500 font-semibold"
										>RAM</span
									>
									<span
										class="text-sm text-gray-500 font-semibold"
										>{server.ramUsage}%</span
									>
								</div>
								<div class="flex flex-col">
									<span
										class="text-sm text-gray-500 font-semibold"
										>CPU</span
									>
									<span
										class="text-sm text-gray-500 font-semibold"
										>{server.cpuUsage}%</span
									>
								</div>
								<div class="flex flex-col">
									<span
										class="text-sm text-gray-500 font-semibold"
										>Disque</span
									>
									<span
										class="text-sm text-gray-500 font-semibold"
										>{server.diskUsage}%</span
									>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		{/if}
	</div>

	<Footer />
</div>
