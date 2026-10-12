type Child = Node | string | number | null | undefined | false | Child[];
type AttrValue = string | number | boolean | null | undefined | ((e: Event) => void);

/** Minimal hyperscript. Text children are always text nodes (no HTML injection). */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, AttrValue> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    const aria = key.startsWith('aria-');
    if (value === false && !aria) continue;
    if (typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      el.className = String(value);
    } else {
      // ARIA states are string enums ("true"/"false"); plain booleans are presence attributes.
      el.setAttribute(key, value === true && !aria ? '' : String(value));
    }
  }
  append(el, children);
  return el;
}

function append(parent: Node, children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) append(parent, child);
    else parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** Replace an element's children, skipping falsy entries (same child rules as `h`). */
export function fill(el: Element, ...children: Child[]): void {
  el.replaceChildren();
  append(el, children);
}
