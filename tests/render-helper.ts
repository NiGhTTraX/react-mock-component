import * as ReactDOM from 'react-dom';
import { ReactElement } from 'react';
import * as $ from 'jquery';

const _container = document.createElement('div');

/**
 * Render the given component.
 *
 * @param {ReactElement} element
 *
 * @returns {jQuery} The component's root DOM node wrapped in jQuery.
 */
// eslint-disable-next-line no-undef
export function $render(element: ReactElement<any>): JQuery {
  ReactDOM.render(element, _container);

  // Return the first (and only) child in the container wrapped in jQuery.
  return $(_container).children().eq(0);
}


/**
 * Unmount the currently mounted component.
 */
export function unmount(): void {
  // unmountComponentAtNode will return `false` if there was no component
  // mounted at the given node. That can happen when the component was
  // unmounted inside a test i.e. to test cleanup logic.
  ReactDOM.unmountComponentAtNode(_container);
}
