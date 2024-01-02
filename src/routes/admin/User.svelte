<script lang="ts">
	import md5 from "md5";
	import Error from "../../components/Error.svelte";
	import { getUserFromId } from "../../utils/user";
	import toast, { Toaster } from "svelte-french-toast";
	import { API } from "../../utils/config";

	export let id: any;

	let user: any;
	let error = false;
	let forbidden = false;
	let loaded = false;

	let iName: HTMLInputElement;
	let iEmail: HTMLInputElement;
	let iAdmin: HTMLInputElement;

	(async () => {
		let userQuery = await getUserFromId(id);
		if (userQuery.error) {
			if (userQuery.error == "USER_NOT_FOUND") return history.back();
			else if (userQuery.error == "FORBIDDEN") return (forbidden = true);

			error = true;
		} else {
			user = userQuery.response;
		}

		loaded = true;
	})();

	function inputChange(key: string, input: HTMLInputElement) {
		if (input.value == user[key]) {
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
		await fetch(`${API()}/admin/users/edit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				userId: user.id,
				[key]: input.value,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					user[key] = input.value;

					input.classList.remove("input-primary");
					input.parentElement
						?.querySelector(".btn")
						?.classList.add("btn-disabled");
					input.parentElement
						?.querySelector(".fa-save")
						?.classList.remove("text-primary");
				} else {
					toast.error(
						"Une erreur est survenue lors de la modification de l'utilisateur.",
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
					"Une erreur est survenue lors de la modification de l'utilisateur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	async function toggleAdmin() {
		await fetch(`${API()}/admin/users/edit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				userId: user.id,
				admin: !user.admin,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					user.admin = !user.admin;
					iAdmin.checked = user.admin;
				} else {
					toast.error(
						"Une erreur est survenue lors de la modification de l'utilisateur.",
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
					"Une erreur est survenue lors de la modification de l'utilisateur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	async function toggleSuspend() {
		await fetch(`${API()}/admin/users/edit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				userId: user.id,
				suspended: !user.suspended,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					user.suspended = !user.suspended;
					if (user.suspended) {
						toast.success("L'utilisateur a été suspendu.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else {
						toast.success("L'utilisateur a été réactivé.", {
							duration: 5000,
							position: "bottom-right",
						});
					}
				} else {
					toast.error(
						`Une erreur est survenue lors de la ${
							user.suspended ? "réactivation" : "suspension"
						} de l'utilisateur.`,
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
					`Une erreur est survenue lors de la ${
						user.suspended ? "réactivation" : "suspension"
					} de l'utilisateur.`,
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	async function deleteUser() {
		await fetch(`${API()}/admin/users/delete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				userId: user.id,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					toast.success(
						"L'utilisateur a été supprimé de la base de données.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
					history.back();
				} else {
					toast.error(
						"Une erreur est survenue lors de la supression de l'utilisateur.",
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
					"Une erreur est survenue lors de la supression de l'utilisateur.",
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
			{user.name}
		</h1>
		{#if user.superuser}
			<span class="badge badge-success mt-2">Super-utilisateur</span>
		{:else if user.admin}
			<span class="badge badge-warning mt-2">Administrateur</span>
		{:else}
			<span class="badge badge-neutral mt-2">Utilisateur</span>
		{/if}

		{#if user.suspended}
			<div class="flex alert alert-error mt-5 w-1/2">
				<div class="flex flex-col items-center justify-between mx-auto">
					<span class="font-semibold">Utilisateur suspendu</span>
					<p class="text-sm">
						Cet utilisateur a été suspendu par un administrateur.
					</p>

					<button
						class="btn btn-ghost btn-sm mt-5"
						on:click={toggleSuspend}
					>
						<i class="fas fa-play mr-2" /> Réactiver
					</button>
				</div>
			</div>
		{/if}

		<div class="w-11/12 xl:w-8/12 mx-auto mt-10">
			<div class="card bg-base-100 w-full shadow-xl">
				<div class="card-body flex flex-col">
					<div class="flex flex-row">
						<figure class="flex justify-center items-center">
							<img
								class="rounded-lg shadow-lg w-14 h-14"
								src="https://secure.gravatar.com/avatar/{md5(
									user.email.toLowerCase().trim(),
								)}"
								alt="Avatar de {user.name}"
							/>
						</figure>
						<div class="flex flex-col w-11/12">
							<span class="text-2xl font-semibold ml-5">
								Informations générales
							</span>
							<span class="flex flex-row text-sm ml-5 mt-2">
								<span class="font-semibold">ID&nbsp;:</span>
								<span class="ml-2">{user.id}</span>
							</span>
							<span class="flex flex-row text-sm ml-5 mt-2">
								<span class="font-semibold"
									>Serveurs&nbsp;:</span
								>
								<span class="ml-2">{user.serverCount}</span>
							</span>
							<span class="flex flex-col text-sm ml-5 mt-2">
								<span class="font-semibold"
									>Nom d'utilisateur&nbsp;:</span
								>
								<div class="flex flex-row mt-2">
									<input
										type="text"
										bind:this={iName}
										on:change={() =>
											inputChange("name", iName)}
										on:keyup={() =>
											inputChange("name", iName)}
										class="input input-sm w-full"
										value={user.name}
									/>
									<button
										class="btn btn-ghost btn-sm ml-2 btn-disabled"
										on:click={() => edit("name", iName)}
									>
										<i class="fas fa-save" />
									</button>
								</div>
							</span>
							<span class="flex flex-col text-sm ml-5 mt-2">
								<span class="font-semibold"
									>Courriel&nbsp;:</span
								>
								<div class="flex flex-row mt-2">
									<input
										type="text"
										bind:this={iEmail}
										on:change={() =>
											inputChange("email", iEmail)}
										on:keyup={() =>
											inputChange("email", iEmail)}
										class="input input-sm w-full"
										value={user.email}
									/>
									<button
										class="btn btn-ghost btn-sm ml-2 btn-disabled"
										on:click={() => edit("email", iEmail)}
									>
										<i class="fas fa-save" />
									</button>
								</div>
							</span>
							<span
								class="flex flex-col text-sm ml-5 mt-2 w-fit"
								class:tooltip={user.superuser}
								data-tip={user.superuser
									? "Vous ne pouvez pas modifier le super-utilisateur."
									: ""}
							>
								<label
									class="label cursor-pointer"
									class:opacity-50={user.superuser}
								>
									<span class="label-text mr-5 font-semibold"
										>Administrateur</span
									>
									<input
										type="checkbox"
										bind:this={iAdmin}
										on:click|preventDefault={() =>
											eval("adminModal.showModal()")}
										class="toggle"
										checked={user.admin}
										disabled={user.superuser}
									/>
								</label>

								<dialog id="adminModal" class="modal">
									<form method="dialog" class="modal-box">
										<button
											class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
											>✕</button
										>

										<div class="space-y-2">
											<h3 class="font-bold text-lg">
												{user.admin
													? "Rétrograder"
													: "Promouvoir"}
												{user.name} en tant qu'{user.admin
													? "utilisateur"
													: "administrateur"}
												?
											</h3>
											<p class="text-sm">
												{user.admin
													? "L'utilisateur ne pourra plus accéder à l'interface d'administration."
													: "L'utilisateur pourra accéder à l'interface d'administration."}
											</p>
										</div>

										<div
											class="modal-action flex justify-end space-x-2"
										>
											<button
												class="btn btn-primary"
												on:click={toggleAdmin}
												>{user.admin
													? "Rétrograder"
													: "Promouvoir"}</button
											>
											<button class="btn btn-ghost"
												>Annuler</button
											>
										</div>
									</form>

									<form
										method="dialog"
										class="modal-backdrop"
									>
										<button>Fermer</button>
									</form>
								</dialog>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ACTION BUTTONS -->
		<div class="flex flex-col md:flex-row justify-end relative my-10">
			{#if user.superuser}
				<div
					class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
				>
					<span
						class="badge badge-neutral badge-md h-14 md:h-8 text-center"
					>
						Désactivé pour le super-utilisateur
					</span>
				</div>
			{/if}

			{#if !user.suspended}
				<button
					class="btn btn-warning m-3"
					disabled={user.superuser}
					on:click={() => eval("suspendModal.showModal()")}
				>
					<i class="fas fa-pause mr-2" />
					<span>Suspendre l'utilisateur</span>
				</button>
			{/if}
			<button
				class="btn btn-error m-3"
				disabled={user.superuser}
				on:click={() => eval("deleteModal.showModal()")}
			>
				<i class="fas fa-trash mr-2" />
				<span>Supprimer l'utilisateur</span>
			</button>
		</div>

		<dialog id="suspendModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<div class="space-y-2">
					<h3 class="font-bold text-lg">Suspendre l'utilsiateur ?</h3>
					<p class="text-sm">
						Cet utilisateur n'aura plus accès au panel. Seul un
						administrateur pourra réactiver son compte.
					</p>
				</div>

				<div class="modal-action flex justify-end space-x-2">
					<button class="btn btn-warning" on:click={toggleSuspend}
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
					<h3 class="font-bold text-lg">Supprimer l'utilisateur ?</h3>
					<p class="text-sm">
						Vous êtes sur le point de supprimer cet utilisateur.
						Cette action est irréversible.
					</p>
				</div>

				<div class="modal-action flex justify-end space-x-2">
					<button class="btn btn-error" on:click={deleteUser}
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
