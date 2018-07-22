import * as React from 'react';
import { spy, stub } from 'sinon';

// Replace this with ReactNode after https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544 is done.
export type JSX = React.ReactElement<any> | null;

export interface ReactMockExpectation {
  renders: (jsx: JSX) => void;
}

export interface ReactMock<Props> {
  withProps: (expected: Props) => ReactMockExpectation;
}

// eslint-disable-next-line space-infix-ops
export type ReactStub<Props> = React.StatelessComponent<Props> & ReactMock<Props>;

// eslint-disable-next-line max-len
export function createReactStub<Props>(): ReactStub<Props> {
  const render = stub();

  function Stub(props: Props) {
    return render(props);
  }

  const withProps = (expectedProps: Props): ReactMockExpectation => {
    const expectation = render.withArgs(expectedProps);
    const renders = (jsx: JSX) => expectation.returns(jsx);
    return { renders };
  };

  return Object.assign(Stub, { withProps });
}

export interface ReactSpy<Props> {
  renderedWith: (props: Partial<Props>) => boolean;
}

export function createReactSpy<Props>(): React.StatelessComponent<Props> & ReactSpy<Props> {
  const renderSpy = spy();

  function Spy(props: Props) {
    renderSpy(props);

    return <span>foobar</span>;
  }

  return Object.assign(Spy, {
    renderedWith: (props: Partial<Props>): boolean => renderSpy.calledWithMatch(props)
  });
}
