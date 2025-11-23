import { getNodeAt, getEdgeAt } from "../rendering/canvas-renderer.js";
import { isMouseOnNode, isMouseOnEdge } from "../rendering/hit-test.js";
import { zoomAt } from "../rendering/zoom.js";
import { centerGraph } from "../rendering/center.js";
import { GraphKind } from "../core/state.js";

export function setupEventHandlers(app) {

    function hideTooltip() {
        app.ui.tooltip.style.display = "none";
    }

    function showTooltipForNode(e, node) {
        app.ui.tooltip.style.left = `${e.clientX + 10}px`;
        app.ui.tooltip.style.top = `${e.clientY + 10}px`;
        app.ui.tooltip.innerHTML = `${node.value} = ${node.primesFactors.map(p => `${p.value}<sup>${p.power}</sup>`).join(" × ")}`;
        app.ui.tooltip.classList.toggle("primes", node.isPrime);
        app.ui.tooltip.style.display = "block";
    }

    function showTooltipForEdge(e, edge) {
        app.ui.tooltip.style.left = `${e.clientX + 10}px`;
        app.ui.tooltip.style.top = `${e.clientY + 10}px`;
        app.ui.tooltip.innerHTML = `${edge.from.value} &rarr; ${edge.to.value}`;
        app.ui.tooltip.classList.toggle("primes", edge.from.isPrime && edge.to.isPrime);
        app.ui.tooltip.style.display = "block";
    }

    function showDebugTooltip(e, mouseX, mouseY) {
        app.ui.tooltip.style.left = `${e.clientX + 10}px`;
        app.ui.tooltip.style.top = `${e.clientY + 10}px`;
        app.ui.tooltip.innerHTML = `x:${Math.floor(mouseX)} y:${Math.floor(mouseY)}`;
        app.ui.tooltip.classList.remove("primes");
        app.ui.tooltip.style.display = "block";
    }

    // Resize
    app.ui.canvas.width = window.innerWidth;
    app.ui.canvas.height = window.innerHeight;

    // setupEventHandlers
    // Schedule redraw
    function scheduleRedraw(graphChanged = false) {
        app.graphState.needsRedraw = true;
        if (graphChanged) app.graphState.graphDirty = true;
    }

    // Buttons
    app.ui.zoomInBtn.onclick = () => {
        app.graphState.manualTransform = true;
        zoomAt(app.ui.canvas.width / 2, app.ui.canvas.height / 2, 1.1, app.graphState);
        scheduleRedraw();
    };

    app.ui.zoomOutBtn.onclick = () => {
        app.graphState.manualTransform = true;
        zoomAt(app.ui.canvas.width / 2, app.ui.canvas.height / 2, 1 / 1.1, app.graphState);
        scheduleRedraw();
    };

    app.ui.centerBtn.onclick = () => {
        app.graphState.manualTransform = false;
        centerGraph(app.ui.canvas, app.graphState);
        scheduleRedraw();
    };

    // Inputs
    app.ui.startInput.oninput = () => {
        app.graphState.graphStartValue = +app.ui.startInput.value;
        scheduleRedraw(true);
    }

    app.ui.endInput.oninput = () => {
        app.graphState.graphEndValue = +app.ui.endInput.value;
        scheduleRedraw(true);
    }

    app.ui.typeSelect.onchange = (e) => {
        switch (e.target.value) {
            case "Zero":
                app.graphState.graphKind = GraphKind.Zero;
                break;
            case "Odd":
                app.graphState.graphKind = GraphKind.Odd;
                break;
            case "Even":
                app.graphState.graphKind = GraphKind.Even;
                break;
            default:
                throw new Error("Unknown graph kind selected: " + e.target.value);
        }
        scheduleRedraw(true);
    }

    app.ui.startMultiplierBtn.onclick = () => {
        app.ui.startInput.value = +app.ui.startInput.value * 2;
        app.graphState.graphStartValue = +app.ui.startInput.value;
        scheduleRedraw(true);
    };

    app.ui.startDividerBtn.onclick = () => {
        app.ui.startInput.value = Math.floor(+app.ui.startInput.value / 2);
        app.graphState.graphStartValue = +app.ui.startInput.value;
        scheduleRedraw(true);
    };

    app.ui.endMultiplierBtn.onclick = () => {
        app.ui.endInput.value = +app.ui.endInput.value * 2;
        app.graphState.graphEndValue = +app.ui.endInput.value;
        scheduleRedraw(true);
    };

    app.ui.endDividerBtn.onclick = () => {
        app.ui.endInput.value = Math.floor(+app.ui.endInput.value / 2);
        app.graphState.graphEndValue = +app.ui.endInput.value;
        scheduleRedraw(true);
    };

    app.ui.nodesDisplayTypeSelect.onchange = (e) => {
        app.graphState.nodesDisplayType = e.target.value;
        scheduleRedraw(true);
    };
    app.ui.edgesDisplayTypeSelect.onchange = (e) => {
        app.graphState.edgesDisplayType = e.target.value;
        scheduleRedraw(true);
    };

    // Mouse events
    app.ui.canvas.onmousedown = (e) => {
        app.graphState.isPanning = true;
        app.graphState.panXStart = (e.clientX - app.graphState.panX) / app.graphState.zoom;
        app.graphState.panYStart = (e.clientY - app.graphState.panY) / app.graphState.zoom;
    };

    app.ui.canvas.onmouseup = () => app.graphState.isPanning = false;

    app.ui.canvas.onmousemove = (e) => {

        const rect = app.ui.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (app.graphState.isPanning) {
            app.graphState.panX = e.clientX - app.graphState.panXStart * app.graphState.zoom;
            app.graphState.panY = e.clientY - app.graphState.panYStart * app.graphState.zoom;
            app.graphState.manualTransform = true;
            scheduleRedraw();
        }

        const hoveredNode = getNodeAt(mouseX, mouseY, app.ui.canvas, app.graphState);
        const hoveredEdge = hoveredNode ? null : getEdgeAt(mouseX, mouseY, app.ui.canvas, app.graphState);

        if (hoveredNode) {
            showTooltipForNode(e, hoveredNode);
        } else if (hoveredEdge) {
            showTooltipForEdge(e, hoveredEdge);
        } else {
            if (app.debug) {
                showDebugTooltip(e, mouseX, mouseY);
            }
            else {
                hideTooltip();
            }
        }
    };

    app.ui.canvas.onwheel = (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        app.graphState.manualTransform = true;
        zoomAt(e.clientX, e.clientY, factor, app.graphState);
        scheduleRedraw();
    };

    app.ui.canvas.oncontextmenu = (e) => e.preventDefault();

    window.onresize = () => {
        app.ui.canvas.width = window.innerWidth;
        app.ui.canvas.height = window.innerHeight;
        scheduleRedraw(true);
    }

    app.ui.showSymmetryLineCheckbox.onchange = (e) => {
        app.graphState.showLineOfSymmetry = e.target.checked;
        scheduleRedraw(true);
    }
}
