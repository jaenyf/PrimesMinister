import { state } from "../core/state.js";
import { isMouseOnLine } from "../rendering/hit-test.js";
import { zoomAt } from "../rendering/zoom.js";
import { centerGraph } from "../rendering/center.js";

import { queryUI } from "./dom.js";

export function setupEventHandlers(ui = queryUI(), stateParam) {
    // Backwards-compatible: tests may call setupEventHandlers(canvas, state)
    let uiObj;
    if (ui && (ui instanceof HTMLCanvasElement || typeof ui.getContext === "function")) {
        // If a bare canvas element is passed (legacy tests), avoid querying
        // the document for other elements because test mocks may not provide them.
        uiObj = {
            canvas: ui,
            ctx: ui.getContext ? ui.getContext("2d") : null,
            tooltip: null,
            startInput: { value: "", oninput: null },
            endInput: { value: "", oninput: null },
            typeSelect: { value: "", onchange: null },
            nodesDisplayTypeSelect: { onchange: null },
            edgesDisplayTypeSelect: { onchange: null },
            zoomInBtn: { onclick: null },
            zoomOutBtn: { onclick: null },
            centerBtn: { onclick: null },
            startMultiplierBtn: { onclick: null },
            startDividerBtn: { onclick: null },
            endMultiplierBtn: { onclick: null },
            endDividerBtn: { onclick: null }
        };
    } else {
        uiObj = ui || queryUI();
    }

    const {
        canvas, tooltip,
        startInput, endInput, typeSelect,
        nodesDisplayTypeSelect, edgesDisplayTypeSelect,
        zoomInBtn, zoomOutBtn, centerBtn,
        startMultiplierBtn, startDividerBtn, endMultiplierBtn, endDividerBtn
    } = uiObj;

    const localState = stateParam || state;

    // Resize
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // setupEventHandlers








    // Schedule redraw
    function scheduleRedraw(graphChanged = false) {
        localState.needsRedraw = true;
        if (graphChanged) localState.graphDirty = true;
    }

    // Buttons
    zoomInBtn.onclick = () => {
        localState.manualTransform = true;
        zoomAt(canvas.width / 2, canvas.height / 2, 1.1);
        scheduleRedraw();
    };

    zoomOutBtn.onclick = () => {
        localState.manualTransform = true;
        zoomAt(canvas.width / 2, canvas.height / 2, 1 / 1.1);
        scheduleRedraw();
    };

    centerBtn.onclick = () => {
        localState.manualTransform = false;
        centerGraph(canvas);
        scheduleRedraw();
    };

    // Inputs
    [startInput, endInput].forEach(inp =>
        inp.oninput = () => scheduleRedraw(true)
    );

    typeSelect.onchange = () => scheduleRedraw(true);

    startMultiplierBtn.onclick = () => {
        startInput.value = +startInput.value * 2;
        scheduleRedraw(true);
    };

    startDividerBtn.onclick = () => {
        startInput.value = Math.floor(+startInput.value / 2);
        scheduleRedraw(true);
    };

    endMultiplierBtn.onclick = () => {
        endInput.value = +endInput.value * 2;
        scheduleRedraw(true);
    };

    endDividerBtn.onclick = () => {
        endInput.value = Math.floor(+endInput.value / 2);
        scheduleRedraw(true);
    };

    nodesDisplayTypeSelect.onchange = (e) => {
        localState.nodesDisplayType = e.target.value;
        scheduleRedraw(true);
    };
    edgesDisplayTypeSelect.onchange = (e) => {
        localState.edgesDisplayType = e.target.value;
        scheduleRedraw(true);
    };

    // Mouse events
    canvas.onmousedown = (e) => {
        localState.isPanning = true;
        localState.panXStart = (e.clientX - localState.panX) / localState.zoom;
        localState.panYStart = (e.clientY - localState.panY) / localState.zoom;
    };

    canvas.onmouseup = () => localState.isPanning = false;

    canvas.onmousemove = (e) => {
        const mx = (e.clientX - localState.panX) / localState.zoom;
        const my = (e.clientY - localState.panY) / localState.zoom;

        if (localState.isPanning) {
            localState.panX = e.clientX - localState.panXStart * localState.zoom;
            localState.panY = e.clientY - localState.panYStart * localState.zoom;
            localState.manualTransform = true;
        }

        let hovered = null;
        for (let edge of localState.edges) {
            if (isMouseOnLine(mx, my, edge.from.x, edge.from.y, edge.to.x, edge.to.y, localState.zoom)) {
                hovered = edge;
                break;
            }
        }

        if (hovered) {
            if (tooltip) {
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY + 10}px`;
                tooltip.innerText = `${hovered.from.value} → ${hovered.to.value}`;
                tooltip.classList.toggle("primes", hovered.from.isPrime && hovered.to.isPrime);
                tooltip.style.display = "block";
            }
        } else {
            if (tooltip) tooltip.style.display = "none";
        }

        scheduleRedraw();
    };

    canvas.onwheel = (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        localState.manualTransform = true;
        zoomAt(e.clientX, e.clientY, factor);
        scheduleRedraw();
    };

    canvas.oncontextmenu = (e) => e.preventDefault();
}
