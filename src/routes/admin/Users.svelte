<script lang="ts">
	import md5 from "md5";
	import CreateUserModal from "../../components/modals/CreateUserModal.svelte";
	import Error from "../../components/Error.svelte";
	import { getAllUsers } from "../../utils/user";
	import { escapeRegExp } from "../../utils/misc";
	import { CONFIG } from "../../utils/config";

	let loadTime = Date.now();
	let users: any;
	let iSearch: HTMLInputElement;
	let error = false;
	let forbidden = false;
	let loaded = false;

	(async () => {
		let usersQuery = await getAllUsers();
		if (usersQuery.error) {
			if (usersQuery.error == "FORBIDDEN") return (forbidden = true);

			error = true;
		} else {
			users = usersQuery.response.map((user: any) => {
				return {
					...user,
					display: true,
				};
			});
		}

		loaded = forbidden ? false : true;
		loadTime = Date.now() - loadTime;
	})();

	function search() {
		let search = iSearch.value.toLowerCase();
		users = users.map((user: any) => {
			if (
				user.id.toString().includes(search) ||
				user.name.toLowerCase().includes(search) ||
				user.email.toLowerCase().includes(search)
			)
				user.display = true;
			else user.display = false;
			return user;
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
		Liste des utilisateurs de {CONFIG().app.name}
	</h1>

	<div class="relative w-full xl:w-10/12 px-4 mt-8">
		<div class="w-2/5 md:w-1/3 float-left">
			{#if loaded}
				<button
					class="btn btn-outline btn-sm"
					on:click={() => eval("addModal.showModal()")}
					>Créer un utilisateur</button
				>
				<CreateUserModal {users} />
			{/if}
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
				{users.length} utilisateur{users.length > 1 ? "s" : ""} chargé{users.length >
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
						<th>Avatar</th>
						<th>Nom</th>
						<th>Courriel</th>
						<th>Flags</th>
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
										des utilisateurs.
									</span>
								</td>
							</tr>
						{/if}
						{#if users && users.length > 0}
							{#each users as user}
								{#if user.display}
									<tr
										class="hover hover:cursor-pointer h-12"
										on:click={() =>
											(location.href = `/admin/users/${user.id}`)}
									>
										<th
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											{#if iSearch.value.trim().length > 0 && user.id
													.toString()
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each user.id
													.toString()
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
												{user.id}
											{/if}
										</th>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											<img
												class="w-8 h-8 rounded-full"
												src="https://secure.gravatar.com/avatar/{md5(
													user.email
														.toLowerCase()
														.trim(),
												)}"
												alt="Avatar de {user.name}"
											/>
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
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
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
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
										</td>
										<td
											class="border border-gray-200 dark:border-gray-700 px-4 py-2"
										>
											{#if user.suspended}
												<span class="badge badge-error"
													>Suspendu</span
												>
											{/if}
											{#if user.superuser}
												<span
													class="badge badge-success"
													>Super User</span
												>
											{:else if user.admin}
												<span
													class="badge badge-warning"
													>Administrateur</span
												>
											{/if}

											{#if !user.suspended && !user.admin}
												<span
													class="badge badge-neutral"
												>
													Utilisateur
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
									colspan="7"
								>
									<span
										class="text-center text-gray-500 font-semibold"
									>
										Aucun utilisateur n'a été trouvé.
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
