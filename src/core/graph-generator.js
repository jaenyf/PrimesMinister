import { state } from "./state.js";
import { precomputePrimes, checkIsPrime } from "./prime-utils.js";
import { arrangeNodes } from "./layout.js";

function computeRoot(start, type) {
    switch (type.toLowerCase()) {
        case "zero": return start > 2 ? start : 0;
        case "odd": return start % 2 === 0 ? (start > 1 ? start - 1 : 1) : start;
        case "even":
            return start % 2 === 0
                ? (start > 1 ? start : 2)
                : (start - 1 > 1 ? start - 1 : 2);
        default:
            return start;
    }
}

export function generateGraph(start, end, type) {
    state.nodes = [];
    state.edges = [];

    const rootValue = computeRoot(start, type);
    precomputePrimes(rootValue, end);

    const createNode = (value) => ({
        value,
        children: [],
        parent: null,
        x: 0,
        y: 0,
        isPrime: checkIsPrime(value),
    });

    const valid = [];
    for (let i = rootValue; i <= end; i++) valid.push(i);

    const root = createNode(rootValue);
    state.nodes.push(root);

    let level = [root];

    for (let i = 1; i < valid.length; i++) {
        const node = createNode(valid[i]);
        state.nodes.push(node);

        const parent = level.find(n => n.children.length < 2);
        if (parent) {
            parent.children.push(node);
            node.parent = parent;
            state.edges.push({ from: parent, to: node });
            level.push(node);
        }
    }

    arrangeNodes();
}
