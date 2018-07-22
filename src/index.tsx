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
}

// eslint-disable-next-line space-infix-ops
export type ReactStub<Props> = React.StatelessComponent<Props> & ReactMock<Props>;

// eslint-disable-next-line max-len
export function createReactStub<Props>(): ReactStub<Props> {
  const render = stub();

  function Stub(props: Props) {
    // In case there were no expectations set on the stub (spy behavior) we
    // return something that won't make React throw its hands in the air.
    return render(props) || null;
  }

  const withProps = (expectedProps: Partial<Props>): ReactMockExpectation => {
    const expectation = render.withArgs(expectedProps);
    const renders = (jsx: JSX) => expectation.returns(jsx);
    return { renders };
  };

  const renderedWith = (props: Partial<Props>): boolean => render.calledWithMatch(props);

  return Object.assign(Stub, { withProps, renderedWith });
}
