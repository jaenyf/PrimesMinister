const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const typeSelect = document.getElementById('type');
const nodesDisplayTypeSelect = document.getElementById('nodesDisplayType');
const edgesDisplayTypeSelect = document.getElementById('edgesDisplayType');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const centerBtn = document.getElementById('centerBtn');

const state = {
    nodes: [],
    edges: [],
    zoom: 1,
    panX: 0,
    panY: 0,
    panXStart : 0,
    panYStart : 0,
    isPanning: false,
    manualTransform: false,
    nodeRadius: 20,
    nodesDisplayType: 'All',
    edgesDisplayType: 'All',
    needsRedraw : true, // indicates canvas needs to be redrawn
    graphDirty: true, // indicates graph structure needs regeneration
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Check if a number is prime
function _isPrime(num) {
    if (num < 2) return num == 1 ? true : false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

const primeCache = new Map();
function precomputePrimes(start, end) {
    for (let i = start; i <= end; i++) {
        if (!primeCache.has(i)) {
            primeCache.set(i, _isPrime(i));
        }
    }
}
function checkIsPrime(n) {
    return primeCache.get(n) || false;
}

// Calculates the root according to the selected type
function computeRoot(start, type) {
    if (type.toLowerCase() === "zero") {
        return start > 2 ? start : 0;
    } else if (type.toLowerCase() === "odd") {
        return start % 2 === 0 ? (start > 1 ? start - 1 : 1) : start;
    } else if (type.toLowerCase() === "even") {
        return start % 2 === 0 ? (start > 1 ? start : 2) : start - 1 > 1 ? start - 1 : 2;
    }
    return start;
}

// Generate the graph
function generateGraph(start, end, type) {
    state.nodes = [];
    state.edges = [];

    const rootValue = computeRoot(start, type);
    precomputePrimes(rootValue, end); // precompute primes once

    const createNode = (value) => ({
        value,
        children: [],
        parent: null,
        x: 0,
        y: 0,
        isPrime: checkIsPrime(value),
    });

    const validNumbers = [];
    for (let i = rootValue; i <= end; i++) validNumbers.push(i);

    const rootNode = createNode(rootValue);
    state.nodes.push(rootNode);
    let currentLevel = [rootNode];

    for (let i = 1; i < validNumbers.length; i++) {
        const node = createNode(validNumbers[i]);
        state.nodes.push(node);

        const parent = currentLevel.find(n => n.children.length < 2);
        if (parent) {
            parent.children.push(node);
            node.parent = parent;
            state.edges.push({ from: parent, to: node });
            currentLevel.push(node);
        }
    }

    arrangeNodes();
}


// Node positioning (adaptation according to the start-end range)
// --- Flattened node arrangement for speed ---
function arrangeNodes() {
    if (!state.nodes.length) return;

    const V_MARGIN = 50, H_MARGIN = 50;
    const levels = [];

    // Step 1: BFS to assign levels
    const root = state.nodes[0];
    root.level = 0;
    const queue = [root];

    while (queue.length) {
        const node = queue.shift();
        if (!levels[node.level]) levels[node.level] = [];
        levels[node.level].push(node);

        node.children.forEach(child => {
            child.level = node.level + 1;
            queue.push(child);
        });
    }

    // Step 2: Assign Y positions evenly per level
    const maxDepth = levels.length;
    levels.forEach((levelNodes, i) => {
        const y = V_MARGIN + i * ((canvas.height - 2 * V_MARGIN) / (maxDepth - 1));
        levelNodes.forEach(n => n.y = y);
    });

    // Step 3: Assign X positions recursively to preserve tree structure
    let nextX = H_MARGIN;
    function assignX(node) {
        if (node.children.length === 0) {
            node.x = nextX;
            nextX += 60; // horizontal spacing
        } else {
            node.children.forEach(assignX);
            // place parent in middle of its children
            const first = node.children[0].x;
            const last = node.children[node.children.length - 1].x;
            node.x = (first + last) / 2;
        }
    }

    assignX(root);

    // Step 4: Scale horizontally to fit canvas
    const [minX, maxX] = getMinMax(state.nodes, 'x');
    const scaleX = (canvas.width - 2 * H_MARGIN) / (maxX - minX || 1);
    state.nodes.forEach(n => n.x = H_MARGIN + (n.x - minX) * scaleX);
}

function getMinMax(nodes, field) {
    let min = Infinity, max = -Infinity;
    for (let n of nodes) {
        if (n[field] < min) min = n[field];
        if (n[field] > max) max = n[field];
    }
    return [min, max];
}


// Graph drawing
// --- Optimized drawGraph with offscreen caching ---
let cachedCanvas = null;
let cachedZoom = 1;
function drawGraph() {
    if (!cachedCanvas || cachedZoom !== state.zoom) {
        cachedCanvas = document.createElement('canvas');
        cachedCanvas.width = canvas.width;
        cachedCanvas.height = canvas.height;
        const cctx = cachedCanvas.getContext('2d');

        cctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        state.edges.forEach(edge => {
            const bothPrime = edge.from.isPrime && edge.to.isPrime;
            if (state.edgesDisplayType === 'Primes' && !bothPrime) return;
            if (state.edgesDisplayType === 'NonPrimes' && bothPrime) return;
            if (state.edgesDisplayType === 'None') return;

            cctx.beginPath();
            cctx.moveTo(edge.from.x, edge.from.y);
            cctx.lineTo(edge.to.x, edge.to.y);
            cctx.strokeStyle = bothPrime ? '#f80' : '#000';
            cctx.lineWidth = 2;
            cctx.stroke();
        });

        // Draw nodes
        state.nodes.forEach(node => {
            if (state.nodesDisplayType === 'Primes' && !node.isPrime) return;
            if (state.nodesDisplayType === 'NonPrimes' && node.isPrime) return;
            if (state.nodesDisplayType === 'None') return;

            cctx.beginPath();
            cctx.arc(node.x, node.y, state.nodeRadius, 0, Math.PI * 2);
            cctx.fillStyle = node.isPrime ? '#f80' : '#08f';
            cctx.fill();
            cctx.closePath();

            cctx.fillStyle = 'white';
            cctx.font = '12px Arial';
            cctx.fillText(node.value, node.x - state.nodeRadius / 2, node.y + 5);
        });

        cachedZoom = state.zoom;
    }

    // Draw cached canvas with zoom/pan
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cachedCanvas, state.panX, state.panY, cachedCanvas.width * state.zoom, cachedCanvas.height * state.zoom);
}

// Center graph without drawing
function centerGraphWithoutDrawing() {
    if (!state.nodes || state.nodes.length === 0) return;

    //1) Global bounding box 
    const minX = Math.min(...state.nodes.map(n => n.x));
    const maxX = Math.max(...state.nodes.map(n => n.x));
    const minY = Math.min(...state.nodes.map(n => n.y));
    const maxY = Math.max(...state.nodes.map(n => n.y));
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    // 2) Maximum zoom for using canvas
    const zoomHeight = (canvas.height / graphHeight) * 0.95;
    const zoomWidth = (canvas.width / graphWidth) * 0.95;
    const newZoom = Math.min(zoomHeight, zoomWidth);

    // 3) Horizontal centering based on parents 
    const parentNodes = state.nodes.filter(n => n.children && n.children.length > 0);
    const minParentX = Math.min(...parentNodes.map(n => n.x));
    const maxParentX = Math.max(...parentNodes.map(n => n.x));
    const parentCenterX = (minParentX + maxParentX) / 2;

    let newPanX = (canvas.width / 2) - parentCenterX * newZoom;

    // 4) Conventional vertical centering
    const newPanY = (canvas.height - graphHeight * newZoom) / 2 - minY * newZoom;

    // 5) Horizontal adjustment if sheets protrude
    const leafNodes = state.nodes.filter(n => !n.children || n.children.length === 0);
    const minLeafX = Math.min(...leafNodes.map(n => n.x)) * newZoom + newPanX;
    const maxLeafX = Math.max(...leafNodes.map(n => n.x)) * newZoom + newPanX;

    // 6) Offset if leaves extend beyond the canvas
    if (minLeafX < 0) newPanX += -minLeafX + 10;  // 10px de marge
    if (maxLeafX > canvas.width) newPanX -= (maxLeafX - canvas.width) + 10;

    // 7) Apply transformations
    state.zoom = newZoom;
    state.panX = newPanX;
    state.panY = newPanY;
}

// Center the graph
function toggleCentering() {
    // Center immediately
    centerGraphWithoutDrawing();

    // Toggle the manualTransform lock
    if (state.manualTransform) {
        lockCentering();   // now locked, centering applied automatically
    } else {
        unlockCentering(); // manual panning/zooming allowed
    }

    scheduleRedraw();
}

function isCenteringLocked() {
    return !state.manualTransform;
}

function unlockCentering() {
    state.manualTransform = true;
    centerBtn.classList.remove('locked');
}

function lockCentering() {
    state.manualTransform = false;
    centerBtn.classList.add('locked');
}


// Zooming in
function zoomIn() {
    unlockCentering();
    const zoomFactor = 1.1;
    state.zoom *= zoomFactor;
    scheduleRedraw();
}

// Zooming out
function zoomOut() {
    unlockCentering();
    const zoomFactor = 1.1;
    state.zoom /= zoomFactor;
    scheduleRedraw();
}

// Check if mouse is on a given line segment
function isMouseOnLine(mx, my, x1, y1, x2, y2, zoomLevel = 1) {

    // Linear interpolation function
    function lerp(a, b, t) { return a + t * (b - a); }

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return false; // segment nul

    // Projection du point sur la ligne
    const t = ((mx - x1) * dx + (my - y1) * dy) / lengthSq;

    // Verify that the projected point is indeed on the segment
    if (t < 0 || t > 1) return false;

    // Coordinates of the point projected onto the segment
    const lineX = lerp(x1, x2, t);
    const lineY = lerp(y1, y2, t);

    // Distance to mouse
    const distance = Math.sqrt((mx - lineX) ** 2 + (my - lineY) ** 2);
    return distance < (5 / zoomLevel); // tolerance
}

// Zoom and center button events
zoomInBtn.addEventListener('click', () => {
    state.manualTransform = true;
    zoomIn();
});
zoomOutBtn.addEventListener('click', () => {
    state.manualTransform = true;
    zoomOut();
});
//  Zoom with mouse wheel
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    unlockCentering();

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate the cursor position in relative coordinates
    const cursorX = (mouseX - state.panX) / state.zoom;
    const cursorY = (mouseY - state.panY) / state.zoom;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1; // Facteur de zoom

    // Adjust the zoom
    state.zoom *= zoomFactor;

    // Adjust panX and panY according to the zoom change
    state.panX = mouseX - cursorX * state.zoom;
    state.panY = mouseY - cursorY * state.zoom;

    scheduleRedraw();
});

