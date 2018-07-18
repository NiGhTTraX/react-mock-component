import { IMock, It, Mock } from 'typemoq';
import * as React from 'react';
// eslint-disable-next-line import/no-unresolved
import { IReturnsResult } from 'typemoq/Api/IReturns';
import { spy, assert } from 'sinon';

// Replace this with ReactNode after https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544 is done.
export type JSX = React.ReactElement<any> | null;

export interface ReactMockExpectation<Props> {
  renders: (jsx: JSX) => IReturnsResult<Props>;
}

export interface ReactMock<Props> {
  withProps: (expected: Partial<Props>) => ReactMockExpectation<Props>;
  verifyAll: () => void;
}

// eslint-disable-next-line space-infix-ops
export type ReactStub<Props> = React.StatelessComponent<Props> & ReactMock<Props>;

// eslint-disable-next-line max-len
export function createReactStub<Props>(): ReactStub<Props> {
  const mock: IMock<React.StatelessComponent<Props>> =
    Mock.ofType<React.StatelessComponent<Props>>();

  const render = mock.object;

  function Stub(props: Props) {
    return render(props);
  }

  const withProps = (expected: Partial<Props>) => {
    const expectation = mock.setup(
      fakeRender => fakeRender(partialPropMatcher<Props>(expected))
    );

    return Object.assign(expectation, {
      renders: (jsx: JSX) => expectation.returns(() => jsx)
    });
  };

  const verifyAll = () => {
    mock.verifyAll();
  };

  const staticProperties: ReactMock<Props> = { withProps, verifyAll };

  return Object.assign(Stub, staticProperties);
}

export function partialPropMatcher<Props>(expected: Partial<Props>): Props {
  return It.is<Props>((props: Props) => {
    try {
      // This can of course be replaced by _.isMatch.
      assert.match(props, expected);
      return true;
    } catch (e) {
      return false;
    }
  });
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
