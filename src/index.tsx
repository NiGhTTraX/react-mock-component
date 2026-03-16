import _ from 'lodash';
import type { ComponentClass, ReactNode } from 'react';
import { act, Component } from 'react';

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

export type ReactStub<Props> = ComponentClass<Props> & ReactMock<Props>;

// The stub props type is in a contravariant position, so we have to use any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  let expectations: [
    DeepPartial<Props>,
    ReactNode | ((props: Props) => ReactNode),
  ][] = [];
  let renderCalls: Props[] = [];
  let mounted = false;

  const Stub = class Stub extends Component<Props> {
    public static withProps(
      expectedProps: DeepPartial<Props>,
    ): ReactMockExpectation<Props> {
      const renders = (jsx: ReactNode | ((props: Props) => ReactNode)) => {
        expectations.push([expectedProps, jsx]);

        return Stub;
      };

      return { renders };
    }

    public static renderedWith(expected: DeepPartial<Props>): boolean {
      return renderCalls.some((actual) => _.isMatch(actual, expected));
    }

    public static get lastProps() {
      if (!renderCalls.length) {
        throw new Error('Component never rendered!');
      }

      const props: Props = renderCalls[renderCalls.length - 1];

      return this.wrapPropCallbacks(props);
    }

    public static get rendered() {
      return !!renderCalls.length;
    }

    public static get mounted() {
      return mounted;
    }

    public static get renderCalls() {
      return renderCalls.map((actual) => this.wrapPropCallbacks(actual));
    }

    public static reset() {
      renderCalls = [];
      expectations = [];
      mounted = false;
    }

    private static wrapPropCallbacks(props: Props) {
      return Object.keys(props).reduce(
        (acc, prop) => ({
          ...acc,

          [prop]: this.wrapCallback(
            // @ts-expect-error because Props is generic so can't be indexed
            props[prop],
          ),
        }),
        {},
      ) as Props;
    }

    private static wrapCallback(prop: unknown) {
      if (typeof prop !== 'function') {
        return prop;
      }

      if (!wrapInAct) {
        return prop;
      }

      return (...args: unknown[]) => act(() => prop(...args));
    }

    render() {
      renderCalls.push(this.props);

      const e = expectations.find((expectation) =>
        _.isMatch(this.props, expectation[0]),
      );

      if (!e) {
        return null;
      }

      if (typeof e[1] === 'function') {
        return e[1](this.props);
      } else {
        return e[1];
      }
    }

    componentDidMount() {
      mounted = true;
    }

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
