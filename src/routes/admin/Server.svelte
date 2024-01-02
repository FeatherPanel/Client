<script lang="ts">
	import md5 from "md5";
	import Error from "../../components/Error.svelte";
	import { getNode } from "../../utils/node";
	import { getServer, serverStatus } from "../../utils/server";
	import { getUserFromId } from "../../utils/user";
	import { formatOct } from "../../utils/misc";
	import toast, { Toaster } from "svelte-french-toast";
	import { API } from "../../utils/config";

	export let id: any;

	let server: any;
	let owner: any;
	let node: any;
	let error = false;
	let forbidden = false;
	let loaded = false;

	let iStartCommand: HTMLInputElement;
	let iContainerId: HTMLInputElement;

	(async () => {
		let serverQuery = await getServer(id, sessionStorage.getItem("token"));
		console.log(serverQuery);
		if (serverQuery.error) {
			if (serverQuery.error == "SERVER_NOT_FOUND") return history.back();
			else if (serverQuery.error == "FORBIDDEN")
				return (forbidden = true);

			error = true;
		} else {
			server = serverQuery.response;
		}

		let ownerQuery = await getUserFromId(serverQuery.response.ownerId);
		if (ownerQuery.error) {
			if (ownerQuery.error == "USER_NOT_FOUND") return history.back();
			else if (ownerQuery.error == "FORBIDDEN") return (forbidden = true);

			error = true;
		} else {
			owner = ownerQuery.response;
		}

		let nodeQuery = await getNode(serverQuery.response.nodeId);
		if (nodeQuery.error) {
			if (nodeQuery.error == "NODE_NOT_FOUND") return history.back();
			else if (nodeQuery.error == "FORBIDDEN") return (forbidden = true);

			error = true;
		} else {
			node = nodeQuery.response;
		}

		loaded = true;
	})();

	function inputChange(key: string, input: HTMLInputElement) {
		if (input.value == server[key]) {
			input.classList.remove("input-primary");
			input.parentElement
				?.querySelector(".btn")
				?.classList.add("btn-disabled");
			input.parentElement
				?.querySelector(".fa-save")
				?.classList.remove("text-primary");
		} else {
			input.classList.add("input-primary");
			input.parentElement
				?.querySelector(".btn")
				?.classList.remove("btn-disabled");
			input.parentElement
				?.querySelector(".fa-save")
				?.classList.add("text-primary");
		}
	}

	async function edit(key: string, input: HTMLInputElement) {
		await fetch(`${API()}/admin/servers/edit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				serverId: server.serverId,
				[key]: input.value,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					server[key] = input.value;

					input.classList.remove("input-primary");
					input.parentElement
						?.querySelector(".btn")
						?.classList.add("btn-disabled");
					input.parentElement
						?.querySelector(".fa-save")
						?.classList.remove("text-primary");
				} else {
					toast.error(
						"Une erreur est survenue lors de la modification du serveur.",
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
					"Une erreur est survenue lors de la modification du serveur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	async function suspendServer() {
		await fetch(`${API()}/admin/servers/suspend`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				serverId: server.serverId,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					toast.success("Le serveur a été suspendu.", {
						duration: 5000,
						position: "bottom-right",
					});
					location.reload();
				} else {
					toast.error(
						"Une erreur est survenue lors de la suspension du serveur.",
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
					"Une erreur est survenue lors de la suspension du serveur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	async function unsuspendServer() {
		await fetch(`${API()}/admin/servers/unsuspend`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				serverId: server.serverId,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					toast.success("Le serveur a été réactivé.", {
						duration: 5000,
						position: "bottom-right",
					});
					location.reload();
				} else {
					toast.error(
						"Une erreur est survenue lors de la réactivation du serveur.",
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
					"Une erreur est survenue lors de la réactivation du serveur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	async function deleteServer() {
		let deleteToastId = toast.loading("Suppression du serveur...", {
			duration: 0,
			position: "bottom-right",
		});

		await fetch(`${API()}/admin/servers/delete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				serverId: server.serverId,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				toast.dismiss(deleteToastId);

				if (res.status == "success") {
					toast.success(
						"Le serveur a été supprimé de la base de données.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
					location.href = "/admin/servers";
				} else {
					toast.error(
						"Une erreur est survenue lors de la supression du serveur.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.dismiss(deleteToastId);
				toast.error(
					"Une erreur est survenue lors de la supression du serveur.",
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
		<Error
			code="500"
			message="Une erreur interne est survenue.<br/>Veuillez réessayer plus tard."
		/>
	{:else}
		<h1 class="text-3xl font-semibold text-center mt-10">
			<div
				class="tooltip md:tooltip-left mr-2"
				data-tip={serverStatus[server.status].display}
			>
				<i
					class="fas fa-dot-circle text-{serverStatus[server.status]
						.color}"
				/>
			</div>
			{server.name}
		</h1>
		<span class="badge badge-neutral">
			#{server.serverId}
		</span>

		{#if server.suspended}
			<div class="flex alert alert-error mt-5 w-1/2">
				<div class="flex flex-col items-center justify-between mx-auto">
					<span class="font-semibold">Serveur suspendu</span>
					<p class="text-sm">
						Ce serveur a été suspendu par un administrateur.
					</p>

					<button
						class="btn btn-ghost btn-sm mt-5"
						on:click={unsuspendServer}
					>
						<i class="fas fa-play mr-2" /> Réactiver
					</button>
				</div>
			</div>
		{/if}

		<div
			class="flex flex-col flex-wrap items-center justify-center xl:flex-row mt-10 w-8/12"
		>
			<button
				class="card card-side bg-base-100 m-5 px-5 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
				on:click={() => (location.href = `/admin/users/${owner.id}`)}
				on:keypress={(e) => {
					if (e.key == "Enter")
						location.href = `/admin/users/${owner.id}`;
				}}
			>
				<figure>
					<img
						class="rounded-lg shadow-lg w-14 h-14"
						src="https://secure.gravatar.com/avatar/{md5(
							owner.email.toLowerCase().trim(),
						)}"
						alt="Avatar de {owner.name}"
					/>
				</figure>
				<div class="card-body p-5">
					<h2 class="card-title">Propriétaire</h2>
					<p>
						{owner.name} <br />
						{owner.email}
					</p>
				</div>
			</button>

			<button
				class="card card-side bg-base-100 m-5 px-5 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
				on:click={() => (location.href = `/admin/nodes/${node.id}`)}
				on:keypress={(e) => {
					if (e.key == "Enter")
						location.href = `/admin/nodes/${node.id}`;
				}}
			>
				<figure class="flex justify-center items-center">
					<i class="fas fa-network-wired h-fit text-6xl" />
				</figure>
				<div class="card-body p-5">
					<h2 class="card-title">Machine</h2>
					<p>
						{node.name} <br />
						{node.address}
					</p>
				</div>
			</button>
		</div>

		<div class="w-11/12 xl:w-8/12 mx-auto mt-10">
			<div class="card bg-base-100 w-full shadow-xl">
				<div class="card-body flex flex-col">
					<div class="flex flex-row">
						<figure
							class="flex justify-center items-center w-0 md:w-1/12"
						>
							<img
								src="/assets/games/{server.game}-icon.png"
								class="w-16 max-md:hidden"
								alt="{server.game.charAt(0).toUpperCase() +
									server.game.slice(1)} icon"
							/>
						</figure>
						<div class="flex flex-col w-11/12">
							<span class="text-2xl font-semibold ml-5">
								{server.game.charAt(0).toUpperCase() +
									server.game.slice(1)}
							</span>
							<span class="flex flex-row text-sm ml-5 mt-2">
								<span class="font-semibold"
									>Commande de démarrage&nbsp;:</span
								>
								<input
									type="text"
									bind:this={iStartCommand}
									on:change={() =>
										inputChange(
											"startCommand",
											iStartCommand,
										)}
									on:keyup={() =>
										inputChange(
											"startCommand",
											iStartCommand,
										)}
									class="input input-sm w-full"
									value={server.startCommand}
								/>
								<button
									class="btn btn-ghost btn-sm ml-2 btn-disabled"
									on:click={() =>
										edit("startCommand", iStartCommand)}
								>
									<i class="fas fa-save" />
								</button>
							</span>
							<span class="flex text-sm ml-5 mt-2">
								<span class="font-semibold"
									>Conteneur Docker&nbsp;:</span
								>
								<input
									type="text"
									bind:this={iContainerId}
									on:change={() =>
										inputChange(
											"containerId",
											iContainerId,
										)}
									on:keyup={() =>
										inputChange(
											"containerId",
											iContainerId,
										)}
									class="input input-sm w-full"
									value={server.containerId}
								/>
								<button
									class="btn btn-ghost btn-sm ml-2 btn-disabled"
									on:click={() =>
										edit("containerId", iContainerId)}
								>
									<i class="fas fa-save" />
								</button>
							</span>
						</div>
					</div>
					<div class="divider my-2" />
					<div class="flex flex-row">
						<figure
							class="flex justify-center items-center w-0 md:w-1/12"
						>
							<i
								class="fas fa-microchip text-5xl xl:text-6xl w-16 max-md:hidden"
							/>
						</figure>
						<div class="flex flex-col w-auto">
							<span class="text-2xl font-semibold ml-5">
								Ressources
							</span>
							<span class="text-sm ml-5 mt-2">
								<span class="font-semibold"
									>Mémoire RAM&nbsp;:</span
								>
								<span class="font-mono">
									{(
										(server.ramUsage / server.ramLimit) *
										100
									).toFixed(0)}% ({formatOct(server.ramUsage)}
									/ {formatOct(server.ramLimit)})
								</span>
							</span>
							<span class="text-sm ml-5 mt-2">
								<span class="font-semibold">CPU&nbsp;:</span>
								<span class="font-mono">
									{server.cpuUsage}% (CPU Shares: {server.cpuShares})
								</span>
							</span>
							<span class="text-sm ml-5 mt-2">
								<span class="font-semibold">Disque&nbsp;:</span>
								<span class="font-mono">
									{(
										(server.diskUsage / server.diskLimit) *
										100
									).toFixed(0)}% ({formatOct(
										server.diskUsage,
									)} / {formatOct(server.diskLimit)})
								</span>
							</span>
						</div>
					</div>
					<div class="divider my-2" />
					<div class="flex flex-row">
						<figure
							class="flex justify-center items-center w-0 md:w-1/12"
						>
							<i
								class="fas fa-chart-network text-4xl xl:text-5xl max-md:hidden"
							/>
						</figure>
						<div class="flex flex-col w-11/12">
							<span class="text-2xl font-semibold ml-5">
								Réseau
							</span>
							<span class="text-sm ml-5 mt-2">
								<span class="font-semibold"
									>Adresse de connexion&nbsp;:</span
								>
								<span class="font-mono">
									{node.address}:{server.port}
								</span>
							</span>
							<span
								class="flex flex-row flex-wrap text-sm ml-5 mt-2"
							>
								<span class="font-semibold"
									>Ports supplémentaires&nbsp;:</span
								>
								{#each server.extraPorts.split(",") as port}
									<span class="font-mono break-words ml-2">
										{port}
									</span>
								{/each}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ACTION BUTTONS -->
		<div class="flex flex-wrap flex-row justify-center my-10">
			<button
				class="btn btn-primary m-3"
				on:click={() => (location.href = `/servers/${server.serverId}`)}
			>
				<i class="fas fa-tasks mr-2" />
				<span>Gérer le serveur</span>
			</button>
			{#if !server.suspended}
				<button
					class="btn btn-warning m-3"
					on:click={() => eval("suspendModal.showModal()")}
				>
					<i class="fas fa-pause mr-2" />
					<span>Suspendre le serveur</span>
				</button>
			{/if}
			<button
				class="btn btn-error m-3"
				on:click={() => eval("deleteModal.showModal()")}
			>
				<i class="fas fa-trash mr-2" />
				<span>Supprimer le serveur</span>
			</button>
		</div>

		<dialog id="suspendModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<div class="space-y-2">
					<h3 class="font-bold text-lg">Suspendre le serveur ?</h3>
					<p class="text-sm">
						La suspension du serveur arrêtera le serveur et libérera
						les ressources allouées.
					</p>
					<p class="text-sm">
						Le propriétaire du serveur n'aura plus accès à celui-ci
						et seul un administrateur pourra le réactiver.
					</p>
				</div>

				<div class="modal-action flex justify-end space-x-2">
					<button class="btn btn-warning" on:click={suspendServer}
						>Suspendre</button
					>
					<button class="btn btn-ghost">Annuler</button>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>Fermer</button>
			</form>
		</dialog>

		<dialog id="deleteModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<div class="space-y-2">
					<h3 class="font-bold text-lg">Supprimer le serveur ?</h3>
					<p class="text-sm">
						Vous êtes sur le point de supprimer le serveur. Cette
						action est irréversible.
					</p>
				</div>

				<div class="modal-action flex justify-end space-x-2">
					<button class="btn btn-error" on:click={deleteServer}
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
