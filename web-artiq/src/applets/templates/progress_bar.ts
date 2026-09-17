import type { Interface } from "../template";

type Subs = { counter: number };
type Locals = { min: number; max: number };

const style = document.createElement("style");
style.innerHTML = `
    .progress_bar .bar {
        background-color: lime;
        height: 100%;
    }

    .progress_bar .label {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
`;
document.head.appendChild(style);

export const preset = "${artiq_applet}progress_bar VALUE";

export const argsShape = {
  positionals: ["counter"],
  localDefaults: { min: 0, max: 100 },
};

export const from: Interface["from"] = ([subs, locals]) => {
  let bar: HTMLElement;
  let label: HTMLElement;

  const rel = (v: number, min: number, max: number): number =>
    (v - min) / (max - min);
  const fmt = (v: number): string => `${(v * 100).toFixed()}%`;

  const setup = (el: HTMLElement, subs: Record<string, any>) => {
    el.classList.add("progress_bar");

    const container = document.createElement("div");

    bar = document.createElement("div");
    bar.classList.add("bar");

    label = document.createElement("div");
    label.classList.add("label");

    container.append(bar);
    container.append(label);
    el.append(container);

    const v = rel(
      (subs as Subs).counter,
      (locals as Locals).min,
      (locals as Locals).max,
    );
    bar.style.width = fmt(v);
    label.innerText = fmt(v);
  };

  const update = (subs: Record<string, any>) => {
    const v = rel(
      (subs as Subs).counter,
      (locals as Locals).min,
      (locals as Locals).max,
    );
    bar.style.width = fmt(v);
    label.innerText = fmt(v);
  };

  return [
    { subs, setup, update },
    { w: 7, h: 1 },
  ];
};
