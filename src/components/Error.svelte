<script lang="ts">
	export let code: string = "404";
	export let message: string = "Page non trouvée";
	export let margin = false;
</script>

<div
	class="absolute items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
	class:md:ml-32={margin}
>
	<div class="flex flex-col w-full items-center justify-center text-center">
		<h1 class="text-9xl font-serif">{code}</h1>
		<p class="text-2xl font-semibold">{@html message}</p>

		<div class="w-1/2 h-1 bg-gray-300 rounded-full my-12" />
		<div class="flex sm:flex-row flex-col items-center justify-center">
			<button class="btn btn-primary m-4" on:click={() => history.back()}
				>Page précédente</button
			>
			<button
				class="btn btn-neutral m-4"
				on:click={() => (location.href = "/")}
				>Retourner à l'accueil</button
			>
		</div>
	</div>
</div>
