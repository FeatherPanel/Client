<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import { LANGUAGES } from "../../constants";
	import { API, CONFIG, loadConfig } from "../../utils/config";

	let iName: HTMLInputElement;
	let iContact: HTMLInputElement;
	let iLang: HTMLSelectElement;
	let iDbConfig: HTMLInputElement;
	let iDbType: HTMLSelectElement;
	let iDbSqlitePath: HTMLInputElement;
	let iDbHost: HTMLInputElement;
	let iDbPort: HTMLInputElement;
	let iDbUser: HTMLInputElement;
	let iDbPass: HTMLInputElement;
	let iDbName: HTMLInputElement;
	let iAppUrl: HTMLInputElement;
	let iSsl: HTMLInputElement;
	let iEnableRegistration: HTMLInputElement;
	let iEnableAccountDetailsChange: HTMLInputElement;
	let iEnablePasswordChange: HTMLInputElement;
	let iSmtpHost: HTMLInputElement;
	let iSmtpPort: HTMLInputElement;
	let iSmtpUser: HTMLInputElement;
	let iSmtpPass: HTMLInputElement;
	let iSmtpDkim: HTMLInputElement;
	let iSmtpSecure: HTMLInputElement;

	let dbType = "mysql";

	let nameValid = true;
	let contactValid = true;
	let langValid = true;
	let dbConfigValid = true;
	let appUrlValid = true;
	let smtpHostValid = true;
	let smtpPortValid = true;

	let globalSubmitted = false;
	let advancedSubmitted = false;
	let userSettingsSubmitted = false;
	let smtpSubmitted = false;

	let useSmtp = false;
	let smtpSettings: any = {};

	let loaded = false;

	(async () => {
		await fetch(`${API()}/admin/settings/smtp`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					smtpSettings = res.data;
					useSmtp =
						smtpSettings.host != null &&
						smtpSettings.port != null &&
						smtpSettings.auth.user != null &&
						smtpSettings.auth.pass != null;
				} else {
					toast.error(
						"Une erreur est survenue lors de la récupération des paramètres SMTP.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error(
					"Une erreur est survenue lors de la récupération des paramètres SMTP.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});

		loaded = true;
	})();

	function applyDbSettings() {
		if (dbType === "sqlite") {
			let path = iDbSqlitePath.value.trim();

			if (path.length > 0) {
				(
					document.getElementById(
						"database_config",
					) as HTMLInputElement
				).value = JSON.stringify({
					type: dbType,
					path: path,
				});
			} else {
				(
					document.getElementById(
						"database_config",
					) as HTMLInputElement
				).value = "";
			}
		} else {
			let host = iDbHost.value;
			let port = iDbPort.value;
			let user = iDbUser.value;
			let pass = iDbPass.value;
			let name = iDbName.value;

			if (name.length > 0 && host.length > 0 && user.length > 0) {
				(
					document.getElementById(
						"database_config",
					) as HTMLInputElement
				).value = JSON.stringify({
					type: dbType,
					database: name,
					host: host,
					port: port,
					user: user,
					password: pass,
				});
			} else {
				(
					document.getElementById(
						"database_config",
					) as HTMLInputElement
				).value = "";
			}
		}
	}

	async function saveGlobal() {
		let name = iName.value.trim();
		let lang = iLang.value.trim().toLowerCase();
		let contact = iContact.value.trim().toLowerCase();

		globalSubmitted = true;
		nameValid = true;
		langValid = true;
		contactValid = true;

		/* NAME */
		if (
			name.length < 3 ||
			name.length > 32 ||
			!name.match(/^[a-zA-Z0-9À-ÿ\s\(\)\[\]\{\}\.\-\_\!\?\&\+\=\*]+$/)
		)
			nameValid = false;

		/* LANG */
		if (LANGUAGES[lang] == null) langValid = false;

		/* CONTACT */
		if (!contact.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/))
			contactValid = false;

		/* ERROR */
		if (!nameValid || !langValid || !contactValid)
			return (globalSubmitted = false);

		/* SAVE */
		await fetch(`${API()}/admin/settings/global`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: name,
				lang: lang,
				contact: contact,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					loadConfig(true);

					toast.success(
						"Les paramètres ont été enregistrés avec succès.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				} else {
					toast.error(
						"Une erreur est survenue lors de l'enregistrement des paramètres.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);

					if (res.error) {
						if (res.error == "INVALID_NAME") nameValid = false;
						else if (res.error == "INVALID_LANGUAGE")
							langValid = false;
						else if (res.error == "INVALID_CONTACT")
							contactValid = false;
					}
				}
			})
			.catch((err) => {
				toast.error(
					"Une erreur est survenue lors de l'enregistrement des paramètres.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				console.error(err);
			});

		globalSubmitted = false;
	}

	async function saveAdvanced(dbUriConfirm = false) {
		let dbConfig: any = iDbConfig.value.trim();
		let appUrl = iAppUrl.value.trim().toLowerCase();
		if (appUrl.endsWith("/")) appUrl = appUrl.slice(0, -1);
		let ssl = iSsl.checked;

		dbConfigValid = true;
		advancedSubmitted = true;
		appUrlValid = true;

		if (!dbUriConfirm) {
			/* DB CONFIG */
			if (dbConfig.length > 0) {
				try {
					dbConfig = JSON.parse(dbConfig);
				} catch (err) {
					dbConfigValid = false;
				}
			} else {
				dbConfig = null;
			}

			/* APP URL */
			if (
				appUrl.length < 3 ||
				!appUrl.match(
					/^(https|http)?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
				)
			)
				appUrlValid = false;

			if (
				appUrl.startsWith("http://localhost") ||
				appUrl.startsWith("https://localhost")
			)
				toast.error(
					'Pour vous référer à votre machine locale, utilisez "127.0.0.1" à la place de "localhost".',
					{
						duration: 5000,
						position: "bottom-right",
					},
				);

			let testConnection = false;
			await fetch(`${appUrl}/api/ping`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					start: Date.now(),
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.data.responseTime) testConnection = true;
				})
				.catch((err) => {
					console.error(err);
				});

			if (!testConnection) {
				appUrlValid = false;
				toast.error(
					"Impossible de se connecter à l'API via l'URL spécifiée.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			}

			/* ERROR */
			if (!dbConfigValid || !appUrlValid)
				return (advancedSubmitted = false);
		}

		/* VERIFICATION */
		if (dbConfig.length > 0 && !dbUriConfirm)
			return eval("dbUriWarnModal.showModal()");

		/* SAVE */
		await fetch(`${API()}/admin/settings/advanced`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				db_config: dbConfig,
				app_url: appUrl,
				ssl: ssl,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					loadConfig(true);

					toast.success(
						"Les paramètres ont été enregistrés avec succès.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				} else {
					if (res.error) {
						if (res.error == "INVALID_DATABASE_CONFIGURATION") {
							dbConfigValid = false;
							toast.error(
								"La connexion à la base de données avec les paramètres spécifiés a échoué.",
								{
									duration: 5000,
									position: "bottom-right",
								},
							);
						} else if (res.error == "INVALID_APPLICATION_URL") {
							appUrlValid = false;
							toast.error(
								"Impossible de se connecter à l'API via l'URL spécifiée.",
								{
									duration: 5000,
									position: "bottom-right",
								},
							);
						}
					} else {
						toast.error(
							"Une erreur est survenue lors de l'enregistrement des paramètres.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}
				}
			})
			.catch((err) => {
				toast.error(
					"Une erreur est survenue lors de l'enregistrement des paramètres.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				console.error(err);
			});

		advancedSubmitted = false;
	}

	async function saveUserSettings() {
		let enableRegistration = iEnableRegistration.checked;
		let enableAccountDetailsChange = iEnableAccountDetailsChange.checked;
		let enablePasswordChange = iEnablePasswordChange.checked;

		userSettingsSubmitted = true;

		await fetch(`${API()}/admin/settings/userSettings`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				enableRegistration: enableRegistration,
				enableAccountDetailsChange: enableAccountDetailsChange,
				enablePasswordChange: enablePasswordChange,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					loadConfig(true);

					toast.success(
						"Les paramètres ont été enregistrés avec succès.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				} else {
					toast.error(
						"Une erreur est survenue lors de l'enregistrement des paramètres.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				toast.error(
					"Une erreur est survenue lors de l'enregistrement des paramètres.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				console.error(err);
			});

		userSettingsSubmitted = false;
	}

	async function saveSMTP() {
		let host = iSmtpHost ? iSmtpHost.value.trim() : null;
		let port = iSmtpPort ? iSmtpPort.value.trim() : null;
		let user = iSmtpUser ? iSmtpUser.value.trim() : null;
		let pass = iSmtpPass ? iSmtpPass.value.trim() : null;
		let dkim = iSmtpDkim ? iSmtpDkim.value.trim() : null;
		let secure = iSmtpSecure ? iSmtpSecure.checked : false;

		smtpSubmitted = true;
		smtpHostValid = true;
		smtpPortValid = true;

		if (useSmtp) {
			if (!host || !port || !user || !pass) {
				toast.error(
					"Veuillez remplir tous les champs SMTP pour activer la fonctionnalité.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				return (smtpSubmitted = false);
			}

			/* HOST */
			if (
				!host.match(/^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,63}$/)
			)
				smtpHostValid = false;

			/* PORT */
			if (!port.match(/^[0-9]+$/)) smtpPortValid = false;

			/* ERROR */
			if (!smtpHostValid || !smtpPortValid)
				return (smtpSubmitted = false);
		}

		/* SAVE */
		await fetch(`${API()}/admin/settings/smtp`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				enabled: useSmtp,
				host: host,
				port: (port && parseInt(port)) || null,
				user: user,
				pass: pass,
				dkim: dkim,
				secure: secure,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success") {
					toast.success(
						"Les paramètres ont été enregistrés avec succès.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				} else {
					if (res.error && res.error == "INVALID_SMTP_SETTINGS")
						toast.error(
							"La connexion au serveur SMTP avec les paramètres spécifiés a échoué.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					else
						toast.error(
							"Une erreur est survenue lors de l'enregistrement des paramètres.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
				}
			})
			.catch((err) => {
				toast.error(
					"Une erreur est survenue lors de l'enregistrement des paramètres.",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
				console.error(err);
			});

		smtpSubmitted = false;
	}
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Paramètres du panel</h1>

<div class="flex flex-row flex-wrap w-full justify-center mt-10">
	<div
		class="w-10/12 md:w-7/12 xl:w-1/3 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
	>
		<h1
			class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
		>
			Informations générales
		</h1>
		<form
			class="space-y-4 md:space-y-6 mt-3"
			on:submit|preventDefault={saveGlobal}
		>
			<div>
				<label
					for="panel_name"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Nom du panel</label
				>
				<input
					type="text"
					id="panel_name"
					bind:this={iName}
					placeholder="Feather Panel"
					value={CONFIG().app.name}
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!nameValid
						? 'border-red-500'
						: ''}"
					required
				/>
			</div>
			<div>
				<label
					for="lang"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Langue par défaut</label
				>
				<select
					id="lang"
					bind:this={iLang}
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!langValid
						? 'border-red-500'
						: ''}"
					required
				>
					{#each Object.keys(LANGUAGES) as lang}
						<option
							value={lang}
							selected={CONFIG().app.lang == lang}
							>{LANGUAGES[lang]}</option
						>
					{/each}
				</select>
			</div>
			<div>
				<label
					for="contact"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Email de contact</label
				>
				<input
					type="email"
					id="contact"
					bind:this={iContact}
					placeholder="contact@domain.com"
					value={CONFIG().app.contact}
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!contactValid
						? 'border-red-500'
						: ''}"
					required
				/>
			</div>
			<button
				type="submit"
				disabled={globalSubmitted}
				class="btn btn-primary btn-wide float-right">Enregistrer</button
			>
		</form>
	</div>
	<div
		class="w-10/12 md:w-7/12 xl:w-1/3 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
	>
		<h1
			class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
		>
			Paramètres avancés
		</h1>
		<form
			class="space-y-4 md:space-y-6 mt-3"
			on:submit|preventDefault={() => saveAdvanced()}
		>
			<div>
				<label
					for="database_config"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>URI de la base de données</label
				>
				<input
					type="text"
					id="database_config"
					bind:this={iDbConfig}
					disabled
					placeholder="Cliquer sur le bouton pour configurer"
					value=""
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!dbConfigValid
						? 'border-red-500'
						: ''}"
				/>
				<span class="text-xs text-gray-500"
					>Laisser vide pour garder la configuration actuelle</span
				>
				<button
					type="button"
					class="btn btn-neutral btn-outline btn-xs float-right mt-2"
					on:click={() => eval("uriModal.showModal()")}
					>Configurer</button
				>
				<dialog id="uriModal" class="modal">
					<form method="dialog" class="modal-box">
						<button
							class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
							>✕</button
						>

						<h3 class="font-bold text-lg">
							Configuration de la base de donnée
						</h3>
						<div class="my-3">
							<label
								for="db_type"
								class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>Type de base de données</label
							>
							<select
								id="db_type"
								bind:this={iDbType}
								on:change={() => (dbType = iDbType.value)}
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								required
							>
								<option value="mysql">MySQL</option>
								<option value="sqlite">SQLite</option>
								<option value="postgresql">PostgreSQL</option>
							</select>
						</div>

						{#if dbType === "sqlite"}
							<div class="my-3">
								<label
									for="db_path"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>
									Chemin de la base de donnée
								</label>
								<input
									type="text"
									id="db_path"
									bind:this={iDbSqlitePath}
									placeholder="/path/to/database.db"
									class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								/>
							</div>
						{:else}
							<div class="my-3">
								<label
									for="db_name"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Nom de la base de données</label
								>
								<input
									type="text"
									id="db_name"
									bind:this={iDbName}
									placeholder="featherpanel"
									class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								/>
							</div>
							<div class="my-3">
								<label
									for="db_host"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Hôte</label
								>
								<input
									type="text"
									id="db_host"
									bind:this={iDbHost}
									placeholder="127.0.0.1"
									class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								/>
							</div>
							<div class="my-3">
								<label
									for="db_port"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Port</label
								>
								<input
									type="number"
									id="db_port"
									bind:this={iDbPort}
									placeholder={dbType === "mysql"
										? "3306"
										: "5432"}
									class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								/>
							</div>
							<div class="my-3">
								<label
									for="db_user"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Nom d'utilisateur</label
								>
								<input
									type="text"
									id="db_user"
									bind:this={iDbUser}
									placeholder="root"
									autocomplete="off"
									class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								/>
							</div>
							<input
								name="dummyUsername"
								type="text"
								class="hidden"
							/>
							<input
								name="dummyPassword"
								type="password"
								class="hidden"
							/>
							<div class="my-3">
								<label
									for="db_pass"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Mot de passe</label
								>
								<input
									type="password"
									id="db_pass"
									bind:this={iDbPass}
									placeholder="••••••••"
									autocomplete="off"
									class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								/>
							</div>
						{/if}

						<div class="modal-action">
							<button
								class="btn btn-sm btn-primary btn-outline"
								on:click={() => {
									applyDbSettings();
								}}>Appliquer</button
							>
						</div>
					</form>

					<form method="dialog" class="modal-backdrop">
						<button>Fermer</button>
					</form>
				</dialog>
			</div>
			<div>
				<label
					for="app_url"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>URL du panel</label
				>
				<input
					type="text"
					id="app_url"
					bind:this={iAppUrl}
					placeholder="http://127.0.0.1"
					value={CONFIG().app.url}
					class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!appUrlValid
						? 'border-red-500'
						: ''}"
					required
				/>
			</div>
			<div>
				<label
					for="ssl"
					class="block text-sm font-medium text-gray-900 dark:text-white"
				>
					Utiliser SSL
				</label>
				<input
					type="checkbox"
					id="ssl"
					bind:this={iSsl}
					class="toggle mt-2"
					checked={CONFIG().app.ssl}
				/>
				<br />
				<span class="text-xs text-gray-500">
					Si vous n'avez pas encore configuré SSL pour le panel ou que
					vous utilisez un reverse proxy, <a
						href="https://docs.featherpanel.com/fr/panel/ssl"
						target="_blank"
						class="link-hover link-primary">cliquez ici</a
					>.
				</span>
			</div>
			<button
				type="submit"
				disabled={advancedSubmitted}
				class="btn btn-primary btn-wide float-right">Enregistrer</button
			>
		</form>
		<dialog id="dbUriWarnModal" class="modal">
			<form method="dialog" class="modal-box">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>✕</button
				>

				<h3 class="font-bold text-lg">Attention !</h3>
				<p class="text-gray-500 text-md">
					Étes-vous sûr de vouloir changer l'URI de la base de données
					?<br />
					Assurez-vous que les informations soient correctes avant de valider.
				</p>

				<div class="modal-action">
					<button class="btn btn-sm btn-error btn-outline"
						>Annuler</button
					>
					<button
						class="btn btn-sm btn-primary btn-outline"
						on:click={() => {
							saveAdvanced(true);
						}}>Enregistrer</button
					>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>Fermer</button>
			</form>
		</dialog>
	</div>
	<div
		class="w-10/12 md:w-7/12 xl:w-1/3 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
	>
		<h1
			class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
		>
			Paramètres utilisateur
		</h1>
		<form
			class="space-y-4 md:space-y-6 mt-3"
			on:submit|preventDefault={saveUserSettings}
		>
			<div class="form-control w-full">
				<label class="label cursor-pointer">
					<span class="label-text font-bold mr-5">
						Autoriser l'inscription via le panel
					</span>
					<input
						type="checkbox"
						bind:this={iEnableRegistration}
						class="toggle"
						checked={CONFIG().userSettings.enableRegistration}
					/>
				</label>
				<span class="text-xs text-gray-500">
					Désactivez cette option si vous souhaitez gérer les
					utilisateur via l'API. Par exemple, pour synchroniser les
					utilisateurs avec votre site web.
				</span>
			</div>
			<div class="form-control w-full">
				<label class="label cursor-pointer">
					<span class="label-text font-bold mr-5">
						Autoriser la modification du nom d'utilisateur /
						courriel
					</span>
					<input
						type="checkbox"
						bind:this={iEnableAccountDetailsChange}
						class="toggle"
						checked={CONFIG().userSettings
							.enableAccountDetailsChange}
					/>
				</label>
			</div>
			<div class="form-control w-full">
				<label class="label cursor-pointer">
					<span class="label-text font-bold mr-5">
						Autoriser la modification du mot de passe
					</span>
					<input
						type="checkbox"
						bind:this={iEnablePasswordChange}
						class="toggle"
						checked={CONFIG().userSettings.enablePasswordChange}
					/>
				</label>
				<span class="text-xs text-gray-500">
					<span class="font-bold">Attention !</span>
					Le serveur SMTP doit être correctement configuré pour permettre
					aux utilisateurs de réinitialiser leur mot de passe en cas de
					perte.
				</span>
			</div>

			<button
				type="submit"
				disabled={userSettingsSubmitted}
				class="btn btn-primary btn-wide float-right">Enregistrer</button
			>
		</form>
	</div>
	<div
		class="w-10/12 md:w-7/12 xl:w-1/3 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
	>
		<h1
			class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
		>
			Serveur SMTP
		</h1>
		<form
			class="space-y-4 md:space-y-6 mt-3"
			on:submit|preventDefault={saveSMTP}
		>
			<p class="text-gray-500 text-md">
				Un serveur SMTP est utilisé pour envoyer des emails à vos
				utilisateurs.<br />
				Activer cette option vous permettra d'envoyer des emails de réinitialisation
				de mot de passe, de confirmation de compte,&nbsp;etc.
			</p>
			{#if loaded}
				<div class="form-control w-fit">
					<label class="label cursor-pointer">
						<span class="label-text font-bold mr-5"
							>Utiliser un serveur SMTP ?</span
						>
						<input
							type="checkbox"
							class="toggle"
							checked={useSmtp}
							on:click={() => (useSmtp = !useSmtp)}
						/>
					</label>
				</div>
				{#if useSmtp}
					<div>
						<label
							for="smtp_host"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Hôte</label
						>
						<input
							type="text"
							id="smtp_host"
							bind:this={iSmtpHost}
							placeholder="smtp.example.com"
							value={smtpSettings.host}
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!smtpHostValid
								? 'border-red-500'
								: ''}"
							required
						/>
					</div>
					<div>
						<label
							for="smtp_port"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Port</label
						>
						<input
							type="number"
							id="smtp_port"
							bind:this={iSmtpPort}
							placeholder="587"
							value={smtpSettings.port}
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 {!smtpPortValid
								? 'border-red-500'
								: ''}"
							required
						/>
					</div>
					<div>
						<label
							for="smtp_username"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Nom d'utilisateur</label
						>
						<input
							type="text"
							id="smtp_username"
							bind:this={iSmtpUser}
							placeholder="user@example.com"
							autocomplete="off"
							value={smtpSettings.auth.user}
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							required
						/>
					</div>
					<div>
						<label
							for="smtp_password"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Mot de passe</label
						>
						<input
							type="password"
							id="smtp_password"
							bind:this={iSmtpPass}
							placeholder="••••••••"
							autocomplete="off"
							value={smtpSettings.auth.pass}
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							required
						/>
					</div>
					<div>
						<label
							for="smtp_dkim"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Clé privée dkim<span class="text-xs text-gray-500"
								>&nbsp;&nbsp;(optionnel)</span
							></label
						>
						<input
							type="text"
							id="smtp_dkim"
							bind:this={iSmtpDkim}
							placeholder="Entrez votre clé privée dkim"
							autocomplete="off"
							value={smtpSettings.dkim}
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						/>
						<span class="text-xs text-gray-500">
							Entrez la clé privée DKIM correspondant à
							l'enregistrement TXT "default._domainkey" de votre
							domaine.
						</span>
					</div>
					<div>
						<label
							for="smtp_secure"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Utiliser une connexion sécurisée (SSL/TLS)</label
						>
						<input
							type="checkbox"
							id="smtp_secure"
							bind:this={iSmtpSecure}
							class="toggle"
							checked={smtpSettings.secure}
						/>
					</div>
				{/if}

				<button
					type="submit"
					disabled={smtpSubmitted}
					class="btn btn-primary btn-wide float-right"
					>Enregistrer</button
				>
			{:else}
				<div
					class="flex items-center space-x-4 text-gray-500 animate-pulse"
				>
					<span class="loading loading-spinner loading-md" />
					<span class="text-md"
						>Récupération des paramètres SMTP...</span
					>
				</div>
			{/if}
		</form>
	</div>
</div>
<Toaster />
