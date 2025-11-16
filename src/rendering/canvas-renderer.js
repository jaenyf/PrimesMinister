import { state } from "../core/state.js";

let cachedCanvas = null;
let cachedZoom = 1;

export function drawGraph(ctx, canvas) {

    if (!cachedCanvas || cachedZoom !== state.zoom) {
        cachedCanvas = document.createElement("canvas");
        cachedCanvas.width = canvas.width;
        cachedCanvas.height = canvas.height;

        const cctx = cachedCanvas.getContext("2d");
        cctx.clearRect(0, 0, canvas.width, canvas.height);

        // Edges
        for (let e of state.edges) {
            const bothPrime = e.from.isPrime && e.to.isPrime;

            if (state.edgesDisplayType === 'Primes' && !bothPrime) continue;
            if (state.edgesDisplayType === 'NonPrimes' && bothPrime) continue;
            if (state.edgesDisplayType === 'None') continue;

            cctx.beginPath();
            cctx.moveTo(e.from.x, e.from.y);
            cctx.lineTo(e.to.x, e.to.y);
            cctx.strokeStyle = bothPrime ? "#f80" : "#000";
            cctx.lineWidth = 2;
            cctx.stroke();
        }

        // Nodes
        for (let node of state.nodes) {
            if (state.nodesDisplayType === 'Primes' && !node.isPrime) continue;
            if (state.nodesDisplayType === 'NonPrimes' && node.isPrime) continue;
            if (state.nodesDisplayType === 'None') continue;

            cctx.beginPath();
            cctx.arc(node.x, node.y, state.nodeRadius, 0, Math.PI * 2);
            cctx.fillStyle = node.isPrime ? "#f80" : "#08f";
            cctx.fill();

            cctx.fillStyle = "white";
            cctx.font = "12px Arial";
            cctx.fillText(node.value, node.x - state.nodeRadius / 2, node.y + 5);
        }

        cachedZoom = state.zoom;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
        cachedCanvas,
        state.panX,
        state.panY,
        cachedCanvas.width * state.zoom,
        cachedCanvas.height * state.zoom
    );
}
