import * as React from 'react';
import { stub, match } from 'sinon';

// Replace this with ReactNode after https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544 is done.
export type JSX = React.ReactElement<any> | null;

export interface ReactMockExpectation {
  /**
   * Set the return value for when the component receives the previously
   * expected upon props.
   *
   * If there no mocked return values the component will render `null`.
   * If the component is rendered with unexpected props it will return
   * `undefined`.
   */
  renders: (jsx: JSX) => void;
}

export interface ReactMock<Props> {
  /**
   * Set an expectation on the props the component will be rendered with.
   *
   * This call alone does nothing unless chained with `renders`.
   * @see ReactMockExpectation.renders
   *
   * The expected props will be shallowly matched against the props
   * received by the component.
   */
  withProps: (expected: Partial<Props>) => ReactMockExpectation;

  /**
   * See whether the component was ever rendered with the given props.
   */
  renderedWith: (props: Partial<Props>) => boolean;

  /**
   * Get the props the component received in the last render call.
   */
  lastProps: Props;
}

// eslint-disable-next-line space-infix-ops
export type ReactStub<Props> = React.ComponentClass<Props> & ReactMock<Props>;

/**
 * Create a mock component of the given type.
 */
export function createReactStub<Props>(): ReactStub<Props> {
  const renderStub = stub();

  return class Stub extends React.Component<Props> {
    public static withProps(expectedProps: Partial<Props>): ReactMockExpectation {
      const expectation = renderStub.withArgs(match(expectedProps));
      const renders = (jsx: JSX) => expectation.returns(jsx);
      return { renders };
    }

    public static renderedWith(props: Partial<Props>): boolean {
      return renderStub.calledWithMatch(props);
    }

    public static get lastProps() {
      return renderStub.lastCall.args[0];
    }

    render() {
      // In case there were no expectations set on the stub (spy behavior) we
      // return something that won't make React throw its hands in the air.
      return renderStub(this.props) || null;
    }
  };
}
