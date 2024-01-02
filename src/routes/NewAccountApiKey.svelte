<script lang="ts">
	import toast from "svelte-french-toast";
	import Footer from "../components/Footer.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import { getApiCredentials } from "../utils/account-api";
	import { PERMISSIONS } from "../utils/permissions";
	import { API } from "../utils/config";

	let apiCredentials: any;
	let loaded = false;

	let iName: HTMLInputElement;
	let tIpWhitelist: HTMLTextAreaElement;

	let formSubmitted = false;
	let nameError: string | null = null;

	let permissions: any = PERMISSIONS;
	for (let category in PERMISSIONS) {
		for (let permission in PERMISSIONS[category]["entries"]) {
			permissions[category]["entries"][permission] = {
				name: PERMISSIONS[category]["entries"][permission],
				value: false,
			};
		}
	}
	permissions = permissions as {
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
	};

	(async () => {
		apiCredentials = (await getApiCredentials()).response;

		loaded = true;
	})();

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

	function checkName() {
		nameError = null;
		if (iName.value.length < 3) nameError = "too-short";
		if (iName.value.length > 32) nameError = "too-long";
		// @ts-ignore
		if (apiCredentials.find((c) => c.name == iName.value))
			nameError = "already-exists";
	}

	function submit() {
		let name = iName.value;
		let ipWhitelist = tIpWhitelist.value;

		if (name.length < 3) {
			nameError = "too-short";
			return;
		}

		if (name.length > 32) {
			nameError = "too-long";
			return;
		}

		let selectedPermissions: string[] = [];
		for (let category in permissions) {
			for (let permission in permissions[category]["entries"]) {
				if (permissions[category]["entries"][permission].value)
					selectedPermissions.push(`${category}.${permission}`);
			}
		}

		formSubmitted = true;
		fetch(`${API()}/api-credentials`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				name,
				ipWhitelist,
				permissions: selectedPermissions,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					location.href = "/account/api";
				} else {
					formSubmitted = false;

					if (res.error && res.error == "KEY_NAME_EXISTS") {
						nameError = "already-exists";
						toast.error("Ce nom est déjà utilisé.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else if (
						res.error &&
						res.error == "INVALID_IP_WHITELIST"
					) {
						toast.error(
							"IP(s) invalide(s) dans la liste blanche.",
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
			.catch((err) => {
				formSubmitted = false;
				toast.error("Une erreur est survenue.", {
					duration: 5000,
					position: "bottom-right",
				});
			});
	}
</script>

<Sidebar active="api" />
<div
	class="relative flex flex-col items-center justify-start md:ml-64 mt-14"
	style="min-height: calc(100vh - 3.5rem);"
>
	<h1 class="text-3xl font-semibold text-center mt-10">
		Ajouter une clé d'API
	</h1>

	{#if loaded}
		<form
			on:submit|preventDefault={submit}
			class="w-11/12 xl:w-10/12 mt-8 space-y-8 md:space-y-10 xl:space-y-16"
		>
			<div>
				<label
					for="name"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Nom</label
				>
				<input
					type="text"
					name="name"
					id="name"
					bind:this={iName}
					on:keyup={checkName}
					on:change={checkName}
					placeholder="Nom de la clé d'API"
					autocomplete="off"
					minlength="3"
					maxlength="32"
					class="input input-bordered w-full"
					class:input-error={nameError}
					required
				/>

				<span
					class="text-xs text-red-500"
					class:invisible={nameError == null}
				>
					{#if nameError == "too-short"}
						Le nom doit faire au moins 3 caractères.
					{:else if nameError == "too-long"}
						Le nom ne doit pas dépasser 32 caractères.
					{:else if nameError == "already-exists"}
						Ce nom est déjà utilisé.
					{/if}
				</span>
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
													onChange(
														category,
														permission,
													)}
												class="checkbox"
											/>
											<span class="ml-2"
												>{permissions[category][
													"entries"
												][permission].name}</span
											>
										</label>
									{/if}
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div>
				<label
					for="ip-whitelist"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>IP autorisées <span class="text-gray-500">(optionnel)</span
					></label
				>

				<textarea
					name="ip-whitelist"
					id="ip-whitelist"
					bind:this={tIpWhitelist}
					placeholder="IP autorisées (séparées par des virgules)"
					class="input input-bordered w-full"
					rows="3"
				/>

				<p class="text-xs text-gray-500 leading-4">
					Limitez l'accès à cette clé d'API à certaines adresses IP.
					<br />
					Laissez vide pour autoriser toutes les adresses IP.
				</p>
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
	{:else}
		<div class="flex flex-col items-center justify-center mt-10">
			<span class="loading loading-spinner loading-lg" />
		</div>
	{/if}

	<Footer />
</div>
