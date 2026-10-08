<script lang="ts">
  // TODO: format values using metadata and pyon's toHuman()
  // TODO: submit user input via pc_rpc (parse via fromHuman() first)

  import { onMount } from "svelte";
  import * as datasets from "artiq-js/datasets";
  import "../table.css";

  let records: [datasets.Keypath, datasets.Dataset][] = $state([]);

  onMount(() => {
    const { store, stop } = datasets.from({
      masterHostname: "localhost",
      onReceive: async () => {
        records = (await store).struct.entries().toArray();
      },
    });

    return stop;
  });
</script>

<table>
  <thead>
    <tr>
      <th scope="col">Keypath</th>
      <th scope="col">Persist</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  <tbody>
    {#each records as [keypath, dataset] (keypath)}
      <tr>
        <th scope="row"><input value={keypath} /></th>
        <td><input type="checkbox" checked={dataset[0]} /></td>
        <td><input value={String(dataset[1])} /></td>
      </tr>
    {/each}
  </tbody>
</table>
