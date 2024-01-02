<script lang="ts">
	import md5 from "md5";
	import { PERMISSIONS } from "../../utils/permissions";
	import toast from "svelte-french-toast";
	import { API } from "../../utils/config";

	export let server: any;
	export let users: any;
	export let extra: any;

	let user: any = null;

	if (!users) users = [];

	user = users.find((u: any) => u.id == parseInt(extra));
	if (!user) location.href = `/servers/${server.serverId}/users`;

	let formSubmitted = false;

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
				value: user.permissions.includes(`${category}.${permission}`),
			};
		}
	}

	function isAllSelected(category: string, fromValues = false) {
		let isAllSelected = true;

		if (fromValues) {
			for (let permission in permissions[category]["entries"]) {
				console.log(permissions[category]["entries"][permission]);
				if (!permissions[category]["entries"][permission].value)
					isAllSelected = false;
			}
		} else {
			document
				.querySelectorAll(`#permissions-grid input[id^="${category}."]`)
				.forEach((i) => {
					if (i.id == `${category}.*`) return;
					if (!(i as HTMLInputElement).checked) isAllSelected = false;
				});
		}

		return isAllSelected;
	}

	function isNoneSelected(category: string, fromValues = false) {
		let isNoneSelected = true;

		if (fromValues) {
			for (let permission in permissions[category]["entries"]) {
				if (permissions[category]["entries"][permission].value)
					isNoneSelected = false;
			}
		} else {
			document
				.querySelectorAll(`#permissions-grid input[id^="${category}."]`)
				.forEach((i) => {
					if (i.id == `${category}.*`) return;
					if ((i as HTMLInputElement).checked) isNoneSelected = false;
				});
		}

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

	function onChange(category: string) {
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

	function submit() {
		let selectedPermissions: string[] = [];
		for (let category in permissions) {
			for (let permission in permissions[category]["entries"]) {
				if (permissions[category]["entries"][permission].value)
					selectedPermissions.push(`${category}.${permission}`);
			}
		}

		formSubmitted = true;
		fetch(`${API()}/servers/${server.serverId}/users`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				permissions: selectedPermissions,
				userId: user.id,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					location.href = "/servers/" + server.serverId + "/users";
				} else {
					formSubmitted = false;
					toast.error("Une erreur est survenue.", {
						duration: 5000,
						position: "bottom-right",
					});
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

<h1 class="text-3xl font-semibold text-center mt-10">
	Modifier un utilisateur
</h1>

<div class="flex flex-row items-center justify-center space-x-3 mt-8">
	<div class="flex-shrink-0">
		<img
			class="rounded-full w-12 h-12 md:w-16 md:h-16 object-cover"
			src="https://secure.gravatar.com/avatar/{md5(
				user.email.toLowerCase().trim(),
			)}"
			alt="User avatar"
		/>
	</div>
	<div class="flex flex-col">
		<h1 class="text-2xl font-semibold">{user.name}</h1>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			{user.email.toLowerCase().trim()}
		</p>
	</div>
</div>

<form
	on:submit|preventDefault={submit}
	class="w-11/12 xl:w-10/12 my-8 space-y-8 md:space-y-10 xl:space-y-16"
>
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
									checked={isAllSelected(category, true)}
									indeterminate={!isNoneSelected(
										category,
										true,
									) && !isAllSelected(category, true)}
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
											on:change={() => onChange(category)}
											checked={permissions[category][
												"entries"
											][permission].value}
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
		Modifier
	</button>
</form>
