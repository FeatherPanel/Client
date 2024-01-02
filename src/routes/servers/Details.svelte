<script lang="ts">
	import toast from "svelte-french-toast";
	import { getUser } from "../../utils/user";
	import { API } from "../../utils/config";

	export let server: any;
	let user = getUser();

	let iName: HTMLInputElement;
	let bName: HTMLButtonElement;
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Informations</h1>

<!-- SFTP details -->
<div class="flex flex-col xl:flex-row w-10/12 justify-center mt-10">
	<div
		class="h-fit w-full xl:w-1/2 p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
	>
		<h1
			class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
		>
			Accès SFTP
		</h1>

		<label class="form-control w-full mt-2">
			<div class="label">
				<span class="label-text">Adresse du serveur</span>
			</div>
			<input
				class="input input-bordered w-full"
				readonly
				value="sftp://{server.nodeAddress}:{server.nodeSftpPort}"
			/>
		</label>

		<label class="form-control w-full mt-2">
			<div class="label">
				<span class="label-text">Nom d'utilisateur</span>
			</div>
			<input
				class="input input-bordered w-full"
				readonly
				value="{server.serverId}_{user.name.toLowerCase()}"
			/>
		</label>

		<p class="text-sm text-gray-500 mt-2">
			Le mot de passe SFTP est identique au mot de passe de votre compte
		</p>

		<a
			href="sftp://{server.serverId}_{user.name.toLowerCase()}@{server.nodeAddress}:{server.nodeSftpPort}"
			class="btn btn-primary btn-wide float-right mt-4"
		>
			Lancer le client SFTP
		</a>
	</div>

	<div
		class="h-fit w-full xl:w-1/2 p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
	>
		<h1
			class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
		>
			Serveur
		</h1>

		<label class="form-control w-full mt-2">
			<div class="label">
				<span class="label-text">Nom du serveur</span>
			</div>
			<div class="join">
				<input
					class="input input-bordered w-full join-item"
					value={server.name}
					bind:this={iName}
					on:change={() =>
						(bName.disabled = iName.value === server.name)}
					on:keyup={() =>
						(bName.disabled = iName.value === server.name)}
				/>
				<button
					class="btn btn-square join-item"
					bind:this={bName}
					on:click={() => {
						iName.disabled = true;

						fetch(`${API()}/servers/${server.serverId}`, {
							method: "PATCH",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${sessionStorage.getItem(
									"token",
								)}`,
							},
							body: JSON.stringify({
								name: iName.value,
							}),
						})
							.then((res) => res.json())
							.then((data) => {
								iName.disabled = false;

								if (data.status === "success") {
									bName.disabled = true;
								} else {
									iName.value = server.name;
									toast.error("Une erreur est survenue", {
										duration: 5000,
										position: "bottom-right",
									});
								}
							})
							.catch((err) => {
								console.error(err);
								iName.value = server.name;
								iName.disabled = false;
								toast.error("Une erreur est survenue", {
									duration: 5000,
									position: "bottom-right",
								});
							});
					}}
					disabled
				>
					<i class="fas fa-save"></i>
				</button>
			</div>
		</label>

		<label class="form-control w-full mt-2">
			<div class="label">
				<span class="label-text">Adresse du serveur</span>
			</div>
			<input
				class="input input-bordered w-full"
				readonly
				value="{server.nodeAddress}:{server.port}"
			/>
		</label>

		<label class="form-control w-full mt-2">
			<div class="label">
				<span class="label-text">ID du serveur</span>
			</div>
			<input
				class="input input-bordered w-full"
				readonly
				value={server.serverId}
			/>
		</label>
	</div>
</div>
