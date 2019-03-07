import * as React from 'react';
import { stub, match, SinonStub } from 'sinon';
import {ReactNode} from 'react';

export type JSX = ReactNode;

export interface ReactMockExpectation<Props> {
  /**
   * Set the return value for when the component receives the previously
   * expected upon props.
   *
   * If there's no matching mocked return calls the component will render `null`.
   */
  renders: (jsx: JSX | ((props: Props) => JSX)) => ReactStub<Props>;
}

export interface ReactMock<Props> {
  /**
   * Set an expectation on the props the component will be rendered with.
   *
   * This call alone does nothing unless chained with `renders`.
   * @see ReactMockExpectation.renders
   *
   * @param expected The expected props will be shallowly matched against
   *   the props received by the component. They can be a subset of the
   *   props so as to not expose private handlers e.g. when a parent
   *   component sends a private onClick handler to a Button component.
   */
  withProps: (expected: Partial<Props>) => ReactMockExpectation<Props>;

  /**
   * See whether the component was ever rendered with the given props.
   *
   * @param props A subset of the props.
   * @see withProps
   */
  renderedWith: (props: Partial<Props>) => boolean;

  /**
   * Get the props the component received in the last render call.
   */
  lastProps: Props;

  /**
   * Was this component rendered at least once?
   */
  rendered: boolean;

  /**
   * Get all the props ever received by the mock.
   */
  props: Props[];

    /**
     * The raw Sinon stub used under the hood.
     */
  sinonStub: SinonStub;
}

// eslint-disable-next-line space-infix-ops
export type ReactStub<Props> = React.ComponentClass<Props> & ReactMock<Props>;

/**
 * Create a mock component of the given type.
 */
export function createReactStub<Props>(): ReactStub<Props> {
  const renderStub = stub();

  return class Stub extends React.Component<Props> {
    public static withProps(expectedProps: Partial<Props>): ReactMockExpectation<Props> {
      const expectation = renderStub.withArgs(match(expectedProps));

      const renders = (jsx: JSX | ((props: Props) => JSX)) => {
        if (typeof jsx === 'function') {
          expectation.callsFake((props: Props) => jsx(props));
        } else {
          expectation.returns(jsx);
        }

        return Stub;
      };

      return { renders };
    }

    public static renderedWith(props: Partial<Props>): boolean {
      return renderStub.calledWithMatch(props);
    }

    public static get lastProps() {
      if (!renderStub.called) {
        throw new Error('Component never rendered!');
      }

      return renderStub.lastCall.args[0];
    }

    public static get rendered() {
      return renderStub.called;
    }

    public static get props() {
      return renderStub.args.map(args => args[0]);
    }

    public static sinonStub = renderStub;

    render() {
      // In case there were no expectations set on the stub (spy behavior) we
      // return something that won't make React throw its hands in the air.
      return <div>
        {renderStub(this.props) || null}
      </div>;
    }
  };
}
