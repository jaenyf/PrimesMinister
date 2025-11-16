export function isMouseOnLine(mx, my, x1, y1, x2, y2, zoom) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (!lenSq) return false;

    const t = ((mx - x1) * dx + (my - y1) * dy) / lenSq;
    if (t < 0 || t > 1) return false;

    const lx = x1 + t * dx;
    const ly = y1 + t * dy;

    const dist = Math.hypot(mx - lx, my - ly);
    return dist < 5 / zoom;
}
