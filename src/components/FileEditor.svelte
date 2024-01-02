<script lang="ts">
	import * as monaco from "monaco-editor";
	import { onMount, createEventDispatcher } from "svelte";
	import { IS_DARK } from "../constants";

	export let value: string = "";
	export let language: string = "";
	export let readOnly: boolean = false;

	const dispatch = createEventDispatcher();

	let editorContainer: HTMLDivElement;
	let editor: monaco.editor.IStandaloneCodeEditor;

	self.MonacoEnvironment = {
		getWorker: function (workerId, label) {
			const getWorkerModule = (moduleUrl: any, label: any) => {
				return new Worker(
					// @ts-ignore
					self.MonacoEnvironment.getWorkerUrl(moduleUrl),
					{
						name: label,
						type: "module",
					},
				);
			};

			switch (label) {
				case "json":
					return getWorkerModule(
						"/monaco-editor/esm/vs/language/json/json.worker?worker",
						label,
					);
				case "css":
				case "scss":
				case "less":
					return getWorkerModule(
						"/monaco-editor/esm/vs/language/css/css.worker?worker",
						label,
					);
				case "html":
				case "handlebars":
				case "razor":
					return getWorkerModule(
						"/monaco-editor/esm/vs/language/html/html.worker?worker",
						label,
					);
				case "typescript":
				case "javascript":
					return getWorkerModule(
						"/monaco-editor/esm/vs/language/typescript/ts.worker?worker",
						label,
					);
				default:
					return getWorkerModule(
						"/monaco-editor/esm/vs/editor/editor.worker?worker",
						label,
					);
			}
		},
	};

	onMount(() => {
		editor = monaco.editor.create(editorContainer, {
			value,
			language,
			readOnly,
			theme: IS_DARK ? "vs-dark" : "vs",
			fontSize: 15,
			automaticLayout: true, // responsive
			unusualLineTerminators: "off", // no warning for line terminators
			acceptSuggestionOnCommitCharacter: true,
			acceptSuggestionOnEnter: "on",
			roundedSelection: true,
		});

		editor.getModel()?.onDidChangeContent(() => {
			dispatch("change", editor.getValue());
		});
	});
</script>

<div bind:this={editorContainer} class="w-full h-full" />
