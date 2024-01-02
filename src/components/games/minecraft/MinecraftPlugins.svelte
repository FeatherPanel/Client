<script lang="ts">
	import MultiSelect from "svelte-multiselect";
	import { IS_DARK, MODRINTH_API } from "../../../constants";
	import {
		formatDateRelative,
		formatNumber,
		formatNumberWithCommas,
	} from "../../../utils/misc";
	import { selectedMinecraftPlugin } from "../../../utils/store";
	import Pagination from "../../Pagination.svelte";
	import MinecraftPluginModal from "./MinecraftPluginModal.svelte";
	import { loaders } from "../../../utils/minecraft";

	export let server: any;

	let categoriesName: Record<string, string> = {
		adventure: "Aventure",
		challenging: "Difficile",
		combat: "Combat",
		cursed: "Cursed",
		decoration: "Décoration",
		economy: "Économie",
		equipment: "Équipement",
		food: "Nourriture",
		"game-mechanics": "Mécaniques de jeu",
		"kitchen-sink": "Cuisine",
		library: "Librairie",
		lightweight: "Léger",
		magic: "Magie",
		management: "Gestion",
		minigame: "Mini jeux",
		mobs: "Mobs",
		multiplayer: "Multijoueur",
		optimization: "Optimisation",
		quests: "Quêtes",
		social: "Social",
		storage: "Stockage",
		technology: "Technologie",
		transportation: "Transport",
		utility: "Utilitaire",
		worldgen: "Génération de monde",
	};
	let categories: any[] = [];
	let gameVersions: string[] = [];

	let selectedType = "mod";
	let selectedCategories: string[] = [];
	let selectedLoaders: string[] = [];
	let selectedGameVersions: string[] = [];

	let limit = 20;
	let offset = 0;
	let total = 0;
	let index: "relevance" | "downloads" | "follows" | "newest" | "updated" =
		"relevance";
	let query = "";

	let entries: any[] = [];

	let loaded = false;

	(async () => {
		await fetch(`${MODRINTH_API}/tag/category`)
			.then((res) => res.json())
			.then((data) => {
				categories = data;
			})
			.catch((err) => {
				console.error(err);
			});

		await fetch(`${MODRINTH_API}/tag/loader`)
			.then((res) => res.json())
			.then((data) => {
				data.forEach((loader: any) => {
					if (loaders[loader.name])
						loaders[loader.name].icon = loader.icon;
				});
			})
			.catch((err) => {
				console.error(err);
			});

		await fetch(`${MODRINTH_API}/tag/game_version`)
			.then((res) => res.json())
			.then((data) => {
				data.forEach((version: any) => {
					if (version.version_type === "release")
						gameVersions.push(version.version);
				});
			})
			.catch((err) => {
				console.error(err);
			});

		search();

		loaded = true;
	})();

	function search(newType: null | string = null) {
		selectedType = newType || selectedType;
		selectedCategories = selectedCategories;
		selectedLoaders = newType ? [] : selectedLoaders;
		selectedGameVersions = selectedGameVersions;

		/**********/
		/* Facets */
		let facets: string[] = [
			'["server_side:optional","server_side:required"]',
		];

		// Type
		facets.push(
			`["project_type:${
				selectedType === "modpack" ? "modpack" : "mod"
			}"]`,
		);

		if (selectedType === "datapack") {
			facets.push('["categories:datapack"]');
		}

		// Categories
		if (selectedCategories.length > 0) {
			facets.push(
				`[${selectedCategories
					.map((cat) => `"categories:${cat}"`)
					.join(",")}]`,
			);
		}

		// Loaders
		if (selectedLoaders.length > 0) {
			facets.push(
				`[${selectedLoaders
					.map((loader) => {
						if (
							loaders[loader] &&
							loaders[loader].project_types.includes(selectedType)
						)
							return `"categories:${loader}"`;
						else return "";
					})
					.filter((loader) => loader !== "")
					.join(",")}]`,
			);
		} else if (selectedType !== "datapack") {
			// Return all loaders in selected type
			facets.push(
				`[${Object.keys(loaders)
					.filter((loader) =>
						loaders[loader].project_types.includes(selectedType),
					)
					.map((loader) => `"categories:${loader}"`)
					.join(",")}]`,
			);
		}

		// Game versions
		if (selectedGameVersions.length > 0) {
			facets.push(
				`[${selectedGameVersions
					.map((version) => `"versions:${version}"`)
					.join(",")}]`,
			);
		}

		// Author
		let author = query.match(/author:(\w+)/);
		if (author) {
			query = query.replace(/author:(\w+)/, "");

			facets.push(`["author:${author[1]}"]`);
		}

		fetch(
			`${MODRINTH_API}/search?facets=${encodeURIComponent(
				`[${facets.join(",")}]`,
			)}&limit=${limit}&offset=${offset}&index=${index}${
				query.trim().length > 0 ? `&query=${query}` : ""
			}`,
		)
			.then((res) => res.json())
			.then((data) => {
				entries = data.hits;
				console.log(data);
				total = data.total_hits;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	function sortDisplayedCategories(a: string, b: string) {
		if (loaders[a]) return 1;
		else if (loaders[b]) return -1;
		else return 0;
	}

	function openPlugin(entry: any) {
		selectedMinecraftPlugin.set({
			slug: entry.slug,
			type: selectedType,
		});
		eval("pluginModal.showModal()");
	}
</script>

<MinecraftPluginModal serverId={server.serverId} />

{#if loaded}
	<div class="flex flex-row space-x-4 w-10/12 py-8">
		<!-- Filters -->
		<div class="card w-96 h-fit bg-base-100 shadow-lg">
			<div class="card-body flex flex-col space-y-4">
				<h2 class="card-title">Filtres</h2>

				<div>
					<span
						class="text-base-content text-opacity-60 text-sm font-bold"
						>Rechercher:</span
					>

					<div class="flex flex-col">
						<label class="label cursor-pointer w-fit space-x-2">
							<input
								type="radio"
								class="radio radio-sm"
								name="radio"
								checked
								on:change={() => search("mod")}
							/>
							<span class="label-text">Mods</span>
						</label>
						<label class="label cursor-pointer w-fit space-x-2">
							<input
								type="radio"
								class="radio radio-sm"
								name="radio"
								on:change={() => search("plugin")}
							/>
							<span class="label-text">Plugins</span>
						</label>
						<label class="label cursor-pointer w-fit space-x-2">
							<input
								type="radio"
								class="radio radio-sm"
								name="radio"
								on:change={() => search("datapack")}
							/>
							<span class="label-text">Data packs</span>
						</label>
						<label class="label cursor-pointer w-fit space-x-2">
							<input
								type="radio"
								class="radio radio-sm"
								name="radio"
								on:change={() => search("modpack")}
							/>
							<span class="label-text">Modpacks</span>
						</label>
					</div>
				</div>

				<div>
					<span
						class="text-base-content text-opacity-60 text-sm font-bold"
						>Catégories:</span
					>

					<div class="flex flex-col">
						{#each categories as cat}
							<label
								class="label cursor-pointer w-fit h-6 space-x-2"
								class:hidden={cat.project_type !==
									(selectedType === "modpack"
										? "modpack"
										: "mod")}
							>
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									name="checkbox"
									on:change={() => {
										if (
											selectedCategories.includes(
												cat.name,
											)
										) {
											selectedCategories.splice(
												selectedCategories.indexOf(
													cat.name,
												),
												1,
											);
										} else {
											selectedCategories.push(cat.name);
										}
										search();
									}}
								/>
								<span
									class="label-text flex flex-row items-center"
								>
									<div class="w-4 h-4 mr-2">
										{@html cat.icon}
									</div>
									{#if categoriesName[cat.name]}
										{categoriesName[cat.name]}
									{:else}
										{cat.name.charAt(0).toUpperCase() +
											cat.name
												.replaceAll("-", " ")
												.slice(1)}
									{/if}
								</span>
							</label>
						{/each}
					</div>
				</div>

				<div class:hidden={selectedType === "datapack"}>
					<span
						class="text-base-content text-opacity-60 text-sm font-bold"
						>Loaders:</span
					>

					<div id="loaders" class="flex flex-col">
						{#each Object.keys(loaders) as loader}
							<label
								class="label cursor-pointer w-fit h-6 space-x-2"
								class:hidden={!loaders[
									loader
								].project_types.includes(selectedType)}
							>
								<input
									id={loader}
									type="checkbox"
									class="checkbox checkbox-sm"
									name="checkbox"
									on:change={() => {
										if (selectedLoaders.includes(loader)) {
											selectedLoaders.splice(
												selectedLoaders.indexOf(loader),
												1,
											);
										} else {
											selectedLoaders.push(loader);
										}
										search();
									}}
								/>
								<span
									class="label-text flex flex-row items-center"
								>
									{#if loaders[loader].icon}
										<div class="w-4 h-4 mr-2">
											{@html loaders[loader].icon}
										</div>
									{/if}
									{loaders[loader].name}
								</span>
							</label>
						{/each}
					</div>
				</div>

				<div>
					<span
						class="text-base-content text-opacity-60 text-sm font-bold"
						>Versions de Minecraft:</span
					>

					<MultiSelect
						options={gameVersions}
						noMatchingOptionsMsg="Toutes les versions"
						--sms-border="solid 1px hsl(var(--b3))"
						--sms-options-bg="hsl(var(--b1))"
						on:change={(e) => {
							if (e.detail.type === "add") {
								selectedGameVersions.push(e.detail.option);
							} else if (e.detail.type === "remove") {
								selectedGameVersions.splice(
									selectedGameVersions.indexOf(
										e.detail.option,
									),
									1,
								);
							} else if (e.detail.type === "removeAll") {
								selectedGameVersions = [];
							}
							search();
						}}
					/>
				</div>
			</div>
		</div>

		<div class="flex flex-col items-center justify-start space-y-4 w-full">
			<!-- Sort -->
			<div class="card w-full bg-base-100 shadow-lg">
				<div class="card-body flex flex-col">
					<h2 class="card-title mb-2">Plugins & Mods</h2>

					<div class="relative">
						<i
							class="absolute left-4 top-1/2 -translate-y-1/2 fas fa-search text-base-content text-opacity-60"
						></i>
						<input
							type="text"
							id="search"
							placeholder="Rechercher des {selectedType ===
							'modpack'
								? 'modpacks'
								: selectedType === 'mod'
								  ? 'mods'
								  : selectedType === 'plugin'
								    ? 'plugins'
								    : 'data packs'}..."
							class="input input-bordered w-full pl-10"
							on:input={(e) => {
								// prettier-ignore
								// eslint-disable-next-line
								// @ts-ignore
								query = e.target.value;
								search();
							}}
						/>
					</div>

					<div class="flex flex-row space-x-4">
						<div class="flex flex-row items-center w-1/2">
							<span
								class="text-base-content text-opacity-60 text-sm font-bold mr-2"
								>Trier&nbsp;par</span
							>
							<select
								class="select select-bordered select-sm w-full"
								on:change={(e) => {
									// prettier-ignore
									// eslint-disable-next-line
									// @ts-ignore
									index = e.target.value;
									search();
								}}
							>
								<option value="relevance">Pertinence</option>
								<option value="downloads"
									>Téléchargements</option
								>
								<option value="follows">Favoris</option>
								<option value="newest">Nouveaux</option>
								<option value="updated">Mis à jour</option>
							</select>
						</div>

						<div class="flex flex-row items-center w-1/2">
							<span
								class="text-base-content text-opacity-60 text-sm font-bold mr-2"
								>Afficher</span
							>
							<select
								class="select select-bordered select-sm w-full"
								on:change={(e) => {
									// prettier-ignore
									// eslint-disable-next-line
									// @ts-ignore
									limit = parseInt(e.target.value);
									search();
								}}
							>
								{#each [5, 10, 15, 20, 50, 100] as l}
									<option value={l} selected={l === limit}>
										{l} résultats
									</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			</div>

			{#if total > limit}
				<Pagination
					{offset}
					{limit}
					{total}
					on:change={(e) => {
						offset = e.detail.offset;
						limit = e.detail.limit;
						search();
					}}
				/>
			{/if}

			<!-- Entries -->
			{#each entries as entry}
				<div
					class="card w-full bg-base-100 shadow-lg hover:scale-[1.01] transition-transform duration-200"
				>
					<div class="card-body flex flex-row space-x-4 py-4">
						<div class="w-9/12 flex flex-row space-y-2">
							<button
								class="flex items-center justify-center w-16 h-16 min-w-[4rem] min-h-[4rem] rounded-lg shadow-lg mr-4"
								on:click={() => openPlugin(entry)}
							>
								{#if entry.icon_url}
									<img
										src={entry.icon_url}
										alt={entry.title}
										class="w-16 h-16 rounded-lg object-contain"
									/>
								{:else}
									<i class="far fa-cube text-[3rem]"></i>
								{/if}
							</button>

							<div class="flex flex-col">
								<div
									class="flex flex-row items-baseline space-x-2"
								>
									<button
										class="text-base-content text-lg font-bold"
										on:click={() => openPlugin(entry)}
									>
										{entry.title}
									</button>

									<span
										class="text-base-content text-opacity-60 text-sm"
									>
										par <button
											class="link link-hover font-semibold"
											on:click={() => {
												// prettier-ignore
												// eslint-disable-next-line
												// @ts-ignore
												document.getElementById("search").value = `author:${entry.author}`;
												query = `author:${entry.author}`;
												search();
											}}>{entry.author}</button
										>
									</span>
								</div>

								<p class="text-base-content text-sm">
									{entry.description}
								</p>

								<div class="flex flex-row flex-wrap mt-2">
									{#each entry.categories.sort(sortDisplayedCategories) as cat}
										<div
											class="flex flex-row text-base-content text-opacity-60 text-sm mr-3"
										>
											{#if loaders[cat]}
												<div class="w-4 h-4 mr-1">
													{@html loaders[cat].icon}
												</div>
												{loaders[cat].name}
											{:else}
												{#if categories.find((c) => c.name === cat)}
													<div class="w-4 h-4 mr-1">
														{@html categories.find(
															(c) =>
																c.name === cat,
														).icon}
													</div>
												{/if}
												{#if categoriesName[cat]}
													{categoriesName[cat]}
												{:else}
													{cat
														.charAt(0)
														.toUpperCase() +
														cat
															.replaceAll(
																"-",
																" ",
															)
															.slice(1)}
												{/if}
											{/if}
										</div>
									{/each}
								</div>
							</div>
						</div>
						<div
							class="w-3/12 flex flex-col items-end justify-between"
						>
							<div class="flex flex-col items-end justify-start">
								<span
									class="text-base-content font-medium text-md"
								>
									<i class="far fa-download mr-1"></i>
									<b>{formatNumber(entry.downloads)}</b>
									téléchargements
								</span>

								<span
									class="text-base-content font-medium text-md"
								>
									<i class="far fa-heart mr-1"></i>
									<b
										>{formatNumberWithCommas(
											entry.follows,
											" ",
										)}</b
									>
									favoris
								</span>
							</div>

							<!-- entries.date_modified -->
							<span class="text-base-content font-medium text-md">
								<i class="far fa-arrows-rotate mr-1"></i>
								{formatDateRelative(
									new Date(entry.date_modified),
								)}
							</span>
						</div>
					</div>
				</div>
			{/each}

			{#if total > limit}
				<Pagination
					{offset}
					{limit}
					{total}
					on:change={(e) => {
						offset = e.detail.offset;
						limit = e.detail.limit;
						search();
					}}
				/>
			{/if}

			<p class="text-base-content text-opacity-60 text-sm">
				Liste des mods et plugins fournie par
				<a
					href="https://modrinth.com"
					target="_blank"
					rel="noopener noreferrer"
					class="link link-hover font-semibold"
					><img
						src="/assets/images/modrinth{IS_DARK
							? '_white'
							: ''}.png"
						alt="Modrinth"
						class="h-4 inline-block hover:opacity-80 transition-opacity duration-200"
					/></a
				>.
			</p>
		</div>
	</div>
{:else}
	<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
		<span class="loading loading-spinner loading-lg" />
	</div>
{/if}
