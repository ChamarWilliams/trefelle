const workspace = document.getElementById('workspace');
const rightColumn = document.querySelector('.right-column');
const verticalSplitter = document.querySelector('.vertical');
const horizontalSplitter = document.querySelector('.horizontal');

document.querySelectorAll('.segment').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.segment.active').classList.remove('active');
  document.querySelector('.tab-view.active').classList.remove('active');
  button.classList.add('active');
  document.getElementById(button.dataset.view).classList.add('active');
}));

function resize(splitter, axis, apply) {
  splitter.addEventListener('pointerdown', event => {
    event.preventDefault(); splitter.setPointerCapture(event.pointerId);
    const start = axis === 'x' ? event.clientX : event.clientY;
    const initial = axis === 'x' ? workspace.getBoundingClientRect().width : rightColumn.getBoundingClientRect().height;
    splitter.onpointermove = move => apply((axis === 'x' ? move.clientX : move.clientY) - start, initial);
    splitter.onpointerup = () => { splitter.onpointermove = null; };
  });
}
resize(verticalSplitter, 'x', (delta, width) => { const value = Math.max(305, Math.min(width - 390, width * .39 + delta)); workspace.style.gridTemplateColumns = `${value}px 7px 1fr`; });
resize(horizontalSplitter, 'y', (delta, height) => { const value = Math.max(285, Math.min(height - 220, height * .58 + delta)); rightColumn.style.gridTemplateRows = `${value}px 7px 1fr`; });

document.getElementById('runTests').addEventListener('click', () => {
  const editor = document.querySelector('.editor-pane'); editor.classList.add('running');
  setTimeout(() => { editor.classList.remove('running'); document.querySelector('.fail').classList.add('shake'); }, 1150);
});
document.getElementById('submitSolution').addEventListener('click', () => {
  const toast = document.getElementById('toast'); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600);
});
