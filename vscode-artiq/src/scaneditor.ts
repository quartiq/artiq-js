import * as argument from "./argument.js";
import * as editors from "./editors.js";
import * as scan from "./scan.js";
import * as scanwidget from "./scanwidget.js";

// TODO: create lovely graphical editor for rangescan like in artiq_dashboard

const html = `
	<header>
		<select>
			<option>NoScan</option>
			<option>RangeScan</option>
			<option>CenterScan</option>
			<option>ExplicitScan</option>
		</select>
	</header>

	<section class="NoScan">
		<label for="NoScan__value">Value:</label>
        <div class="input">
            <div class="unit-prefix hidden"></div>
            <input id="NoScan__value" type="number">
        </div>

		<label for="NoScan__repetitions">Repetitions:</label>
		<input id="NoScan__repetitions" type="number">
	</section>

	<section class="RangeScan">
        <div class="scan-widget"></div>

		<label for="RangeScan__start">Start:</label>
        <div class="input">
            <div class="unit-prefix hidden"></div>
            <input id="RangeScan__start" type="number">
        </div>

		<label for="RangeScan__stop">Stop:</label>
        <div class="input">
            <div class="unit-prefix hidden"></div>
            <input id="RangeScan__stop" type="number">
        </div>

		<label for="RangeScan__npoints">Npoints:</label>
		<input id="RangeScan__npoints" type="number">

		<label for="RangeScan__randomize">Randomize:</label>
		<input id="RangeScan__randomize" type="checkbox">
		<input id="RangeScan__seed" type="hidden">
	</section>

	<section class="CenterScan">
		<label for="CenterScan__center">Center:</label>
        <div class="input">
            <div class="unit-prefix hidden"></div>
            <input id="CenterScan__center" type="number">
        </div>

		<label for="CenterScan__span">Span:</label>
        <div class="input">
            <div class="unit-prefix hidden"></div>
            <input id="CenterScan__span" type="number">
        </div>

		<label for="CenterScan__step">Step:</label>
        <div class="input">
            <div class="unit-prefix hidden"></div>
            <input id="CenterScan__step" type="number">
        </div>

		<label for="CenterScan__randomize">Randomize:</label>
		<input id="CenterScan__randomize" type="checkbox">
		<input id="CenterScan__seed" type="hidden">
	</section>

	<section class="ExplicitScan">
		<label for="ExplicitScan__sequence">Sequence:</label>
		<input id="ExplicitScan__sequence" type="text">
	</section>

	<footer>
		<div class="button save">Save</div>
		<div class="button discard">Discard</div>
	</footer>
`;

type Value = number | number[] | boolean;

const switchSections = (
  sections: NodeListOf<Element>,
  type: string,
  widget: scanwidget.ScanWidget,
) =>
  sections.forEach((s) => {
    s.classList.toggle("hidden", !s.classList.contains(type));
    if (s.classList.contains("RangeScan")) {
      widget.updateLayout();
    }
  });

const initSwitch = (
  el: HTMLSelectElement,
  sections: NodeListOf<Element>,
  type: string,
  widget: scanwidget.ScanWidget,
) => {
  el.value = type;
  switchSections(sections, type, widget);
  el.addEventListener("change", () =>
    switchSections(sections, el.value, widget),
  );
};

const initNumberConstraints = (
  els: NodeListOf<HTMLInputElement>,
  procdesc: argument.Scannable,
) => {
  els.forEach((el) => {
    if (procdesc.global_min !== null) {
      el.setAttribute("min", String(procdesc.global_min / procdesc.scale));
    }
    if (procdesc.global_max !== null) {
      el.setAttribute("max", String(procdesc.global_max / procdesc.scale));
    }
    // FIXME ignore "global_step" for now, because setting
    // input attribute "step" creates "invalid" events for values in between steps
    // this is impossible to suppress by code and it interferes with "precision"
    el.setAttribute("step", "any");
    el.addEventListener(
      "change",
      () => (el.value = Number(el.value).toPrecision(procdesc.precision)),
    );
  });
};

const initUnitIndicator = (els: NodeListOf<HTMLElement>, unit: string) =>
  unit &&
  els.forEach((el) => {
    el.classList.remove("hidden");
    el.innerText = unit;
  });

