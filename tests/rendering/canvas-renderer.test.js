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
});

describe("drawGraph", () => {
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
});

describe("drawGraph", () => {
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
});

describe("drawGraph", () => {
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
