<script lang="ts">
	import md5 from "md5";
	import { IS_DARK } from "../constants";
	import { getUser } from "../utils/user";
	import { CONFIG } from "../utils/config";

	export let active: string = "";
	export let server: any = null;

	let user = getUser();

	function toggleDrawer() {
		const drawer = document.getElementById("logo-sidebar")!;
		drawer.classList.toggle("translate-x-0");
		drawer.classList.toggle("-translate-x-full");

		const backdrop = document.getElementById("sidebar-backdrop")!;
		backdrop.classList.toggle("hidden");
		backdrop.classList.toggle("block");
	}

	function toggleUserMenu() {
		const menu = document.getElementById("dropdown-user")!;
		menu.classList.toggle("hidden");
		menu.classList.toggle("block");
	}

	document.querySelector("html")?.addEventListener("click", (event) => {
		const target = event.target as HTMLElement;
		if (target.closest("#dropdown-user") || target.closest("#user-menu")) {
			return;
		}

		const menu = document.getElementById("dropdown-user")!;
		menu.classList.remove("block");
		menu.classList.add("hidden");
	});
</script>

<nav
	class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
>
	<div class="px-3 py-3 lg:px-5 lg:pl-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center justify-start">
				<button
					on:click={toggleDrawer}
					type="button"
					class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
				>
					<span class="sr-only">Ouvrir la barre latérale</span>
					<i class="fas fa-bars" />
				</button>
				<a href="/" class="flex ml-2 md:mr-24">
					<img
						src="/assets/images/icon{IS_DARK ? '_white' : ''}.png"
						class="h-8 mr-3"
						alt="Logo"
					/>
					<span
						class="self-center text-xl font-semibold md:text-2xl whitespace-nowrap dark:text-white"
						>{CONFIG().app.name}</span
					>
				</a>
			</div>
			<div class="flex items-center">
				<div class="flex relative items-center ml-3">
					<div id="user-menu" class="relative inline-block text-left">
						<button
							on:click={toggleUserMenu}
							type="button"
							class="group flex items-center justify-center w-full px-4 text-sm"
						>
							<span class="sr-only"
								>Ouvrir le menu utilisateur</span
							>
							<span
								class="mr-2 text-sm font-medium truncate text-gray-700 group-hover:text-gray-900 group-focus:text-gray-900 dark:text-gray-300 dark:group-hover:text-white dark:group-focus:text-white duration-200"
							>
								{user.name}
							</span>
							<img
								class="w-8 h-8 rounded-full group-focus:ring-4 group-focus:ring-gray-300 dark:group-focus:ring-gray-600"
								src="https://secure.gravatar.com/avatar/{md5(
									user.email.toLowerCase().trim(),
								)}"
								alt="Avatar"
							/>
						</button>
					</div>
					<div
						class="z-50 hidden absolute top-5 right-0 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
						id="dropdown-user"
					>
						<div class="px-4 py-3" role="none">
							<p
								class="text-sm text-gray-900 dark:text-white"
								role="none"
							>
								{user.name}
							</p>
							<p
								class="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
								role="none"
							>
								{user.email}
							</p>
						</div>
						<ul class="py-1" role="none">
							<li>
								<a
									href="/"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem">Tableau de bord</a
								>
							</li>
							<li>
								<a
									href="/account"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem">Mon compte</a
								>
							</li>
							<li>
								<a
									href="/logout"
									class="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-600 dark:hover:text-red-400"
									role="menuitem">Se Déconnecter</a
								>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</nav>

<aside
	id="logo-sidebar"
	class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
	aria-label="Sidebar"
