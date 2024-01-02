<script lang="ts">
	import { onMount } from "svelte";
	import toast from "svelte-french-toast";
	import Error from "../../components/Error.svelte";
	import FileEditor from "../../components/FileEditor.svelte";
	import FilesContextMenu from "../../components/FilesContextMenu.svelte";
	import { formatOct } from "../../utils/misc";
	import { getPermissions } from "../../utils/permissions";
	import { API } from "../../utils/config";

	export let server: any;
	export let extra: string = "";

	let permissions = getPermissions();

	let path = extra;
	let files: any[] = [];
	let lastFileSelected = -1;

	let sort = "alphabetic";

	let contextMenu = false;
	let contextMenuPosX = 0;
	let contextMenuPosY = 0;
	let contextMenuFile: any = null;

	let fileEditorContainer: HTMLDivElement;
	let fileEditor = false;
	let fileEditorValue: string | null = "";
	let fileEditorLanguage = "";
	let fileEditorReadOnly = false;
	let openedFile = "";
	let savingFile = false;

	let resizerInitial: any = null;

	let forbidden = false;
	let error = false;
	let loaded = false;

	(async () => {
		await fetch(
			`${API()}/servers/${
				server.serverId
			}/files/list?path=${encodeURIComponent(path)}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			},
		)
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success" && res.data) {
					files = res.data;
				} else {
					error = true;

					if (res.error && res.error === "FORBIDDEN") {
						forbidden = true;
					}
				}
			})
			.catch((err) => {
				error = true;
				console.error(err);
			});

		files = files.map((file) => {
			return {
				...file,
				selected: false,
				date: new Date(file.modifyTime),
			};
		});

		sortFiles();

		loaded = true;

		setTimeout(() => {
			document.getElementById("filesContainer")!.onselectstart = () =>
				false;
		}); // Wait for filesContainer to be loaded
	})();

	function sortFiles() {
		switch (sort) {
			case "alphabetic-reverse":
				files = files.sort((a, b) => {
					if (a.type === "d" && b.type === "-") return -1;
					if (a.type === "-" && b.type === "d") return 1;

					if (a.name.toLowerCase() < b.name.toLowerCase()) return 1;
					if (a.name.toLowerCase() > b.name.toLowerCase()) return -1;

					return 0;
				});
				break;
			case "date":
				files = files.sort((a, b) => {
					if (a.type === "d" && b.type === "-") return -1;
					if (a.type === "-" && b.type === "d") return 1;

					if (a.date < b.date) return -1;
					if (a.date > b.date) return 1;

					return 0;
				});
				break;
			case "date-reverse":
				files = files.sort((a, b) => {
					if (a.type === "d" && b.type === "-") return -1;
					if (a.type === "-" && b.type === "d") return 1;

					if (a.date < b.date) return 1;
					if (a.date > b.date) return -1;

					return 0;
				});
				break;
			case "size":
				files = files.sort((a, b) => {
					if (a.type === "d" && b.type === "-") return -1;
					if (a.type === "-" && b.type === "d") return 1;

					if (a.size < b.size) return -1;
					if (a.size > b.size) return 1;

					return 0;
				});
				break;
			case "size-reverse":
				files = files.sort((a, b) => {
					if (a.type === "d" && b.type === "-") return -1;
					if (a.type === "-" && b.type === "d") return 1;

					if (a.size < b.size) return 1;
					if (a.size > b.size) return -1;

					return 0;
				});
				break;
			default:
				files = files.sort((a, b) => {
					if (a.type === "d" && b.type === "-") return -1;
					if (a.type === "-" && b.type === "d") return 1;

					if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
					if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;

					return 0;
				});
				break;
		}
	}

	function pushFile(file: any) {
		files.push(file);
		files = files.map((file) => {
			return {
				...file,
				selected: false,
				date: new Date(file.modifyTime),
			};
		});

		sortFiles();
	}

	function openContextMenu(event: MouseEvent) {
		document.documentElement.oncontextmenu = () => false;
		contextMenu = false;

		// If a parent of event.target has the id "file-{index}"
		let fileIndex = -1;
		let target = event.target as HTMLElement;

		while (target.parentElement) {
			if (target.id.startsWith("file-")) {
				fileIndex = parseInt(target.id.split("-")[1]);
				break;
			}

			target = target.parentElement;
		}

		contextMenuPosX = event.clientX;
		contextMenuPosY = event.clientY;
		contextMenuFile = fileIndex !== -1 ? files[fileIndex] : null;

		setTimeout(() => {
			contextMenu = true;

			document.documentElement.oncontextmenu = () =>
				(contextMenu = false);
		});
	}

	function select(event: MouseEvent, file: any) {
		let fileIndex = files.findIndex((f) => f.name === file.name);

		if (event.ctrlKey) {
			if (event.shiftKey) {
				if (lastFileSelected !== -1) {
					if (lastFileSelected > fileIndex) {
						// select all files between fileIndex and lastFileSelected
						for (let i = fileIndex; i <= lastFileSelected; i++) {
							files[i].selected = true;
						}
					} else {
						// select all files between lastFileSelected and fileIndex
						for (let i = lastFileSelected; i <= fileIndex; i++) {
							files[i].selected = true;
						}
					}
				}
			} else {
				files[fileIndex].selected = !file.selected;
				lastFileSelected = fileIndex;
			}
		} else {
			files.forEach((f) => (f.selected = false));
			files[fileIndex].selected = true;
			lastFileSelected = fileIndex;

			document.getElementById("filesContainer")!.focus();
		}
	}

	async function open(file: any, newTab: boolean = false) {
		if (file.type === "d") {
			if (newTab) {
				window.open(
					`/servers/${server.serverId}/files/${path}${
						path.length > 0 ? "/" : ""
					}${file.name}/`,
					"_blank",
				);
			} else {
				location.href = `/servers/${server.serverId}/files/${path}${
					path.length > 0 ? "/" : ""
				}${file.name}/`;
			}
			return;
		} else {
			if (!permissions.includes("server.files.read")) {
				toast.error(
					`Vous n'avez pas la permission de lire les fichiers.`,
					{
						duration: 3000,
						position: "bottom-right",
					},
				);
				return;
			}

			fileEditorValue = null;
			fileEditor = true;
			openedFile = file.name;

			let fileInfos = await fetch(
				`${API()}/servers/${
					server.serverId
				}/files/stat?${new URLSearchParams({
					path: path,
					name: file.name,
				}).toString()}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${sessionStorage.getItem(
							"token",
						)}`,
					},
				},
			)
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "success" && res.data) {
						return res.data;
					} else {
						toast.error(`Impossible d'ouvrir le fichier.`, {
							duration: 3000,
							position: "bottom-right",
						});
						return null;
					}
				})
				.catch((err) => {
					console.error(err);
					toast.error(`Impossible d'ouvrir le fichier.`, {
						duration: 3000,
						position: "bottom-right",
					});
					return null;
				});

			if (!fileInfos) return;

			let fileContent = await fetch(
				`${API()}/servers/${
					server.serverId
				}/files/get?${new URLSearchParams({
					path: path,
					name: file.name,
				}).toString()}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${sessionStorage.getItem(
							"token",
						)}`,
					},
				},
			)
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "success" && res.data) {
						return res.data;
					} else {
						if (res.error && res.error === "FILE_TOO_LARGE") {
							toast.error(`Fichier trop volumineux.`, {
								duration: 3000,
								position: "bottom-right",
							});
						} else {
							toast.error(`Impossible d'ouvrir le fichier.`, {
								duration: 3000,
								position: "bottom-right",
							});
						}
						return null;
					}
				})
				.catch((err) => {
					console.error(err);
					toast.error(`Impossible d'ouvrir le fichier.`, {
						duration: 3000,
						position: "bottom-right",
					});
					return null;
				});

			if (!fileInfos) return;

			fileEditorValue = fileContent;
			fileEditorLanguage = (
				fileInfos.language || "plaintext"
			).toLowerCase();
			fileEditorReadOnly = !permissions.includes("server.files.write");
			openedFile = fileInfos.name;
		}
	}

	function copy(file: any) {
		if (!permissions.includes("server.files.copy")) {
			toast.error(
				`Vous n'avez pas la permission de copier les fichiers.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
			return;
		}

		let text = "/" + path + (path.length > 0 ? "/" : "") + file.name;

		sessionStorage.setItem("filesClipboard", text);

		toast.success(
			`1 ${file.type === "d" ? "dossier copié" : "fichier copié"}.`,
			{
				duration: 3000,
				position: "bottom-right",
			},
		);
	}

	function paste() {
		if (!permissions.includes("server.files.copy")) {
			toast.error(
				`Vous n'avez pas la permission de copier les fichiers.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
			return;
		}

		let rawFiles = sessionStorage.getItem("filesClipboard") || "";

		let pasteFiles = rawFiles
			.split("\n")
			.filter((f) => f.trim().length > 0);

		if (pasteFiles.length < 1) return;

		let loadingToast = toast.loading(
			`Collage de ${pasteFiles.length} ${
				pasteFiles.length > 1 ? "éléments" : "élément"
			}...`,
			{
				duration: 0,
				position: "bottom-right",
			},
		);

		fetch(`${API()}/servers/${server.serverId}/files/copy`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				path: path,
				files: pasteFiles,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				toast.dismiss(loadingToast);

				if (res.status === "success") {
					toast.success(
						`${pasteFiles.length} ${
							pasteFiles.length > 1
								? "éléments collés"
								: "élément collé"
						}.`,
						{
							duration: 3000,
							position: "bottom-right",
						},
					);
					res.data.forEach((name: string) => {
						if (name && name.length > 0) {
							pushFile({
								name: name.split("/").pop(),
								type: "-",
								size: 0,
								modifyTime: new Date(),
								selected: false,
							});
						}
					});
				} else {
					toast.error(`Impossible de coller les éléments.`, {
						duration: 3000,
						position: "bottom-right",
					});
				}
			})
			.catch((err) => {
				toast.dismiss(loadingToast);

				console.error(err);
				toast.error(`Impossible de coller les éléments.`, {
					duration: 3000,
					position: "bottom-right",
				});
			});
	}

	function copyPath(file: any) {
		if (file) {
			let text = "/" + path + (path.length > 0 ? "/" : "") + file.name;

			navigator.clipboard.writeText(text);

			toast.success(
				`Chemin du ${
					file.type === "d" ? "dossier" : "fichier"
				} copié dans le presse-papier.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
		} else {
			navigator.clipboard.writeText("/" + path);

			toast.success("Chemin copié dans le presse-papier.", {
				duration: 3000,
				position: "bottom-right",
			});
		}
	}

	function rename(file: any) {
		if (!permissions.includes("server.files.rename")) {
			toast.error(
				`Vous n'avez pas la permission de renommer les fichiers.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
			return;
		}

		let newName = prompt("Nouveau nom :", file.name);

		if (newName) {
			if (files.find((f) => f.name === newName)) {
				toast.error(
					`Un ${
						files.find((f) => f.name === newName).type === "d"
							? "dossier"
							: "fichier"
					} portant ce nom existe déjà.`,
					{
						duration: 3000,
						position: "bottom-right",
					},
				);
				return;
			}

			fetch(`${API()}/servers/${server.serverId}/files/rename`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					path: path,
					oldName: file.name,
					newName: newName,
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "success") {
						toast.success(
							`${
								file.type === "d" ? "Dossier" : "Fichier"
							} renommé.`,
							{
								duration: 3000,
								position: "bottom-right",
							},
						);
						file.name = newName;
					} else {
						toast.error(
							`Impossible de renommer le ${
								file.type === "d" ? "dossier" : "fichier"
							}.`,
							{
								duration: 3000,
								position: "bottom-right",
							},
						);
					}
				})
				.catch((err) => {
					console.error(err);
					toast.error(
						`Impossible de renommer le ${
							file.type === "d" ? "dossier" : "fichier"
						}.`,
						{
							duration: 3000,
							position: "bottom-right",
						},
					);
				});
		}
	}

	function download(file: any) {
		if (!permissions.includes("server.files.read")) {
			toast.error(
				`Vous n'avez pas la permission de télécharger les fichiers.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
			return;
		}

		if (file) {
			let loadingToast = toast.loading(
				`Téléchargement du ${
					file.type === "d" ? "dossier" : "fichier"
				} ${file.name}...`,
				{
					duration: 0,
					position: "bottom-right",
				},
			);

			fetch(
				`${API()}/servers/${
					server.serverId
				}/files/get?${new URLSearchParams({
					path: path,
					name: file.name,
				}).toString()}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem(
							"token",
						)}`,
					},
				},
			)
				.then((res) => res.blob())
				.then((blob) => {
					toast.dismiss(loadingToast);

					let url = window.URL.createObjectURL(blob);
					let a = document.createElement("a");
					a.href = url;
					a.download = file.name + (file.type === "d" ? ".tar" : "");
					document.body.appendChild(a);
					a.click();
					a.remove();
					window.URL.revokeObjectURL(url);
				})
				.catch((err) => {
					toast.dismiss(loadingToast);

					console.error(err);
					toast.error(
						`Impossible de télécharger le ${
							file.type === "d" ? "dossier" : "fichier"
						}.`,
						{
							duration: 3000,
							position: "bottom-right",
						},
					);
				});
		} else {
			let loadingToast = toast.loading(
				`Téléchargement du dossier ${path.split("/").pop()}...`,
				{
					duration: 0,
					position: "bottom-right",
				},
			);

			fetch(
				`${API()}/servers/${
					server.serverId
				}/files/get?${new URLSearchParams({
					path: path.split("/").slice(0, -1).join("/"),
					name: path.split("/").pop() || "",
				}).toString()}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem(
							"token",
						)}`,
					},
				},
			)
				.then((res) => res.blob())
				.then((blob) => {
					toast.dismiss(loadingToast);

					let url = window.URL.createObjectURL(blob);
					let a = document.createElement("a");
					a.href = url;
					a.download = path.split("/").pop() + ".tar";
					document.body.appendChild(a);
					a.click();
					a.remove();
					window.URL.revokeObjectURL(url);
				})
				.catch((err) => {
					toast.dismiss(loadingToast);

					console.error(err);
					toast.error(`Impossible de télécharger le dossier.`, {
						duration: 3000,
						position: "bottom-right",
					});
				});
		}
	}

	function deleteFile(file: any) {
		if (!permissions.includes("server.files.delete")) {
			toast.error(
				`Vous n'avez pas la permission de supprimer les fichiers.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
			return;
		}

		if (
			!confirm(
				`Êtes-vous sûr de vouloir supprimer le ${
					file.type === "d" ? "dossier" : "fichier"
				} ?`,
			)
		)
			return;

		fetch(`${API()}/servers/${server.serverId}/files/delete`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				path: path,
				name: file.name,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status === "success") {
					toast.success(
						`${
							file.type === "d" ? "Dossier" : "Fichier"
						} supprimé.`,
						{
							duration: 3000,
							position: "bottom-right",
						},
					);

					files = files.filter((f) => f.name !== file.name);
				} else {
					toast.error(
						`Impossible de supprimer le ${
							file.type === "d" ? "dossier" : "fichier"
						}.`,
						{
							duration: 3000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error(
					`Impossible de supprimer le ${
						file.type === "d" ? "dosier" : "fichier"
					}.`,
					{
						duration: 3000,
						position: "bottom-right",
					},
				);
			});
	}

	function saveFile() {
		if (!permissions.includes("server.files.write")) {
			toast.error(
				`Vous n'avez pas la permission d'écrire les fichiers.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
			return;
		}

		savingFile = true;
		fetch(`${API()}/servers/${server.serverId}/files/edit`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				path: path,
				name: openedFile,
				content: fileEditorValue,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				savingFile = false;
				if (res.status === "success") {
					toast.success(
						`${
							contextMenuFile.type === "d" ? "Dossier" : "Fichier"
						} enregistré.`,
						{
							duration: 3000,
							position: "bottom-right",
						},
					);
				} else {
					toast.error(
						`Impossible d'enregistrer le ${
							contextMenuFile.type === "d" ? "dossier" : "fichier"
						}.`,
						{
							duration: 3000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				savingFile = false;
				console.error(err);
				toast.error(
					`Impossible d'enregistrer le ${
						contextMenuFile.type === "d" ? "dossier" : "fichier"
					}.`,
					{
						duration: 3000,
						position: "bottom-right",
					},
				);
			});
	}

	function newFolder() {
		if (!permissions.includes("server.files.write")) {
			toast.error(
				`Vous n'avez pas la permission de créer des dossiers.`,
				{
					duration: 3000,
					position: "bottom-right",
				},
			);
			return;
		}

		let name = prompt("Nouveau dossier :");

		if (name) {
			if (files.find((f) => f.name === name)) {
				toast.error(
					`Un ${
						files.find((f) => f.name === name).type === "d"
							? "dossier"
							: "fichier"
					} portant ce nom existe déjà.`,
					{
						duration: 3000,
						position: "bottom-right",
					},
				);
				return;
			}

			fetch(`${API()}/servers/${server.serverId}/files/new-folder`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					path: path,
					name: name,
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "success") {
						toast.success(`Dossier créé.`, {
							duration: 3000,
							position: "bottom-right",
						});
						pushFile({
							name: name,
							type: "d",
							size: 0,
							modifyTime: new Date(),
							selected: false,
						});
					} else {
						toast.error(`Impossible de créer le dossier.`, {
							duration: 3000,
							position: "bottom-right",
						});
					}
				})
				.catch((err) => {
					console.error(err);
					toast.error(`Impossible de créer le dossier.`, {
						duration: 3000,
						position: "bottom-right",
					});
				});
		}
	}

	function selectAll() {
		files = files.map((f) => ({ ...f, selected: true }));
	}

	const fileEditorResize = (e: MouseEvent) => {
		fileEditorContainer.style.height = `${
			resizerInitial.height + (resizerInitial.y - e.pageY)
		}px`;
	};

	onMount(() => {
		document.documentElement.onclick = (e) => {
			contextMenu = false;
			return true;
		};

		addEventListener("keydown", (e) => {
			// Ctrl + A
			if (e.ctrlKey && e.key === "a") {
				e.preventDefault();
				files = files.map((f) => ({ ...f, selected: true }));
			}

			// Ctrl + C
			if (e.ctrlKey && e.key === "c") {
				e.preventDefault();
				let selectedFiles = files.filter((f) => f.selected);
				if (selectedFiles.length < 1) return;
				let text = selectedFiles
					.map((f) => path + (path.length > 0 ? "/" : "") + f.name)
					.join("\n");

				sessionStorage.setItem("filesClipboard", text);

				toast.success(
					`${selectedFiles.length} ${
						selectedFiles.length > 1
							? "fichiers copiés"
							: selectedFiles[0].type === "d"
							  ? "dossier copié"
							  : "fichier copié"
					}.`,
					{
						duration: 3000,
						position: "bottom-right",
					},
				);
			}

			// Ctrl + V
			if (e.ctrlKey && e.key === "v") {
				e.preventDefault();

				paste();
			}

			// Ctrl + Shift + N
			if (e.ctrlKey && e.shiftKey && e.key === "n") {
				e.preventDefault();

				newFolder();
			}

			// Ctrl + A
			if (e.ctrlKey && e.key === "a") {
				e.preventDefault();

				selectAll();
			}

			// Ctrl + S
			if (e.ctrlKey && e.key === "s") {
				e.preventDefault();

				download(files.find((f) => f.selected) || false);
			}
		});
	});
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Fichiers</h1>

