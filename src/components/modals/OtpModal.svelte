<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import toast from "svelte-french-toast";
	import { API, CONFIG } from "../../utils/config";

	export let otpAuthUrl = "";
	export let otpSecret = "";
	export let step = 0;

	const dispatch = createEventDispatcher();

	let iOtpCode: HTMLInputElement;

	let submitted = false;
	let recoveryCode = "";

	function verify() {
		const otpCode = iOtpCode.value;

		if (otpCode.length !== 6)
			toast.error("Le code doit contenir 6 chiffres.", {
				position: "bottom-right",
				duration: 5000,
			});

		submitted = true;

		fetch(`${API()}/auth/otp/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({ otpCode }),
		})
			.then((res) => res.json())
			.then((res) => {
				submitted = false;
				if (res.status !== "success") {
					if (res.error && res.error === "INVALID_OTP_CODE")
						toast.error("Le code est incorrect.", {
							position: "bottom-right",
							duration: 5000,
						});
					else
						toast.error("Une erreur est survenue.", {
							position: "bottom-right",
							duration: 5000,
						});
				} else {
					toast.success("Authentification à deux facteurs activée.", {
						position: "bottom-right",
						duration: 5000,
					});
					recoveryCode = res.data.recoveryCode;
					step = 2;

					dispatch("reload");
				}
			})
			.catch((err) => {
				submitted = false;
				toast.error("Une erreur est survenue.", {
					position: "bottom-right",
					duration: 5000,
				});
			});
	}

	function regenerateRecoveryCode() {
		fetch(`${API()}/auth/otp/recovery`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status !== "success")
					toast.error("Une erreur est survenue.", {
						position: "bottom-right",
						duration: 5000,
					});
				else {
					recoveryCode = res.data.recoveryCode;
					step = 2;
					toast.success("Code de récupération renouvelé.", {
						position: "bottom-right",
						duration: 5000,
					});
				}
			})
			.catch((err) => {
				toast.error("Une erreur est survenue.", {
					position: "bottom-right",
					duration: 5000,
				});
			});
	}

	function otpDisable() {
		fetch(`${API()}/auth/otp/disable`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status !== "success")
					toast.error("Une erreur est survenue.", {
						position: "bottom-right",
						duration: 5000,
					});
				else {
					toast.success(
						"Authentification à deux facteurs désactivée.",
						{
							position: "bottom-right",
							duration: 5000,
						},
					);
					dispatch("close");
					dispatch("reload");
				}
			})
			.catch((err) => {
				toast.error("Une erreur est survenue.", {
					position: "bottom-right",
					duration: 5000,
				});
			});
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	id="otpModal"
	class="modal modal-open"
	on:keydown={(e) => e.key === "Escape" && dispatch("close")}
>
	<div class="modal-box relative">
		<div
			class="absolute top-0 left-0 right-0 w-full h-full pointer-events-none"
		>
			<div
				class="sticky -top-6 h-12 z-10 px-5 bg-base-200 flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 pointer-events-auto"
			>
				<h3 class="font-bold text-lg">
					Authentification à deux facteurs (2FA)
				</h3>

				<form method="dialog" on:submit={() => dispatch("close")}>
					<button class="btn btn-sm btn-circle btn-ghost">✕</button>
				</form>
			</div>
		</div>

		{#if step === 2}
			<div class="flex flex-col mt-9">
				<h4 class="font-bold text-lg">Code de récupération</h4>
				<p class="text-gray-500 my-2">
					Enregistrez votre code de récupération dans un endroit sûr
					mais accessible. Vous en aurez besoin pour vous connecter si
					vous perdez l'accès à votre application d'authentification.
				</p>

				<div class="flex flex-row items-center">
					<input
						type="text"
						id="recoveryCode"
						value={recoveryCode}
						class="input input-bordered w-full"
						disabled
					/>
					<button
						class="btn btn-sm btn-circle btn-ghost ml-2"
						on:click={() => {
							// @ts-ignore
							document.getElementById("recoveryCode").select();
							document.execCommand("copy");
							navigator.clipboard.writeText(recoveryCode);
						}}
					>
						<i class="fas fa-copy" />
					</button>
					<button
						class="btn btn-sm btn-circle btn-ghost ml-2"
						on:click={() => {
							let text = `CODE DE SECOURS 2FA POUR ${CONFIG().app.name.toUpperCase()}\n\n`;
							text +=
								" * Conservez ce code de secours dans un endroit sûr mais accessible.\n";
							text +=
								" * Vous en aurez besoin pour vous connecter si vous perdez l'accès à votre application d'authentification.\n\n";
							text += `\tCode de secours: ${recoveryCode}\n\n`;
							text += ` * Date de création: ${new Date().toLocaleString()}\n`;

							const element = document.createElement("a");
							const file = new Blob([text], {
								type: "text/plain",
							});

							element.href = URL.createObjectURL(file);
							element.download = "recovery-code.txt";
							document.body.appendChild(element);
							element.click();

							document.body.removeChild(element);
						}}
					>
						<i class="fas fa-download" />
					</button>
				</div>
			</div>
		{:else}
			<div class="flex flex-col mt-9">
				<h4 class="font-bold text-lg">
					Configurer une application d'authentification
				</h4>

				<ol class="list-decimal list-outside ml-5">
					<li>
						Installez une application d'authentification sur votre
						téléphone (ex: Authenticator ou Authy).
					</li>
					<li>
						Dans l'application, sélectionnez l'icon "<i
							class="fas fa-plus"
						/>".
					</li>
					<li>
						Sélectionnez "<i class="fas fa-qrcode" /> Scanner un code
						QR" et scannez le code ci-dessous.
					</li>
				</ol>
			</div>

			<div class="divider" />

			<div class="flex flex-col">
				<h4 class="font-bold text-lg">Scannez le code QR</h4>

				<img
					src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data={encodeURIComponent(
						otpAuthUrl,
					)}"
					alt="Chargement en cours..."
					class="w-64 h-64 mx-auto my-4 border-none bg-white p-2 rounded-2xl"
				/>
			</div>

			<div class="flex flex-col">
				<h4 class="font-bold text-lg">
					Ou entrez le code manuellement
				</h4>

				<div class="flex flex-row items-center">
					<input
						type="text"
						id="otpSecret"
						value={otpSecret}
						class="input input-bordered w-full"
						disabled
					/>
					<button
						class="btn btn-sm btn-circle btn-ghost ml-2"
						on:click={() => {
							// @ts-ignore
							document.getElementById("otpSecret").select();
							document.execCommand("copy");
							navigator.clipboard.writeText(otpSecret);
						}}
					>
						<i class="fas fa-copy" />
					</button>
				</div>
			</div>

			<div class="divider" />

			{#if step === 0}
				<div class="flex flex-col">
					<h4 class="font-bold text-lg">
						Entrez le code de vérification
					</h4>
					<p class="text-sm text-gray-500">
						Entrez le code à 6 chiffres généré par l'application
						d'authentification.
					</p>

					<form
						method="dialog"
						class="flex flex-row items-center justify-center mt-4"
						on:submit|preventDefault={verify}
					>
						<input
							type="number"
							bind:this={iOtpCode}
							class="input input-bordered w-full tracking-widest"
							placeholder="123456"
							maxlength="6"
							minlength="6"
							required
						/>
						<button
							class="btn btn-primary ml-2"
							class:btn-disabled={submitted}
							disabled={submitted}
						>
							Valider
						</button>
					</form>
				</div>
			{:else}
				<div class="flex flex-col">
					<h4 class="font-bold text-lg">
						Renouveler le code de récupération
					</h4>
					<p class="text-sm text-gray-500">
						Le code de récupération est un code unique qui vous
						permettra de vous connecter si vous perdez l'accès à
						votre application d'authentification.
					</p>

					<form
						method="dialog"
						class="flex flex-row items-center justify-center mt-4"
						on:submit|preventDefault={regenerateRecoveryCode}
					>
						<button class="btn btn-primary">Renouveler</button>
					</form>
				</div>

				<div class="divider" />

				<div class="flex flex-col">
					<h4 class="font-bold text-lg">
						Désactiver l'authentification à deux facteurs
					</h4>
					<p class="text-sm text-gray-500">
						En désactivant l'authentification à deux facteurs, vous
						perdrez l'accès à votre compte si vous perdez votre mot
						de passe.
					</p>

					<form
						method="dialog"
						class="flex flex-row items-center justify-center mt-4"
						on:submit|preventDefault={otpDisable}
					>
						<button class="btn btn-error">Désactiver</button>
					</form>
				</div>
			{/if}
		{/if}
	</div>
	<form
		method="dialog"
		class="modal-backdrop"
		on:submit={() => dispatch("close")}
	>
		<button>close</button>
	</form>
</dialog>
