import { act } from 'react';
import { createRoot } from 'react-dom/client';

// Tells React that updates run inside act(), so it flushes them before each assertion.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mounted = [];

export const render = async (element) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(element));
  mounted.push({ root, container });
  return container;
};

export const click = (element) => act(async () => element.click());

export const buttonNamed = (container, text) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

// Lets pending requests resolve until the check passes.
export const waitFor = async (check, tries = 50) => {
  for (let i = 0; i < tries; i += 1) {
    if (check()) return;
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  }
  throw new Error('waitFor: the condition was never met');
};

export const cleanup = () => {
  while (mounted.length) {
    const { root, container } = mounted.pop();
    act(() => root.unmount());
    container.remove();
  }
};