const initSequenceConstraints = (el: HTMLInputElement) => {
  const sequence = String.raw`[+\-]?\d+(?:[.]\d*)?(?:[eE][+\-]?\d+)?(?:\s+[+\-]?\d+(?:[.]\d*)?(?:[eE][+\-]?\d+)?)*\s*`; // see: artiq/gui/entries:_ExplicitScan

  el.setAttribute("pattern", sequence);

  el.addEventListener("blur", () => {
    if (el.validity.patternMismatch) {
      el.setCustomValidity(
        "Please enter space-separated numbers (e.g., 1.5 2.3e-4)",
      ); // TODO: can not read message in UI, because it clips
    }
    el.reportValidity();
  });

  el.addEventListener("input", () => el.setCustomValidity(""));
};

const populate = (el: HTMLInputElement, val: Value, precision: number) => {
  const handlers: Record<string, () => void> = {
    checkbox: () => (el.checked = val as boolean),
    text: () => (el.value = (val as number[]).join(" ")),
    number: () =>
      (el.value = el.matches(".unit-prefix + *")
        ? (val as number).toPrecision(precision)
        : JSON.stringify(val)),
    hidden: () => (el.value = val === null ? "" : JSON.stringify(val)),
  };

  handlers[el.type]();
};

const populateAll = (
  els: NodeListOf<HTMLInputElement>,
  state: scan.ScanState,
  precision: number,
) => {
  els.forEach((el) => {
    const [ty, prop] = el.id.split("__");
    populate(el, state[ty][prop], precision);
  });
};

const parse = (el: HTMLInputElement): Value => {
  const handlers: Record<string, () => Value> = {
    checkbox: () => el.checked,
    text: () => {
      // prevent hallucination of zeros out of piled up white space
      const v = el.value.trim();
      return v === "" ? [] : v.split(/\s+/).map(Number);
    },
    number: () => Number(el.value),
    hidden: () => (el.value === "" ? null : JSON.parse(el.value)),
  };

  return handlers[el.type]();
};

const parseAll = (el: HTMLElement): scan.ScanState => {
  const state: scan.ScanState = {} as scan.ScanState;
  state.selected = el.querySelector("select")!.value;

  el.querySelectorAll("input").forEach((input) => {
    const [ty, prop] = input.id.split("__");
    (state[ty] ??= {})[prop] = parse(input);
  });

  return state;
};

const initSaveButton = (
  el: HTMLElement,
  info: editors.Info<argument.Scannable>,
) => {
  el.querySelector(".button.save")!.addEventListener("click", () => {
    // TODO check and report invalid input fields
    info.success(parseAll(el));
    el.remove();
    document.body.classList.remove("noscroll");
  });
};

const initDiscardButton = (
  el: HTMLElement,
  info: editors.Info<argument.Scannable>,
) => {
  el.querySelector(".button.discard")!.addEventListener("click", () => {
    info.cancel(info.arg[3]);
    el.remove();
    document.body.classList.remove("noscroll");
  });
};

const initWidget = (
  el: HTMLElement,
  info: editors.Info<argument.Scannable>,
) => {
  const widget = new scanwidget.ScanWidget(el.querySelector(".scan-widget")!);

  widget.setStart(info.arg[3].RangeScan.start);
  widget.setStop(info.arg[3].RangeScan.stop);
  widget.setNpoints(info.arg[3].RangeScan.npoints);

  ["Start", "Stop", "Npoints"].forEach((bound) => {
    const input = el.querySelector(
      `#RangeScan__${bound.toLowerCase()}`,
    ) as HTMLInputElement;
    widget[`on${bound}Changed`] = (v: number) =>
      populate(input, v, info.arg[0].precision);
    input.addEventListener("change", () => widget[`set${bound}`](parse(input)));
  });

  return widget;
};

export const from: editors.Editor<argument.Scannable> = (info) => {
  const el = document!.createElement("div");
  el.classList.add("scan");
  el.innerHTML = html;

  initNumberConstraints(
    el.querySelectorAll(`.unit-prefix + input[type="number"]`),
    info.arg[0],
  );
  initUnitIndicator(el.querySelectorAll(".unit-prefix"), info.arg[0].unit);
  initSequenceConstraints(
    el.querySelector("#ExplicitScan__sequence") as HTMLInputElement,
  );

  populateAll(el.querySelectorAll("input"), info.arg[3], info.arg[0].precision);
  initSaveButton(el, info);
  initDiscardButton(el, info);
  // TODO: context menus: "view range", "snap range"
  const widget = initWidget(el, info);

  initSwitch(
    el.querySelector(".scan header select") as HTMLSelectElement,
    el.querySelectorAll("section"),
    info.arg[3].selected,
    widget,
  );

  document.body.appendChild(el);
  document.body.classList.add("noscroll");
  return el;
};
