const canvas = document.getElementById('particleField');
const context = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let points = [];
let pointer = { x: -1000, y: -1000 };

function makePoints() {
  const rect = canvas.getBoundingClientRect();
  const count = Math.max(26, Math.min(58, Math.round(rect.width / 11)));
  points = Array.from({ length: count }, (_, index) => ({ x: Math.random() * rect.width, y: Math.random() * rect.height, z: .25 + Math.random() * .8, size: .55 + Math.random() * 1.25, phase: index * .71 }));
}
function resize() { const rect = canvas.getBoundingClientRect(); const scale = Math.min(window.devicePixelRatio || 1, 2); canvas.width = rect.width * scale; canvas.height = rect.height * scale; context.setTransform(scale, 0, 0, scale, 0, 0); makePoints(); }
function draw(time = 0) {
  const rect = canvas.getBoundingClientRect(); context.clearRect(0, 0, rect.width, rect.height); const turn = reduceMotion ? 0 : time * .00018;
  points.forEach((point, index) => {
    const x = point.x + Math.sin(turn + point.phase) * 24 * point.z, y = point.y + Math.cos(turn * 1.4 + point.phase) * 18 * point.z, near = Math.hypot(x - pointer.x, y - pointer.y) < 110;
    context.beginPath(); context.fillStyle = near ? 'rgba(60,188,155,.72)' : `rgba(20,22,23,${.08 + point.z * .22})`; context.arc(x, y, point.size * point.z * (near ? 1.8 : 1), 0, Math.PI * 2); context.fill();
    for (let next = index + 1; next < points.length; next++) { const other = points[next], ox = other.x + Math.sin(turn + other.phase) * 24 * other.z, oy = other.y + Math.cos(turn * 1.4 + other.phase) * 18 * other.z, distance = Math.hypot(x - ox, y - oy); if (distance < 80) { context.beginPath(); context.moveTo(x, y); context.lineTo(ox, oy); context.strokeStyle = `rgba(33,37,38,${.07 * (1 - distance / 80)})`; context.lineWidth = .6; context.stroke(); } }
  }); if (!reduceMotion) requestAnimationFrame(draw);
}
window.addEventListener('resize', resize);
canvas.parentElement.addEventListener('pointermove', event => { const rect = canvas.getBoundingClientRect(); pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }; });
canvas.parentElement.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
resize(); draw();
const whyLink = document.querySelector('a[href="#why"]');
if (whyLink) whyLink.href = 'why.html';
const flowLink = document.querySelector('a[href="#challenges"]');
if (flowLink) { flowLink.href = 'flow.html'; flowLink.textContent = 'How it works'; }
