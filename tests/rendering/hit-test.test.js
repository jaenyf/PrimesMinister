import { isMouseOnLine } from "../../src/rendering/hit-test.js";

describe("hit-test", () => {
    it("returns true when mouse is close to a segment", () => {
        const result = isMouseOnLine(5, 5, 0, 0, 10, 10, 1);
        expect(result).toBe(true);
    });

    it("returns false when mouse is far", () => {
        const result = isMouseOnLine(100, 5, 0, 0, 10, 10, 1);
        expect(result).toBe(false);
    });
});
