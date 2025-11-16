import { state } from "../core/state.js";
import { generateGraph } from "../core/graph-generator.js";
import { drawGraph, resetCanvasCache } from "../rendering/canvas-renderer.js";
import { isMouseOnLine } from "../rendering/hit-test.js";
import { zoomAt } from "../rendering/zoom.js";
import { centerGraph } from "../rendering/center.js";

import {
    canvas, ctx, tooltip,
    startInput, endInput, typeSelect,
    nodesDisplayTypeSelect, edgesDisplayTypeSelect,
    zoomInBtn, zoomOutBtn, centerBtn,
    startMultiplierBtn, startDividerBtn, endMultiplierBtn, endDividerBtn
} from "./dom.js";

// Resize
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Schedule redraw
function scheduleRedraw(graphChanged = false) {
    state.needsRedraw = true;
    if (graphChanged) state.graphDirty = true;
}

// Buttons
zoomInBtn.onclick = () => {
    state.manualTransform = true;
    zoomAt(canvas.width / 2, canvas.height / 2, 1.1);
    scheduleRedraw();
};

zoomOutBtn.onclick = () => {
    state.manualTransform = true;
    zoomAt(canvas.width / 2, canvas.height / 2, 1 / 1.1);
    scheduleRedraw();
};

centerBtn.onclick = () => {
    state.manualTransform = false;
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
    state.nodesDisplayType = e.target.value;
    scheduleRedraw(true);
};
edgesDisplayTypeSelect.onchange = (e) => {
    state.edgesDisplayType = e.target.value;
    scheduleRedraw(true);
};

// Mouse events
canvas.onmousedown = (e) => {
    state.isPanning = true;
    state.panXStart = (e.clientX - state.panX) / state.zoom;
    state.panYStart = (e.clientY - state.panY) / state.zoom;
};

canvas.onmouseup = () => state.isPanning = false;

canvas.onmousemove = (e) => {
    const mx = (e.clientX - state.panX) / state.zoom;
    const my = (e.clientY - state.panY) / state.zoom;

    if (state.isPanning) {
        state.panX = e.clientX - state.panXStart * state.zoom;
        state.panY = e.clientY - state.panYStart * state.zoom;
        state.manualTransform = true;
    }

    let hovered = null;
    for (let edge of state.edges) {
        if (isMouseOnLine(mx, my, edge.from.x, edge.from.y, edge.to.x, edge.to.y, state.zoom)) {
            hovered = edge;
            break;
        }
    }

    if (hovered) {
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
        tooltip.innerText = `${hovered.from.value} → ${hovered.to.value}`;
        tooltip.classList.toggle("primes", hovered.from.isPrime && hovered.to.isPrime);
        tooltip.style.display = "block";
    } else {
        tooltip.style.display = "none";
    }

    scheduleRedraw();
};

canvas.onwheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    state.manualTransform = true;
    zoomAt(e.clientX, e.clientY, factor);
    scheduleRedraw();
};

canvas.oncontextmenu = (e) => e.preventDefault();

// Render Loop
export function renderLoop() {
    if (state.needsRedraw) {
        if (state.graphDirty) {
            
            const start = +startInput.value;
            const end = +endInput.value;
            const type = typeSelect.value;

            generateGraph(start, end, type);
            resetCanvasCache();

            if (!state.manualTransform) centerGraph(canvas);

            state.graphDirty = false;
        }

        drawGraph(ctx, canvas);
        state.needsRedraw = false;
    }
    requestAnimationFrame(renderLoop);
}
