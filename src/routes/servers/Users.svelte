<script lang="ts">
	import md5 from "md5";
	import { escapeRegExp } from "../../utils/misc";
	import { getSubusers } from "../../utils/subusers";
	import NewUser from "./NewUser.svelte";
	import EditUser from "./EditUser.svelte";
	import toast from "svelte-french-toast";
	import { API } from "../../utils/config";

	export let server: any;
	export let extra: any;

	let users: any;
	let iSearch: HTMLInputElement;
	let sUser: HTMLSpanElement;
	let error = false;
	let loaded = false;

	(async () => {
		let usersQuery = await getSubusers(server.serverId);
		if (usersQuery.error) error = true;
		else
			usersQuery = usersQuery.response.map((user: any) => {
				return {
					...user,
					display: true,
				};
			});

		users = usersQuery;

		loaded = true;
	})();

	async function deleteUser(user: any, confirm = false) {
		if (!confirm) {
			if (!user?.id || !user?.name) return;

			sUser.innerText = user.name;
			sUser.dataset.user = user.id;

			eval("deleteUserModal.showModal()");
			return;
		}

		if (typeof user !== "string") return;

		fetch(`${API()}/servers/${server.serverId}/users`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				id: parseInt(user),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					users = users.filter((u: any) => u.id !== parseInt(user));
					toast.success(
						"Les accès de cet utilisateur ont été révoqués avec succès.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				} else {
					toast.error("Une erreur est survenue.", {
						duration: 5000,
						position: "bottom-right",
					});
				}
			})
			.catch(() => {
				toast.error("Une erreur est survenue.", {
					duration: 5000,
					position: "bottom-right",
				});
			});
	}

	function search() {
		let search = iSearch.value.toLowerCase();
		users = users.map((user: any) => {
			if (
				user.name.toLowerCase().includes(search) ||
				user.email.toLowerCase().includes(search) ||
				new Date(user.createdAt)
					.toLocaleString()
					.toLowerCase()
					.includes(search)
			)
				user.display = true;
			else user.display = false;
			return user;
		});
	}
</script>

{#if extra === "new"}
	{#if loaded}
		<NewUser {server} {users} />
	{:else}
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
		>
			<span class="loading loading-spinner loading-lg" />
		</div>
	{/if}
{:else if extra && extra.length > 0}
	{#if loaded}
		<EditUser {server} {users} {extra} />
	{:else}
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
		>
			<span class="loading loading-spinner loading-lg" />
		</div>
	{/if}
{:else}
	<h1 class="text-3xl font-semibold text-center mt-10">Utilisateurs</h1>

	<div class="w-11/12 xl:w-10/12 mt-8">
		<p class="text-center">
			Invitez d'autres utilisateurs à accéder à votre serveur. Vous pouvez
			également leur donner des permissions spécifiques.
		</p>
	</div>

	<div class="w-11/12 xl:w-10/12 mt-8 overflow-x-scroll">
		<div class="w-2/5 md:w-1/3 float-left px-1">
			<a
				href="/servers/{server.serverId}/users/new"
				class="btn btn-outline btn-sm">Ajouter un utilisateur</a
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

		<div class="clear-both" />

		{#if loaded}
			<dialog id="deleteUserModal" class="modal">
				<form method="dialog" class="modal-box">
					<button
						class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
						>✕</button
					>

					<div class="space-y-2">
						<h3 class="font-bold text-lg">
							Révoquer l'accès de <span
								data-user=""
								bind:this={sUser}>cet utilisateur</span
							>&nbsp;?
						</h3>
						<p class="text-sm">
							Êtes-vous sûr de vouloir révoquer l'accès de cet
							utilisateur à ce serveur&nbsp;?
						</p>
					</div>

					<div class="modal-action flex justify-end space-x-2">
						<button
							class="btn btn-error btn-outline"
							on:click={() =>
								deleteUser(sUser.dataset.user, true)}
						>
							Révoquer l'accès
						</button>
						<button class="btn">Annuler</button>
					</div>
				</form>

				<form method="dialog" class="modal-backdrop">
					<button>Fermer</button>
				</form>
			</dialog>

			{#if users && users.length > 0}
				{#each users as user}
					{#if user.display}
						<div class="w-full float-left my-4">
							<div
								class="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between dark:bg-gray-800"
							>
								<div class="flex flex-row items-center">
									<div class="flex-shrink-0">
										<img
											class="rounded-full w-12 h-12 md:w-16 md:h-16 object-cover"
											src="https://secure.gravatar.com/avatar/{md5(
												user.email.toLowerCase().trim(),
											)}"
											alt="User avatar"
										/>
									</div>
									<div class="ml-4">
										<h2
											class="text-lg font-semibold dark:text-white"
										>
											{#if iSearch.value.trim().length > 0 && user.name
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each user.name.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
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
												{user.name}
											{/if}
										</h2>
										<p
											class="text-gray-600 dark:text-gray-400 break-all"
										>
											{#if iSearch.value.trim().length > 0 && user.email
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each user.email.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
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
												{user.email}
											{/if}
										</p>
									</div>
								</div>
								<div
									class="flex flex-row items-center max-sm:w-full max-sm:mt-4 sm:pl-4"
								>
									<div class="flex-shrink-0 max-xl:hidden">
										<p
											class="text-gray-600 dark:text-gray-400"
										>
											{#if iSearch.value.trim().length > 0 && new Date(user.createdAt)
													.toLocaleString()
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each new Date(user.createdAt)
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
													user.createdAt,
												).toLocaleString()}
											{/if}
										</p>
									</div>
									<div class="flex flex-row ml-3">
										<button
											on:click={() =>
												(window.location.href = `/servers/${server.serverId}/users/${user.id}`)}
											class="btn max-sm:btn-outline sm:btn-ghost btn-sm mr-1"
										>
											<i class="fas fa-pen" />
											<span class="sm:hidden">
												Modifier
											</span>
										</button>
										<button
											on:click={() => deleteUser(user)}
											class="btn btn-error sm:btn-ghost btn-sm"
										>
											<i class="fas fa-trash" />
											<span class="sm:hidden">
												Révoquer
											</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			{:else if error}
				<p class="text-center mt-4">
					Une erreur est survenue lors du chargement des utilisateurs.
				</p>
			{:else}
				<p class="text-center mt-4">Aucun utilisateur trouvé.</p>
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center mt-5">
				<span class="loading loading-spinner loading-lg" />
			</div>
		{/if}
	</div>
{/if}
