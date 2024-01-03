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
