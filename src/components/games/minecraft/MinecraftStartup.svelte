<script lang="ts">
	import toast from "svelte-french-toast";
	import { API } from "../../../utils/config";

	export let server: any;

	let runType = server.startCommand.includes("-jar") ? "jar" : "txt";
	let jarFile = server.startCommand.includes("-jar")
		? server.startCommand.split("-jar ")[1].split(" ")[0]
		: "";
	let txtFile = server.startCommand.includes("-jar")
		? ""
		: server.startCommand.split('"@"')[0].trim().split(" ")[
				server.startCommand.split('"@"')[0].trim().split(" ").length - 1
		  ];

	let jarError = false;
	let txtError = false;

	function updateCommand(doFetch = true) {
		jarError = false;
		txtError = false;

		if (runType === "jar") {
			server.startCommand = `java -Xms${
				server.ramLimit / 1024 / 1024
			}M -jar ${jarFile || "server.jar"} nogui`;

			if (
				!new RegExp(
					/^(?!\.)(?!com[0-9]$)(?!con$)(?!lpt[0-9]$)(?!nul$)(?!prn$)[^\ \|\*\?\\\:\<\>\&\$\"]*[^\ \.\|\*\?\\\:\<\>\$\"]+(\.jar)$/gi,
				).test(jarFile || "server.jar")
			)
				jarError = true;
		} else {
			server.startCommand = `java -Xms${server.ramLimit / 1024 / 1024}M ${
				txtFile || "unix_args.txt"
			} "@" nogui`;

			if (
				!new RegExp(
					/^(?!\.)(?!com[0-9]$)(?!con$)(?!lpt[0-9]$)(?!nul$)(?!prn$)[^\ \|\*\?\\\:\<\>\&\$\"]*[^\ \.\|\*\?\\\:\<\>\$\"]+(\.txt)$/gi,
				).test(txtFile || "unix_args.txt")
			)
				txtError = true;
		}

		if (jarError || txtError || !doFetch) return;

		fetch(`${API()}/servers/${server.serverId}/startup`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				runType,
				jarFile: jarFile || "server.jar",
				txtFile: txtFile || "unix_args.txt",
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.status !== "success") {
					toast.error(
						"Erreur lors de la modification de la commande de démarrage",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error(
					"Erreur lors de la modification de la commande de démarrage",
					{
						duration: 5000,
						position: "bottom-right",
					},
				);
			});
	}
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Démarrage</h1>

<div class="flex flex-col w-10/12 justify-center mt-10">
	<div
		class="h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
	>
		<h1
			class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
		>
			Commande de démarrage
		</h1>
		<div
			class="bg-gray-50 border border-gray-300 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 mt-2"
			class:border-red-500={jarError || txtError}
		>
			<span class="text-gray-700 dark:text-gray-300 text-sm"
				>{server.startCommand}</span
			>
		</div>

		{#if jarError || txtError}
			<p class="text-red-500 text-sm mt-2">
				Le chemin du fichier n'est pas valide (ne doit pas contenir
				d'espaces ou de caractères spéciaux)
			</p>
		{/if}
	</div>

	<div class="flex flex-col xl:flex-row w-full justify-center mt-10">
		<div
			class="w-full xl:w-1/2 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
		>
			<h1
				class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
			>
				Type de lancement
			</h1>
			<select
				class="select select-bordered w-full max-w-xs mt-2"
				bind:value={runType}
				on:change={() => updateCommand()}
			>
				<option value="jar">Fichier .jar</option>
				<option value="txt">Fichier d'arguments .txt</option>
			</select>
		</div>

		{#if runType == "jar"}
			<div
				class="w-full xl:w-1/2 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
			>
				<h1
					class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
				>
					Chemin du fichier .jar
				</h1>
				<input
					type="text"
					class="input input-bordered w-full mt-2"
					placeholder="server.jar"
					bind:value={jarFile}
					on:change={() => updateCommand()}
					on:keyup={() => updateCommand(false)}
				/>
			</div>
		{:else}
			<div
				class="w-full xl:w-1/2 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
			>
				<h1
					class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
				>
					Chemin du fichier .txt
				</h1>
				<input
					type="text"
					class="input input-bordered w-full mt-2"
					placeholder="libraries/net/minecraftforge/forge/version/unix_args.txt"
					bind:value={txtFile}
					on:change={() => updateCommand()}
					on:keyup={() => updateCommand(false)}
				/>
			</div>
		{/if}
	</div>

	<!-- width 1/2 aligned at right -->
	<div class="flex justify-center mt-10">
		<div
			class="flex flex-col items-center justify-center w-full xl:w-1/2 h-fit p-6 m-4 rounded-lg shadow bg-white dark:bg-gray-800 dark:border dark:border-gray-700"
		>
			<h1
				class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
			>
				Version de Java
			</h1>
			<select
				class="select select-bordered w-full max-w-xs mt-2"
				bind:value={server.javaVersion}
				on:change={() => {
					fetch(`${API()}/servers/${server.serverId}/java`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem(
								"token",
							)}`,
						},
						body: JSON.stringify({
							javaVersion: server.javaVersion,
						}),
					})
						.then((res) => res.json())
						.then((data) => {
							if (data.status !== "success") {
								toast.error(
									"Erreur lors de la modification de la version de Java",
									{
										duration: 5000,
										position: "bottom-right",
									},
								);
							}
						})
						.catch((err) => {
							console.error(err);
							toast.error(
								"Erreur lors de la modification de la version de Java",
								{
									duration: 5000,
									position: "bottom-right",
								},
							);
						});
				}}
			>
				<option value="8">Java 8</option>
				<option value="11">Java 11</option>
				<option value="17">Java 17</option>
				<option value="21">Java 21</option>
			</select>
		</div>
	</div>
</div>
