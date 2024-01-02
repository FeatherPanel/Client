<script lang="ts">
	import { MODRINTH_API } from "../../../constants";
	import { selectedMinecraftPlugin } from "../../../utils/store";
	import Markdown from "markdown-it";

	import "../../../css/markdown.css";
	import {
		formatDateRelative,
		formatNumber,
		formatNumberWithCommas,
	} from "../../../utils/misc";
	import toast, { Toaster } from "svelte-french-toast";
	import { loaders } from "../../../utils/minecraft";
	import { API } from "../../../utils/config";

	export let serverId: string;

	let minecraftVersions: any[] = [];

	let slug: string;
	let type: string;
	let plugin: any;
	let pluginGameVersions: any[] = [];
	let pluginVersions: any[] = [];

	let showVersions = false;
	let versionsLoaded = false;
	let selectedGameVersion = "";
	let selectedLoader = "";
	let stablesOnly = false;

	let installing = "";

	let md = new Markdown({
		linkify: true,
		html: true,
	});

	selectedMinecraftPlugin.subscribe((value) => {
		slug = value.slug;
		type = value.type;
		plugin = {};
		pluginGameVersions = [];
		pluginVersions = [];
		showVersions = false;
		versionsLoaded = false;
		selectedGameVersion = "";
		selectedLoader = "";
		stablesOnly = false;

		getPlugin();
	});

	async function getPlugin() {
		if (minecraftVersions.length === 0)
			await fetch(`${MODRINTH_API}/tag/game_version`)
				.then((res) => res.json())
				.then((data) => {
					minecraftVersions = data;
				});

		fetch(`${MODRINTH_API}/project/${slug}`)
			.then((res) => res.json())
			.then((data) => {
				plugin = data;
				plugin.loaders = plugin.loaders.filter(
					(value: string) =>
						loaders[value] &&
						loaders[value].project_types.includes(type),
				);

				setTimeout(processMarkdown);
			});
	}

	function processMarkdown() {
		const markdownLinks = document.querySelectorAll(
			"#markdown a",
		) as NodeListOf<HTMLAnchorElement>;

		markdownLinks.forEach((link) => {
			link.target = "_blank";
		});
	}

	function mapCapitalize(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function showPluginVersions() {
		showVersions = true;

		fetch(`${MODRINTH_API}/project/${slug}/version`)
			.then((res) => res.json())
			.then((data) => {
				data.forEach((version: any) => {
					let validLoader = false;
					version.loaders.forEach((loader: string) => {
						if (
							loaders[loader] &&
							loaders[loader].project_types.includes(type)
						)
							validLoader = true;
					});

					if (type === "datapack" || validLoader) {
						version.game_versions.forEach((gameVersion: string) => {
							if (!pluginGameVersions.includes(gameVersion))
								pluginGameVersions.push(gameVersion);
						});

						pluginVersions.push(version);
					}
				});

				pluginGameVersions = pluginGameVersions.filter(
					(value) =>
						minecraftVersions.find((v) => v.version === value) &&
						minecraftVersions.find((v) => v.version === value)
							.version_type === "release",
				);

				pluginGameVersions = pluginGameVersions.sort((a, b) => {
					const aDate = new Date(
						minecraftVersions.find(
							(v) => v.version === a,
						).date_published,
					);
					const bDate = new Date(
						minecraftVersions.find(
							(v) => v.version === b,
						).date_published,
					);

					return bDate.getTime() - aDate.getTime();
				});

				pluginVersions = pluginVersions.sort((a, b) => {
					const aDate = new Date(a.date_published);
					const bDate = new Date(b.date_published);

					return bDate.getTime() - aDate.getTime();
				});

				selectedGameVersion = pluginGameVersions[0];
				selectedLoader =
					type === "datapack" ? "datapack" : plugin.loaders[0] || "";

				versionsLoaded = true;
			});
	}

	function installPlugin(version: string) {
		installing = version;

		fetch(`${API()}/servers/${serverId}/plugins/install`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				id: plugin.slug,
				type,
				version,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				installing = "";
				if (data.status === "success") {
					if (type === "modpack") {
						toast.success(
							`Le modpack ${plugin.title} sera installé au prochain démarrage du serveur !`,
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else {
						toast.success(
							`Le ${
								type === "datapack"
									? "datapack"
									: type === "plugin"
									  ? "plugin"
									  : "mod"
							} ${plugin.title} a été installé avec succès !`,
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					}

					eval("pluginModal.close()");
				} else {
					toast.error(
						`Une erreur est survenue lors de l'installation du ${
							type === "mod"
								? "mod"
								: type === "plugin"
								  ? "plugin"
								  : type === "datapack"
								    ? "datapack"
								    : "modpack"
						} !`,
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				installing = "";
				console.error(err);

				toast.error(
					`Une erreur est survenue lors de l'installation du ${
						type === "mod"
							? "mod"
							: type === "plugin"
							  ? "plugin"
							  : type === "datapack"
							    ? "datapack"
							    : "modpack"
					} !`,
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}
</script>

<dialog id="pluginModal" class="modal">
	<Toaster />

	<div class="modal-box w-11/12 max-w-5xl">
		{#if plugin && plugin.id}
			<h1 class="font-bold text-2xl">{plugin.title}</h1>

			<div
				class="flex flex-row items-center justify-start space-x-4 mt-1"
			>
				<p class="text-sm font-bold">
					<i class="far fa-download" />
					{formatNumber(plugin.downloads)}
					<span class="ml-1 font-normal text-xs">
						Téléchargements
					</span>
				</p>
				<p class="text-sm font-bold">
					<i class="fas fa-users" />
					{formatNumberWithCommas(plugin.followers)}
					<span class="ml-1 font-normal text-xs">Followers</span>
				</p>
				<p class="text-sm font-bold">
					<i class="fas fa-code-branch" />
					{plugin.versions.length}
					<span class="ml-1 font-normal text-xs">Versions</span>
				</p>
			</div>

			{#if showVersions}
				{#if versionsLoaded}
					<div class="flex flex-col items-start justify-start mt-5">
						<div
							class="flex flex-row items-center justify-start space-x-6"
						>
							<div
								class="flex flex-row items-center justify-start space-x-2"
							>
								<p class="text-sm font-bold">
									<i class="fas fa-gamepad" />
									Version du jeu
								</p>
								<select
									class="select select-bordered select-sm"
									on:change={(e) =>
										// @ts-ignore
										(selectedGameVersion = e.target.value)}
								>
									{#each pluginGameVersions as gameVersion}
										<option
											value={gameVersion}
											selected={gameVersion ===
												pluginGameVersions[0]}
										>
											{gameVersion}
										</option>
									{/each}
								</select>
							</div>

							{#if plugin.loaders && plugin.loaders.length > 1}
								<div
									class="flex flex-row items-center justify-start space-x-2"
								>
									<p class="text-sm font-bold">
										<i class="fas fa-cogs" />
										Loader
									</p>
									<select
										class="select select-bordered select-sm"
										on:change={(e) =>
											(selectedLoader =
												// @ts-ignore
												e.target.value)}
									>
										{#each plugin.loaders as loader}
											<option value={loader}>
												{loader
													.charAt(0)
													.toUpperCase() +
													loader.slice(1)}
											</option>
										{/each}
									</select>
								</div>
							{/if}
						</div>

						<div class="form-control my-2">
							<label class="label cursor-pointer">
								<span class="label-text font-bold"
									>Uniquement les versions stables</span
								>
								<input
									id="releasesOnly"
									type="checkbox"
									class="checkbox checkbox-sm ml-2"
									on:change={(e) =>
										// @ts-ignore
										(stablesOnly = e.target.checked)}
								/></label
							>
						</div>

						{#if selectedGameVersion && selectedLoader}
							<div class="overflow-x-auto w-full">
								<table class="table">
									<thead>
										<tr>
											<th class="w-6/12">Version</th>
											<th class="w-3/12">Suppport</th>
											<th class="w-3/12">Stats</th>
										</tr>
									</thead>

									<tbody>
										{#if !pluginVersions.find((v) => v.game_versions.includes(selectedGameVersion) && (v.loaders.length === 0 || v.loaders.includes(selectedLoader)) && (!stablesOnly || v.version_type === "release"))}
											<tr>
												<td
													class="flex flex-row items-center justify-start"
												>
													<span
														class="text-xs font-normal"
													>
														Aucun résultat
													</span>
												</td>
												<td />
												<td />
											</tr>
										{/if}

										{#each pluginVersions as version}
											{#if version.game_versions.includes(selectedGameVersion) && (version.loaders.length === 0 || version.loaders.includes(selectedLoader)) && (!stablesOnly || version.version_type === "release")}
												<tr>
													<td
														class="flex flex-row items-center justify-start"
													>
														<button
															class="btn btn-sm btn-outline btn-secondary"
															disabled={installing.length >
																0}
															on:click={() =>
																installPlugin(
																	version.version_number,
																)}
														>
															{#if installing === version.version_number}
																<span
																	class="loading loading-spinner loading-sm"
																/>
															{:else}
																<i
																	class="fas fa-download"
																/>
															{/if}
														</button>

														<div
															class="flex flex-col items-start justify-start ml-4"
														>
															<b>
																{version.name}
															</b>
															<span>
																{#if version.version_type === "release"}
																	<span
																		class="text-xs font-normal text-green-500"
																	>
																		<i
																			class="fas fa-dot-circle"
																		/>
																		Release
																	</span>
																{:else if version.version_type === "beta"}
																	<span
																		class="text-xs font-normal text-yellow-500"
																	>
																		<i
																			class="fas fa-dot-circle"
																		/>
																		Beta
																	</span>
																{:else if version.version_type === "alpha"}
																	<span
																		class="text-xs font-normal text-red-500"
																	>
																		<i
																			class="fas fa-dot-circle"
																		/>
																		Alpha
																	</span>
																{/if}
																{version.version_number}
															</span>
														</div>
													</td>
													<td>
														{#if version.loaders.length > 0}
															<span
																class="text-xs font-normal"
															>
																{version.loaders
																	.map(
																		mapCapitalize,
																	)
																	.join(", ")}
															</span>
															<br />
														{/if}
														{#if version.game_versions.length > 0}
															<span
																class="text-xs font-normal"
															>
																{version.game_versions
																	.map(
																		mapCapitalize,
																	)
																	.join(", ")}
															</span>
														{/if}
													</td>
													<td>
														<!-- Downloads & publication date -->
														<span
															class="text-xs font-normal"
														>
															<i
																class="far fa-download"
															/>
															<b>
																{formatNumber(
																	version.downloads,
																)}
															</b>
															<span class="ml-1">
																Téléchargements
															</span>
														</span>
														<br />
														<span
															class="text-xs font-normal"
														>
															<i
																class="far fa-clock"
															/>
															{formatDateRelative(
																new Date(
																	version.date_published,
																),
															)}
														</span>
													</td>
												</tr>
											{/if}
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-4">
						<span class="loading loading-spinner loading-lg" />
					</div>
				{/if}
			{:else}
				<button
					class="btn btn-sm btn-outline btn-secondary mt-5"
					on:click={() => showPluginVersions()}
				>
					<i class="fas fa-download" />
					Installer
				</button>

				<a
					href="https://modrinth.com/{type}/{plugin.slug}"
					target="_blank"
					class="link link-hover mt-2 ml-5"
				>
					<i class="fas fa-external-link-alt" />
					Voir sur Modrinth
				</a>

				{#if plugin.issues_url || plugin.source_url || plugin.wiki_url || plugin.discord_url || plugin.donation_urls.length > 0}
					<div
						class="flex flex-row items-center justify-start space-x-4 mt-5"
					>
						{#if plugin.issues_url}
							<a
								href={plugin.issues_url}
								target="_blank"
								class="link link-hover text-sm"
							>
								<i class="fas fa-bug" />
								Signaler un bug
							</a>
						{/if}
						{#if plugin.source_url}
							<a
								href={plugin.source_url}
								target="_blank"
								class="link link-hover text-sm"
							>
								<i class="fas fa-code" />
								Voir le code source
							</a>
						{/if}
						{#if plugin.wiki_url}
							<a
								href={plugin.wiki_url}
								target="_blank"
								class="link link-hover text-sm"
							>
								<i class="fas fa-book" />
								Voir la documentation
							</a>
						{/if}
						{#if plugin.discord_url}
							<a
								href={plugin.discord_url}
								target="_blank"
								class="link link-hover text-sm"
							>
								<i class="fab fa-discord" />
								Discord
							</a>
						{/if}
						{#if plugin.donation_urls.length > 0}
							{#each plugin.donation_urls as donation}
								<a
									href={donation.url}
									target="_blank"
									class="link link-hover text-sm"
								>
									<i class="fas fa-donate" />
									{donation.platform}
								</a>
							{/each}
						{/if}
					</div>
				{/if}

				<div class="divider" />

				<div id="markdown">
					{@html md.render(plugin.body)}
				</div>
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center py-4">
				<span class="loading loading-spinner loading-lg" />
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
