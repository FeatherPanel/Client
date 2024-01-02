<script lang="ts">
	import toast from "svelte-french-toast";
	import Footer from "../components/Footer.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import { getApiCredentials } from "../utils/account-api";
	import { escapeRegExp } from "../utils/misc";
	import { API } from "../utils/config";

	let apiCredentials: any;
	let iSearch: HTMLInputElement;
	let error = false;
	let loaded = false;

	(async () => {
		let apiCredentialsQuery = await getApiCredentials();
		if (apiCredentialsQuery.error) error = true;
		else
			apiCredentials = apiCredentialsQuery.response.map(
				(credential: any) => {
					return {
						...credential,
						display: true,
					};
				},
			);

		loaded = true;
	})();

	function search() {
		let search = iSearch.value.toLowerCase();
		apiCredentials = apiCredentials.map((credential: any) => {
			if (
				credential.name.toLowerCase().includes(search) ||
				new Date(credential.createdAt)
					.toLocaleString()
					.toLowerCase()
					.includes(search) ||
				new Date(credential.updatedAt)
					.toLocaleString()
					.toLowerCase()
					.includes(search)
			)
				credential.display = true;
			else credential.display = false;
			return credential;
		});
	}

	function deleteKey(key: string, name: string) {
		fetch(`${API()}/api-credentials`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				key,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					apiCredentials = apiCredentials.filter(
						(credential: any) => credential.key !== key,
					);

					toast.success(`La clé ${name} a été supprimée.`, {
						duration: 3000,
						position: "bottom-right",
					});
				} else {
					toast.error(
						"Une erreur est survenue lors de la suppression de la clé d'API.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				}
			});
	}
</script>

<Sidebar active="api" />
<div
	class="relative flex flex-col items-center justify-start md:ml-64 mt-14"
	style="min-height: calc(100vh - 3.5rem);"
>
	<h1 class="text-3xl font-semibold text-center mt-10">API Utilisateur</h1>

	<div class="w-11/12 xl:w-10/12 mt-8">
		<p class="text-center">
			L'API utilisateur vous permet d'interagir avec votre compte et vos
			serveurs depuis des applications tierces.
			<br />
			La documentation de l'API est disponible sur
			<a href={API + "/docs"} class="link link-primary link-hover"
				>cette page</a
			>.
		</p>
	</div>

	<div class="w-11/12 xl:w-10/12 mt-8 overflow-x-scroll">
		<div class="w-2/5 md:w-1/3 float-left px-1">
			<a href="/account/api/new" class="btn btn-outline btn-sm"
				>Ajouter une clé d'API</a
			>
		</div>
		<div class="flex items-center w-1/3 float-right m-1 mb-4">
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
		<div class="overflow-x-scroll w-full">
			<table class="table bg-white dark:bg-gray-800 shadow-md rounded-md">
				<thead>
					<tr>
						<th>Clé d'API</th>
						<th>Nom</th>
						<th>Dernière utilisation</th>
						<th>Date de création</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{#if loaded}
						{#if error}
							<tr>
								<td colspan="4" class="text-center">
									<span
										class="text-error-content font-semibold"
									>
										<i
											class="fas fa-exclamation-circle mr-2"
										/>
										Une erreur est survenue lors du chargement
										des clés d'API.
									</span>
								</td>
							</tr>
						{/if}
						{#if apiCredentials && apiCredentials.length > 0}
							{#each apiCredentials as credential}
								{#if credential.display}
									<tr>
										<th
											class="border border-gray-200 dark:border-gray-700 px-1 md:px-4 py-x md:py-2"
										>
											<span
												class="text-gray-500 font-semibold blur-[3px] hover:blur-none transition-all duration-300 max-w-[20px] overflow-x-scroll"
											>
												{credential.key}
											</span>
										</th>
										<td
											class="border border-gray-200 dark:border-gray-700 px-1 md:px-4 py-1 md:py-2"
										>
											<span
												class="text-gray-500 font-semibold"
											>
												{#if iSearch.value.trim().length > 0 && credential.name
														.toLowerCase()
														.includes(iSearch.value.toLowerCase())}
													{#each credential.name.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
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
													{credential.name}
												{/if}
											</span>
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-1 md:px-4 py-x md:py-2"
										>
											<span
												class="text-gray-500 font-semibold"
											>
												{#if iSearch.value.trim().length > 0 && new Date(credential.updatedAt)
														.toLocaleString()
														.toLowerCase()
														.includes(iSearch.value.toLowerCase())}
													{#each new Date(credential.updatedAt)
														.toLocaleString()
														.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
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
													{new Date(
														credential.updatedAt,
													).toLocaleString()}
												{/if}
											</span>
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-1 md:px-4 py-x md:py-2"
										>
											<span
												class="text-gray-500 font-semibold"
											>
												{#if iSearch.value.trim().length > 0 && new Date(credential.createdAt)
														.toLocaleString()
														.toLowerCase()
														.includes(iSearch.value.toLowerCase())}
													{#each new Date(credential.createdAt)
														.toLocaleString()
														.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
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
													{new Date(
														credential.createdAt,
													).toLocaleString()}
												{/if}
											</span>
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-1 md:px-4 py-x md:py-2"
										>
											<button
												class="btn btn-sm btn-outline btn-error"
												on:click={() =>
													deleteKey(
														credential.key,
														credential.name,
													)}
											>
												<i class="fas fa-trash" />
											</button>
										</td>
									</tr>
								{/if}
							{/each}
						{:else}
							<tr class="h-12">
								<th
									class="border border-gray-200 dark:border-gray-700 px-1 md:px-4 py-x md:py-2"
									colspan="6"
								>
									<span
										class="text-center text-gray-500 font-semibold"
									>
										Vous n'avez aucune clé d'API.
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

	<Footer />
</div>
