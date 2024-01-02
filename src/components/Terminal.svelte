<script lang="ts">
	import { Terminal } from "xterm";
	import { Socket, io } from "socket.io-client";
	import toast from "svelte-french-toast";
	import { FitAddon } from "xterm-addon-fit";
	import { WebLinksAddon } from "xterm-addon-web-links";
	import "xterm/css/xterm.css";
	import { getServer, serverStatus } from "../utils/server";
	import { getUser } from "../utils/user";
	import { onMount } from "svelte";
	import { API, CONFIG } from "../utils/config";

	export let id: string;
	export let height = "100vh";
	export let fullscreen = true;
	export let server: any = null;
	export let socket: Socket = io(CONFIG().app.url, {
		auth: {
			token: sessionStorage.getItem("token"),
		},
	});

	let user: any = null;
	let error = false;
	let directory = "/";
	let forbidden = false;
	let loaded = false;

	const term = new Terminal({
		allowProposedApi: true,
		cursorBlink: true,
		cursorStyle: "underline",
		fontFamily:
			'"Fira Code", courier-new, courier, monospace, "Powerline Extra Symbols"',
		theme: {
			foreground: "#F8F8F8",
			background: "#111827",
			selectionBackground: "#5DA5D533",
			black: "#1E1E1D",
			brightBlack: "#262625",
			red: "#FF5B5B",
			brightRed: "#FF7272",
			green: "#5BCC5B",
			brightGreen: "#72FF72",
			yellow: "#CCCC5B",
			brightYellow: "#FFFF72",
			blue: "#5D5DD3",
			brightBlue: "#7279FF",
			magenta: "#BC5ED1",
			brightMagenta: "#E572FF",
			cyan: "#5DA5D5",
			brightCyan: "#72F0FF",
			white: "#F8F8F8",
			brightWhite: "#FFFFFF",
		},
	});

	onMount(async () => {
		document.body.style.overflowX = "hidden";

		if (!server) {
			let serverQuery = await getServer(id);
			if (serverQuery.error) {
				if (serverQuery.error == "SERVER_NOT_FOUND")
					return (location.href = "/servers");
				else if (serverQuery.error == "FORBIDDEN")
					return (forbidden = true);

				error = true;
			} else {
				server = serverQuery.response;
			}
		}

		user = getUser();

		loaded = forbidden ? false : true;

		setTimeout(async () => {
			loadTerminal();

			await fetch(`${API()}/servers/${server.serverId}/console`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.status === "success" && res.data) {
						term.write(res.data + "\r");
					} else {
						term.writeln(
							`\x1b[1;31m[${
								CONFIG().app.name
							}] An error occured while loading logs history.\x1b[0m`,
						);
					}
				});

			socket.emit("servers/connect", server.serverId);
			socket.emit("servers/logs", server.serverId);

			socket.on("servers/logs", (res: any) => {
				if (res.status === "success") {
					term.write(res.data + "\r");
				}

				if (res.error && res.error == "DAEMON_DISCONNECTED")
					toast.error(
						"La connexion au daemon a été perdue. Veuillez réessayer plus tard.",
						{
							duration: 5000,
							position: "bottom-right",
						},
					);
			});

			socket.on("servers/power", (res: any) => {
				if (res.status === "success") commandHandler(res.data, true);
			});
		}); // Wait for terminalContainer to be loaded
	});

	function loadTerminal() {
		let terminalContainer = document.getElementById("terminal")!;
		while (terminalContainer.children.length) {
			terminalContainer.removeChild(terminalContainer.children[0]);
		}

		const fitAddon = new FitAddon();
		term.loadAddon(fitAddon);
		term.loadAddon(
			new WebLinksAddon((event, uri) => {
				if (uri.startsWith("http://") || uri.startsWith("https://")) {
					if (uri.split("/")[2] == location.host) open(uri, "_self");
					else open(uri, "_blank");
				}
			}),
		);

		term.open(document.getElementById("terminal")!);
		fitAddon.fit();

		term.onResize((size) => {
			fitAddon.fit();
		});

		addEventListener("resize", () => {
			fitAddon.fit();
		});

		term.writeln("");
		greetings();

		if (error) {
			term.writeln(
				"\x1b[1;31m[ERROR] An error occured while loading the terminal.\x1b[0m",
			);
			term.writeln("\x1b[1;31m[ERROR] Please try again later.\x1b[0m");
			return;
		}

		term.onKey(({ key, domEvent }) => {
			let keyCode = domEvent.keyCode;

			switch (keyCode) {
				case 67: // C
					if (domEvent.ctrlKey && term.hasSelection()) {
						let textarea = document.createElement("textarea");
						textarea.value = term.getSelection();
						document.body.appendChild(textarea);
						textarea.select();
						document.execCommand("copy");
						textarea.remove();
					} else {
						focusInput(domEvent, key);
					}
					break;
				case 86: // V
					if (domEvent.ctrlKey) {
						document.getElementById("term-input")?.focus();
						document.getElementById("term-input")?.scrollIntoView();
						navigator.clipboard.readText().then((text) => {
							(
								document.getElementById(
									"term-input",
								) as HTMLInputElement
							).value += text;
						});
					} else {
						focusInput(domEvent, key);
					}
					break;
				default:
					focusInput(domEvent, key);
			}
		});
	}

	function focusInput(
		domEvent: KeyboardEvent | null = null,
		key: any = null,
	) {
		document.getElementById("term-input")?.focus();
		document.getElementById("term-input")?.scrollIntoView();

		if (!domEvent || !key) return;
		if (domEvent.keyCode == 13) return; // Enter

		let ev = document.createEvent("Event") as any;
		// @ts-ignore
		ev.initKeyboardEvent(
			"keydown",
			true,
			true,
			window,
			key,
			0,
			domEvent.ctrlKey,
			domEvent.altKey,
			domEvent.shiftKey,
			domEvent.metaKey,
		);
		document.getElementById("term-input")?.dispatchEvent(ev);
	}

	function termInput(e: KeyboardEvent) {
		if (e.key == "Enter") {
			if (sessionStorage.getItem("terminalHistory"))
				sessionStorage.setItem(
					"terminalHistory",
					sessionStorage
						.getItem("terminalHistory")!
						.concat((e.target as HTMLInputElement).value + "\n"),
				);
			else
				sessionStorage.setItem(
					"terminalHistory",
					(e.target as HTMLInputElement).value + "\n",
				);

			commandHandler((e.target as HTMLInputElement).value);
			(e.target as HTMLInputElement).value = "";
		} else if (e.key == "ArrowUp") {
			if (!sessionStorage.getItem("terminalHistory")) return;

			let history = sessionStorage
				.getItem("terminalHistory")!
				.split("\n");
			let input = (e.target as HTMLInputElement).value;

			if (history.length == 1) return;

			if (history[history.length - 1] == input) {
				(e.target as HTMLInputElement).value =
					history[history.length - 2];
			} else {
				let index = history.indexOf(input);
				if (index == -1) return;

				(e.target as HTMLInputElement).value = history[index - 1];
			}
		} else if (e.key == "ArrowDown") {
			if (!sessionStorage.getItem("terminalHistory")) return;

			let history = sessionStorage
				.getItem("terminalHistory")!
				.split("\n");
			let input = (e.target as HTMLInputElement).value;

			if (history.length == 1) return;

			if (history[history.length - 1] == input) {
				(e.target as HTMLInputElement).value = "";
			} else {
				let index = history.indexOf(input);
				if (index == -1) return;

				(e.target as HTMLInputElement).value = history[index + 1];
			}
		}
	}

	function greetings() {
		let length = CONFIG().app.name.length + 8;

		term.writeln(
			"=".repeat(length > 32 ? CONFIG().app.name.length + 8 : 32),
		);
		term.writeln(
			" ".repeat(
				Math.floor(
					(length > 32 ? CONFIG().app.name.length + 8 : 32) / 2,
				) - Math.floor(CONFIG().app.name.length / 2),
			) + `\x1b[1;33m${CONFIG().app.name}\x1b[0m`,
		);

		term.writeln(" Powered by Feather Panel v" + CONFIG().version);
		term.writeln(
			"=".repeat(length > 32 ? CONFIG().app.name.length + 8 : 32),
		);
		term.writeln("");
		term.writeln(
			'Type \x1b[1;37m"help"\x1b[0m to see the list of commands.',
		);
		term.writeln("");
	}

	export async function commandHandler(command: string, printOnly = false) {
		if (error) return false;

		term.writeln(`\x1b[1;37m> ${command}\x1b[0m`);

		if (
			server.status === "online" &&
			command.trim() !== "start" &&
			command.trim() !== "stop" &&
			command.trim() !== "restart" &&
			command.trim() !== "kill" &&
			command.trim() !== "status" &&
			!printOnly
		) {
			fetch(`${API()}/servers/${server.serverId}/console`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					command: command,
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					if (
						res.error &&
						res.error === "COULD_NOT_CONNECT_TO_NODE"
					) {
						toast.error(
							"La connexion au daemon a été perdue. Veuillez réessayer plus tard.",
							{
								duration: 5000,
								position: "bottom-right",
							},
						);
					} else if (res.error) {
						term.writeln(
							`\x1b[1;31m[${
								CONFIG().app.name
							}] An error occured while executing the command.\x1b[0m`,
						);
					}
				});

			return;
		}

		term.writeln("");

		switch (command.split(" ")[0]) {
			case "help":
				term.writeln(
					`\x1b[1;34m┌─────────── Terminal Help ───────────┐\x1b[0m`,
				);
				term.writeln("");
				term.writeln(" Available commands:");
				term.writeln("  - help: Display this message.");
				term.writeln("  - clear: Clear the terminal.");
				term.writeln("  - start: Start the server.");
				term.writeln("  - stop: Stop the server.");
				term.writeln("  - restart: Restart the server.");
				term.writeln("  - kill: Kill the server.");
				term.writeln("  - status: Display the server status.");
				term.writeln("");
				term.writeln(
					"\x1b[1;34m└─────────────────────────────────────┘\x1b[0m",
				);
				break;
			case "clear":
			case "cls":
				term.clear();
				setTimeout(() => {
					term.clear();
					greetings();
				}, 10); // Fix for terminal not clearing entirely
				break;
			case "start":
				if (!printOnly)
					socket.emit("servers/power", server.serverId, "start");

				term.writeln(
					`\x1b[1;32m[${
						CONFIG().app.name
					}] Starting server...\x1b[0m`,
				);
				term.writeln(
					`\x1b[1;32m[${
						CONFIG().app.name
					}] Starting command: \x1b[0;32m${
						server.startCommand
					}\x1b[0m`,
				);
				term.writeln(
					`\x1b[1;32m[${
						CONFIG().app.name
					}] You can change the start command at ${
						location.protocol
					}//${location.host}/servers/${
						server.serverId
					}/startup\x1b[0m`,
				);

				break;
			case "stop":
				if (!printOnly)
					socket.emit("servers/power", server.serverId, "stop");

				term.writeln(
					`\x1b[1;32m[${
						CONFIG().app.name
					}] Stopping server...\x1b[0m`,
				);

				break;
			case "restart":
				if (!printOnly)
					socket.emit("servers/power", server.serverId, "restart");

				term.writeln(
					`\x1b[1;32m[${
						CONFIG().app.name
					}] Restarting server...\x1b[0m`,
				);

				break;
			case "kill":
				if (!printOnly)
					socket.emit("servers/power", server.serverId, "kill");

				term.writeln(
					`\x1b[1;32m[${CONFIG().app.name}] Killing server...\x1b[0m`,
				);

				break;
			case "status":
				term.writeln(
					`[${CONFIG().app.name}] Server status: \x1b${
						serverStatus[server.status].term
					}${serverStatus[server.status].display}\x1b[0m`,
				);

				break;
			default:
				term.writeln(`\x1b[1;31mCommand not found: ${command}\x1b[0m`);
		}

		term.writeln("");

		return true;
	}
