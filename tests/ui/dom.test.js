import { queryUI } from "../../src/ui/dom.js";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("dom bindings (index.html)", () => {
    it("loads index.html and extracts UI elements", () => {
        const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
        document.body.innerHTML = html;

        const ui = queryUI();

        expect(ui).toBeDefined();
        expect(ui.canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(ui.startInput).toBeInstanceOf(HTMLInputElement);
        expect(ui.endInput).toBeInstanceOf(HTMLInputElement);
        expect(ui.typeSelect).toBeInstanceOf(HTMLSelectElement);
        expect(ui.tooltip).toBeInstanceOf(HTMLElement);
    });
});
