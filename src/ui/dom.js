export function queryUI() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    return {
        canvas,
        ctx,
        tooltip: document.getElementById("tooltip"),
        startInput: document.getElementById("start"),
        endInput: document.getElementById("end"),
        typeSelect: document.getElementById("type"),

        nodesDisplayTypeSelect: document.getElementById("nodesDisplayType"),
        edgesDisplayTypeSelect: document.getElementById("edgesDisplayType"),

        zoomInBtn: document.getElementById("zoomInBtn"),
        zoomOutBtn: document.getElementById("zoomOutBtn"),
        centerBtn: document.getElementById("centerBtn"),

        startMultiplierBtn: document.getElementById("startMultiplierBtn"),
        startDividerBtn: document.getElementById("startDividerBtn"),
        endMultiplierBtn: document.getElementById("endMultiplierBtn"),
        endDividerBtn: document.getElementById("endDividerBtn")
    };
}

export default queryUI;
