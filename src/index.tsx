import React, { ReactNode } from 'react';
import { act } from 'react-dom/test-utils';
import { match, stub } from 'sinon';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

export interface ReactMockExpectation<Props> {
  /**
   * Set the return value for when the component receives the previously
   * expected upon props.
   *
   * @see withProps
   *
   * If there are no matching expectations the component will render an
   * empty div.
   */
  renders: (jsx: ReactNode | ((props: Props) => ReactNode)) => ReactStub<Props>;
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
   *   props to not expose private handlers e.g. when a parent
   *   component sends a private onClick handler to a Button component.
   */
  withProps: (expected: DeepPartial<Props>) => ReactMockExpectation<Props>;

  /**
   * See whether the component was ever rendered with the given props.
   *
   * @param props A subset of the props.
   * @see withProps
   */
  renderedWith: (props: DeepPartial<Props>) => boolean;

  /**
   * Was this component rendered at least once?
   */
  rendered: boolean;

  /**
   * Is this component currently mounted?
   */
  mounted: boolean;

  /**
   * Get the props the component received in the last render call.
   *
   * You can call callbacks from here and not have to worry about `act()`.
   *
   * @example
   * ```
   * const Mock = createReactMock<{ foo: number }>();
   * render(<Mock foo={23} />);
   * Mock.lastProps.foo === 23
   * ```
   */
  lastProps: Props;

  /**
   * Get all the props ever received by the mock.
   *
   * Each element in the array corresponds to a render call. The order
   * matches the order in which the component was rendered.
   *
   * You can call callbacks from here and not have to worry about `act()`.
   *
   * @example
   * ```
   * const Mock = createReactMock<{ foo: number }>();
   * render(<Mock foo={42} />);
   * render(<Mock foo={-42} />);
   * Mock.renderCalls[0].foo === 42
   * Mock.renderCalls[1].foo === -42
   * ```
   */
  renderCalls: Props[];

  /**
   * Clear all expectations and reset render history.
   *
   * @see {@link resetAll} Consider using `resetAll()` in your test setup.
   */
  reset: () => void;
}

export type ReactStub<Props> = React.ComponentClass<Props> & ReactMock<Props>;

const stubs: ReactStub<any>[] = [];

/**
 * Create a mock component of the given type.
 *
 * @param wrapInAct By default all function props are wrapped in `act()`
 *   so you don't have to when calling them from `lastProps`. If you want
 *   to opt out of this pass `wrapInAct: false`.
 */
export default function createReactMock<Props extends object>({
  wrapInAct = true,
}: {
  wrapInAct?: boolean;
} = {}): ReactStub<Props> {
  const renderStub = stub();
  let mounted = false;

  const Stub = class Stub extends React.Component<Props> {
    public static withProps(
      expectedProps: DeepPartial<Props>
    ): ReactMockExpectation<Props> {
      const expectation = renderStub.withArgs(match(expectedProps as object));

      const renders = (jsx: ReactNode | ((props: Props) => ReactNode)) => {
        if (typeof jsx === 'function') {
          expectation.callsFake((props: Props) => jsx(props));
        } else {
          expectation.returns(jsx);
        }

        return Stub;
      };

      return { renders };
    }

    public static renderedWith(props: DeepPartial<Props>): boolean {
      return renderStub.calledWithMatch(props);
    }

    public static get lastProps() {
      if (!renderStub.called) {
        throw new Error('Component never rendered!');
      }

      const props: Props = renderStub.lastCall.args[0];

      return this.wrapPropCallbacks(props);
    }

    public static get rendered() {
      return renderStub.called;
    }

    public static get mounted() {
      return mounted;
    }

    public static get renderCalls() {
      return renderStub.args.map((args) => this.wrapPropCallbacks(args[0]));
    }

    public static reset() {
      renderStub.reset();
      mounted = false;
    }

    private static wrapPropCallbacks(props: Props) {
      return Object.keys(props).reduce(
        (acc, prop) => ({
          ...acc,

          [prop]: this.wrapCallback(
            // @ts-ignore because Props is generic so can't be indexed
            props[prop]
          ),
        }),
        {}
      ) as Props;
    }

    private static wrapCallback(prop: any) {
      if (typeof prop !== 'function') {
        return prop;
      }

      if (!wrapInAct) {
        return prop;
      }

      return (...args: any[]) => act(() => prop(...args));
    }

    render() {
      // In case there were no expectations set on the stub (spy behavior) we
      // return something that won't make React throw its hands in the air.
      return renderStub(this.props);
    }

    // eslint-disable-next-line class-methods-use-this
    componentDidMount() {
      mounted = true;
    }

    // eslint-disable-next-line class-methods-use-this
    componentWillUnmount() {
      mounted = false;
    }
  };

  stubs.push(Stub);

  return Stub;
}

/**
 * Reset all mocks.
 *
 * @example
 * import { resetAll } from 'react-mock-component';
 *
 * beforeEach(() => {
 *   resetAll();
 * });
 */
export const resetAll = () => {
  stubs.forEach((stub) => {
    stub.reset();
  });
};