centerBtn.addEventListener('click', toggleCentering);

canvas.addEventListener('mousemove', (e) => {

    const mouseX = (e.clientX - state.panX) / state.zoom;
    const mouseY = (e.clientY - state.panY) / state.zoom;

    if (state.isPanning) {
        state.panX = e.clientX - state.panXStart * state.zoom;
        state.panY = e.clientY - state.panYStart * state.zoom;
        unlockCentering();
    }

    let lineHovered = null;
    // Check if the mouse is on one of the edges
    for (let edge of state.edges) {
        const x1 = edge.from.x;
        const y1 = edge.from.y;
        const x2 = edge.to.x;
        const y2 = edge.to.y;

        if (isMouseOnLine(mouseX, mouseY, x1, y1, x2, y2, state.zoom)) {
            lineHovered = edge;
            break;
        }
    }

    if (lineHovered) {
        // Displaying the tooltip
        tooltip.style.left = `${e.clientX + 10}px`;  // Position of the tooltip next to the cursor
        tooltip.style.top = `${e.clientY + 10}px`;
        tooltip.innerText = `${lineHovered.from.value} to ${lineHovered.to.value}`;
        if (lineHovered.from.isPrime && lineHovered.to.isPrime) {
            tooltip.classList.add('primes');
        } else {
            tooltip.classList.remove('primes');
        }
        tooltip.style.display = 'block';
    } else {
        //  Hide the tooltip if no line is hovered over
        tooltip.style.display = 'none';
    }

    scheduleRedraw();
});

