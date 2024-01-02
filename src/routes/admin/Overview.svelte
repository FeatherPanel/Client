<script lang="ts">
	import toast from "svelte-french-toast";
	import { FP_DOCS_URL, FP_HOME_URL } from "../../constants";
	import { getNodes, pingNode } from "../../utils/node";
	import { getAllServers } from "../../utils/server";
	import { API, CONFIG } from "../../utils/config";

	let isApiOnline = false;
	let apiResponseTime = 0;
	let nodes: any[] = [];
	let nodesStatus: any[] = [];
	let serverCount = 0;

	(async () => {
		await fetch(`${API()}/ping`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				start: Date.now(),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				isApiOnline = true;
				apiResponseTime = res.data.responseTime || 0;
			})
			.catch((err) => {
				console.error(err);
			});

		let nodesQuery = await getNodes();
		if (nodesQuery.error)
			toast.error(
				"Une erreur est survenue lors de la connexion à l'API",
				{
					duration: 5000,
				},
			);
		else nodes = nodesQuery.response;

		nodes.forEach(async (node: any) => {
			let pingQuery = await pingNode(node.id);
			if (pingQuery.error)
				nodesStatus[node.id] = {
					isOnline: false,
					responseTime: 0,
				};
			else
				nodesStatus[node.id] = {
					isOnline: true,
					responseTime: pingQuery.response.responseTime || 0,
				};
		});

		let serverCountQuery = await getAllServers();
		if (serverCountQuery.response)
			serverCount = serverCountQuery.response.length;
	})();
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Vue d'ensemble</h1>

<div class="stats stats-vertical mt-10 xl:w-1/2 w-10/12">
	<div class="stat">
		<h2 class="text-2xl font-semibold">FeatherPanel</h2>
		<p class="mt-2">
			Version: <span class="font-semibold">{CONFIG().version}</span><br />
			URL: <span class="font-semibold">{CONFIG().app.url}</span><br />
			Serveurs: <span class="font-semibold">{serverCount}</span>
		</p>
		<div class="flex flex-row flex-wrap mt-2 space-x-2">
			<a
				href={FP_HOME_URL}
				target="_blank"
				class="btn btn-primary btn-outline mt-3"
			>
				<i class="fas fa-home" />Site web
			</a>
			<a
				href={FP_DOCS_URL}
				target="_blank"
				class="btn btn-primary btn-outline mt-3"
			>
				<i class="fas fa-book" />Documentation
			</a>
			<a
				href="https://github.com/featherpanel"
				target="_blank"
				class="btn btn-neutral btn-outline mt-3"
			>
				<i class="fab fa-github" />GitHub
			</a>
			<a
				href="https://github.com/sponsors/natoune"
				target="_blank"
				class="btn btn-secondary btn-outline mt-3"
			>
				<i class="fas fa-heart" />Sponsor
			</a>
		</div>
	</div>
	<div class="stat">
		<h2 class="text-2xl font-semibold">API</h2>
		<p>
			<span class="font-semibold text-{isApiOnline ? 'success' : 'error'}"
				>{isApiOnline ? "En ligne" : "Hors ligne"}</span
			>
			{#if isApiOnline}
				- Temps de réponse: <span class="font-semibold"
					>{apiResponseTime}ms</span
				>
			{/if}
		</p>
	</div>
	<div class="stat">
		{#if nodes}
			<h2 class="text-2xl font-semibold">Machines</h2>
			{#if !isApiOnline}
				<span class="font-semibold text-error">API Hors ligne</span>
			{/if}
			{#each nodes as node}
				<div class="my-3">
					{#if nodesStatus[node.id] && nodesStatus[node.id].isOnline}
						{#if nodesStatus[node.id].isOnline}
							<div
								class="tooltip absolute mt-1 w-4 h-4 z-10"
								data-tip="{nodesStatus[node.id].responseTime}ms"
							/>
							<i class="fas fa-dot-circle text-success" />
						{:else}
							<div
								class="tooltip absolute mt-1 w-4 h-4 z-10"
								data-tip="Hors ligne"
							/>
							<i class="fas fa-dot-circle text-error" />
						{/if}
					{:else}
						<div
							class="tooltip absolute mt-1 w-4 h-4 z-10"
							data-tip="Ping en cours..."
						/>
						<i
							class="fa-duotone fa-spinner-third fa-spin text-gray-500"
						/>
					{/if}
					<span class="font-semibold">{node.name}</span> - {node.address}<br
					/>
					<span class="text-sm ml-5">
						<i class="fas fa-location" />
						{node.location}
					</span>
				</div>
			{/each}
		{/if}
	</div>
</div>