>
	<div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
		<ul class="space-y-2 font-medium">
			<li>
				<a
					href="/"
					class:active={active === "servers"}
					class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<i
						class="{active === 'servers'
							? 'fas'
							: 'far'} fa-server text-inherit"
					/>
					<span class="ml-3">Serveurs</span>
				</a>
			</li>
			{#if server}
				<div class="divider">
					<span>
						#{server.serverId}
					</span>
				</div>
				<ul class="space-y-2 font-medium">
					<li>
						<a
							href="/servers/{server.serverId}"
							class:active={active === "console"}
							class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<i
								class="{active === 'console'
									? 'fas'
									: 'far'} fa-terminal text-inherit"
							/>
							<span class="ml-3">Console</span>
						</a>
					</li>
					<li>
						<a
							href="/servers/{server.serverId}/files"
							class:active={active === "files"}
							class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<i
								class="{active === 'files'
									? 'fas'
									: 'far'} fa-folder text-inherit"
							/>
							<span class="ml-3">Fichiers</span>
						</a>
					</li>
					<li>
						<a
							href="/servers/{server.serverId}/users"
							class:active={active === "users"}
							class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<i
								class="{active === 'users'
									? 'fas'
									: 'far'} fa-users text-inherit"
							/>
							<span class="ml-3">Utilisateurs</span>
						</a>
					</li>
					<li>
						<a
							href="/servers/{server.serverId}/plugins"
							class:active={active === "plugins"}
							class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<i
								class="{active === 'plugins'
									? 'fas'
									: 'far'} fa-puzzle-piece text-inherit"
							/>
							<span class="ml-3">Plugins & Mods</span>
						</a>
					</li>
					{#if server.backupsLimit > 0}
						<li>
							<a
								href="/servers/{server.serverId}/backups"
								class:active={active === "backups"}
								class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
							>
								<i
									class="{active === 'backups'
										? 'fas'
										: 'far'} fa-hdd text-inherit"
								/>
								<span class="ml-3">Sauvegardes</span>
							</a>
						</li>
					{/if}
					<li>
						<a
							href="/servers/{server.serverId}/startup"
							class:active={active === "startup"}
							class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<i
								class="{active === 'startup'
									? 'fas'
									: 'far'} fa-play text-inherit"
							/>
							<span class="ml-3">Démarrage</span>
						</a>
					</li>
					<li>
						<a
							href="/servers/{server.serverId}/details"
							class:active={active === "details"}
							class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<i
								class="{active === 'details'
									? 'fas'
									: 'far'} fa-info-circle text-inherit"
							/>
							<span class="ml-3">Informations</span>
						</a>
					</li>
				</ul>
			{/if}
			<div class="divider" />
			<li>
				<a
					href="/account"
					class:active={active === "account"}
					class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<i class="{active === 'account' ? 'fas' : 'far'} fa-user" />
					<span class="flex-1 ml-3 whitespace-nowrap">Compte</span>
				</a>
			</li>
			<li>
				<a
					href="/account/api"
					class:active={active === "api"}
					class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<i class="{active === 'api' ? 'fas' : 'far'} fa-code" />
					<span class="flex-1 ml-3 whitespace-nowrap"
						>API Utilisateur</span
					>
				</a>
			</li>
			{#if user.admin}
				<li>
					<a
						href="/admin"
						class:active={active === "admin"}
						class="flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
					>
						<i
							class="{active === 'admin'
								? 'fas'
								: 'far'} fa-shield-alt"
						/>
						<span class="flex-1 ml-3 whitespace-nowrap"
							>Administration</span
						>
					</a>
				</li>
			{/if}
		</ul>
	</div>
	<div
		class="alert alert-info absolute w-11/12 bottom-5 left-1/2 -translate-x-1/2 sm:hidden"
	>
		<span>
			<i class="far fa-circle-info" />
			Pour une expérience optimale, il est conseillé d'utiliser {CONFIG()
				.app.name} sur un grand écran.
		</span>
	</div>
</aside>

<div
	on:click={toggleDrawer}
	role="none"
	class="bg-black bg-opacity-50 fixed inset-0 z-30 hidden md:hidden"
	id="sidebar-backdrop"
/>

<style lang="postcss">
	.active {
		@apply text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700;
	}
</style>
