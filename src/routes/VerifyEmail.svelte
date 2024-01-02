<script lang="ts">
	import Footer from "../components/Footer.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import { API } from "../utils/config";
	import { decodeJWT, getUser } from "../utils/user";

	export let urlParams: URLSearchParams;

	let user: any;
	let error = "";
	let loaded = false;

	(async () => {
		user = getUser(sessionStorage.getItem("token"), true);

		let token = urlParams.get("token");
		if (!token) return (error = "NO_TOKEN_PROVIDED");

		let decoded = decodeJWT(token);
		if (!decoded) return (error = "UNAUTHORIZED");
		if (!decoded.i || !decoded.e || !decoded.t) error = "UNAUTHORIZED";

		if (decoded.exp < Date.now() / 1000) return (error = "TOKEN_EXPIRED");

		await fetch(`${API()}/verify-email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status !== "success")
					return (error = res.error || "UNKNOWN_ERROR");
				location.href = (user ? "/account" : "/") + "?verified";

				setTimeout(() => {
					loaded = true;
				}, 200);
			})
			.catch(() => {
				error = "UNKNOWN_ERROR";
			});
	})();
</script>

{#if user}
	<Sidebar />
{/if}
<div
	class="relative flex flex-col items-center {user
		? 'justify-start md:ml-64'
		: 'justify-center'} mt-14"
	style="min-height: calc(100vh - 3.5rem);"
>
	{#if !loaded && !error}
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
		>
			<span class="loading loading-spinner loading-lg" />
		</div>
	{/if}
	{#if error}
		<div class="alert alert-error w-10/12 md:w-1/2 mt-14">
			<i class="fas fa-exclamation-triangle" />
			<span>
				{#if error === "NO_TOKEN_PROVIDED"}
					Le lien de vérification est invalide.
				{:else if error === "UNAUTHORIZED"}
					Le lien de vérification est invalide.
				{:else if error === "TOKEN_EXPIRED"}
					Le lien de vérification a expiré.
				{:else}
					Une erreur est survenue lors de la vérification de votre
					email. Veuillez réessayer plus tard.
				{/if}
			</span>
		</div>
	{/if}
	{#if loaded}
		<span class="text-2xl font-bold mb-4">
			Vous allez être redirigé dans quelques secondes...
		</span>
	{/if}

	<Footer />
</div>