</script>

<div
	class="group relative w-full bg-gray-900 text-white"
	style="height: {height}"
>
	{#if forbidden}
		<div
			class="absolute items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
		>
			<div
				class="flex flex-col w-full items-center justify-center text-center"
			>
				<h1 class="text-9xl font-serif">403</h1>
				<p class="text-2xl font-semibold">
					Vous n'êtes pas autorisé à accéder à cette page.
				</p>
			</div>
		</div>
	{/if}
	{#if loaded}
		{#if !fullscreen}
			<button
				class="absolute top-0 right-0 z-50 mt-2 mr-2 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				title="Ouvrir en plein écran"
				on:click={() =>
					open(`/servers/${server.serverId}/console`, "_blank")}
			>
				<i class="fas fa-external-link-alt" />
				<span class="sr-only">Ouvrir en plein écran</span>
			</button>
		{/if}

		<div
			style="height: calc({height} - 3.5rem)"
			class="bg-gray-900 w-full p-2 scrollbar-hide"
			id="terminal"
		/>
		<div
			class="w-full h-14 bg-gray-800 flex flex-row items-center"
			style="font-family: 'Fira Code', monospace; font-size: 0.9rem;"
		>
			<span class="text-white pl-4 pr-1">
				<span class="text-green-500"
					>{user.name.toLowerCase()}@{server.serverId}</span
				>:<span class="text-blue-500">{directory}</span>$
			</span>
			<input
				type="text"
				id="term-input"
				on:keydown={termInput}
				class="w-full h-full bg-transparent text-white pr-4 pl-1 outline-none border-none"
				disabled={error}
			/>
		</div>
	{/if}
</div>
