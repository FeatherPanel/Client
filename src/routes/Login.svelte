<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import OtpRecoveyModal from "../components/modals/OtpRecoveryModal.svelte";
	import ResetPasswordModal from "../components/modals/ResetPasswordModal.svelte";
	import { IS_DARK } from "../constants";
	import { API, CONFIG } from "../utils/config";

	export let urlParams: URLSearchParams = new URLSearchParams(
		location.search,
	);

	let iEmail: HTMLInputElement;
	let iPassword: HTMLInputElement;
	let iRemember: HTMLInputElement;
	let iOtpCode: HTMLInputElement;

	let email = "";
	let password = "";
	let remember = false;

	if (urlParams.has("error")) {
		toast.error(urlParams.get("error"), {
			duration: 5000,
			position: "bottom-right",
		});
	}

	let emailVerificationPage = false;
	let otpVerificationPage = false;

	let emailValid = true;
	let passwordValid = true;
	let otpValid = true;

	let formSubmitted = false;

	const login = async () => {
		formSubmitted = true;

		email = iEmail.value;
		password = iPassword.value;
		remember = iRemember.checked;

		emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		passwordValid = password.length >= 8;

		if (!emailValid || !passwordValid) return (formSubmitted = false);

		await fetch(`${API()}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					sessionStorage.setItem("token", res.data.token);
					if (remember) {
						localStorage.setItem("token", res.data.token);
					}
					location.href = location.href + "?fromLogin";
				} else if (res.status === "pending") {
					formSubmitted = false;

					if (res.error && res.error === "OTP_REQUESTED") {
						otpVerificationPage = true;
					} else if (
						res.error &&
						res.error === "EMAIL_NOT_VERIFIED"
					) {
						emailVerificationPage = true;
					} else {
						toast.error(
							"Une erreur est survenue lors de la connexion au serveur.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}
				} else {
					formSubmitted = false;

					if (res.error && res.error == "UNAUTHORIZED") {
						toast.error("Identifiants invalides.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else if (res.error && res.error == "ACCOUNT_SUSPENDED") {
						toast.error("Votre compte a été suspendu.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else {
						toast.error(
							"Une erreur est survenue lors de la connexion au serveur.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}
				}
			})
			.catch(() => {
				toast.error(
					"Une erreur est survenue lors de la connexion au serveur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				formSubmitted = false;
			});
	};

	function resendVerificationEmail() {
		formSubmitted = true;
		fetch(`${API()}/auth/verification-email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		})
			.then((res) => res.json())
			.then((res) => {
				formSubmitted = false;

				if (res.status === "success") {
					toast.success(
						"Un email de vérification a été envoyé à l'adresse " +
							email +
							".",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				} else {
					if (res.error && res.error == "EMAIL_COOLDOWN") {
						toast.error(
							"Veuillez attendre 2 minutes avant de renvoyer un email de vérification.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (
						res.error &&
						res.error == "EMAIL_ALREADY_VERIFIED"
					) {
						location.href = "/login";
					} else {
						toast.error(
							"Une erreur est survenue lors de l'envoi de l'email de vérification.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}
				}
			})
			.catch(() => {
				toast.error(
					"Une erreur est survenue lors de l'envoi de l'email de vérification.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	function verifyOtp() {
		formSubmitted = true;

		fetch(`${API()}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password, otp: iOtpCode.value }),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					sessionStorage.setItem("token", res.data.token);
					if (remember) {
						localStorage.setItem("token", res.data.token);
					}
					location.href = location.href + "?fromLogin";
				} else {
					formSubmitted = false;

					if (res.error && res.error == "INVALID_OTP_CODE") {
						otpValid = false;

						toast.error("Code invalide.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else {
						toast.error(
							"Une erreur est survenue lors de la connexion au serveur.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}
				}
			})
			.catch(() => {
				toast.error(
					"Une erreur est survenue lors de la connexion au serveur.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				formSubmitted = false;
			});
	}
</script>

<ResetPasswordModal />
<OtpRecoveyModal {email} {password} {remember} />
<Toaster />
<section>
	<div
		class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
	>
		<a
			href="/"
			class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
		>
			<img
				class="w-14 h-14 mr-2"
				src="/assets/images/icon{IS_DARK ? '_white' : ''}.png"
				id="icon"
				alt="icon"
			/>
			{CONFIG().app.name}
		</a>

		{#if emailVerificationPage}
			<div
				class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border dark:border-gray-700"
			>
				<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1
						class="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
					>
						Un email de vérification a été envoyé
					</h1>

					<p class="text-gray-500 dark:text-gray-300">
						Un email de vérification a été envoyé à l'adresse {email}.
						Veuillez cliquer sur le lien de vérification dans
						l'email pour continuer.
					</p>
					<button
						class="btn btn-primary w-full"
						on:click={resendVerificationEmail}
						class:btn-disabled={formSubmitted}
						disabled={formSubmitted}
					>
						{#if formSubmitted}
							<i class="fas fa-spinner-third fa-spin mr-3" />
						{/if}
						{#if formSubmitted}
							Envoi en cours...
						{:else}
							Renvoyer l'email de vérification
						{/if}
					</button>
				</div>
			</div>
		{:else if otpVerificationPage}
			<div
				class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border dark:border-gray-700"
			>
				<div class="relative p-6 space-y-4 md:space-y-6 sm:p-8">
					<button
						on:click={() => (otpVerificationPage = false)}
						class="text-primary hover:underline dark:text-primary-500 absolute right-6 top-6"
						>Retour</button
					>

					<h1
						class="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
					>
						Double authentification
					</h1>

					<p class="text-gray-500 dark:text-gray-300">
						Entrez le code à 6 chiffres généré par votre application
						d'authentification.
					</p>

					<form
						on:submit|preventDefault={verifyOtp}
						class="flex flex-col space-y-4 md:space-y-6"
					>
						<input
							type="number"
							bind:this={iOtpCode}
							class="input input-bordered w-full tracking-widest"
							class:input-error={!otpValid}
							placeholder="123456"
							maxlength="6"
							minlength="6"
							required
						/>

						<button
							type="submit"
							class="btn btn-primary w-full"
							class:btn-disabled={formSubmitted}
							disabled={formSubmitted}
						>
							{#if formSubmitted}
								<i class="fas fa-spinner-third fa-spin mr-3" />
							{/if}
							Se connecter
						</button>
					</form>
				</div>
			</div>

			<div
				class="flex flex-col items-center justify-center mt-6 max-w-md"
			>
				<p class="text-sm font-medium text-gray-900 dark:text-white">
					Vous avez perdu l'accès à votre application
					d'authentification ?
				</p>

				<button
					on:click={() => eval("otpRecoveryModal.show()")}
					class="ml-2 text-sm font-medium text-primary hover:underline dark:text-primary-500"
				>
					Utiliser un code de récupération
				</button>
			</div>
		{:else}
			<div
				class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border dark:border-gray-700"
			>
				<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1
						class="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
					>
						Connexion à votre compte
					</h1>
					<form
						class="space-y-4 md:space-y-6"
						on:submit|preventDefault={login}
					>
						<div>
							<label
								for="email"
								class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>Adresse email</label
							>
							<input
								type="email"
								name="email"
								id="email"
								bind:this={iEmail}
								placeholder="name@company.com"
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!emailValid
									? 'border-red-500'
									: ''}"
								required
							/>
						</div>
						<div>
							<label
								for="password"
								class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>Mot de passe</label
							>
							<input
								type="password"
								name="password"
								id="password"
								bind:this={iPassword}
								placeholder="••••••••"
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!passwordValid
									? 'border-red-500'
									: ''}"
								required
							/>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-start">
								<div class="flex items-center h-5">
									<input
										id="remember"
										type="checkbox"
										bind:this={iRemember}
										class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
									/>
								</div>
								<div class="ml-3 text-sm">
									<label
										for="remember"
										class="text-gray-500 dark:text-gray-300"
										>Rester connecté</label
									>
								</div>
							</div>

							{#if CONFIG().userSettings.enablePasswordChange}
								<button
									on:click|preventDefault={() =>
										eval("resetPasswordModal.show()")}
									type="button"
									class="text-sm font-medium text-primary hover:underline dark:text-primary-500"
									>Mot de passe oublié ?</button
								>
							{/if}
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
							Se connecter
						</button>
					</form>
					{#if CONFIG().userSettings.enableRegistration}
						<div class="flex items-center justify-center mt-6">
							<p
								class="text-sm font-medium text-gray-900 dark:text-white"
							>
								Pas encore de compte ?
							</p>
							<a
								href="/register"
								class="ml-2 text-sm font-medium text-primary hover:underline dark:text-primary-500"
								>Inscrivez-vous</a
							>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex items-center justify-center mt-6">
				<p class="text-sm text-gray-600 dark:text-gray-400">
					&copy; {new Date().getFullYear()}
					<a
						class="link"
						href="https:/featherpanel.natoune.fr"
						target="_blank">Feather Panel</a
					>. Tous droits réservés.
				</p>
			</div>
		{/if}
	</div>
</section>
