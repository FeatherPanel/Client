<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";

	import { IS_DARK } from "./constants";
	import { getUser } from "./utils/user";

	import Error from "./components/Error.svelte";
	import Terminal from "./components/Terminal.svelte";

	import { Route, Router } from "svelte-routing";
	import Sidebar from "./components/Sidebar.svelte";
	import Account from "./routes/Account.svelte";
	import AccountApi from "./routes/AccountApi.svelte";
	import Admin from "./routes/Admin.svelte";
	import Login from "./routes/Login.svelte";
	import Logout from "./routes/Logout.svelte";
	import NewAccountApiKey from "./routes/NewAccountApiKey.svelte";
	import Register from "./routes/Register.svelte";
	import Servers from "./routes/Servers.svelte";
	import VerifyEmail from "./routes/VerifyEmail.svelte";
	import ServerLayout from "./routes/servers/Layout.svelte";
	import { API, CONFIG, loadConfig } from "./utils/config";
	import NonInstalled from "./components/Non-Installed.svelte";

	let loaded = false;
	let logged = false;
	let configError = false;
	let urlParams = new URLSearchParams(location.search);
	history.replaceState({}, document.title, location.pathname);

	(async () => {
		if (!(await loadConfig())) return (configError = true);

		if (sessionStorage.getItem("token")) logged = true;

		if (localStorage.getItem("token") && !sessionStorage.getItem("token")) {
			await fetch(`${API()}/auth/refresh`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				method: "POST",
			})
				.then((res) => res.json())
				.then((res) => {
					if (
						res.status === "success" &&
						res.data.token &&
						localStorage.getItem("token")
					) {
						sessionStorage.setItem("token", res.data.token);
						localStorage.setItem("token", res.data.token);
						logged = true;
					} else {
						sessionStorage.removeItem("token");
						localStorage.remove("token");
						logged = false;
					}
				})
				.catch((err) => {
					console.error(err);
				});
		}

		loaded = true;

		if (sessionStorage.getItem("token")) {
			await fetch(`${API()}/auth/refresh`, {
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				method: "POST",
			})
				.then((res) => res.json())
				.then((res) => {
					if (
						res.status === "success" &&
						res.data.token &&
						sessionStorage.getItem("token")
					) {
						sessionStorage.setItem("token", res.data.token);
						logged = true;
					} else {
						sessionStorage.removeItem("token");
						logged = false;
					}
				})
				.catch((err) => {
					console.error(err);
				});
		}

		if (logged) {
			let user = getUser();

			if (user.suspended) {
				sessionStorage.removeItem("token");
				localStorage.remove("token");
				location.href = "/login?error=Votre compte a été suspendu.";
			}
		}

		if (urlParams.has("verified")) {
			toast.success("Votre adresse email a été vérifiée.", {
				duration: 5000,
				position: "bottom-right",
			});
		}

		if (urlParams.has("otpDisabled")) {
			toast.success(
				"L'authentification à deux facteurs a été désactivée sur votre compte.",
				{
					duration: 5000,
					position: "bottom-right",
				},
			);
		}
	})();
</script>

<svelte:head>
	{#if IS_DARK}
		<link
			rel="icon"
			type="image/svg+xml"
			href="/assets/images/icon_white.png"
		/>
	{:else}
		<link rel="icon" type="image/svg+xml" href="/assets/images/icon.png" />
	{/if}
</svelte:head>

{#if configError}
	<NonInstalled />
{:else if loaded}
	<Router>
		<Route path="/verify-email" component={VerifyEmail} {urlParams} />
		<Route path="/logout" component={Logout} />
		{#if CONFIG().userSettings.enableRegistration}
			<Route path="/register" component={Register} />
		{/if}

		{#if logged}
			<Route path="/" component={Servers} />
			<Route path="/account" component={Account} />
			<Route path="/account/api" component={AccountApi} />
			<Route path="/account/api/new" component={NewAccountApiKey} />
			<Route path="/admin" component={Admin} />
			<Route path="/admin/*" component={Admin} />
			<Route path="/login">
				<script>
					location.href = "/";
				</script>
			</Route>
			<Route path="/server" component={Servers} />
			<Route path="/servers" component={Servers} />
			<Route
				path="/servers/:id/console"
				component={Terminal}
				props={{ id: ":id", fullscreen: true }}
			/>
			<Route
				path="/servers/:id"
				component={ServerLayout}
				props={{ id: ":id" }}
			/>
			<Route
				path="/servers/:id/:page/*extra"
				component={ServerLayout}
				props={{ id: ":id", page: ":page", extra: "*extra" }}
			/>
			<Route
				path="/servers/:id/:page"
				component={ServerLayout}
				props={{ id: ":id", page: ":page" }}
			/>

			<Route path="*">
				{#if urlParams.has("fromLogin")}
					<script>
						location.href = "/";
					</script>
				{/if}
				<Sidebar />
				<Error code="404" message="Page non trouvée" />
			</Route>
		{:else}
			<Route path="*">
				<Login {urlParams} />
			</Route>
		{/if}
	</Router>

	<Toaster />
{:else}
	<div
		class="flex flex-col items-center justify-center w-full h-screen animate-pulse"
	>
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{/if}
