import { JSDOM } from 'jsdom';

declare global {
  namespace NodeJS {
    interface Global {
      window: any;
      document: any;
      navigator: any;
      requestAnimationFrame: any;
      HTMLElement: any;
    }
  }
}

// React needs these.
global.window = new JSDOM('').window;
global.document = global.window.document;
global.navigator = {
  userAgent: 'node.js'
};
global.requestAnimationFrame = function (callback: () => void) {
  setTimeout(callback, 0);
};

// SinonJS needs this.
global.HTMLElement = global.window.HTMLElement;
