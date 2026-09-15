/**
 * ARTIQ ScanWidget - TypeScript/Web Port
 * Original: artiq/gui/scanwidget.py
 * Ported to TypeScript: 2026
 * 
 * A graphical widget for selecting scan ranges with interactive visualization
 */

import { Ticker } from "./ticker.js";

export interface ScanWidgetOptions {
    zoomMargin?: number;
    zoomFactor?: number;
    dynamicRange?: number;
    suffix?: string;
    minTicks?: number;
}

export class ScanWidget {
    [key: string]: any;

    private container: HTMLElement;
    private ticksContainer!: HTMLElement;
    private axisLine!: HTMLElement;
    private scanPointsContainer!: HTMLElement;
    private markersContainer!: HTMLElement;
    private startMarker!: HTMLElement;
    private stopMarker!: HTMLElement;
    private prefixLabel!: HTMLElement;
    private suffixLabel!: HTMLElement;
    
    // Configuration
    private zoomMargin: number = 0.1;
    private zoomFactor: number = 1.05;
    private dynamicRange: number = 1e9;
    private suffix: string = "";
    
    // Ticker for generating axis labels
    private ticker: Ticker;
    
    // Scan parameters
    private _start: number | null = null;
    private _stop: number | null = null;
    private _npoints: number = 10;
    private _min: number = -Infinity;
    private _max: number = Infinity;
    
    // View state
    private _axisView: [number, number] | null = null; // [left offset, scale]
    
    // Interaction state
    private _drag: "select" | "zoom" | "axis" | "start" | "stop" | "both" | null = null;
    private _offset: number | [number, number] | null = null;
    private _dragStartX: number = 0;
    
    // Event callbacks
    public onStartChanged?: (value: number) => void;
    public onStopChanged?: (value: number) => void;
    public onNpointsChanged?: (value: number) => void;
    
