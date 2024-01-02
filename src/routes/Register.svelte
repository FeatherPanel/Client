<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import { IS_DARK } from "../constants";
	import { API, CONFIG } from "../utils/config";

	let iUsername: HTMLInputElement;
	let iEmail: HTMLInputElement;
	let iPassword: HTMLInputElement;
	let iPasswordConfirm: HTMLInputElement;
	let iAgree: HTMLInputElement;

	let usernameValid = true;
	let emailValid = true;
	let passwordValid = true;

	let formSubmitted = false;

	function togglePassword(id: string) {
		let input = document.getElementById(id) as HTMLInputElement;
		if (input.type === "password") {
			input.type = "text";
			input.parentElement
				?.querySelector("i")
				?.classList.replace("fa-eye-slash", "fa-eye");
		} else {
			input.type = "password";
			input.parentElement
				?.querySelector("i")
				?.classList.replace("fa-eye", "fa-eye-slash");
		}
	}

	function register() {
		formSubmitted = true;

		let username = iUsername.value;
		let email = iEmail.value;
		let password = iPassword.value;
		let passwordConfirm = iPasswordConfirm.value;
		let agree = iAgree.checked;

		usernameValid = username.length >= 3 && username.length <= 32;
		emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		passwordValid = password.length >= 8;

		if (!usernameValid || !emailValid || !passwordValid)
			return (formSubmitted = false);

		if (password !== passwordConfirm) {
			toast.error("Les mots de passe ne correspondent pas.", {
				duration: 5000,
				position: "bottom-right",
			});
			formSubmitted = false;
			return;
		}

		if (!agree) {
			toast.error("Vous devez accepter les conditions d'utilisation.", {
				duration: 5000,
				position: "bottom-right",
			});
			formSubmitted = false;
			return;
		}

		fetch(`${API()}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				email,
				password,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					location.href = "/login?fromRegister";
				} else {
					formSubmitted = false;
					if (res.error && res.error == "EMAIL_ALREADY_EXISTS") {
						toast.error("Cette adresse email est déjà utilisée.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else if (
						res.error &&
						res.error == "USERNAME_ALREADY_EXISTS"
					) {
						toast.error("Ce nom d'utilisateur est déjà utilisé.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else if (res.error && res.error == "INVALID_EMAIL") {
						toast.error("Adresse email invalide.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else if (res.error && res.error == "FORBIDDEN_EMAIL") {
						toast.error(
							"Les adresses email de ce domaine ne sont pas autorisées.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (res.error && res.error == "INVALID_USERNAME") {
						toast.error("Nom d'utilisateur invalide.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else if (res.error && res.error == "INVALID_PASSWORD") {
						toast.error("Mot de passe invalide.", {
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
		<div
			class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border dark:border-gray-700"
		>
			<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
				<h1
					class="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
				>
					Créer un compte
				</h1>
				<form
					class="space-y-4 md:space-y-6"
					on:submit|preventDefault={register}
				>
					<input
						type="password"
						name="password"
						class="hidden"
						value=""
						autocomplete="current-password"
					/>

					<div>
						<label
							for="username"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Nom d'utilisateur</label
						>
						<input
							type="text"
							name="username"
							id="username"
							bind:this={iUsername}
							placeholder="John Doe"
							autocomplete="off"
							minlength="3"
							maxlength="32"
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!usernameValid
								? 'border-red-500'
								: ''}"
							required
						/>
					</div>
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
							autocomplete="username"
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

						<div class="relative">
							<input
								type="password"
								name="password"
								id="password"
								bind:this={iPassword}
								placeholder="••••••••"
								autocomplete="new-password"
								minlength="8"
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!passwordValid
									? 'border-red-500'
									: ''}"
								required
							/>
							<button
								class="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
								tabindex="-1"
								on:click|preventDefault={() =>
									togglePassword("password")}
							>
								<i
									class="fas fa-eye-slash text-gray-400 dark:text-gray-300"
								/>
							</button>
						</div>
					</div>
					<div>
						<label
							for="passwordConfirm"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Retaper le mot de passe</label
						>

						<div class="relative">
							<input
								type="password"
								name="passwordConfirm"
								id="passwordConfirm"
								bind:this={iPasswordConfirm}
								placeholder="••••••••"
								autocomplete="new-password"
								minlength="8"
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!passwordValid
									? 'border-red-500'
									: ''}"
								required
							/>
							<button
								class="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
								tabindex="-1"
								on:click|preventDefault={() =>
									togglePassword("passwordConfirm")}
							>
								<i
									class="fas fa-eye-slash text-gray-400 dark:text-gray-300"
								/>
							</button>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-start">
							<div class="flex items-center h-5">
								<input
									id="agree"
									type="checkbox"
									bind:this={iAgree}
									on:keypress={(e) => {
										if (e.key === "Enter")
											// @ts-ignore
											e.target.checked =
												// @ts-ignore
												!e.target.checked;
									}}
									class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
								/>
							</div>
							<div class="ml-3 text-sm">
								<label
									for="agree"
									class="text-gray-500 dark:text-gray-300"
									>J'accepte les <a
										href="/terms"
										class="text-primary hover:underline dark:text-primary-500"
										>conditions d'utilisation</a
									>
								</label>
							</div>
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
						Créer un compte
					</button>
				</form>
			</div>
		</div>

		<div class="flex items-center justify-center mt-6">
			<p class="text-sm font-medium text-gray-900 dark:text-white">
				Vous avez déjà un compte ?
			</p>
			<a
				href="/login"
				class="ml-2 text-sm font-medium text-primary hover:underline dark:text-primary-500"
				>Connectez-vous</a
			>
		</div>
	</div>
</section>
