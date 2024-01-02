<script lang="ts">
	import md5 from "md5";
	import toast, { Toaster } from "svelte-french-toast";
	import Error from "../components/Error.svelte";
	import Footer from "../components/Footer.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import ChangePasswordModal from "../components/modals/ChangePasswordModal.svelte";
	import OtpModal from "../components/modals/OtpModal.svelte";
	import { API, CONFIG } from "../utils/config";

	let iName: HTMLInputElement;
	let iEmail: HTMLInputElement;

	let editName = false;
	let editEmail = false;

	let oldName: string;
	let oldEmail: string;

	let user: any;

	let unsavedChanges = false;

	let showOtpModal = false;
	let otpAuthUrl: string;
	let otpSecret: string;
	let otpStep = 0;

	let loaded = false;
	let error = false;

	load();

	async function load() {
		loaded = false;

		await fetch(`${API()}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success" && res.data) user = res.data;
				else error = true;
			})
			.catch((err) => {
				error = true;
			});

		oldName = user.name;
		oldEmail = user.email;

		loaded = true;
	}

	function checkForChanges() {
		if (iName.value !== oldName || iEmail.value !== oldEmail)
			unsavedChanges = true;
		else unsavedChanges = false;
	}

	async function confirmEdit() {
		unsavedChanges = false;

		editName = false;
		editEmail = false;

		if (oldName !== iName.value) {
			user.name = iName.value;

			await fetch(`${API()}/user`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					name: iName.value,
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.status !== "success") {
						user.name = oldName;

						toast.error(
							"Une erreur est survenue lors de la modification de votre nom. Veuillez réessayer plus tard.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}
				})
				.catch((err) => {
					user.name = oldName;

					console.error(err);
					toast.error(
						"Une erreur est survenue lors de la modification de votre nom. Veuillez réessayer plus tard.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				});
		}

		if (oldEmail !== iEmail.value) {
			user.email = iEmail.value;

			await fetch(`${API()}/user`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					email: iEmail.value,
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "pending") {
						toast.success(
							"Un email de confirmation vous a été envoyé. Votre nouvelle adresse email sera effective après confirmation.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (res.status !== "success") {
						user.email = oldEmail;

						toast.error(
							"Une erreur est survenue lors de la modification de votre email. Veuillez réessayer plus tard.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}
				})
				.catch((err) => {
					user.email = oldEmail;

					console.error(err);
					toast.error(
						"Une erreur est survenue lors de la modification de votre email. Veuillez réessayer plus tard.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				});
		}
	}

	function cancelEdit() {
		unsavedChanges = false;

		editName = false;
		editEmail = false;

		iName.value = oldName;
		iEmail.value = oldEmail;
	}

	function otpGenerate() {
		fetch(`${API()}/auth/otp/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (
					res.status !== "success" ||
					!res.data ||
					!res.data.otpAuthUrl ||
					!res.data.otpSecret
				) {
					toast.error(
						"Une erreur est survenue lors de l'activation de l'authentification à deux facteurs. Veuillez réessayer plus tard.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
					return;
				}

				otpAuthUrl = res.data.otpAuthUrl;
				otpSecret = res.data.otpSecret;
				showOtpModal = true;
			})
			.catch((err) => {
				console.error(err);
				toast.error(
					"Une erreur est survenue lors de l'activation de l'authentification à deux facteurs. Veuillez réessayer plus tard.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}

	function otpInfos() {
		fetch(`${API()}/auth/otp/infos`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (
					res.status !== "success" ||
					!res.data ||
					!res.data.otpAuthUrl ||
					!res.data.otpSecret
				) {
					toast.error(
						"Une erreur est survenue. Veuillez réessayer plus tard.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
					return;
				}

				otpAuthUrl = res.data.otpAuthUrl;
				otpSecret = res.data.otpSecret;
				otpStep = 1;
				showOtpModal = true;
			})
			.catch((err) => {
				console.error(err);
				toast.error(
					"Une erreur est survenue. Veuillez réessayer plus tard.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}
</script>

<Sidebar active="account" />
{#if loaded}
	<div
		class="relative flex flex-col items-center justify-start md:ml-64 mt-14"
		style="min-height: calc(100vh - 3.5rem);"
	>
		{#if error}
			<Error
				code="500"
				message="Une erreur interne est survenue.<br/>Veuillez réessayer plus tard."
			/>
		{:else}
			<h1 class="text-3xl font-semibold text-center mt-10">
				Votre compte
			</h1>

			<div
				class="card w-10/12 md:w-2/3 xl:w-1/2 bg-base-100 shadow-xl mt-10"
			>
				<div class="card-body">
					<div class="flex flex-row items-center">
						<img
							class="w-16 h-16 xl:w-20 xl:h-20 rounded-lg mr-4"
							src="https://secure.gravatar.com/avatar/{md5(
								user.email.toLowerCase().trim(),
							)}"
							alt="Avatar"
						/>
						<div class="flex flex-col justify-center">
							<div class="flex flex-row w-fit">
								<input
									type="text"
									bind:this={iName}
									class="text-xl font-semibold rounded-lg px-2 border-0 ring-0 focus:ring-1 ring-primary"
									class:hidden={!editName}
									value={user.name}
									on:blur={checkForChanges}
								/>
								<h2
									class="card-title px-2"
									class:hidden={editName}
								>
									{user.name}
								</h2>
								{#if CONFIG().userSettings.enableAccountDetailsChange}
									<button
										class="px-3"
										on:click={() => {
											oldName = iName.value;
											editName = true;
											setTimeout(() => {
												iName.focus();
												iName.select();
											}, 10);
										}}
									>
										<i class="fas fa-pen text-sm" />
									</button>
								{/if}
							</div>
							<div class="flex flex-row w-fit">
								<input
									type="email"
									bind:this={iEmail}
									class="rounded-lg px-2 border-0 ring-0 focus:ring-1 ring-primary"
									class:hidden={!editEmail}
									value={user.email}
									on:blur={checkForChanges}
								/>
								<p class="px-2" class:hidden={editEmail}>
									{user.email}
								</p>
								{#if CONFIG().userSettings.enableAccountDetailsChange}
									<button
										class="px-3"
										on:click={() => {
											oldEmail = iEmail.value;
											editEmail = true;
											setTimeout(() => {
												iEmail.focus();
												iEmail.select();
											}, 10);
										}}
									>
										<i class="fas fa-pen text-sm" />
									</button>
								{/if}
							</div>
							<p class="text-sm text-gray-500 px-2 mt-3">
								Inscrit le: <span class="font-semibold"
									>{new Date(
										user.createdAt,
									).toLocaleDateString()}</span
								>
							</p>
							<p class="text-sm text-gray-500 px-2">
								Serveurs: <span class="font-semibold"
									>{user.serverCount}</span
								>
							</p>
						</div>
					</div>
				</div>
			</div>

			<div
				class="card w-10/12 md:w-2/3 xl:w-1/2 bg-base-100 shadow-xl mt-10"
			>
				<div class="card-body">
					<h2 class="card-title">Sécurité</h2>
					<div class="flex flex-col md:flex-row items-center">
						{#if CONFIG().userSettings.enablePasswordChange}
							<div class="flex flex-col w-full md:w-1/2">
								<h3 class="card-title">Mot de passe</h3>
								<p class="text-sm text-gray-500 text-left">
									Changez votre mot de passe
								</p>
							</div>
							<div class="flex flex-col w-full md:w-1/2">
								<button
									class="btn btn-secondary btn-outline btn-sm max-md:mt-4"
									on:click={() =>
										eval("passwordModal.showModal()")}
								>
									Modifier
								</button>
								<ChangePasswordModal />
							</div>
						{:else}
							<div class="flex flex-col w-full">
								<h3 class="card-title">Mot de passe</h3>
								<p class="text-sm text-gray-500 text-left">
									Vous ne pouvez pas modifier votre mot de
									passe depuis le panel
								</p>
							</div>
						{/if}
					</div>

					<div class="flex flex-col md:flex-row items-center mt-5">
						<div class="flex flex-col w-full md:w-1/2">
							<h3 class="card-title">2FA</h3>
							<p class="text-sm text-gray-500">
								Activez l'authentification à deux facteurs
							</p>
						</div>
						<div class="flex flex-col w-full md:w-1/2 space-y-4">
							{#if user.otpEnabled}
								<button
									class="btn btn-primary btn-outline btn-sm max-md:mt-4"
									on:click={otpInfos}
								>
									Voir plus
								</button>
							{:else}
								<button
									class="btn btn-primary btn-outline btn-sm max-md:mt-4"
									on:click={otpGenerate}
								>
									Activer
								</button>
							{/if}
						</div>
					</div>
				</div>
			</div>

			{#if unsavedChanges}
				<div class="fixed bottom-0 right-0 mb-10 mr-10 z-20">
					<div
						class="flex flex-row items-center justify-center bg-base-100 rounded-lg shadow-lg p-4"
					>
						<span class="text-lg mr-2">
							Vous avez des modifications non enregistrées
						</span>
						<div class="flex flex-row w-fit justify-end ml-2">
							<button
								class="btn btn-primary btn-outline btn-sm mr-2"
								on:click={confirmEdit}
							>
								Enregistrer
							</button>
							<button
								class="btn btn-error btn-outline btn-sm"
								on:click={cancelEdit}
							>
								Annuler
							</button>
						</div>
					</div>
				</div>
			{/if}
		{/if}

		<Footer />
	</div>
{:else}
	<div
		class="relative flex flex-col items-center justify-start md:ml-64 mt-14"
		style="min-height: calc(100vh - 3.5rem);"
	>
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
		>
			<span class="loading loading-spinner loading-lg" />
		</div>

		<Footer />
	</div>
{/if}
<Toaster />

{#if showOtpModal}
	<OtpModal
		{otpAuthUrl}
		{otpSecret}
		step={otpStep}
		on:close={() => (showOtpModal = false)}
		on:reload={load}
	/>
{/if}
