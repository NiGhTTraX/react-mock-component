import * as React from 'react';
import { stub } from 'sinon';

// Replace this with ReactNode after https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544 is done.
export type JSX = React.ReactElement<any> | null;

export interface ReactMockExpectation {
  renders: (jsx: JSX) => void;
}

export interface ReactMock<Props> {
  withProps: (expected: Partial<Props>) => ReactMockExpectation;
  renderedWith: (props: Partial<Props>) => boolean;
  lastProps: Props;
}

// eslint-disable-next-line space-infix-ops
export type ReactStub<Props> = React.ComponentClass<Props> & ReactMock<Props>;

export function createReactStub<Props>(): ReactStub<Props> {
  const renderStub = stub();

  return class Stub extends React.Component<Props> {
    public static withProps(expectedProps: Partial<Props>): ReactMockExpectation {
      const expectation = renderStub.withArgs(expectedProps);
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
