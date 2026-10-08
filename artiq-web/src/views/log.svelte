<script lang="ts">
  import { onMount, tick } from "svelte";
  import * as broadcast from "sipyco-js/broadcast";
  import "../table.css";

  type LogRecord = [
    level: number,
    source: string,
    time: number,
    message: string,
  ];

  let records: LogRecord[] = $state([]);

  onMount(() =>
    broadcast.subscribe<LogRecord>({
      masterHostname: "localhost",
      targetName: "log",
      onReceive: (record) => {
        const atBottom =
          window.scrollY + window.innerHeight >= document.body.scrollHeight;
        records.push(record);

        if (atBottom) {
          tick().then(() => window.scrollTo(0, document.body.scrollHeight));
        }
      },
    }),
  );
</script>

<table>
  <thead>
    <tr>
      <th scope="col">Level</th>
      <th scope="col">Source</th>
      <th scope="col">Time</th>
      <th scope="col">Message</th>
    </tr>
  </thead>
  <tbody>
    {#each records as r}
      <tr>
        {#each r as v}
          <td>{v}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