canvas.addEventListener('mouseup', () => {
    state.isPanning = false;
});
canvas.addEventListener('mousedown', (e) => {
    const mouseX = (e.clientX - state.panX) / state.zoom;
    const mouseY = (e.clientY - state.panY) / state.zoom;

    state.panXStart = mouseX;
    state.panYStart = mouseY;
    state.isPanning = true;
});


startInput.addEventListener('input', () => scheduleRedraw(true));
endInput.addEventListener('input', () => scheduleRedraw(true));
typeSelect.addEventListener('change', () => scheduleRedraw(true));

nodesDisplayTypeSelect.addEventListener('change', (e) => {
    state.nodesDisplayType = e.target.value;
    scheduleRedraw(true);
});

edgesDisplayTypeSelect.addEventListener('change', (e) => {
    state.edgesDisplayType = e.target.value;
    scheduleRedraw(true);
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

document.getElementById('startMultiplierBtn').addEventListener('click', () => {
    let currentValue = parseInt(startInput.value);
    startInput.value = currentValue * 2;
    scheduleRedraw(true);
});
document.getElementById('startDividerBtn').addEventListener('click', () => {
    let currentValue = parseInt(startInput.value);
    startInput.value = currentValue / 2;
    scheduleRedraw(true);
});
document.getElementById('endMultiplierBtn').addEventListener('click', () => {
    let currentValue = parseInt(endInput.value);
    endInput.value = currentValue * 2;
    scheduleRedraw(true);
});
document.getElementById('endDividerBtn').addEventListener('click', () => {
    let currentValue = parseInt(endInput.value);
    endInput.value = currentValue / 2;
    scheduleRedraw(true);
});

function refreshGraph() {
    const start = parseInt(startInput.value);
    const end = parseInt(endInput.value);
    const type = typeSelect.value;
    generateGraph(start, end, type);
    if (!state.manualTransform) {
        centerGraphWithoutDrawing();
    }
    drawGraph();
}

function scheduleRedraw(graphChanged = false) {
    state.needsRedraw = true;
    if (graphChanged) state.graphDirty = true;
}

function renderLoop() {
     if (state.needsRedraw) {
        if (state.graphDirty) {
            const start = parseInt(startInput.value) || 0;
            const end = parseInt(endInput.value) || 100;
            const type = typeSelect.value;
            generateGraph(start, end, type);
            if (!state.manualTransform) centerGraphWithoutDrawing();
            cachedZoom = 0; // force cache redraw
            state.graphDirty = false;
        }
        drawGraph();
        state.needsRedraw = false;
    }
    requestAnimationFrame(renderLoop);
}

// Initial generation
renderLoop();
