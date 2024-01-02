<script lang="ts">
	import { FP_DOCS_URL } from "../../constants";
	import { API, CONFIG } from "../../utils/config";
	import { escapeRegExp } from "../../utils/misc";
	import { getNodes, nodeStatus, pingNode } from "../../utils/node";

	let loadTime = Date.now();
	let nodes: any[] = [];
	let iSearch: HTMLInputElement;
	let token = "Récupération du token...";
	let iToken: HTMLInputElement;
	let error = false;
	let loaded = false;

	(async () => {
		let nodesQuery = await getNodes();
		if (nodesQuery.error) error = true;
		else
			nodes = nodesQuery.response.map((node: any) => {
				return {
					...node,
					display: true,
					status: "loading",
					responseTime: 0,
				};
			});

		let tokenQuery = await fetch(`${API()}/admin/daemon-token/get`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res: any) => res.json())
			.catch(() => null);
		if (tokenQuery && tokenQuery.data && tokenQuery.data.token)
			token = tokenQuery.data.token;
		else
			token = "Une erreur est survenue lors de la récupération du token.";

		/* Ping nodes */
		await Promise.all(
			nodes.map(async (node: any) => {
				let pingQuery = await pingNode(node.id);
				if (pingQuery.error) node.status = "offline";
				else {
					node.status = "online";
					node.responseTime = pingQuery.response.responseTime || 0;
				}
			}),
		);

		loaded = true;
		loadTime = Date.now() - loadTime;
	})();

	function search() {
		let search = iSearch.value.toLowerCase();
		nodes = nodes.map((node: any) => {
			if (
				node.name.toLowerCase().includes(search) ||
				node.address.toLowerCase().includes(search) ||
				node.location.toLowerCase().includes(search)
			)
				node.display = true;
			else node.display = false;
			return node;
		});
	}
</script>

<h1 class="text-3xl font-semibold text-center mt-10">
	Liste des machines de {CONFIG().app.name}
</h1>

<div class="relative w-11/12 xl:w-10/12 mt-8">
	<div class="w-2/5 md:w-1/3 float-left">
		<button
			class="btn btn-outline btn-sm"
			on:click={() => eval("addModal.showModal()")}
			>Ajouter une machine</button
		>
		<dialog id="addModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<div class="space-y-2">
					<h3 class="font-bold text-lg">Ajouter une machine</h3>
					<p class="text-gray-500">
						Pour ajouter une nouvelle machine, vous devez y
						installer FeatherDaemon en suivant <a
							href="{FP_DOCS_URL}/daemon/installation"
							class="link link-primary link-hover"
							target="_blank">ces instructions</a
						>.
					</p>
					<p class="text-gray-500">
						Lors du premier démarrage du daemon, vous devrez
						renseigner votre token de daemon.
					</p>
					<div class="form-control w-full">
						<input
							type="text"
							class="input input-primary w-full blur-sm hover:blur-0 focus:blur-0 transition-all duration-200"
							value={token}
							bind:this={iToken}
							on:click={() => iToken.select()}
							readonly
						/>
						<label class="label" for="#">
							<span class="label-text text-error">
								<i class="fas fa-exclamation-circle mr-2" />
								Ne partagez jamais votre token de daemon !
							</span>
						</label>
					</div>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>Fermer</button>
			</form>
		</dialog>
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
			{nodes.length} machine{nodes.length > 1 ? "s" : ""} chargée{nodes.length >
			1
				? "s"
				: ""} en {loadTime / 1000} seconde{loadTime / 1000 > 1
				? "s"
				: ""}
		{/if}
	</span>
	<div class="w-full overflow-x-scroll">
		<table
			class="table bg-white dark:bg-gray-800 shadow-md rounded-md my-5"
		>
			<thead>
				<tr>
					<th>Nom</th>
					<th>Adresse IP</th>
					<th>Port du daemon</th>
					<th>Localisation</th>
					<th>Statut</th>
				</tr>
			</thead>
			<tbody>
				{#if loaded}
					{#if error}
						<tr>
							<td colspan="6" class="text-center">
								<span class="text-error-content font-semibold">
									<i class="fas fa-exclamation-circle mr-2" />
									Une erreur est survenue lors de la récupération
									des machines.
								</span>
							</td>
						</tr>
					{/if}
					{#if nodes}
						{#each nodes as node}
							{#if node.display}
								<tr
									class="relative hover hover:cursor-pointer h-12"
									on:click={() => {
										location.href = `/admin/nodes/${node.id}`;
									}}
								>
									<th
										class="border border-gray-200 dark:border-gray-700 px-4 py-2"
									>
										{#if iSearch.value.trim().length > 0 && node.name
												.toLowerCase()
												.includes(iSearch.value.toLowerCase())}
											{#each node.name.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
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
											{node.name}
										{/if}
									</th>
									<td
										class="border border-gray-200 dark:border-gray-700 px-4 py-2"
									>
										{#if iSearch.value.trim().length > 0 && node.address
												.toLowerCase()
												.includes(iSearch.value.toLowerCase())}
											{#each node.address.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "gi")) as part}
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
											{node.address}
										{/if}
									</td>
									<td
										class="border border-gray-200 dark:border-gray-700 px-4 py-2"
									>
										{node.daemonPort}
									</td>
									<td
										class="border border-gray-200 dark:border-gray-700 px-4 py-2"
									>
										{#if iSearch.value.trim().length > 0 && node.location
												.toLowerCase()
												.includes(iSearch.value.toLowerCase())}
											{#each node.location.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "gi")) as part}
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
											{node.location}
										{/if}
									</td>
									<td
										class="border border-gray-200 dark:border-gray-700 px-4 py-2"
									>
										<span
											class="badge badge-{nodeStatus[
												node.status
											].color} w-24"
										>
											{nodeStatus[node.status].display}
										</span>
										{#if node.status === "online"}
											<span
												class="text-gray-500 font-semibold ml-5 max-xl:hidden"
											>
												<i
													class="fas fa-clock"
												/>{node.responseTime}ms
											</span>
										{/if}
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
									Aucun résultat.
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
