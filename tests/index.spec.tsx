/* eslint-disable react/prop-types */
import React, { ComponentType, useState } from 'react';
import { act } from 'react-dom/test-utils';
import { describe, it, beforeEach, afterEach } from 'tdd-buffet/suite/node';
import { $render, $unmount } from '@tdd-buffet/react';
import { expect } from 'tdd-buffet/expect/chai';
import createReactMock from '../src';

describe('createReactMock', () => {
  interface BarProps {
    bar: number;
  }

  interface FooProps {
    // eslint-disable-next-line no-use-before-define
    Bar: React.ComponentType<BarProps>;
    testbar?: number;
  }

  class Foo extends React.Component<FooProps> {
    // eslint-disable-next-line react/static-property-placement
    public static defaultProps: Partial<FooProps> = {
      testbar: 42,
    };

    render() {
      const { Bar, testbar } = this.props;
      return <Bar bar={testbar as number} />;
    }
  }

  it('should stub render calls', function () {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 42 }).renders('I am Bar');

    const $foo = $render(<Foo Bar={Bar} />);

    expect($foo.text()).to.contain('I am Bar');
  });

  it('should stub render calls based on props', () => {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 42 }).renders((props) => props.bar);

    const $foo = $render(<Foo Bar={Bar} />);

    expect($foo.text()).to.contain('42');
  });

  it('should stub multiple render calls', function () {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 1 }).renders('call 1');
    Bar.withProps({ bar: 2 }).renders('call 2');

    let $foo = $render(<Foo Bar={Bar} testbar={1} />);
    expect($foo.text()).to.contain('call 1');

    $foo = $render(<Foo Bar={Bar} testbar={2} />);
    expect($foo.text()).to.contain('call 2');
  });

  it('should spy on render calls', function () {
    const Bar = createReactMock<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.renderedWith({ bar: 42 })).to.be.true;
    expect(Bar.renderedWith({ bar: 43 })).to.be.false;
  });

  it('should expose the last received props', function () {
    const Bar = createReactMock<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.lastProps).to.deep.equal({ bar: 42 });
  });

  it('should not return last props if never rendered', function () {
    const Bar = createReactMock<BarProps>();

    expect(() => Bar.lastProps).to.throw('Component never rendered!');
  });

  it('should expose whether it was rendered', function () {
    const Bar = createReactMock<BarProps>();

    expect(Bar.rendered).to.be.false;
    $render(<Foo Bar={Bar} />);
    expect(Bar.rendered).to.be.true;
  });

  it('should expose if it is currently rendered', () => {
    const Mock = createReactMock();

    $render(<Mock />);

    expect(Mock.mounted).to.be.true;

    $unmount();

    expect(Mock.mounted).to.be.false;
  });

  it('should expose all the received props', function () {
    const Bar = createReactMock<BarProps>();

    $render(<Foo Bar={Bar} testbar={1} />);
    $render(<Foo Bar={Bar} testbar={2} />);

    expect(Bar.renderCalls).to.deep.equal([{ bar: 1 }, { bar: 2 }]);
  });

  it('should reset the stub', function () {
    const Stub = createReactMock();
    Stub.withProps({}).renders(<span>foo</span>);

    $render(<Stub />);
    Stub.reset();

    expect(Stub.rendered).to.be.false;
  });

  it('should return the original stub after an expectation', function () {
    const Stub = createReactMock<BarProps>();

    const ChainedStub: ComponentType<BarProps> = Stub.withProps({ bar: 1 })
      .renders('1')
      .withProps({ bar: 2 })
      .renders('2');

    let $chainedStub = $render(<ChainedStub bar={1} />);
    expect($chainedStub.text()).to.equal('1');

    $chainedStub = $render(<ChainedStub bar={2} />);
    expect($chainedStub.text()).to.equal('2');
  });

  it('should check children', () => {
    interface WithChildren {
      children: JSX.Element;
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

    const $chainedStub = $render(
      <Stub foo={1}>
        <Stub foo={2}>
          <span>children</span>
        </Stub>
      </Stub>
    );

    expect($chainedStub.text()).to.contain('it really worked');
    expect(
      Stub.renderedWith({
        children: (
          <Stub foo={2}>
            <span>children</span>
          </Stub>
        ),
      })
    ).to.be.true;
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

      const $x = $render(<M foo1={1} foo2={2} nested={{ foo: { bar: 3 } }} />);

      expect($x.text()).to.contain('foobar');
    });

    it('should spy on render calls', function () {
      const M = createReactMock<MultipleProps>();

      $render(<M foo1={1} foo2={2} nested={{ foo: { bar: 3 } }} />);

      expect(M.renderedWith({ nested: { foo: { bar: 3 } } })).to.be.true;
    });
  });

  describe('hooks', () => {
    const originalError = console.error;

    beforeEach(() => {
      console.error = (...args: any[]) => {
        if (/act/.test(args[0])) {
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
      $render(<HookyComponents Child={Child} />);

      Child.renderCalls[0].onSubmit(-1);
      expect(Child.renderedWith({ someState: -1 })).to.be.true;

      Child.lastProps.onSubmit(23);
      expect(Child.renderedWith({ someState: 23 })).to.be.true;
    });

    it('should opt out of wrapping last prop calls in act', () => {
      const Child = createReactMock<ChildProps>({ wrapInAct: false });

      $render(<Child onSubmit={() => () => {}} someState={23} />);

      act(() => {
        Child.renderCalls[0].onSubmit(-1);
      });
    });
  });
});
