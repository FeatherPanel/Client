<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import { API } from "../../utils/config";

	export let serverId: string;
	export let backups: any;

	let iName: HTMLInputElement;
	let tIgnore: HTMLTextAreaElement;

	let nameError = false;

	let submitted = false;

	function createBackup() {
		submitted = true;

		nameError = false;

		if (iName.value.length < 3 || iName.value.length > 32) {
			nameError = true;
			toast.error(
				"Le nom de la sauvegarde doit contenir entre 3 et 32 caractères.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);

			submitted = false;
			return;
		}

		if (backups.find((backup: any) => backup.name == iName.value)) {
			nameError = true;
			toast.error("Une sauvegarde avec ce nom existe déjà.", {
				duration: 5000,
				position: "bottom-right",
			});

			submitted = false;
			return;
		}

		fetch(`${API()}/servers/${serverId}/backups`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				name: iName.value,
				ignore: tIgnore.value.split("\n"),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "pending") {
					toast.success("La sauvegarde est en cours de création...", {
						duration: 5000,
						position: "bottom-right",
					});

					submitted = false;
					iName.value = "";

					eval("createBackupModal.close()");

					location.reload();
				} else {
					toast.error("Une erreur est survenue.", {
						duration: 5000,
						position: "bottom-right",
					});

					submitted = false;
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Une erreur est survenue.", {
					duration: 5000,
					position: "bottom-right",
				});
				submitted = false;
			});
	}
</script>

<dialog id="createBackupModal" class="modal">
	<form method="dialog" class="modal-box">
		<button
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			disabled={submitted}>✕</button
		>

		<h3 class="font-bold text-lg">Créer une sauvegarde</h3>
		<p class="text-gray-500">
			Vous pouvez créer une sauvegarde des fichiers de votre serveur en
			remplissant le formulaire ci-dessous.
		</p>
		<form
			class="flex flex-col space-y-5"
			on:submit|preventDefault={createBackup}
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
						placeholder="Nom de la sauvegarde"
						minlength="3"
						maxlength="32"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="ignore"
						><span class="label-text">Ignorer les fichiers</span
						></label
					>
					<textarea
						id="ignore"
						bind:this={tIgnore}
						class="textarea textarea-bordered textarea-sm"
						placeholder="Fichiers à ignorer (un par ligne)"
					></textarea>

					<p class="text-xs text-gray-500">
						Les fichiers à ignorer sont les fichiers qui ne seront
						pas inclus dans la sauvegarde. Vous pouvez utiliser des
						wildcards (ex: <code>logs/*</code>).
					</p>
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
