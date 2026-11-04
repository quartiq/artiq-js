<script lang="ts">
  import { onMount } from "svelte";
  import * as sync_struct from "sipyco-js/sync_struct";
  import type { Dict } from "sipyco-js/pyon";
  import "../table.css";

  type Run = {
    pipeline: string;
    status: string;
    priority: number;
    due_date: number | null;
    expid: {
      file: string;
      class_name: string;
      repo_rev?: string | null;
    };
  };

  let records = $state<Array<Run & { rid: number }>>([]);

  onMount(() => {
    const { store, stop } = sync_struct.from<Dict<number, Run>>({
      masterHostname: "localhost",
      notifierName: "schedule",
      onReceive: async () => {
        records = Array.from((await store).struct, ([rid, run]) => ({
          rid,
          ...run,
          expid: { ...run.expid },
        }));
      },
    });

    return stop;
  });
</script>

<table>
  <thead>
    <tr>
      <th scope="col">RID</th>
      <th scope="col">Pipeline</th>
      <th scope="col">Status</th>
      <th scope="col">Priority</th>
      <th scope="col">Due date</th>
      <th scope="col">Revision</th>
      <th scope="col">File</th>
      <th scope="col">Class</th>
    </tr>
  </thead>
  <tbody>
    {#each records as run (run.rid)}
      <tr>
        <th scope="row">{run.rid}</th>
        <td>{run.pipeline}</td>
        <td>{run.status}</td>
        <td>{run.priority}</td>
        <td>
          {run.due_date === null
            ? "—"
            : new Date(run.due_date * 1000).toLocaleString("en-EN")}
        </td>
        <td>{run.expid.repo_rev ?? "—"}</td>
        <td>{run.expid.file}</td>
        <td>{run.expid.class_name}</td>
      </tr>
    {:else}
      <tr>
        <td colspan="8">No scheduled experiments.</td>
      </tr>
    {/each}
  </tbody>
</table>
