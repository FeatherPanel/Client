<script lang="ts">
	import toast from "svelte-french-toast";
	import { API } from "../../utils/config";

	export let email: string;
	export let password: string;
	export let remember: boolean;

	let iRecoveryCode: HTMLInputElement;

	let formSubmitted = false;

	function submit() {
		formSubmitted = true;

		fetch(`${API()}/auth/otp/recovery`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
				password,
				recoveryCode: iRecoveryCode.value,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				formSubmitted = false;

				if (res.status === "success") {
					sessionStorage.setItem("token", res.data.token);
					if (remember) {
						localStorage.setItem("token", res.data.token);
					}
					location.href = location.href + "?fromLogin&otpDisabled";
				} else {
					if (res.error && res.error == "INVALID_RECOVERY_CODE") {
						toast.error("Le code de récupération est invalide.", {
							duration: 5000,
							position: "bottom-right",
						});
					} else {
						toast.error("Une erreur inconnue s'est produite.", {
							duration: 5000,
							position: "bottom-right",
						});
					}
				}
			})
			.catch((err) => {
				formSubmitted = false;

				toast.error("Une erreur inconnue s'est produite.", {
					duration: 5000,
					position: "bottom-right",
				});
			});
	}
</script>

<dialog id="otpRecoveryModal" class="modal bg-black bg-opacity-50">
	<div class="modal-box">
		<form method="dialog">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>✕</button
			>
		</form>

		<h3 class="font-bold text-lg">Utiliser un code de récupération</h3>

		<p class="text-sm">
			Entrez le code de récupération récupéré lors de l'activation de
			l'authentification à deux facteurs.
		</p>

		<form on:submit|preventDefault={submit}>
			<div class="form-control">
				<label for="code" class="label">
					<span class="label-text">Code</span>
				</label>
				<input
					type="text"
					name="code"
					id="code"
					bind:this={iRecoveryCode}
					placeholder="Entrez votre code de récupération"
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
	</div>
</dialog>
