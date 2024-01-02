<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import { API } from "../../utils/config";

	let iCurrentPassword: HTMLInputElement;
	let iNewPassword: HTMLInputElement;
	let iPasswordConfirm: HTMLInputElement;
	let iSubmit: HTMLInputElement;

	let passwordValid = false;
	let passwordCorrespond = true;
	let submitted = false;

	function checkPassword() {
		if (
			iNewPassword.value.length < 8 ||
			iNewPassword.value.length > 32 ||
			iNewPassword.value !== iPasswordConfirm.value
		)
			passwordValid = false;
		else passwordValid = true;

		if (iNewPassword.value !== iPasswordConfirm.value)
			passwordCorrespond = false;
		else passwordCorrespond = true;
	}

	function changePassword() {
		submitted = true;

		if (!passwordValid) {
			toast.error("Le mot de passe doit faire entre 8 et 32 caractères.");
			submitted = false;
			return;
		}

		if (!passwordCorrespond) {
			toast.error("Les mots de passe ne correspondent pas.");
			submitted = false;
			return;
		}

		fetch(`${API()}/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItemItem("token")}`,
			},
			body: JSON.stringify({
				currentPassword: iCurrentPassword.value,
				newPassword: iNewPassword.value,
			}),
		})
			.then((res) => {
				if (res.status === 200) {
					toast.success("Votre mot de passe a été modifié.");
					iCurrentPassword.value = "";
					iNewPassword.value = "";
					iPasswordConfirm.value = "";
					submitted = false;
				} else if (res.status === 401) {
					toast.error("Le mot de passe actuel est incorrect.");
					submitted = false;
				} else {
					toast.error("Une erreur est survenue.");
					submitted = false;
				}
			})
			.catch(() => {
				toast.error("Une erreur est survenue.");
				submitted = false;
			});
	}
</script>

<dialog id="passwordModal" class="modal">
	<div class="modal-box">
		<form method="dialog">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				disabled={submitted}>✕</button
			>
		</form>

		<h3 class="font-bold text-lg">Modifier le mot de passe</h3>
		<p class="text-gray-500">
			Modifiez le mot de passe de votre compte via ce formulaire.
		</p>
		<form
			class="flex flex-col space-y-5"
			on:submit|preventDefault={changePassword}
		>
			<input
				type="submit"
				bind:this={iSubmit}
				class="hidden"
				disabled={submitted}
				tabindex="-1"
			/>
			<div class="flex flex-col space-y-2">
				<div class="form-control">
					<label class="label" for="currentPassword"
						><span class="label-text">Mot de passe actuel</span
						></label
					>
					<input
						type="password"
						id="currentPassword"
						bind:this={iCurrentPassword}
						class="input input-bordered input-sm"
						placeholder="Mot de passe actuel"
						autocomplete="off"
						minlength="8"
						maxlength="32"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="newPassword"
						><span class="label-text">Nouveau mot de passe</span
						></label
					>
					<input
						type="password"
						id="newPassword"
						bind:this={iNewPassword}
						on:input={checkPassword}
						class="input input-bordered input-sm"
						class:input-error={!passwordCorrespond}
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
						on:input={checkPassword}
						class="input input-bordered input-sm"
						class:input-error={!passwordCorrespond}
						placeholder="Répéter le mot de passe"
						minlength="8"
						maxlength="32"
						required
					/>
				</div>
			</div>

			{#if iNewPassword && iPasswordConfirm}
				<span class="label-text-alt">
					{#if iNewPassword.value.length < 8}
						Le mot de passe doit contenir au moins 8 caractères.
					{:else if iNewPassword.value.length > 32}
						Le mot de passe ne doit pas dépasser 32 caractères.
					{:else if iNewPassword.value !== iPasswordConfirm.value}
						Les mots de passe ne correspondent pas.
					{:else}
						&nbsp;
					{/if}
				</span>
			{/if}

			<div>
				<button
					class="btn btn-primary btn-wide float-right"
					class:btn-disabled={submitted ||
						!passwordValid ||
						!passwordCorrespond}
					on:click={() => {
						iSubmit.click();
					}}
					on:keypress={(event) => {
						if (event.key === "Enter") iSubmit.click();
					}}>Créer</button
				>
			</div>
		</form>
	</div>

	<Toaster />
</dialog>
