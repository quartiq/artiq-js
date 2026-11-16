<script lang="ts">
  import logo from "./assets/artiq.svg";

  let { names }: { names: string[] } = $props();
</script>

<nav>
  <img src={logo} alt="ARTIQ" />
  {#each names as name}
    <a
      href={`/${name}`}
      aria-current={location.pathname === `/${name}` ? "page" : undefined}
      >{name}</a
    >
  {/each}
</nav>

<style>
  nav {
    display: flex;
    background: var(--color-bg-beta);
  }

  a {
    padding: 0.65rem 1.25rem;
    color: inherit;
    text-decoration: none;
  }

  a[aria-current="page"] {
    font-weight: bold;
    background: var(--color-bg-alpha);
  }

  img {
    height: 2rem;
    align-self: center;
    margin-inline: 1rem;
  }
</style>
