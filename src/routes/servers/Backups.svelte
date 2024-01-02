<script lang="ts">
	import toast from "svelte-french-toast";
	import { escapeRegExp, formatOct } from "../../utils/misc";
	import CreateBackupModal from "../../components/modals/CreateBackupModal.svelte";
	import { io } from "socket.io-client";
	import { API, CONFIG } from "../../utils/config";

	export let server: any;

	let backups: any;
	let iSearch: HTMLInputElement;
	let sBackupDelete: HTMLSpanElement;
	let sBackupRestore: HTMLSpanElement;
	let error = false;
	let loaded = false;

	let socket = io(CONFIG().app.url, {
		auth: {
			token: sessionStorage.getItem("token"),
		},
	});

	socket.emit("servers/connect", server.serverId);

	socket.on("servers/backups", (res: any) => {
		if (res.status === "success") {
			backups.find((b: any) => b.id === res.data.backup).status =
				res.data.status;
			backups = [...backups];
		}
	});

	(async () => {
		await fetch(`${API()}/servers/${server.serverId}/backups`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					backups = res.data;
					backups = backups.map((backup: any) => {
						backup.display = true;
						return backup;
					});
				} else {
					error = true;
				}
			})
			.catch(() => {
				error = true;
			});

		console.log(backups);

		loaded = true;
	})();

	async function deleteBackup(backup: any, confirm = false) {
		if (!confirm) {
			if (!backup?.id || !backup?.name) return;

			sBackupDelete.innerText = backup.name;
			sBackupDelete.dataset.backup = backup.id;

			eval("deleteBackupModal.showModal()");
			return;
		}

		if (typeof backup !== "string") return;

		fetch(`${API()}/servers/${server.serverId}/backups`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				id: parseInt(backup),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					backups = backups.filter(
						(u: any) => u.id !== parseInt(backup),
					);
					toast.success("La sauvegarde a été supprimée.", {
						duration: 5000,
						position: "bottom-right",
					});
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

	async function restoreBackup(backup: any, confirm = false) {
		if (!confirm) {
			if (!backup?.id || !backup?.name) return;

			sBackupRestore.innerText = backup.name;
			sBackupRestore.dataset.backup = backup.id;

			eval("restoreBackupModal.showModal()");
			return;
		}

		if (typeof backup !== "string") return;

		fetch(`${API()}/servers/${server.serverId}/backups/restore`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				id: parseInt(backup),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "pending") {
					toast.success(
						"La sauvegarde est en cours de restauration...",
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
		backups = backups.map((backup: any) => {
			if (
				backup.name.toLowerCase().includes(search) ||
				backup.email.toLowerCase().includes(search) ||
				new Date(backup.createdAt)
					.toLocaleString()
					.toLowerCase()
					.includes(search)
			)
				backup.display = true;
			else backup.display = false;
			return backup;
		});
	}
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Sauvegardes</h1>

<div class="w-11/12 xl:w-10/12 mt-8">
	<p class="text-center">
		Sauvegardez votre serveur en un clic. Revenez à n'importe quel moment à
		une version antérieure.
	</p>
</div>

<div class="w-11/12 xl:w-10/12 mt-8 overflow-x-scroll">
	<div class="w-2/5 md:w-1/3 float-left px-1">
		<button
			on:click={() => eval("createBackupModal.showModal()")}
			class="btn btn-outline btn-sm"
			disabled={!loaded ||
				(backups && backups.length >= server.backupsLimit)}
			data-t>Créer une sauvegarde</button
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
		<dialog id="deleteBackupModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<div class="space-y-2">
					<h3 class="font-normal text-lg">
						Supprimer la sauvegarde <span
							class="font-bold"
							data-backup=""
							bind:this={sBackupDelete}
						></span>&nbsp;?
					</h3>
					<p class="text-sm">
						Êtes-vous sûr de vouloir supprimer cette
						sauvegarde&nbsp;?
					</p>
				</div>

				<div class="modal-action flex justify-end space-x-2">
					<button
						class="btn btn-error btn-outline"
						on:click={() =>
							deleteBackup(sBackupDelete.dataset.backup, true)}
					>
						Supprimer
					</button>
					<button class="btn">Annuler</button>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>Fermer</button>
			</form>
		</dialog>

		<dialog id="restoreBackupModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<div class="space-y-2">
					<h3 class="font-normal text-lg">
						Restaurer la sauvegarde <span
							class="font-bold"
							data-backup=""
							bind:this={sBackupRestore}
						></span>&nbsp;?
					</h3>
					<p class="text-sm">
						En restaurant cette sauvegarde, vous perdrez toutes les
						données actuelles de votre serveur.
					</p>
				</div>

				<div class="modal-action flex justify-end space-x-2">
					<button
						class="btn btn-warning btn-outline"
						on:click={() =>
							restoreBackup(sBackupRestore.dataset.backup, true)}
					>
						Restaurer
					</button>
					<button class="btn">Annuler</button>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>Fermer</button>
			</form>
		</dialog>

		<CreateBackupModal serverId={server.serverId} {backups} />

		{#if backups && backups.length > 0}
			{#each backups as backup}
				{#if backup.display}
					<div class="w-full float-left my-4">
						<div
							class="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between dark:bg-gray-800"
						>
							<div class="flex flex-row items-center">
								<div class="ml-4">
									<h2
										class="text-lg font-semibold dark:text-white"
									>
										{#if iSearch.value.trim().length > 0 && backup.name
												.toLowerCase()
												.includes(iSearch.value.toLowerCase())}
											{#each backup.name.split(new RegExp(`(${escapeRegExp(iSearch.value)})`, "ig")) as part}
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
											{backup.name}
										{/if}

										<span
											class="badge badge-outline badge-sm ml-2"
											class:hidden={backup.status ===
												"success"}
											class:badge-error={backup.status ===
												"error"}
										>
											{#if backup.status === "success"}
												<i class="fas fa-check" />
												<span class="ml-1"
													>Terminée</span
												>
											{:else if backup.status === "error"}
												<i class="fas fa-times" />
												<span class="ml-1">Erreur</span>
											{:else}
												<i
													class="fas fa-spinner fa-spin"
												/>
												<span class="ml-1"
													>En cours</span
												>
											{/if}
										</span>
									</h2>
								</div>
							</div>

							<div class="flex flex-row items-center mr-4">
								{#if backup.status === "in_progress"}
									<div class="flex-shrink-0 max-xl:hidden">
										<p
											class="text-gray-600 dark:text-gray-400 text-sm -mb-2"
										>
											Sauvegarde en cours...
										</p>
										<progress class="progress" />
									</div>
								{:else if backup.status === "error"}
									<div class="flex-shrink-0 max-xl:hidden">
										<p
											class="text-red-600 dark:text-red-400"
										>
											Une erreur est survenue lors de la
											création de la sauvegarde.
										</p>
									</div>
									<div class="flex flex-row ml-3">
										<button
											on:click={() =>
												deleteBackup(backup)}
											class="btn btn-error sm:btn-ghost btn-sm"
										>
											<i class="fas fa-trash" />
											<span class="sm:hidden">
												Supprimer
											</span>
										</button>
									</div>
								{:else}
									<div
										class="flex-shrink-0 max-xl:hidden mr-2"
									>
										<p
											class="text-gray-600 dark:text-gray-400 text-sm"
										>
											{formatOct(backup.size, 2, 1000)}
										</p>
									</div>
									<div class="flex-shrink-0 max-xl:hidden">
										<p
											class="text-gray-600 dark:text-gray-400"
										>
											{#if iSearch.value.trim().length > 0 && new Date(backup.createdAt)
													.toLocaleString()
													.toLowerCase()
													.includes(iSearch.value.toLowerCase())}
												{#each new Date(backup.createdAt)
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
													backup.createdAt,
												).toLocaleString()}
											{/if}
										</p>
									</div>
									<div class="flex flex-row ml-3">
										<button
											class="btn max-sm:btn-outline sm:btn-ghost btn-sm mr-1"
											on:click={() =>
												restoreBackup(backup)}
										>
											<i class="fas fa-rotate-left" />
											<span class="sm:hidden">
												Restaurer
											</span>
										</button>
										<button
											on:click={() =>
												deleteBackup(backup)}
											class="btn btn-error sm:btn-ghost btn-sm"
										>
											<i class="fas fa-trash" />
											<span class="sm:hidden">
												Supprimer
											</span>
										</button>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			{/each}
			<p class="text-lg float-right mt-4">
				{backups.length} / {server.backupsLimit}
				{#if server.backupsLimit === 0}sauvegarde{:else}sauvegardes{/if}
			</p>
		{:else if error}
			<p class="text-center mt-4">
				Une erreur est survenue lors du chargement des sauvegardes.
			</p>
		{:else}
			<p class="text-center mt-4">Aucune sauvegarde trouvée.</p>
		{/if}
	{:else}
		<div class="flex flex-col items-center justify-center mt-5">
			<span class="loading loading-spinner loading-lg" />
		</div>
	{/if}
</div>
