/* eslint-disable react/prop-types */
import { render } from '@testing-library/react';
import React, { act, ComponentType, ReactNode, useState } from 'react';
import createReactMock, { resetAll } from './index';

describe('createReactMock', () => {
  interface BarProps {
    bar: number;
  }

  interface FooProps {
    Bar: React.ComponentType<BarProps>;
    data?: number;
  }

  const Foo = ({ Bar, data = 42 }: FooProps) => <Bar bar={data} />;

  it('should stub render calls', function () {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 42 }).renders('I am Bar');

    const { container } = render(<Foo Bar={Bar} />);

    expect(container.innerHTML).toEqual('I am Bar');
  });

  it('should stub render calls based on props', () => {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 42 }).renders((props) => props.bar);

    const { container } = render(<Foo Bar={Bar} />);

    expect(container.innerHTML).toEqual('42');
  });

  it('should stub multiple render calls', function () {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 1 }).renders('call 1');
    Bar.withProps({ bar: 2 }).renders('call 2');

    let $foo = render(<Foo Bar={Bar} data={1} />);
    expect($foo.container.textContent).toContain('call 1');

    $foo = render(<Foo Bar={Bar} data={2} />);
    expect($foo.container.textContent).toContain('call 2');
  });

  it('should spy on render calls', function () {
    const Bar = createReactMock<BarProps>();

    const { container } = render(<Foo Bar={Bar} />);

    expect(container.innerHTML).toEqual('');

    expect(Bar.renderedWith({ bar: 42 })).toBeTruthy();
    expect(Bar.renderedWith({ bar: 43 })).toBeFalsy();
  });

  it('should expose the last received props', function () {
    const Bar = createReactMock<BarProps>();

    render(<Foo Bar={Bar} />);

    expect(Bar.lastProps).toEqual({ bar: 42 });
  });

  it('should not return last props if never rendered', function () {
    const Bar = createReactMock<BarProps>();

    expect(() => Bar.lastProps).toThrow('Component never rendered!');
  });

  it('should expose whether it was rendered', function () {
    const Bar = createReactMock<BarProps>();

    expect(Bar.rendered).toBeFalsy();
    render(<Foo Bar={Bar} />);
    expect(Bar.rendered).toBeTruthy();
  });

  it('should expose if it is currently rendered', () => {
    const Mock = createReactMock();

    const { unmount } = render(<Mock />);

    expect(Mock.mounted).toBeTruthy();

    unmount();

    expect(Mock.mounted).toBeFalsy();
  });

  it('should expose all the received props', function () {
    const Bar = createReactMock<BarProps>();

    render(<Foo Bar={Bar} data={1} />);
    render(<Foo Bar={Bar} data={2} />);

    expect(Bar.renderCalls).toEqual([{ bar: 1 }, { bar: 2 }]);
  });

  it('should reset the stub', function () {
    const Stub = createReactMock();
    Stub.withProps({}).renders(<span>foo</span>);

    render(<Stub />);
    Stub.reset();

    expect(Stub.rendered).toBeFalsy();
  });

  it('should reset the mounted flag', function () {
    const Stub = createReactMock();

    render(<Stub />);
    Stub.reset();

    expect(Stub.mounted).toBeFalsy();
  });

  it('should reset all mocks', function () {
    const Stub1 = createReactMock();
    const Stub2 = createReactMock();

    render(<Stub1 />);
    render(<Stub2 />);

    resetAll();

    expect(Stub1.mounted).toBeFalsy();
    expect(Stub2.mounted).toBeFalsy();
  });

  it('should return the original stub after an expectation', function () {
    const Stub = createReactMock<BarProps>();

    const ChainedStub: ComponentType<BarProps> = Stub.withProps({ bar: 1 })
      .renders('1')
      .withProps({ bar: 2 })
      .renders('2');

    let $chainedStub = render(<ChainedStub bar={1} />);
    expect($chainedStub.container.textContent).toEqual('1');

    $chainedStub = render(<ChainedStub bar={2} />);
    expect($chainedStub.container.textContent).toEqual('2');
  });

  it('should check children', () => {
    interface WithChildren {
      children: ReactNode;
      foo: number;
    }

    const Stub = createReactMock<WithChildren>();

    Stub.withProps({
      foo: 1,
      children: (
        <Stub foo={2}>
          <span>children</span>
        </Stub>
      ),
    }).renders(<span>it really worked</span>);

    const { container } = render(
      <Stub foo={1}>
        <Stub foo={2}>
          <span>children</span>
        </Stub>
      </Stub>
    );

    expect(container.textContent).toContain('it really worked');
    expect(
      Stub.renderedWith({
        children: (
          <Stub foo={2}>
            <span>children</span>
          </Stub>
        ),
      })
    ).toBeTruthy();
  });

  describe('partial props', function () {
    interface MultipleProps {
      foo1: number;
      foo2: number;
      nested: {
        foo: {
          bar: number;
        };
      };
    }

    it('should stub render calls', function () {
      const M = createReactMock<MultipleProps>();
      M.withProps({ nested: { foo: { bar: 3 } } }).renders('foobar');

      const { container } = render(
        <M foo1={1} foo2={2} nested={{ foo: { bar: 3 } }} />
      );

      expect(container.textContent).toContain('foobar');
    });

    it('should spy on render calls', function () {
      const M = createReactMock<MultipleProps>();

      render(<M foo1={1} foo2={2} nested={{ foo: { bar: 3 } }} />);

      expect(M.renderedWith({ nested: { foo: { bar: 3 } } })).toBeTruthy();
    });
  });

  describe('hooks', () => {
    const originalError = console.error;

    beforeEach(() => {
      console.error = (...args: unknown[]) => {
        if (typeof args[0] === 'string' && /act/.test(args[0])) {
          throw new Error(args[0]);
        }

        originalError.call(console, ...args);
      };
    });

    afterEach(() => {
      console.error = originalError;
    });

    interface ChildProps {
      onSubmit: (foo: number) => void;
      someState: number;
    }
    interface HookyProps {
      Child: React.ComponentType<ChildProps>;
    }

    const HookyComponents: React.FC<HookyProps> = ({ Child }) => {
      const [someState, setSomeState] = useState(42);

      return (
        <Child someState={someState} onSubmit={(foo) => setSomeState(foo)} />
      );
    };

    it('should wrap last prop calls in act', () => {
      const Child = createReactMock<ChildProps>();
      render(<HookyComponents Child={Child} />);

      Child.renderCalls[0].onSubmit(-1);
      expect(Child.renderedWith({ someState: -1 })).toBeTruthy();

      Child.lastProps.onSubmit(23);
      expect(Child.renderedWith({ someState: 23 })).toBeTruthy();
    });

    it('should opt out of wrapping last prop calls in act', () => {
      const Child = createReactMock<ChildProps>({ wrapInAct: false });

      render(<Child onSubmit={() => () => {}} someState={23} />);

      act(() => {
        Child.renderCalls[0].onSubmit(-1);
      });
    });
  });
});
