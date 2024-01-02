<script lang="ts">
	import toast from "svelte-french-toast";
	import { PERMISSIONS } from "../../utils/permissions";
	import { getSubusers } from "../../utils/subusers";
	import { getUser } from "../../utils/user";
	import { API, CONFIG } from "../../utils/config";

	export let server: any;
	export let users: any;

	let iEmail: HTMLInputElement;

	let formSubmitted = false;
	let emailNote: string = "";

	let permissions: {
		[category: string]: {
			name: string;
			subusers: boolean;
			entries: {
				[permission: string]: {
					name: string;
					value: boolean;
				};
			};
		};
	} = {};
	for (let category in PERMISSIONS) {
		permissions[category] = {
			name: PERMISSIONS[category]["name"],
			subusers: PERMISSIONS[category]["subusers"],
			entries: {},
		};
		for (let permission in PERMISSIONS[category]["entries"]) {
			permissions[category]["entries"][permission] = {
				name: PERMISSIONS[category]["entries"][permission],
				value: false,
			};
		}
	}

	function isAllSelected(category: string) {
		let isAllSelected = true;

		document
			.querySelectorAll(`#permissions-grid input[id^="${category}."]`)
			.forEach((i) => {
				if (i.id == `${category}.*`) return;
				if (!(i as HTMLInputElement).checked) isAllSelected = false;
			});

		return isAllSelected;
	}

	function isNoneSelected(category: string) {
		let isNoneSelected = true;

		document
			.querySelectorAll(`#permissions-grid input[id^="${category}."]`)
			.forEach((i) => {
				if (i.id == `${category}.*`) return;
				if ((i as HTMLInputElement).checked) isNoneSelected = false;
			});

		return isNoneSelected;
	}

	function updatePermissionsValues() {
		document.querySelectorAll(`#permissions-grid input`).forEach((i) => {
			let id = (i as HTMLInputElement).id;
			let category: any = id.split(".");
			category.pop();
			category = category.join(".");
			let permission = id.split(".")[id.split(".").length - 1];

			permissions[category]["entries"][permission].value = (
				i as HTMLInputElement
			).checked;
		});
	}

	function selectAll(category: string) {
		let allSelected = isAllSelected(category);

		document
			.querySelectorAll(`#permissions-grid input[id^="${category}."]`)
			.forEach((i) => {
				(i as HTMLInputElement).checked = !allSelected;
			});

		updatePermissionsValues();
	}

	function onChange(category: string, permission: string) {
		let input = document.getElementById(
			`${category}.*`,
		) as HTMLInputElement;

		if (isAllSelected(category)) {
			input.indeterminate = false;
			input.checked = true;
		} else {
			if (isNoneSelected(category)) {
				input.indeterminate = false;
				input.checked = false;
			} else {
				input.indeterminate = true;
				input.checked = false;
			}
		}

		updatePermissionsValues();
	}

	function checkEmail() {
		emailNote = "";
		if (users && users.find((u: any) => u.email == iEmail.value))
			emailNote = "already-exists";

		if (iEmail.value === getUser()?.email) emailNote = "already-exists";
	}

	function submit() {
		let email = iEmail.value;

		let selectedPermissions: string[] = [];
		for (let category in permissions) {
			for (let permission in permissions[category]["entries"]) {
				if (permissions[category]["entries"][permission].value)
					selectedPermissions.push(`${category}.${permission}`);
			}
		}

		formSubmitted = true;
		fetch(`${API()}/servers/${server.serverId}/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				email,
				permissions: selectedPermissions,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					location.href = "/servers/" + server.serverId + "/users";
				} else {
					formSubmitted = false;

					if (res.error && res.error == "USER_NOT_FOUND") {
						emailNote = "not-found";
						toast.error("Cet utilisateur n'existe pas.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else if (res.error && res.error == "ALREADY_EXISTS") {
						emailNote = "already-exists";
						toast.error(
							"Cet utilisateur est déjà un sous-utilisateur de ce serveur.",
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
				}
			})
			.catch(() => {
				formSubmitted = false;
				toast.error("Une erreur est survenue.", {
					duration: 5000,
					position: "bottom-right",
				});
			});
	}
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Ajouter un utilisateur</h1>

<form
	on:submit|preventDefault={submit}
	class="w-11/12 xl:w-10/12 my-8 space-y-8 md:space-y-10 xl:space-y-16"
>
	<div>
		<label
			for="email"
			class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
		>
			Adresse email
		</label>
		<input
			type="email"
			name="email"
			id="email"
			bind:this={iEmail}
			placeholder="Adresse email de l'utilisateur"
			autocomplete="off"
			class="input input-bordered w-full"
			class:input-error={emailNote.length > 0}
			on:keyup={checkEmail}
			on:change={checkEmail}
			required
		/>
		{#if emailNote == "not-found"}
			<span class="text-xs text-red-500">
				Saisissez l'adresse email d'un utilisateur déjà inscrit sur {CONFIG()
					.app.name}.
			</span>
		{:else if emailNote == "already-exists"}
			<span class="text-xs text-red-500">
				Cet utilisateur est déjà un sous-utilisateur de ce serveur.
			</span>
		{:else}
			<span class="text-xs text-gray-500">
				Saisissez l'adresse email d'un utilisateur déjà inscrit sur {CONFIG()
					.app.name}.
			</span>
		{/if}
	</div>

	<div class="flex flex-col space-y-2">
		<p class="text-sm font-medium text-gray-900 dark:text-white">
			Permissions
		</p>

		<div class="flex items-center space-x-2">
			<button
				type="button"
				class="btn btn-xs btn-neutral"
				on:click={() => {
					document
						.querySelectorAll(
							"#permissions-grid input[type=checkbox]",
						)
						.forEach((i) => {
							// @ts-ignore
							i.checked = true;
							// @ts-ignore
							i.indeterminate = false;
						});

					updatePermissionsValues();
				}}
			>
				Tout sélectionner
			</button>
			<button
				type="button"
				class="btn btn-xs btn-neutral"
				on:click={() => {
					document
						.querySelectorAll(
							"#permissions-grid input[type=checkbox]",
						)
						.forEach((i) => {
							// @ts-ignore
							i.checked = false;
							// @ts-ignore
							i.indeterminate = false;
						});

					updatePermissionsValues();
				}}
			>
				Tout désélectionner
			</button>
		</div>

		<div
			class="grid grid-cols-1 xl:grid-cols-2 gap-4"
			id="permissions-grid"
		>
			{#each Object.keys(permissions) as category}
				{#if permissions[category].subusers}
					<div class="flex flex-col space-y-2">
						<div class="flex flex-col space-y-1">
							<div class="divider">
								<span>{permissions[category].name}</span>
							</div>

							<label
								for={`${category}.*`}
								class="flex items-center text-gray-900 dark:text-white"
							>
								<input
									type="checkbox"
									id={`${category}.*`}
									on:change={() => selectAll(category)}
									class="checkbox checkbox-sm"
								/>
								<span class="ml-2 text-sm"
									>Tout sélectionner</span
								>
							</label>

							<div class="h-2" />

							{#each Object.keys(permissions[category]["entries"]) as permission}
								{#if permission != "*"}
									<label
										for={`${category}.${permission}`}
										class="flex items-center text-gray-900 dark:text-white"
									>
										<input
											type="checkbox"
											id={`${category}.${permission}`}
											on:change={() =>
												onChange(category, permission)}
											class="checkbox"
										/>
										<span class="ml-2"
											>{permissions[category]["entries"][
												permission
											].name}</span
										>
									</label>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<button
		type="submit"
		class="btn btn-primary w-full"
		class:btn-disabled={formSubmitted}
		disabled={formSubmitted}
	>
		{#if formSubmitted}
			<i class="fas fa-spinner-third fa-spin mr-3" />
		{/if}
		Créer
	</button>
</form>
