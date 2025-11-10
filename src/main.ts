import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import and register Chart.js components
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController,
);

// Global error handlers: capture and prevent default handling of uncaught errors
// and unhandled promise rejections to avoid the dev overlay crashing the page.
// We still log errors to the console for visibility.
if (typeof window !== 'undefined') {
  const win = window as typeof window & {
    ErrorOverlay?: any;
  };

  const wrapOverlay = (OverlayCtor: any) => {
    if (typeof OverlayCtor !== 'function' || OverlayCtor.__SAFE_WRAPPED__) {
      return OverlayCtor;
    }

    const SafeOverlay = function SafeOverlay(this: any, ...args: any[]) {
      try {
        return new OverlayCtor(...args);
      } catch (err) {
        console.error('[vite overlay fallback]', err);
        const frame = document.createElement('iframe');
        frame.style.cssText = 'display:none';
        document.body?.appendChild(frame);
        return {
          frame,
          show: () => {},
          hide: () => {},
          update: () => {},
          close: () => {},
        };
      }
    } as any;

    Object.defineProperty(SafeOverlay, '__SAFE_WRAPPED__', {
      value: true,
      enumerable: false,
    });

    return SafeOverlay;
  };

  let currentOverlay = wrapOverlay(win.ErrorOverlay);

  Object.defineProperty(win, 'ErrorOverlay', {
    configurable: true,
    get() {
      return currentOverlay;
    },
    set(value) {
      currentOverlay = wrapOverlay(value);
    },
  });

  const suppressOverlay = (evt: ErrorEvent | PromiseRejectionEvent) => {
    const targetError = (evt as ErrorEvent)?.error;
    return targetError?.constructor?.name === 'ErrorOverlay';
  };

  window.addEventListener('error', (evt: ErrorEvent) => {
    try {
      // eslint-disable-next-line no-console
      console.error('[global error]', evt.error || evt.message, evt);
      if (suppressOverlay(evt)) {
        evt.preventDefault();
      }
    } catch (e) {
      // ignore
    }
  });

  window.addEventListener('unhandledrejection', (evt: PromiseRejectionEvent) => {
    try {
      // eslint-disable-next-line no-console
      console.error('[unhandledrejection]', evt.reason);
      if (evt.reason?.constructor?.name === 'ErrorOverlay') {
        evt.preventDefault();
      }
    } catch (e) {
      // ignore
    }
  });
}

// Bootstrap the Angular application and ensure errors are logged
bootstrapApplication(AppComponent, appConfig).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[bootstrap error]', err);
});
