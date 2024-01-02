<script lang="ts">
	import { Route, Router } from "svelte-routing";
	import Footer from "../components/Footer.svelte";
	import SidebarAdmin from "../components/SidebarAdmin.svelte";
	import Error from "../components/Error.svelte";
	import { getUser } from "../utils/user";
	import Overview from "./admin/Overview.svelte";
	import Settings from "./admin/Settings.svelte";
	import Nodes from "./admin/Nodes.svelte";
	import Node from "./admin/Node.svelte";
	import Servers from "./admin/Servers.svelte";
	import Server from "./admin/Server.svelte";
	import Users from "./admin/Users.svelte";
	import User from "./admin/User.svelte";

	let user: any = null;
	let loaded = false;

	let page = location.pathname.split("/")[2] || "overview";

	(async () => {
		user = getUser();

		if (user && user.admin) {
			loaded = true;
		} else {
			history.back();
		}
	})();
</script>

<SidebarAdmin active={page} />
<div
	class="relative flex flex-col items-center justify-start md:ml-64 mt-14"
	style="min-height: calc(100vh - 3.5rem);"
>
	{#if loaded}
		<Router>
			<Route path="/" component={Overview} />
			<Route path="/settings" component={Settings} />
			<Route path="/nodes" component={Nodes} />
			<Route path="/nodes/:id" component={Node} props={{ id: ":id" }} />
			<Route path="/servers" component={Servers} />
			<Route
				path="/servers/:id"
				component={Server}
				props={{ id: ":id" }}
			/>
			<Route path="/users" component={Users} />
			<Route path="/users/:id" component={User} props={{ id: ":id" }} />

			<Route path="*">
				<Error code="404" message="Page non trouvée." />
			</Route>
		</Router>
	{:else}
		<p class="text-gray-500">Chargement...</p>
	{/if}
	<Footer />
</div>