{#if loaded}
	{#if forbidden}
		<Error
			code="403"
			message="Vous n'êtes pas autorisé à accéder à cette page."
		/>
	{:else}
		<div
			class="flex flex-col justify-center items-center mt-10 mb-5 w-full"
		>
			<div class="flex flex-col w-10/12">
				<div class="flex flex-row justify-start items-center xl:hidden">
					<h3 class="text-xl font-semibold">/{path}</h3>
				</div>
				<div
					class="flex flex-row justify-end xl:justify-between items-center"
				>
					<h3 class="text-xl font-semibold max-xl:hidden">/{path}</h3>
					<div>
						<span class="text-sm mr-2">Trier par</span>
						<select
							class="select select-bordered select-sm w-fit"
							on:change={() => setTimeout(sortFiles)}
							bind:value={sort}
						>
							<option value="alphabetic">Alphabétique</option>
							<option value="alphabetic-reverse"
								>Alphabétique inverse</option
							>
							<option value="date">Date</option>
							<option value="date-reverse">Date inverse</option>
							<option value="size">Taille</option>
							<option value="size-reverse">Taille inverse</option>
						</select>
					</div>
				</div>
			</div>
			<div
				class="flex flex-col xl:flex-row justify-start items-start w-10/12 mt-5"
			>
				<span class="text-sm mr-3">
					Sélection: {files.filter((f) => f.selected).length} / {files.length}
					{files.length > 1 ? "éléments" : "élément"}
				</span>

				<div
					class="flex flex-col md:flex-row max-md:mt-2 justify-start items-start"
				>
					<button
						class="btn btn-xs btn-outline mx-3 max-md:my-1"
						disabled={files.filter((f) => f.selected).length < 1 ||
							!permissions.includes("server.files.copy")}
						on:click={() => {
							let selectedFiles = files.filter((f) => f.selected);
							if (selectedFiles.length < 1) return;
							let text = selectedFiles
								.map(
									(f) =>
										path +
										(path.length > 0 ? "/" : "") +
										f.name,
								)
								.join("\n");

							sessionStorage.setItem("filesClipboard", text);

							toast.success(
								`${selectedFiles.length} ${
									selectedFiles.length > 1
										? "fichiers copiés"
										: selectedFiles[0].type === "d"
										  ? "dossier copié"
										  : "fichier copié"
								}.`,
								{
									duration: 3000,
									position: "bottom-right",
								},
							);
						}}
					>
						<i class="fas fa-copy" />
						Copier la sélection
					</button>

					<button
						class="btn btn-xs btn-error btn-outline mx-3 max-md:my-1"
						disabled={files.filter((f) => f.selected).length < 1 ||
							!permissions.includes("server.files.delete")}
						on:click={() => {}}
					>
						<i class="fas fa-trash" />
						Supprimer la sélection
					</button>
				</div>
			</div>
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				id="fullContainer"
				class="relative w-full flex justify-center items-start min-h-[50vh]"
				on:contextmenu|preventDefault={openContextMenu}
				on:click={(e) => {
					if (e.target === document.getElementById("fullContainer")) {
						files = files.map((f) => ({ ...f, selected: false }));
					}
				}}
			>
				{#if contextMenu}
					<FilesContextMenu
						posX={contextMenuPosX}
						posY={contextMenuPosY}
						file={contextMenuFile}
						on:open={(e) => open(e.detail.file, e.detail.newTab)}
						on:copy={(e) => copy(e.detail.file)}
						on:paste={(e) => paste()}
						on:copyPath={(e) => copyPath(e.detail.file)}
						on:rename={(e) => rename(e.detail.file)}
						on:download={(e) => download(e.detail.file)}
						on:delete={(e) => deleteFile(e.detail.file)}
						on:newFolder={() => newFolder()}
						on:selectAll={() => selectAll()}
					/>
				{/if}

				{#if fileEditor}
					<div
						id="fileEditorContainer"
						bind:this={fileEditorContainer}
						class="fixed z-30 bottom-0 min-h-[100px] max-h-[80vh] max-md:w-full left-1/12 h-1/3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg"
					>
						<!-- resizer -->
						<div
							on:mousedown|preventDefault={(e) => {
								resizerInitial = {
									y: e.pageY,
									height: fileEditorContainer.getBoundingClientRect()
										.height,
								};

								addEventListener("mousemove", fileEditorResize);
								addEventListener("mouseup", () => {
									removeEventListener(
										"mousemove",
										fileEditorResize,
									);
								});
							}}
							class="w-full h-1 cursor-row-resize"
						/>

						<!-- toolbar -->
						<div
							class="flex flex-row justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700"
						>
							<div class="flex flex-row items-center">
								{#if fileEditorValue}
									<span class="text-xs mr-2">Fichier : </span>
									<span class="text-xs">{openedFile}</span>
								{:else}
									<span class="text-xs mr-2"
										>Ouverture de {openedFile}...</span
									>
								{/if}
							</div>
							<div class="flex flex-row items-center">
								<button
									class="btn btn-sm btn-square btn-ghost"
									disabled={!fileEditorValue ||
										fileEditorReadOnly ||
										savingFile}
									on:click={saveFile}
								>
									<i class="fas fa-save" />
								</button>
								<button
									class="btn btn-sm btn-square btn-ghost mr-2"
									on:click={() => {
										fileEditor = false;
										fileEditorValue = "";
									}}
								>
									<i class="fas fa-times" />
								</button>
							</div>
						</div>

						{#if fileEditorValue}
							<FileEditor
								value={fileEditorValue}
								language={fileEditorLanguage}
								readOnly={fileEditorReadOnly}
								on:change={(e) => (fileEditorValue = e.detail)}
							/>
						{:else}
							<div
								class="flex flex-col justify-center items-center w-full h-full"
							>
								<span class="loading loading-lg" />
							</div>
						{/if}
					</div>
				{/if}

				<div id="filesContainer" class="flex flex-col mt-5 w-10/12">
					{#if path.length > 0}
						<div
							class="flex flex-row justify-between items-center px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-100 cursor-pointer"
							on:click={() =>
								(location.href = `/servers/${
									server.serverId
								}/files/${path
									.split("/")
									.slice(0, -1)
									.join("/")}`)}
							on:keydown={(e) => {
								if (e.key === "Enter") {
									location.href = `/servers/${
										server.serverId
									}/files/${path
										.split("/")
										.slice(0, -1)
										.join("/")}`;
								}
							}}
							role="button"
							tabindex="0"
						>
							<div class="flex flex-row items-center">
								<i
									class="fas fa-folder-arrow-up text-blue-500 mr-2"
								/>
								<span>Dossier parent</span>
							</div>
						</div>
					{/if}

					{#if error}
						<div
							class="flex flex-col justify-center items-center w-full h-full"
						>
							<span class="text-xl font-semibold">
								Impossible de charger les fichiers.
							</span>
						</div>
					{:else if files.length < 1}
						<div
							class="flex flex-col justify-center items-center w-full h-full"
						>
							<span class="text-xl font-semibold">
								Aucun fichier.
							</span>
						</div>
					{:else}
						{#each files as file}
							<!-- svelte-ally bug -->
							<div
								id={"file-" +
									files.findIndex(
										(f) => f.name === file.name,
									)}
								class="flex flex-col md:flex-row justify-between md:items-center px-3 py-2 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-100 cursor-pointer"
								class:bg-gray-200={file.selected}
								class:dark:bg-gray-700={file.selected}
								on:click={(e) => select(e, file)}
								on:dblclick={() => open(file)}
								on:keydown={(e) => {
									if (e.key === "Enter") {
										open(file, e.ctrlKey);
									}
								}}
								role="button"
								tabindex="0"
							>
								<div
									class="flex flex-row items-center md:w-2/3"
								>
									{#if file.type == "d"}
										<i
											class="fas fa-folder text-blue-500 mr-2"
										/>
									{:else}
										<i
											class="fas fa-file text-gray-500 mr-2"
										/>
									{/if}
									<span>{file.name}</span>
								</div>
								<div
									class="flex flex-row flex-wrap justify-end md:w-1/3"
								>
									{#if file.type !== "d"}
										<span class="text-xs mr-2"
											>{formatOct(file.size, 1)}</span
										>
									{/if}
									<span class="text-xs"
										>{file.date.toLocaleString({
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "numeric",
											minute: "numeric",
											second: "numeric",
										})}</span
									>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	{/if}
{:else}
	<div
		class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
	>
		<span class="loading loading-spinner loading-lg" />
	</div>
{/if}

<style>
	#fileEditorContainer {
		width: calc(100% - 16rem);
	}

	/* md */
	@media (max-width: 768px) {
		#fileEditorContainer {
			width: 100%;
		}
	}
</style>
