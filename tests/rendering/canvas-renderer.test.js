import { createGraphState } from "../../src/core/state.js";
import { drawGraph, resetCanvasCache } from "../../src/rendering/canvas-renderer.js";
import { createMockCanvas, createMockContext } from "../mocks/canvas-mock.js";
import { queryUIMock } from "../mocks/ui-mock.js";

beforeEach(() => {
    // make requestAnimationFrame sync by runing the callback directly
    global.requestAnimationFrame = (callback) => callback();
});


describe("drawGraph", () => {
    it("clear and draw image", () => {
        // Arrange
        const state = createGraphState();
        const mockedUI = queryUIMock(state);
        const canvas = mockedUI.canvas;
        const context = canvas.getContext("2d");

        state.nodes = [
            { x: 10, y: 10, isPrime: false },
            { x: 100, y: 100, isPrime: true }
        ];

        state.edges = [
            { from: state.nodes[0], to: state.nodes[1] }
        ];

        resetCanvasCache();

        // Act
        drawGraph(context, canvas, state);

        // Assert
        expect(context.clearRect).toHaveBeenCalled();
        expect(context.drawImage).toHaveBeenCalled();
    });

    it("draw edges", () => {
        // Arrange
        const state = createGraphState();
        const mockedUI = queryUIMock(state);
        const canvas = mockedUI.canvas;
        const context = canvas.getContext("2d");

        const cachedCanvas = createMockCanvas();
        globalThis.document.createElement = (tagName) => {
            if (tagName.toLowerCase() === "canvas") {
                return cachedCanvas;
            }
        }

        state.nodes = [
            { x: 10, y: 10, isPrime: false },
            { x: 100, y: 100, isPrime: true }
        ];

        state.edges = [
            { from: state.nodes[0], to: state.nodes[1] }
        ];

        resetCanvasCache();

        // Act
        drawGraph(context, canvas, state);

        // Assert
        const cachedContext = cachedCanvas.getContext("2d");
        expect(cachedContext.lineTo).toHaveBeenCalledTimes(1);
        expect(cachedContext.stroke).toHaveBeenCalledTimes(1);
    });

    it.each([
        {
            nodes: [
                { x: -1000, y: -1000 }, // outside viewport
                { x: 10000, y: 10000 } // outside viewport
            ],
            expectedEdgesDrawed: 1  //but edge cross the viewport
        },
        {
            nodes: [
                { x: -1000, y: -1000 }, // outside viewport
                { x: -10000, y: 10000 } // outside viewport
            ],
            expectedEdgesDrawed: 0  //edge does not cross the viewport
        },
        {
            nodes: [
                { x: 1000, y: -1000 }, // outside viewport
                { x: 10000, y: 10000 } // outside viewport
            ],
            expectedEdgesDrawed: 0  //edge does not cross the viewport
        }
    ])("draw visible edges", (testArg) => {
        // Arrange
        const state = createGraphState();
        const mockedUI = queryUIMock(state);
        const canvas = mockedUI.canvas;
        const context = canvas.getContext("2d");

        const cachedCanvas = createMockCanvas();
        globalThis.document.createElement = (tagName) => {
            if (tagName.toLowerCase() === "canvas") {
                return cachedCanvas;
            }
        }

        state.nodes = testArg.nodes;

        state.edges = [
            { from: state.nodes[0], to: state.nodes[1] }
        ];

        resetCanvasCache();

        // Act
        drawGraph(context, canvas, state);

        // Assert
        // The edge crossing the viewport should have been drawed
        const cachedContext = cachedCanvas.getContext("2d");
        expect(cachedContext.lineTo).toHaveBeenCalledTimes(testArg.expectedEdgesDrawed);
        expect(cachedContext.stroke).toHaveBeenCalledTimes(testArg.expectedEdgesDrawed);
    });

    it("draw nodes", () => {
        // Arrange
        const state = createGraphState();
        const mockedUI = queryUIMock(state);
        const canvas = mockedUI.canvas;
        const context = canvas.getContext("2d");

        const cachedCanvas = createMockCanvas();
        globalThis.document.createElement = (tagName) => {
            if (tagName.toLowerCase() === "canvas") {
                return cachedCanvas;
            }
        }

        state.nodes = [
            { x: 10, y: 10, isPrime: false },
            { x: 100, y: 100, isPrime: true }
        ];

        state.edges = [
            { from: state.nodes[0], to: state.nodes[1] }
        ];

        resetCanvasCache();

        // Act
        drawGraph(context, canvas, state);

        // Assert
        const cachedContext = cachedCanvas.getContext("2d");
        expect(cachedContext.arc).toHaveBeenCalledTimes(2);
        expect(cachedContext.fill).toHaveBeenCalledTimes(2);
    });

    it.each([
        {
            nodes: [
                { x: 10, y: 10 }, // inside viewport
                { x: 10000, y: 10000 } // outside viewport
            ],
            expectedNodesDrawed: 1
        },
        {
            nodes: [
                { x: -1000, y: -1000 }, // ouside viewport
                { x: 10, y: 10 } // inside viewport
            ],
            expectedNodesDrawed: 1
        },
        {
            nodes: [
                { x: 10, y: 10 }, // inside viewport
                { x: 30, y: 30 } // inside viewport
            ],
            expectedNodesDrawed: 2
        },
        {
            nodes: [
                { x: -1000, y: -1000 }, // outside viewport
                { x: 10000, y: 10000 } // outside viewport
            ],
            expectedNodesDrawed: 0
        },
        {
            nodes: [
                { x: -1000, y: -1000 }, // outside viewport
                { x: -10000, y: 10000 } // outside viewport
            ],
            expectedNodesDrawed: 0
        },
        {
            nodes: [
                { x: 1000, y: -1000 }, // outside viewport
                { x: 10000, y: 10000 } // outside viewport
            ],
            expectedNodesDrawed: 0
        }
    ])("draw visible nodes", (testArg) => {
        // Arrange
        const state = createGraphState();
        const mockedUI = queryUIMock(state);
        const canvas = mockedUI.canvas;
        const context = canvas.getContext("2d");

        const cachedCanvas = createMockCanvas();
        globalThis.document.createElement = (tagName) => {
            if (tagName.toLowerCase() === "canvas") {
                return cachedCanvas;
            }
        }

        state.nodes = testArg.nodes;

        state.edges = [
            { from: state.nodes[0], to: state.nodes[1] }
        ];

        resetCanvasCache();

        // Act
        drawGraph(context, canvas, state);

        // Assert
        // The edge crossing the viewport should have been drawed
        const cachedContext = cachedCanvas.getContext("2d");
        expect(cachedContext.arc).toHaveBeenCalledTimes(testArg.expectedNodesDrawed);
        expect(cachedContext.fill).toHaveBeenCalledTimes(testArg.expectedNodesDrawed);
    });

    it("draw line of symmetry", () => {
        // Arrange
        const state = createGraphState();
        const mockedUI = queryUIMock(state);
        const canvas = mockedUI.canvas;
        const context = canvas.getContext("2d");
        state.showLineOfSymmetry = true;

        const cachedCanvas = createMockCanvas();
        globalThis.document.createElement = (tagName) => {
            if (tagName.toLowerCase() === "canvas") {
                return cachedCanvas;
            }
        }

        state.nodes = [
            { x: 50, y: 10, isPrime: false },
            { x: 100, y: 100, isPrime: true }
        ];
        state.edges = [
            { from: state.nodes[0], to: state.nodes[1] }
        ];
        resetCanvasCache();

        // Act
        drawGraph(context, canvas, state);
        // Assert
        const cachedContext = cachedCanvas.getContext("2d");
        expect(cachedContext.moveTo).toHaveBeenCalledWith(50, 0);
        expect(cachedContext.lineTo).toHaveBeenCalledWith(50, canvas.height);
        expect(cachedContext.stroke).toHaveBeenCalled();
    })
});