    constructor(container: HTMLElement, options: ScanWidgetOptions = {}) {
        this.container = container;
        
        // Apply options
        this.zoomMargin = options.zoomMargin ?? 0.1;
        this.zoomFactor = options.zoomFactor ?? 1.05;
        this.dynamicRange = options.dynamicRange ?? 1e9;
        this.suffix = options.suffix ?? "";
        
        // Initialize ticker
        this.ticker = new Ticker({ 
            minTicks: options.minTicks ?? 5,
            precision: 3 
        });
        
        // Build DOM structure
        this.buildDOM();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Wait for DOM to be ready, then initialize view
        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
            this.viewRange();
            this.render();
        });
    }

    updateLayout(): void {
        this.viewRange();
        this.render();
    }

    private buildDOM(): void {
        this.container.innerHTML = "";
        this.container.className = "scan-widget";
        
        // Prefix/Suffix row
        const headerRow = document.createElement("div");
        headerRow.className = "scan-header";
        this.prefixLabel = document.createElement("div");
        this.prefixLabel.className = "scan-prefix";
        this.suffixLabel = document.createElement("div");
        this.suffixLabel.className = "scan-suffix";
        this.suffixLabel.textContent = this.suffix;
        headerRow.appendChild(this.prefixLabel);
        headerRow.appendChild(this.suffixLabel);
        this.container.appendChild(headerRow);
        
        // Tick labels row
        this.ticksContainer = document.createElement("div");
        this.ticksContainer.className = "scan-ticks";
        this.container.appendChild(this.ticksContainer);
        
        // Tick marks
        const tickMarksContainer = document.createElement("div");
        tickMarksContainer.className = "scan-tick-marks";
        this.container.appendChild(tickMarksContainer);
        
        // Main axis line
        this.axisLine = document.createElement("div");
        this.axisLine.className = "scan-axis-line";
        this.container.appendChild(this.axisLine);
        
        // Scan points
        this.scanPointsContainer = document.createElement("div");
        this.scanPointsContainer.className = "scan-points";
        this.container.appendChild(this.scanPointsContainer);
        
        // Markers (in same container as scan points)
        this.markersContainer = document.createElement("div");
        this.markersContainer.className = "scan-markers";
        
        this.startMarker = document.createElement("div");
        this.startMarker.className = "scan-marker scan-marker-start";
        this.startMarker.innerHTML = `<div class="scan-marker-triangle"></div>`;
        
        this.stopMarker = document.createElement("div");
        this.stopMarker.className = "scan-marker scan-marker-stop";
        this.stopMarker.innerHTML = `<div class="scan-marker-triangle"></div>`;
        
        this.markersContainer.appendChild(this.startMarker);
        this.markersContainer.appendChild(this.stopMarker);
        this.container.appendChild(this.markersContainer);
        
        // Add styles
        this.addStyles();
    }
    
    private addStyles(): void {
        const styleId = "scan-widget-styles";
        if (document.getElementById(styleId)) {
            return;
        }
        
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .scan-widget {
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                padding: 5px 0;

                position: relative;
                overflow: hidden;
                cursor: grab;
            }

            .scan-widget:active {
                cursor: grabbing;
            }

            .scan-header {
                display: flex;
                justify-content: space-between;
                margin: 0 5px 5px 5px;
            }
            
            .scan-prefix, .scan-suffix {
                opacity: .5;
            }
            
            .scan-ticks {
                height: 20px;
            }
            
            .scan-tick {
                position: absolute;
                transform: translateX(-50%);
            }
            
            .scan-tick-marks {
                height: 10px;
            }
            
            .scan-tick-mark, .scan-point {
                position: absolute;
                width: 1px;
                height: 10px;
                background: var(--vscode-foreground);
                transform: translateX(-50%);
            }
            
            .scan-axis-line {
                height: 1px;
                background: var(--vscode-foreground);
            }
            
            .scan-points {
                height: 10px;
            }

            .scan-markers {
                height: 20px;
            }
            
            .scan-marker {
                position: absolute;
                transform: translateX(-50%);
            }
            
            .scan-marker-triangle {
                border-left: 9px solid transparent;
                border-right: 9px solid transparent;
                border-bottom: 18px solid;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }
            
            .scan-marker-start .scan-marker-triangle {
                border-bottom-color: var(--scanwidget-start-color);
            }
            
            .scan-marker-stop .scan-marker-triangle {
                border-bottom-color: var(--scanwidget-stop-color);
            }
            
            .scan-marker:hover .scan-marker-triangle {
                filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
            }
        `;
        document.head.appendChild(style);
    }
    
    // Coordinate conversion
    private axisToPixel(val: number): number {
        if (!this._axisView) {
            return 0;
        }
        const [a, b] = this._axisView;
        return a + val * b;
    }
    
    private pixelToAxis(val: number): number {
        if (!this._axisView) {
            return 0;
        }
        const [a, b] = this._axisView;
        return (val - a) / b;
    }
    
    private setView(left: number, scale: number): void {
        this._axisView = [left, scale];
        this.render();
    }
    
    private setViewAxis(center: number, scale: number): void {
        if (center) {
            scale = Math.min(scale, this.dynamicRange / Math.abs(center));
        }
        const width = this.container.offsetWidth;
        const left = width / 2 - center * scale;
        this.setView(left, scale);
    }
    
    private clamp(v: number | null): number | null {
        if (v === null) { return null; }
        v = Math.max(this._min, v);
        v = Math.min(this._max, v);
        return v;
    }
    
    // Public API
    setStart(val: number | null): void {
        val = this.clamp(val);
        if (this._start === val) {
            return;
        }
        this._start = val;
        
        // Ensure we have a valid view
        if (!this._axisView || this.container.offsetWidth === 0) {
            requestAnimationFrame(() => {
                this.viewRange();
                this.render();
            });
        } else {
            this.render();
        }
        
        if (val !== null && this.onStartChanged) {
            this.onStartChanged(val);
        }
    }
    
    setStop(val: number | null): void {
        val = this.clamp(val);
        if (this._stop === val) {
            return;
        }
        this._stop = val;
        
        // Ensure we have a valid view
        if (!this._axisView || this.container.offsetWidth === 0) {
            requestAnimationFrame(() => {
                this.viewRange();
                this.render();
            });
        } else {
            this.render();
        }
        
        if (val !== null && this.onStopChanged) {
            this.onStopChanged(val);
        }
    }
    
    setNpoints(val: number): void {
        if (this._npoints === val) {
            return;
        }
        this._npoints = val;
        this.render();
        if (this.onNpointsChanged) {
            this.onNpointsChanged(val);
        }
    }
    
    setMinimum(v: number): void {
        this._min = v;
        this.setStart(this._start);
        this.setStop(this._stop);
    }
    
    setMaximum(v: number): void {
        this._max = v;
        this.setStart(this._start);
        this.setStop(this._stop);
    }
    
    setSuffix(v: string): void {
        this.suffix = v;
        this.suffixLabel.textContent = v;
    }
    
    getStart(): number | null {
        return this._start;
    }
    
    getStop(): number | null {
        return this._stop;
    }
    
    getNpoints(): number {
        return this._npoints;
    }
    
    // View control
    viewRange(): void {
        if (this._start === null || this._stop === null) {
            // Set a default view if no range is set
            const width = this.container.offsetWidth || 800;
            this.setView(0, width / 10); // Default: show -5 to 5
            return;
        }
        
        const center = (this._stop + this._start) / 2;
        const width = this.container.offsetWidth;
        let scale = width * (1 - 2 * this.zoomMargin);
        
        if (this._stop !== this._start) {
            scale /= Math.abs(this._stop - this._start);
        } else {
            scale = this.dynamicRange;
        }
        
        this.setViewAxis(center, scale);
    }
    
    snapRange(): void {
        const width = this.container.offsetWidth;
        this.setStart(this.pixelToAxis(this.zoomMargin * width));
        this.setStop(this.pixelToAxis((1 - this.zoomMargin) * width));
    }
    
    private zoom(z: number, x: number): void {
        if (!this._axisView) { return; }
        const [a, b] = this._axisView;
        const scale = z * b;
        const left = x + z * (a - x);
        
        const width = this.container.offsetWidth;
        if (z > 1 && Math.abs(left - width / 2) > this.dynamicRange) {
            return;
        }
        
        this.setView(left, scale);
    }
    
    // Event handlers
    private setupEventListeners(): void {
        this.container.addEventListener("mousedown", this.onMouseDown.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.container.addEventListener("wheel", this.onWheel.bind(this));
        
        this.startMarker.addEventListener("mousedown", (ev) => {
            ev.stopPropagation();
            this._drag = "start";
            this._dragStartX = ev.clientX;
            this._offset = ev.clientX - this.startMarker.offsetLeft;
        });
        
        this.stopMarker.addEventListener("mousedown", (ev) => {
            ev.stopPropagation();
            this._drag = "stop";
            this._dragStartX = ev.clientX;
            this._offset = ev.clientX - this.stopMarker.offsetLeft;
        });
        
        // Keyboard shortcuts
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }
    
    private onMouseDown(ev: MouseEvent): void {
        const rect = this.container.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        
        if (ev.shiftKey) {
            this._drag = "select";
            this.setStart(this.pixelToAxis(x));
            this.setStop(this._start);
        } else if (ev.ctrlKey) {
            this._drag = "zoom";
            this._dragStartX = x;
            this._offset = x;
        } else {
            const lineRect = this.container.querySelector(".scan-axis-line")!.getBoundingClientRect();
            const lineY = lineRect.top - rect.top;
            
            if (y < lineY) {
                // Clicked in axis area (above markers) - pan the axis
                this._drag = "axis";
                this._dragStartX = ev.clientX;
                this._offset = this._axisView ? x - this._axisView[0] : 0;
            } else if (this._start !== null && this._stop !== null) {
                // Clicked in markers area (below axis) - check if clicked on a marker or in between
                const startX = this.axisToPixel(this._start);
                const stopX = this.axisToPixel(this._stop);
                const markerHitRadius = 9; // Half the marker width
                
                if (Math.abs(x - startX) < markerHitRadius) {
                    // Clicked on start marker - already handled by marker mousedown
                    return;
                } else if (Math.abs(x - stopX) < markerHitRadius) {
                    // Clicked on stop marker - already handled by marker mousedown
                    return;
                } else {
                    // Clicked between/outside markers - drag both (move range)
                    this._drag = "both";
                    this._offset = [
                        x - this.axisToPixel(this._start),
                        x - this.axisToPixel(this._stop)
                    ];
                }
            } else {
                // No markers set, treat as axis drag
                this._drag = "axis";
                this._dragStartX = ev.clientX;
                this._offset = this._axisView ? x - this._axisView[0] : 0;
            }
        }
    }
    
    private onMouseMove(ev: MouseEvent): void {
        if (!this._drag) {
            return;
        }
        
        const rect = this.container.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        
        if (this._drag === "select") {
            this.setStop(this.pixelToAxis(x));
        } else if (this._drag === "axis" && this._axisView && typeof this._offset === "number") {
            this.setView(x - this._offset, this._axisView[1]);
        } else if (this._drag === "start") {
            const rect = this.container.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            this.setStart(this.pixelToAxis(x));
        } else if (this._drag === "stop") {
            const rect = this.container.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            this.setStop(this.pixelToAxis(x));
        } else if (this._drag === "both" && Array.isArray(this._offset)) {
            // Move both markers together (drag the range)
            const rect = this.container.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            this.setStart(this.pixelToAxis(x - this._offset[0]));
            this.setStop(this.pixelToAxis(x - this._offset[1]));
        }
    }
    
    private onMouseUp(ev: MouseEvent): void {
        this._drag = null;
    }
    
    private onWheel(ev: WheelEvent): void {
        ev.preventDefault();
        const y = Math.sign(-ev.deltaY);
        
        if (!y) {
            return;
        }
        
        if (ev.shiftKey) {
            this.setNpoints(Math.max(1, this._npoints + y));
        } else {
            const rect = this.container.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            this.zoom(Math.pow(this.zoomFactor, y), x);
        }
    }
    
    private onKeyDown(ev: KeyboardEvent): void {
        if (ev.ctrlKey) {
            if (ev.key === "i") {
                ev.preventDefault();
                this.viewRange();
            } else if (ev.key === "p") {
                ev.preventDefault();
                this.snapRange();
            }
        }
    }
    
    // Rendering
    render(): void {
        const width = this.container.offsetWidth;
        
        // Safeguard: ensure we have a valid interval
        // Extend the range beyond visible area for smooth tick appearance
        const padding = width * 0.1; // 10% padding on each side
        const axisStart = this.pixelToAxis(-padding);
        const axisEnd = this.pixelToAxis(width + padding);
        
        if (!isFinite(axisStart) || !isFinite(axisEnd) || axisStart === axisEnd) {
            // Invalid view, skip rendering ticks
            return;
        }
        
        // Get ticks from ticker
        const tickResult = this.ticker.call(axisStart, axisEnd);
        
        // Update prefix
        this.prefixLabel.textContent = tickResult.prefix;
        
        // Render tick labels
        this.ticksContainer.innerHTML = "";
        for (let i = 0; i < tickResult.ticks.length; i++) {
            const tickPos = this.axisToPixel(tickResult.ticks[i]);
            const tickLabel = document.createElement("div");
            tickLabel.className = "scan-tick";
            tickLabel.textContent = tickResult.labels[i];
            tickLabel.style.left = `${tickPos}px`;
            this.ticksContainer.appendChild(tickLabel);
        }
        
        // Render tick marks
        const tickMarksContainer = this.container.querySelector(".scan-tick-marks");
        if (tickMarksContainer) {
            tickMarksContainer.innerHTML = "";
            for (const tick of tickResult.ticks) {
                const x = this.axisToPixel(tick);
                const mark = document.createElement("div");
                mark.className = "scan-tick-mark";
                mark.style.left = `${x}px`;
                tickMarksContainer.appendChild(mark);
            }
        }
        
        // Render scan points
        this.scanPointsContainer.innerHTML = "";
        if (this._start !== null && this._stop !== null && this._npoints > 1) {
            for (let i = 0; i < this._npoints; i++) {
                const t = i / (this._npoints - 1);
                const val = this._start + t * (this._stop - this._start);
                const x = this.axisToPixel(val);
                const point = document.createElement("div");
                point.className = "scan-point";
                point.style.left = `${x}px`;
                this.scanPointsContainer.appendChild(point);
            }
        }
        
        // Update marker positions
        if (this._start !== null) {
            this.startMarker.style.left = `${this.axisToPixel(this._start)}px`;
            this.startMarker.style.display = "block";
        } else {
            this.startMarker.style.display = "none";
        }
        
        if (this._stop !== null) {
            this.stopMarker.style.left = `${this.axisToPixel(this._stop)}px`;
            this.stopMarker.style.display = "block";
        } else {
            this.stopMarker.style.display = "none";
        }
    }
}