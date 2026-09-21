import type { Interface } from "../template";
import type { UnitaryArgs } from "../schedule";

type Args = { scalar: number };
type Locals = { "digit-count": number };

const style = document.createElement("style");
style.innerHTML = `
    .big_number {
        font-family: monospace;
        font-size: 72px;
    }
`;
document.head.appendChild(style);

export const preset = "${artiq_applet}big_number NUMBER_DATASET";

export const argsShape = {
  positionals: ["scalar"],
  localDefaults: { "digit-count": 10 },
};

export const from: Interface["from"] = ([subs, locals]) => {
  let parent: HTMLElement;

  // TODO: Add unit symbol
  const fmt = (f: number, n: number) =>
    new Intl.NumberFormat("en-EN", {
      useGrouping: false,
      maximumSignificantDigits: n,
    }).format(f);

  const setup = (el: HTMLElement, args: UnitaryArgs) => {
    parent = el;
    parent.classList.add("big_number");
    parent.innerText = fmt(
      (args as Args).scalar,
      (locals as Locals)["digit-count"],
    );
  };

  const update = (args: UnitaryArgs) =>
    (parent.innerText = fmt(
      (args as Args).scalar,
      (locals as Locals)["digit-count"],
    ));

  return [
    { subs, setup, update },
    { w: 5, h: 2 },
  ];
};
