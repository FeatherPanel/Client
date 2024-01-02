<script lang="ts">
	export let minecraftJavaType: string;

	let select: HTMLSelectElement;
</script>

<div class="form-control">
	<label class="label" for="minecraftJavaType"
		><span class="label-text">Type</span></label
	>
	<select
		id="minecraftJavaType"
		bind:this={select}
		on:change={() => (minecraftJavaType = select.value)}
		class="select select-bordered w-full max-w-xs"
	>
		<option value="vanilla">Vanilla</option>
		<option value="paper">Paper</option>
		<option value="forge">Forge</option>
		<option value="fabric">Fabric</option>
		<option value="mohist">Mohist</option>
		<option value="purpur">Purpur</option>
		<option value="bungeecord">Bungeecord</option>
	</select>
</div>
