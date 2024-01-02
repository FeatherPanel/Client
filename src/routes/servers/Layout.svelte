<script lang="ts">
	import { SvelteComponent } from "svelte";
	import Error from "../../components/Error.svelte";
	import Footer from "../../components/Footer.svelte";
	import Sidebar from "../../components/Sidebar.svelte";
	import { setPermissions } from "../../utils/permissions";
	import { getServer } from "../../utils/server";
	import Backups from "./Backups.svelte";
	import Console from "./Console.svelte";
	import Details from "./Details.svelte";
	import Files from "./Files.svelte";
	import Plugins from "./Plugins.svelte";
	import Startup from "./Startup.svelte";
	import Users from "./Users.svelte";

	export let page: string = "console";
	export let id: string;
	export let extra: string;

	let server: any = null;
	let error = false;
	let forbidden = false;
	let loaded = false;

	let components: {
		[key: string]: typeof SvelteComponent<any>;
	} = {
		console: Console,
		files: Files,
		users: Users,
		plugins: Plugins,
		backups: Backups,
		startup: Startup,
		details: Details,
	};

	(async () => {
		let serverQuery = await getServer(id);
		if (serverQuery.error) {
			if (serverQuery.error == "SERVER_NOT_FOUND")
				location.href = "/servers";
			else if (serverQuery.error == "FORBIDDEN") forbidden = true;

			error = true;
		} else {
			server = serverQuery.response;
		}

		if (sessionStorage.getItem(server.serverId + "_permissions")) {
			let date = new Date(
				parseInt(
					sessionStorage
						.getItem(server.serverId + "_permissions")
						?.split(",")
						.pop() || "0",
				),
			);

			// Update after 5 minutes
			if (new Date().getTime() - date.getTime() > 1000 * 60 * 5) {
				await setPermissions(server.serverId);
			}
		} else {
			await setPermissions(server.serverId);
		}

		loaded = true;
	})();
</script>

<Sidebar active={page} {server} />
{#if loaded}
	{#if forbidden}
		<Error
			code="403"
			message="Vous n'êtes pas autorisé à accéder à ce serveur."
			margin={true}
		/>
	{:else}
		<div
			class="relative flex flex-col items-center justify-start md:ml-64 mt-14"
			style="min-height: calc(100vh - 3.5rem);"
		>
			{#if error}
				<Error
					code="500"
					message="Une erreur interne est survenue.<br/>Veuillez réessayer plus tard."
				/>
			{:else if components[page]}
				<svelte:component this={components[page]} {server} {extra} />
			{:else}
				<Error code="404" message="Page non trouvée." />
			{/if}

			<Footer />
		</div>
	{/if}
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
