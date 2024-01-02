<script lang="ts">
	import { io } from "socket.io-client";
	import Terminal from "../../components/Terminal.svelte";
	import { formatOct } from "../../utils/misc";
	import { serverStatus } from "../../utils/server";
	import { API, CONFIG } from "../../utils/config";

	let terminal: Terminal;
	let connError = false;
	export let server: any;

	let socket = io(CONFIG().app.url, {
		auth: {
			token: sessionStorage.getItem("token"),
		},
	});

	(async () => {
		fetch(`${API()}/servers/${server.serverId}/status`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.data && res.data.status) {
					server.status = res.data.status;
				}
			});
	})();

	socket.on("connect", () => {
		socket.emit("servers/connect", server.serverId);

		socket.on("servers/status", (res: any) => {
			if (res.status === "success") {
				server.status = res.data;
			}
		});
	});

	async function power(action: string) {
		let success = await terminal.commandHandler(action);
		if (success)
			server.status =
				action === "start"
					? "starting"
					: action === "stop"
					  ? "stopping"
					  : action === "restart"
					    ? "restarting"
					    : "killing";
	}

	setInterval(
		() => {
			connError = false;
			fetch(`${API()}/servers/${server.serverId}/stats`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "success") {
						server.cpuUsage = res.data.cpuUsage;
						server.ramUsage = res.data.ramUsage;
						server.diskUsage = res.data.diskUsage;
					} else {
						connError = true;
					}
				})
				.catch(() => {
					connError = true;
				});

			fetch(`${API()}/servers/${server.serverId}/status`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "success") {
						server.status = res.data;
					} else {
						connError = true;
					}
				})
				.catch(() => {
					connError = true;
				});
		},
		5000 + (connError ? 10000 : 0),
	);
</script>

<h1 class="text-3xl font-semibold text-center mt-10">Console</h1>

<div class="flex flex-col xl:flex-row w-full mt-4 p-5">
	<div class="flex flex-col mr-0 mb-6 xl:mr-3 w-full xl:w-1/4">
		<div
			class="flex flex-col items-start justify-center px-6 py-4 h-fit border-b dark:border-gray-700 shadow rounded-t-xl bg-gray-200 dark:bg-gray-800"
		>
			<h1 class="text-xl font-semibold">{server.name}</h1>
			<p class="text-gray-500 dark:text-gray-400">
				{server.nodeAddress}:{server.port}
			</p>
			<span class="badge badge-info mt-1">
				#{server.serverId}
			</span>
		</div>
		<div
			class="stats xl:stats-vertical max-sm:stats-vertical shadow rounded-none"
		>
			<div class="stat">
				<div class="stat-title">Status</div>
				<div
					class="stat-value text-{serverStatus[server.status].color}"
				>
					{serverStatus[server.status].display}
				</div>
			</div>
			<div class="stat dark:border-t dark:border-gray-700">
				<div class="stat-title">Utilisation du processeur</div>
				<div class="stat-value">{server.cpuUsage.toFixed(2)}%</div>
				<progress
					class="progress"
					class:progress-warning={server.cpuUsage > 50 &&
						server.cpuUsage < 90}
					class:progress-error={server.cpuUsage > 90}
					value={server.cpuUsage}
					max="100"
				/>
			</div>
		</div>
		<div
			class="stats xl:stats-vertical max-sm:stats-vertical shadow rounded-t-none border-t dark:border-gray-700"
		>
			<div class="stat">
				<div class="stat-title">Utilisation de la RAM</div>
				<div class="stat-value">
					{((server.ramUsage / server.ramLimit) * 100).toFixed(2)}%
				</div>
				<progress
					class="progress"
					class:progress-warning={(server.ramUsage /
						server.ramLimit) *
						100 >
						50 && (server.ramUsage / server.ramLimit) * 100 < 90}
					class:progress-error={(server.ramUsage / server.ramLimit) *
						100 >
						90}
					value={(server.ramUsage / server.ramLimit) * 100}
					max="100"
				/>
				<div class="stat-desc mt-1">
					{formatOct(server.ramUsage)} / {formatOct(server.ramLimit)}
				</div>
			</div>
			<div class="stat dark:border-t dark:border-gray-700">
				<div class="stat-title">Utilisation du disque</div>
				<div class="stat-value">
					{((server.diskUsage / server.diskLimit) * 100).toFixed(2)}%
				</div>
				<progress
					class="progress"
					class:progress-warning={(server.diskUsage /
						server.diskLimit) *
						100 >
						50 && (server.diskUsage / server.diskLimit) * 100 < 90}
					class:progress-error={(server.diskUsage /
						server.diskLimit) *
						100 >
						90}
					value={(server.diskUsage / server.diskLimit) * 100}
					max="100"
				/>
				<div class="stat-desc mt-1">
					{formatOct(server.diskUsage)} / {formatOct(
						server.diskLimit,
					)}
				</div>
			</div>
		</div>

		<div
			class="flex flex-row flex-wrap justify-center items-center bg-gray-200 dark:bg-gray-800 rounded-xl shadow p-4 mt-5"
		>
			<button
				class="btn btn-sm btn-outline btn-success m-1"
				on:click={() => power("start")}
				disabled={server.status !== "offline"}
			>
				<i class="far fa-play mr-2" />
				Démarrer
			</button>
			<button
				class="btn btn-sm btn-outline m-1"
				on:click={() => power("restart")}
				disabled={server.status !== "online"}
			>
				<i class="far fa-repeat mr-2" />
				Redémarrer
			</button>
			<button
				class="btn btn-sm btn-outline btn-error m-1"
				on:click={() => power("stop")}
				disabled={server.status !== "online"}
			>
				<i class="far fa-power-off mr-2" />
				Arrêter
			</button>
			<button
				class="btn btn-sm btn-outline m-1 border-red-600 text-red-600 hover:bg-red-600 hover:border-red-600"
				on:click={() => power("kill")}
				disabled={server.status === "offline"}
			>
				<i class="fas fa-power-off mr-2" />
				Forcer l'arrêt
			</button>
		</div>
	</div>

	<div
		class="overflow-hidden border-2 border-gray-200 rounded-xl bg-gray-900 w-full xl:w-4/5 h-fit ml-0 xl:ml-3 dark:border-gray-700"
	>
		<Terminal
			id={server.id}
			fullscreen={false}
			height="70vh"
			{server}
			{socket}
			bind:this={terminal}
		/>
	</div>
</div>
