import { state as realState } from "../../src/core/state.js";

export function createTestState() {
    const s = structuredClone(realState);
    // replace properties on the real exported state object so modules that
    // imported the `state` reference see the updated values in tests
    Object.keys(realState).forEach(k => delete realState[k]);
    Object.assign(realState, s);
    global.state = realState;
    return realState;
}
