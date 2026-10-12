import { h } from '../lib/dom.ts';

let current: HTMLElement | null = null;

export function closePopover(): void {
  current?.remove();
  current = null;
}

/** Shows a single floating card anchored under `anchor` (document coordinates, clamped to viewport). */
export function showPopover(anchor: HTMLElement, label: string, ...content: Array<Node | string>): void {
  closePopover();
  const pop = h('div', { class: 'pop', role: 'dialog', 'aria-label': label }, ...content);
  document.body.appendChild(pop);

  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  const left = Math.max(margin, Math.min(rect.left + rect.width / 2 - pop.offsetWidth / 2, window.innerWidth - pop.offsetWidth - margin));
  pop.style.left = `${left + window.scrollX}px`;
  pop.style.top = `${rect.bottom + window.scrollY + margin}px`;
  current = pop;
}

document.addEventListener('click', (e) => {
  const target = e.target as Element;
  if (current && !current.contains(target) && !target.closest('.w')) closePopover();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopover();
});
