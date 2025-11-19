import { state } from "./core/state.js";
import { setupEventHandlers } from "./ui/events.js";
import { generateGraph } from "./core/graph-generator.js";
import { drawGraph, resetCanvasCache } from "./rendering/canvas-renderer.js";
import { centerGraph } from "./rendering/center.js";
import { queryUI } from "./ui/dom.js";

// Render Loop
function renderLoop(ui) {
    if (state.needsRedraw) {
        if (state.graphDirty) {
            const start = +ui.startInput.value;
            const end = +ui.endInput.value;
            const type = ui.typeSelect.value;

            generateGraph(start, end, type);
            resetCanvasCache();

            if (!state.manualTransform) centerGraph(ui.canvas);

            state.graphDirty = false;
        }

        drawGraph(ui.ctx, ui.canvas);
        state.needsRedraw = false;
    }
    requestAnimationFrame(() => renderLoop(ui));
}

const ui = queryUI();
setupEventHandlers(ui);
renderLoop(ui);
