<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import { getAllUsers } from "../../utils/user";
	import { getNodes } from "../../utils/node";
	import md5 from "md5";
	import { FP_DOCS_URL, GAMES } from "../../constants";
	import MinecraftJavaType from "../games/minecraft/versions/MinecraftJavaType.svelte";
	import MinecraftJavaVersion from "../games/minecraft/versions/MinecraftJavaVersion.svelte";
	import MinecraftJavaVersion2 from "../games/minecraft/versions/MinecraftJavaVersion2.svelte";
	import MinecraftJavaVersion3 from "../games/minecraft/versions/MinecraftJavaVersion3.svelte";
	import { API } from "../../utils/config";

	let iName: HTMLInputElement;
	let iOwner: HTMLInputElement;
	let iNode: HTMLInputElement;
	let iPort: HTMLInputElement;
	let iExtraPorts: HTMLInputElement;
	let iCpu: HTMLInputElement;
	let iRam: HTMLInputElement;
	let iDisk: HTMLInputElement;
	let iBackupsLimit: HTMLInputElement;
	let iGame: HTMLSelectElement;

	let minecraftJavaType: string = "vanilla";
	let minecraftJavaVersion: string;
	let minecraftJavaVersion2: string;
	let minecraftJavaVersion3: string;

	let nameError = false;
	let ownerError = false;
	let nodeError = false;
	let portError = false;
	let extraPortsError = false;
	let cpuError = false;
	let ramError = false;
	let diskError = false;
	let backupsLimitError = false;

	let submitted = false;

	let loadingToastId: any;

	let users: any[] = [];
	let nodes: any[] = [];
	let userSearchResult: any[] = [];
	let nodeSearchResult: any[] = [];
	let showUserSearch = false;
	let showNodeSearch = false;

	let loaded = false;

	(async () => {
		let usersQuery = await getAllUsers();
		if (usersQuery.error)
			toast.error(
				"Une erreur est survenue lors de la récupération des utilisateurs.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		else users = usersQuery.response;

		let nodesQuery = await getNodes();
		if (nodesQuery.error)
			toast.error(
				"Une erreur est survenue lors de la récupération des machines.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		else nodes = nodesQuery.response;

		loaded = true;
	})();

	function searchUser() {
		if (iOwner.value.length > 1)
			userSearchResult = users.filter(
				(user) =>
					user.name
						.toLowerCase()
						.includes(iOwner.value.toLowerCase()) ||
					user.email
						.toLowerCase()
						.includes(iOwner.value.toLowerCase()),
			);
		else userSearchResult = users;
		showUserSearch = true;
	}

	function searchNode() {
		if (iNode.value.length > 1)
			nodeSearchResult = nodes.filter(
				(node) =>
					node.name
						.toLowerCase()
						.includes(iNode.value.toLowerCase()) ||
					node.address
						.toLowerCase()
						.includes(iNode.value.toLowerCase()),
			);
		else nodeSearchResult = nodes;
		showNodeSearch = true;
	}

	function addServer() {
		submitted = true;

		nameError = false;
		ownerError = false;
		nodeError = false;
		portError = false;
		extraPortsError = false;
		cpuError = false;
		ramError = false;
		diskError = false;
		backupsLimitError = false;

		if (iName.value.length < 3 || iName.value.length > 32) {
			nameError = true;
			toast.error(
				"Le nom du serveur doit contenir entre 3 et 32 caractères.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}

		if (users.filter((user) => user.name === iOwner.value).length === 0) {
			ownerError = true;
			toast.error("L'utilisateur spécifié n'existe pas.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (nodes.filter((node) => node.name === iNode.value).length === 0) {
			nodeError = true;
			toast.error("La machine spécifiée n'existe pas.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (
			iPort.value.length > 0 &&
			(parseInt(iPort.value) < 3000 || parseInt(iPort.value) > 65535)
		) {
			portError = true;
			toast.error("Le port doit être compris entre 3000 et 65535.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (
			iExtraPorts.value.length > 0 &&
			(parseInt(iExtraPorts.value) < 0 ||
				parseInt(iExtraPorts.value) > 20)
		) {
			extraPortsError = true;
			toast.error(
				"Le nombre de ports supplémentaires doit être compris entre 0 et 20.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}

		if (
			iCpu.value.length === 0 ||
			parseInt(iCpu.value) < 1 ||
			parseInt(iCpu.value) > 100
		) {
			cpuError = true;
			toast.error(
				"Le nombre de coeurs doit être compris entre 1% et 100%.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}

		if (iRam.value.length === 0 || parseInt(iRam.value) < 512) {
			ramError = true;
			toast.error("La mémoire RAM doit être supérieure à 512 Mo.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (iDisk.value.length === 0 || parseInt(iDisk.value) < 1) {
			diskError = true;
			toast.error("L'espace disque doit être supérieur à 1 Go.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (
			iBackupsLimit.value.length === 0 ||
			parseInt(iBackupsLimit.value) < 0
		) {
			backupsLimitError = true;
			toast.error(
				"Le nombre de backups doit être supérieur ou égal à 0.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}

		if (
			nameError ||
			ownerError ||
			nodeError ||
			portError ||
			extraPortsError ||
			cpuError ||
			ramError ||
			diskError ||
			backupsLimitError
		) {
			return (submitted = false);
		}

		let data = {
			name: iName.value,
			owner: iOwner.value,
			node: iNode.value,
			game: {
				name: iGame.value,
				data: {
					type: minecraftJavaType,
					version: minecraftJavaVersion,
					version2: minecraftJavaVersion2,
					version3: minecraftJavaVersion3,
				},
			},
			port: parseInt(iPort.value),
			extraPorts: parseInt(iExtraPorts.value),
			cpu: parseInt(iCpu.value),
			ram: parseInt(iRam.value),
			disk: parseInt(iDisk.value),
			backupsLimit: parseInt(iBackupsLimit.value),
		};

		let timeout = setTimeout(() => {
			if (submitted) {
				loadingToastId = toast.loading(
					"Création du serveur en cours, cela peut prendre un moment...",
					{
						duration: 0,
						position: "bottom-right",
					},
				);
			}
		}, 5000);

		fetch(`${API()}/admin/servers/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify(data),
		})
			.then((res) => res.json())
			.then((res) => {
				clearTimeout(timeout);
				toast.dismiss(loadingToastId);

				if (res.status == "success") {
					toast.success("Le serveur a été créé avec succès.", {
						duration: 5000,
						position: "bottom-right",
					});
					submitted = false;
					iName.value = "";
					iOwner.value = "";
					iNode.value = "";
					iPort.value = "";
					iExtraPorts.value = "";
					iCpu.value = "";
					iRam.value = "";
					iDisk.value = "";
					showUserSearch = false;
					showNodeSearch = false;
					userSearchResult = [];
					nodeSearchResult = [];

					eval("addModal.close()");

					location.reload();
				} else {
					toast.dismiss(loadingToastId);

					if (res.error) {
						let errorMessage =
							"Une erreur est survenue lors de la création du serveur.";
						switch (res.error) {
							case "SERVER_NAME_ALREADY_EXISTS":
								errorMessage =
									"Un serveur avec ce nom existe déjà.";
								nameError = true;
								break;
							case "USER_NOT_FOUND":
								errorMessage =
									"L'utilisateur spécifié n'existe pas.";
								ownerError = true;
								break;
							case "NODE_NOT_FOUND":
								errorMessage =
									"La machine spécifiée n'existe pas.";
								nodeError = true;
								break;
							case "PORT_ALREADY_USED":
								errorMessage =
									"Le port spécifié est déjà utilisé.";
								portError = true;
								break;
							case "NOT_ENOUGH_PORTS_ON_NODE":
								errorMessage =
									"Il n'y a pas assez de ports disponibles sur la machine spécifiée.";
								portError = true;
								break;
							case "NOT_ENOUGH_CPU_ON_NODE":
								errorMessage =
									"Il n'y a pas assez de coeurs disponibles sur la machine spécifiée.";
								cpuError = true;
								break;
							case "NOT_ENOUGH_RAM_ON_NODE":
								errorMessage =
									"Il n'y a pas assez de mémoire RAM disponible sur la machine spécifiée.";
								ramError = true;
								break;
							case "NOT_ENOUGH_DISK_ON_NODE":
								errorMessage =
									"Il n'y a pas assez d'espace disque disponible sur la machine spécifiée.";
								diskError = true;
								break;
						}

						toast.error(errorMessage, {
							duration: 5000,
							position: "bottom-right",
						});
					} else {
						toast.error(
							"Une erreur est survenue lors de la création du serveur.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}

					submitted = false;
				}
			})
			.catch((err) => {
				toast.dismiss(loadingToastId);

				toast.error(
					"Une erreur est survenue lors de la création du serveur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				submitted = false;
			});
	}
</script>

<dialog id="addModal" class="modal">
	<form
		method="dialog"
		class="modal-box w-10/12 xl:w-2/3 max-w-none max-h-[90%] min-h-[60%]"
	>
		<button
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			disabled={submitted}>✕</button
		>

		{#if loaded}
			<form class="space-y-2" on:submit|preventDefault={addServer}>
				<h3 class="font-bold text-lg">Créer un serveur</h3>
				<p class="text-gray-500">
					Vous pouvez créer un serveur en remplissant le formulaire
					ci-dessous.
				</p>
				<p class="text-gray-500 text-sm">
					Les champs marqués d'un <span class="text-red-500">*</span> sont
					facultatifs.
				</p>
				<div class="flex flex-col xl:flex-row space-x-2 space-y-2">
					<div class="flex flex-col space-y-2 xl:w-1/3">
						<h2 class="font-bold text-lg">
							Informations générales
						</h2>

						<div class="form-control">
							<label class="label" for="name"
								><span class="label-text">Nom</span></label
							>
							<input
								type="text"
								id="name"
								bind:this={iName}
								class="input input-bordered input-sm"
								class:input-error={nameError}
								placeholder="Nom du serveur"
								minlength="3"
								required
							/>
						</div>
						<div class="form-control">
							<label class="label" for="owner"
								><span class="label-text">Propriétaire</span
								></label
							>

							<div class="dropdown w-full">
								<label tabindex="-1" class="block w-full">
									<input
										type="text"
										id="owner"
										bind:this={iOwner}
										on:click={searchUser}
										on:input={searchUser}
										class="input input-bordered input-sm w-full"
										class:input-error={ownerError}
										placeholder="Tapez pour rechercher..."
										autocomplete="off"
										required
									/></label
								>
								<ul
									tabindex="-1"
									class="dropdown-content z-[1] menu p-2 shadow bg-base-100 border border-gray-300 dark:border-gray-700 rounded-box w-fit"
									class:hidden={!showUserSearch}
								>
									{#if iOwner}
										{#if userSearchResult.length === 0}
											<li class="p-2">Aucun résultat</li>
										{:else}
											<span class="text-gray-500 text-sm">
												{#if iOwner.value.length < 2}
													Saisissez au moins 2
													caractères pour rechercher
												{:else}
													{userSearchResult.length} résultat
													{#if userSearchResult.length > 1}
														s
													{/if}
												{/if}
											</span>
											<div class="divider m-0" />
											<div
												class="flex flex-col overflow-y-auto"
												style="max-height: 200px;"
											>
												{#each userSearchResult as user}
													<li>
														<!-- svelte-ignore a11y-no-static-element-interactions -->
														<div
															class="cursor-pointer"
															on:click={() => {
																iOwner.value =
																	user.name;
																showUserSearch = false;
															}}
															on:keypress={(
																event,
															) => {
																if (
																	event.key ===
																	"Enter"
																) {
																	iOwner.value =
																		user.name;
																	showUserSearch = false;
																}
															}}
														>
															<img
																class="w-8 h-8 min-w-[2rem] rounded-full max-xl:hidden"
																src="https://secure.gravatar.com/avatar/{md5(
																	user.email
																		.toLowerCase()
																		.trim(),
																)}"
																alt="Avatar"
															/>
															<div
																class="flex flex-col items-start ml-1"
															>
																{user.name}
																<span
																	class="text-gray-500 text-sm -mt-1"
																	>{user.email}</span
																>
															</div>
														</div>
													</li>
												{/each}
											</div>
										{/if}
									{/if}
								</ul>
							</div>
						</div>
						<div class="form-control">
							<label class="label" for="node"
								><span class="label-text">Machine</span></label
							>

							<div class="dropdown w-full">
								<label tabindex="-1" class="block w-full">
									<input
										type="text"
										id="node"
										bind:this={iNode}
										on:click={searchNode}
										on:input={searchNode}
										class="input input-bordered input-sm w-full"
										class:input-error={nodeError}
										placeholder="Tapez pour rechercher..."
										autocomplete="off"
										required
									/></label
								>
								<ul
									tabindex="-1"
									class="dropdown-content z-[1] menu p-2 shadow bg-base-100 border border-gray-300 dark:border-gray-700 rounded-box w-fit"
									class:hidden={!showNodeSearch}
								>
									{#if iNode}
										{#if nodeSearchResult.length === 0}
											<li class="p-2">Aucun résultat</li>
										{:else}
											<span class="text-gray-500 text-sm">
												{#if iNode.value.length < 2}
													Saisissez au moins 2
													caractères pour rechercher
												{:else}
													{nodeSearchResult.length} résultat
													{#if nodeSearchResult.length > 1}
														s
													{/if}
												{/if}
											</span>
											<div class="divider m-0" />
											<div
												class="flex flex-col overflow-y-auto"
												style="max-height: 200px;"
											>
												{#each nodeSearchResult as node}
													<li>
														<!-- svelte-ignore a11y-no-static-element-interactions -->
														<div
															class="cursor-pointer"
															on:click={() => {
																iNode.value =
																	node.name;
																showNodeSearch = false;
															}}
															on:keypress={(
																event,
															) => {
																if (
																	event.key ===
																	"Enter"
																) {
																	iNode.value =
																		node.name;
																	showNodeSearch = false;
																}
															}}
														>
															<div
																class="flex flex-col items-start ml-1"
															>
																{node.name}
																<span
																	class="text-gray-500 text-sm -mt-1"
																	>{node.address}</span
																>
															</div>
														</div>
													</li>
												{/each}
											</div>
										{/if}
									{/if}
								</ul>
							</div>
						</div>
					</div>
					<div class="divider xl:divider-horizontal" />
					<div class="flex flex-col space-y-2 xl:w-1/3">
						<h2 class="font-bold text-lg">Réseau</h2>

						<div class="form-control">
							<label class="label" for="port"
								><span class="label-text"
									>Port <span class="text-red-500">*</span
									></span
								></label
							>
							<input
								type="number"
								id="port"
								bind:this={iPort}
								class="input input-bordered input-sm"
								class:input-error={portError}
								placeholder="ex: 25565"
								min="3000"
								max="65535"
							/>
							<span class="text-gray-500 text-xs mt-1">
								Laissez ce champ vide pour choisir un port
								aléatoire
							</span>
						</div>
						<div class="form-control">
							<label class="label" for="extraPorts"
								><span class="label-text"
									>Ports supplémentaires
								</span></label
							>
							<br />
							<input
								type="number"
								id="extraPorts"
								bind:this={iExtraPorts}
								class="input input-bordered input-sm"
								class:input-error={extraPortsError}
								placeholder="ex: 10"
								min="0"
								max="20"
							/>
							<span class="text-gray-500 text-xs mt-1">
								Entrez le nombre de ports supplémentaires à
								allouer à ce serveur
							</span>
						</div>
					</div>
					<div class="divider xl:divider-horizontal" />
					<div class="flex flex-col space-y-2 xl:w-1/3">
						<h2 class="font-bold text-lg">Ressources</h2>

						<div class="form-control">
							<label class="label" for="cpu"
								><span class="label-text">CPU Shares</span
								></label
							>

							<label class="input-group">
								<input
									type="number"
									id="cpu"
									bind:this={iCpu}
									class="input input-bordered input-sm"
									class:input-error={cpuError}
									placeholder="ex: 25"
									min="1"
									max="100"
									required
								/>
								<span>%</span>
							</label>
							<span class="text-gray-500 text-xs mt-1">
								Entrez la quantité de processeur à allouer (voir
								{FP_DOCS_URL}/servers/cpu-shares)
							</span>
						</div>

						<div class="form-control">
							<label class="label" for="ram"
								><span class="label-text">Mémoire RAM</span
								></label
							>

							<label class="input-group">
								<input
									type="number"
									id="ram"
									bind:this={iRam}
									class="input input-bordered input-sm w-full"
									class:input-error={ramError}
									placeholder="ex: 1024"
									min="512"
									required
								/>
								<span>Mo</span>
							</label>
						</div>

						<div class="form-control">
							<label class="label" for="disk"
								><span class="label-text"
									>Espace disque
								</span></label
							>

							<label class="input-group">
								<input
									type="number"
									id="disk"
									bind:this={iDisk}
									class="input input-bordered input-sm w-full"
									class:input-error={diskError}
									placeholder="ex: 10"
									min="1"
									required
								/>
								<span>Go</span>
							</label>
						</div>

						<div class="form-control">
							<label class="label" for="backupsLimit"
								><span class="label-text"
									>Nb. de backups
								</span></label
							>

							<input
								type="number"
								id="backupsLimit"
								bind:this={iBackupsLimit}
								class="input input-bordered input-sm w-full"
								class:input-error={backupsLimitError}
								placeholder="ex: 10"
								min="0"
								required
							/>
							<span class="text-gray-500 text-xs mt-1">
								Entrez le nombre de backups maximum que peut
								avoir ce serveur.
							</span>
						</div>
					</div>
				</div>
				<div class="divider" />
				<div class="flex flex-col space-y-2">
					<h2 class="font-bold text-lg">Configuration du jeu</h2>

					<div class="flex flex-row flex-wrap space-x-2">
						<div class="form-control">
							<label class="label" for="game"
								><span class="label-text">Jeu</span></label
							>
							<select
								id="game"
								bind:this={iGame}
								class="select select-bordered w-full max-w-xs"
							>
								{#each Object.values(GAMES) as game}
									<option value={game.id}>
										{game.name}
									</option>
								{/each}
							</select>
						</div>

						{#if iGame}
							{#if iGame.value === "minecraft"}
								<MinecraftJavaType bind:minecraftJavaType />

								{#key minecraftJavaType}
									<MinecraftJavaVersion
										type={minecraftJavaType}
										on:change={(event) =>
											(minecraftJavaVersion =
												event.detail)}
										on:versions={(event) => {
											minecraftJavaVersion =
												event.detail[0];
										}}
										name={minecraftJavaType == "bungeecord"
											? "BungeeCord"
											: "Minecraft"}
									/>

									{#key minecraftJavaVersion}
										{#if ["paper", "forge", "fabric", "mohist", "purpur"].includes(minecraftJavaType)}
											<MinecraftJavaVersion2
												type={minecraftJavaType}
												version={minecraftJavaVersion}
												on:change={(event) =>
													(minecraftJavaVersion2 =
														event.detail)}
												on:versions={(event) => {
													minecraftJavaVersion2 =
														event.detail[0];
												}}
												name={minecraftJavaType ==
												"fabric"
													? "Fabric Loader"
													: minecraftJavaType}
											/>

											{#key minecraftJavaVersion2}
												{#if ["fabric"].includes(minecraftJavaType)}
													<MinecraftJavaVersion3
														type={minecraftJavaType}
														version={minecraftJavaVersion}
														version2={minecraftJavaVersion2}
														on:change={(event) =>
															(minecraftJavaVersion3 =
																event.detail)}
														on:versions={(
															event,
														) => {
															minecraftJavaVersion3 =
																event.detail[0];
														}}
														name={minecraftJavaType ==
														"fabric"
															? "Fabric Installer"
															: minecraftJavaType}
													/>
												{/if}
											{/key}
										{/if}
									{/key}
								{/key}
							{/if}
						{/if}
					</div>
				</div>

				<div class="mt-5">
					<input
						type="submit"
						value="Créer le serveur"
						class="btn btn-primary btn-wide float-right"
						disabled={submitted}
					/>
				</div>
			</form>
		{:else}
			<div class="flex flex-col items-center justify-center space-y-2">
				<span class="loading loading-spinner loading-lg" />
			</div>
		{/if}
	</form>

	<Toaster />
</dialog>
