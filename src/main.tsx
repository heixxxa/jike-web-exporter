import { render } from 'preact';
import { App } from './core/app';
import extensions from './core/extensions';
import { APP_ROOT_ID } from './constants/app';

import JikeCommentsModule from './modules/jike-comments';
import JikeExploreModule from './modules/jike-explore';
import JikeFollowingModule from './modules/jike-following';
import JikePostDetailModule from './modules/jike-post-detail';
import RuntimeLogsModule from './modules/runtime-logs';

import './index.css';

if (location.hostname === 'web.okjike.com') {
  extensions.add(JikeFollowingModule);
  extensions.add(JikeExploreModule);
  extensions.add(JikePostDetailModule);
  extensions.add(JikeCommentsModule);
}

extensions.add(RuntimeLogsModule);
extensions.start();

function mountApp() {
  if (!document.body || document.getElementById(APP_ROOT_ID)) {
    return;
  }

  const root = document.createElement('div');
  root.id = APP_ROOT_ID;
  document.body.append(root);

  render(<App />, root);
}

function scheduleMountApp() {
  const queueMount = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(mountApp, { timeout: 2000 });
      return;
    }

    window.setTimeout(mountApp, 300);
  };

  // Wait until the page finishes hydrating before injecting our own UI.
  if (document.readyState === 'complete') {
    queueMount();
    return;
  }

  window.addEventListener('load', queueMount, { once: true });
}

scheduleMountApp();
