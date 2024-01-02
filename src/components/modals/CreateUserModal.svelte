<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import { API } from "../../utils/config";

	export let users: any;

	let iName: HTMLInputElement;
	let iEmail: HTMLInputElement;
	let iPassword: HTMLInputElement;
	let iPasswordConfirm: HTMLInputElement;
	let iAdmin: HTMLInputElement;

	let nameError = false;
	let emailError = false;
	let passwordError = false;

	let submitted = false;

	function addUser() {
		submitted = true;

		nameError = false;
		emailError = false;
		passwordError = false;

		if (iName.value.length < 3 || iName.value.length > 32) {
			nameError = true;
			toast.error(
				"Le nom de l'utilisateur doit contenir entre 3 et 32 caractères.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}

		if (users.find((user: any) => user.name == iName.value)) {
			nameError = true;
			toast.error("Un utilisateur avec ce nom existe déjà.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (!iEmail.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			emailError = true;
			toast.error("L'adresse email n'est pas valide.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (users.find((user: any) => user.email == iEmail.value)) {
			emailError = true;
			toast.error(
				"Un utilisateur avec cette adresse email existe déjà.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}

		if (iPassword.value.length < 8 || iPassword.value.length > 32) {
			passwordError = true;
			toast.error(
				"Le mot de passe doit contenir entre 8 et 32 caractères.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}

		if (iPassword.value != iPasswordConfirm.value) {
			passwordError = true;
			toast.error("Les mots de passe ne correspondent pas.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (nameError || emailError || passwordError) {
			return (submitted = false);
		}

		let data = {
			name: iName.value,
			email: iEmail.value,
			password: iPassword.value,
			admin: iAdmin.checked,
		};

		fetch(`${API()}/admin/users/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify(data),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					toast.success("Le serveur a été créé avec succès.", {
						duration: 5000,
						position: "bottom-right",
					});

					submitted = false;
					iName.value = "";
					iEmail.value = "";
					iPassword.value = "";

					eval("addModal.close()");

					location.reload();
				} else {
					if (res.error) {
						let errorMessage =
							"Une erreur est survenue lors de la création de l'utilisateur.";
						switch (res.error) {
							case "USER_NAME_ALREADY_EXISTS":
								errorMessage =
									"Un utilisateur avec ce nom existe déjà.";
								nameError = true;
								break;
							case "USER_EMAIL_ALREADY_EXISTS":
								errorMessage =
									"Un utilisateur avec cette adresse email existe déjà.";
								emailError = true;
								break;
						}

						toast.error(errorMessage, {
							duration: 5000,
							position: "bottom-right",
						});
					} else {
						toast.error(
							"Une erreur est survenue lors de la création de l'utilisateur.",
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
				toast.error(
					"Une erreur est survenue lors de la création de l'utilisateur.",
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
	<form method="dialog" class="modal-box">
		<button
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			disabled={submitted}>✕</button
		>

		<h3 class="font-bold text-lg">Créer un utilisateur</h3>
		<p class="text-gray-500">
			Vous pouvez créer un utilisateur en remplissant le formulaire
			ci-dessous.
		</p>
		<form
			class="flex flex-col space-y-5"
			on:submit|preventDefault={addUser}
		>
			<div class="flex flex-col space-y-2">
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
						placeholder="Nom d'utilisateur"
						minlength="3"
						maxlength="32"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="email"
						><span class="label-text">Courriel</span></label
					>
					<input
						type="email"
						id="email"
						bind:this={iEmail}
						class="input input-bordered input-sm"
						class:input-error={emailError}
						placeholder="Adresse courriel"
						autocomplete="off"
						required
					/>
				</div>

				<input name="dummyUsername" type="text" class="hidden" />
				<input name="dummyPassword" type="password" class="hidden" />

				<div class="form-control">
					<label class="label" for="password"
						><span class="label-text">Mot de passe</span></label
					>
					<input
						type="password"
						id="password"
						bind:this={iPassword}
						class="input input-bordered input-sm"
						class:input-error={passwordError}
						placeholder="Mot de passe"
						autocomplete="off"
						minlength="8"
						maxlength="32"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="passwordConfirm"
						><span class="label-text"
							>Confirmation du mot de passe</span
						></label
					>
					<input
						type="password"
						id="passwordConfirm"
						bind:this={iPasswordConfirm}
						class="input input-bordered input-sm"
						class:input-error={passwordError}
						placeholder="Répéter le mot de passe"
						minlength="8"
						maxlength="32"
						required
					/>
				</div>

				<div class="form-control w-fit">
					<label class="label cursor-pointer">
						<span class="label-text mr-5 font-semibold"
							>Administrateur</span
						>
						<input
							type="checkbox"
							bind:this={iAdmin}
							class="toggle"
						/>
					</label>
				</div>
			</div>

			<div>
				<input
					type="submit"
					value="Créer"
					class="btn btn-primary btn-wide float-right"
					class:btn-disabled={submitted}
				/>
			</div>
		</form>
	</form>

	<Toaster />
</dialog>
