import { createTestState } from "../mocks/state-mock.js";
import { drawGraph, resetCanvasCache } from "../../src/rendering/canvas-renderer.js";
import { createMockCanvas, createMockContext } from "../mocks/canvas-mock.js";


describe("drawGraph", () => {
    it("clear and draw image", () => {
        // Arrange
        const canvas = createMockCanvas();
        const context = createMockContext();
        const state = createTestState();

        state.nodes = [
            { x: 10, y: 10, isPrime: false },
            { x: 100, y: 100, isPrime: true }
        ];

        state.edges = [
            { from: state.nodes[0], to: state.nodes[1] }
        ];

        resetCanvasCache();

        // Act
        drawGraph(context, canvas);

        // Assert
        expect(context.clearRect).toHaveBeenCalled();
        expect(context.drawImage).toHaveBeenCalled();
    });
});

describe("drawGraph", () => {
    it("draw edges", () => {
        // Arrange
        const canvas = createMockCanvas();
        const context = createMockContext();
        const state = createTestState();

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
        drawGraph(context, canvas);

        // Assert
        const cachedContext = cachedCanvas.getContext("2d");
        expect(cachedContext.lineTo).toHaveBeenCalledTimes(1);
        expect(cachedContext.stroke).toHaveBeenCalledTimes(1);
    });
});

describe("drawGraph", () => {
    it("draw nodes", () => {
        // Arrange
        const canvas = createMockCanvas();
        const context = createMockContext();
        const state = createTestState();

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
        drawGraph(context, canvas);

        // Assert
        const cachedContext = cachedCanvas.getContext("2d");
        expect(cachedContext.arc).toHaveBeenCalledTimes(2);
        expect(cachedContext.fill).toHaveBeenCalledTimes(2);
    });
});
