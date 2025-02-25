let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, "passive", {
    get() {
      supportsPassive = true;
    },
  });
  // @ts-ignore
  window.addEventListener("test", null, opts);
} catch (e) {
  // empty
}

export const Events = {
  isSupportsPassive: () => supportsPassive,
  on(
    el: Element | Window | Document,
    type: string,
    callback: EventListener,
    options: AddEventListenerOptions | boolean = { passive: false }
  ) {
    el.addEventListener(type, callback, supportsPassive ? options : false);
  },

  off(
    el: Element | Window | Document,
    type: string,
    callback: EventListener,
    options: AddEventListenerOptions | boolean = { passive: false }
  ) {
    el.removeEventListener(type, callback, supportsPassive ? options : false);
  },
};
