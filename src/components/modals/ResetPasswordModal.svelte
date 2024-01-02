<script lang="ts">
	import toast from "svelte-french-toast";
	import { API } from "../../utils/config";

	let iEmail: HTMLInputElement;
	let iCode: HTMLInputElement;
	let iPassword: HTMLInputElement;
	let iPasswordConfirm: HTMLInputElement;

	let step = 0;
	let email = "";
	let code = "";

	let passwordError = false;

	let formSubmitted = false;

	function step0() {
		formSubmitted = true;

		email = iEmail.value;

		fetch(`${API()}/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
		})
			.then((res) => res.json())
			.then((res) => {
				formSubmitted = false;

				if (res.status === "pending" && res.data?.step) {
					toast.success("Un e-mail vous a été envoyé.", {
						duration: 5000,
						position: "bottom-right",
					});

					step = res.data.step;
				} else {
					if (res.error && res.error == "ACCOUNT_SUSPENDED") {
						toast.error(
							"Votre compte a été suspendu. Veuillez contacter un administrateur.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (res.error && res.error == "ACCOUNT_NOT_FOUND") {
						toast.error(
							"Aucun compte n'a été trouvé avec cette adresse e-mail.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (res.error && res.error == "EMAIL_COOLDOWN") {
						toast.error(
							"Veuillez attendre 2 minutes avant d'envoyer un nouvel e-mail.",
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

	function step1() {
		formSubmitted = true;

		code = iCode.value.toString();

		fetch(`${API()}/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, code }),
		})
			.then((res) => res.json())
			.then((res) => {
				formSubmitted = false;

				if (res.status === "pending" && res.data?.step) {
					step = res.data.step;
				} else {
					if (res.error && res.error == "ACCOUNT_SUSPENDED") {
						toast.error(
							"Votre compte a été suspendu. Veuillez contacter un administrateur.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (res.error && res.error == "ACCOUNT_NOT_FOUND") {
						toast.error(
							"Aucun compte n'a été trouvé avec cette adresse e-mail.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (res.error && res.error == "INVALID_CODE") {
						toast.error("Le code est invalide.", {
							duration: 5000,
							position: "bottom-right",
						});
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

	function step2() {
		passwordError = false;

		let password = iPassword.value;
		let passwordConfirm = iPasswordConfirm.value;

		if (password !== passwordConfirm) {
			toast.error("Les mots de passe ne correspondent pas.", {
				duration: 5000,
				position: "bottom-right",
			});
			passwordError = true;
			return;
		}

		if (password.length < 8 || password.length > 32) {
			toast.error(
				"Le mot de passe doit faire entre 8 et 32 caractères.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
			passwordError = true;
			return;
		}

		formSubmitted = true;

		fetch(`${API()}/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, code, newPassword: password }),
		})
			.then((res) => res.json())
			.then((res) => {
				formSubmitted = false;

				if (res.status === "success") {
					step = -1;
				} else {
					toast.error("Une erreur est survenue.", {
						duration: 5000,
						position: "bottom-right",
					});
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

<dialog id="resetPasswordModal" class="modal bg-black bg-opacity-50">
	<div class="modal-box">
		<form method="dialog">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>✕</button
			>
		</form>

		<h3 class="font-bold text-lg">Réinitialisation du mot de passe</h3>

		{#if step === 0}
			<p class="text-sm">
				Entrez votre adresse e-mail pour réinitialiser votre mot de
				passe.
			</p>

			<form on:submit|preventDefault={step0}>
				<div class="form-control">
					<label for="email" class="label">
						<span class="label-text">Adresse e-mail</span>
					</label>
					<input
						type="email"
						name="email"
						id="email"
						bind:this={iEmail}
						placeholder="Entrez votre adresse e-mail"
						class="input input-bordered"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button
						type="submit"
						class="btn btn-primary"
						class:btn-disabled={formSubmitted}
						disabled={formSubmitted}
					>
						{#if formSubmitted}
							<i class="fas fa-spinner-third fa-spin mr-3" />
						{/if}
						{#if formSubmitted}
							Envoi en cours...
						{:else}
							Envoyer
						{/if}
					</button>
				</div>
			</form>
		{:else if step === 1}
			<p class="text-sm">
				Entrez le code à 6 chiffres que vous avez reçu par e-mail.
			</p>

			<form on:submit|preventDefault={step1}>
				<div class="form-control">
					<label for="code" class="label">
						<span class="label-text">Code</span>
					</label>
					<input
						type="number"
						name="code"
						id="code"
						bind:this={iCode}
						placeholder="123456"
						class="input input-bordered tracking-widest"
						maxlength="6"
						minlength="6"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button
						type="submit"
						class="btn btn-primary"
						class:btn-disabled={formSubmitted}
						disabled={formSubmitted}
					>
						{#if formSubmitted}
							<i class="fas fa-spinner-third fa-spin mr-3" />
						{/if}
						{#if formSubmitted}
							Envoi en cours...
						{:else}
							Envoyer
						{/if}
					</button>
				</div>
			</form>
		{:else if step === 2}
			<p class="text-sm">Entrez votre nouveau mot de passe.</p>

			<form on:submit|preventDefault={step2}>
				<input
					type="email"
					name="email"
					id="email"
					autocomplete="email"
					value={email}
					class="hidden"
				/>

				<div class="form-control">
					<label for="password" class="label">
						<span class="label-text">Mot de passe</span>
					</label>
					<input
						type="password"
						name="password"
						id="password"
						autocomplete="new-password"
						bind:this={iPassword}
						placeholder="Entrez votre nouveau mot de passe"
						class="input input-bordered"
						required
					/>
				</div>

				<div class="form-control">
					<label for="passwordConfirm" class="label">
						<span class="label-text">Retaper le mot de passe</span>
					</label>
					<input
						type="password"
						name="passwordConfirm"
						id="passwordConfirm"
						autocomplete="new-password"
						bind:this={iPasswordConfirm}
						placeholder="Confirmez votre nouveau mot de passe"
						class="input input-bordered"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button
						type="submit"
						class="btn btn-primary"
						class:btn-disabled={formSubmitted}
						disabled={formSubmitted}
					>
						{#if formSubmitted}
							<i class="fas fa-spinner-third fa-spin mr-3" />
						{/if}
						{#if formSubmitted}
							Envoi en cours...
						{:else}
							Envoyer
						{/if}
					</button>
				</div>
			</form>
		{:else}
			<p class="text-sm">
				Le mot de passe a été réinitialisé avec succès.
			</p>

			<form method="dialog">
				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary">
						Se connecter
					</button>
				</div>
			</form>
		{/if}
	</div>
</dialog>
