import { state } from "../core/state.js";

export function zoomAt(mouseX, mouseY, factor) {
    const cursorX = (mouseX - state.panX) / state.zoom;
    const cursorY = (mouseY - state.panY) / state.zoom;

    state.zoom *= factor;

    state.panX = mouseX - cursorX * state.zoom;
    state.panY = mouseY - cursorY * state.zoom;
}
