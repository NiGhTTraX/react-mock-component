import * as React from 'react';
import { expect } from 'chai';
import { createReactStub } from '../src';
import { $render } from './render-helper';

describe('createStub', () => {
  interface BarProps {
    bar: number;
  }

  interface FooProps {
    // eslint-disable-next-line no-use-before-define
    Bar: React.ComponentType<BarProps>;
    testbar?: number;
  }

  class Foo extends React.Component<FooProps> {
    public static defaultProps: Partial<FooProps> = {
      testbar: 42
    };

    render() {
      const { Bar, testbar } = this.props;
      return <Bar bar={testbar as number} />;
    }
  }

  it('should stub render calls', function () {
    const Bar = createReactStub<BarProps>();
    Bar.withProps({ bar: 42 }).renders(<span>I am Bar</span>);

    const $foo = $render(<Foo Bar={Bar} />);

    expect($foo.text()).to.contain('I am Bar');
  });

  it('should stub multiple render calls', function() {
    const Bar = createReactStub<BarProps>();
    Bar.withProps({ bar: 1 }).renders(<span>call 1</span>);
    Bar.withProps({ bar: 2 }).renders(<span>call 2</span>);

    const $foo = $render(<Foo Bar={Bar} testbar={1} />);
    expect($foo.text()).to.contain('call 1');

    $render(<Foo Bar={Bar} testbar={2} />);
    expect($foo.text()).to.contain('call 2');
  });

  it('should spy on render calls', function () {
    const Bar = createReactStub<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.renderedWith({ bar: 42 })).to.be.true;
  });

  it('should expose the last received props', function() {
    const Bar = createReactStub<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.lastProps).to.deep.equal({ bar: 42 });
  });

  it('should expose whether it was rendered', function() {
    const Bar = createReactStub<BarProps>();

    expect(Bar.rendered).to.be.false;
    $render(<Foo Bar={Bar} />);
    expect(Bar.rendered).to.be.true;
  });

  it('should expose all the received props', function () {
    const Bar = createReactStub<BarProps>();

    $render(<Foo Bar={Bar} testbar={1} />);
    $render(<Foo Bar={Bar} testbar={2} />);

    expect(Bar.props).to.deep.equal([{ bar: 1 }, { bar: 2 }]);
  });

  describe('partial props', function() {
    interface MultipleProps {
      foo1: number;
      foo2: number;
    }

    const X = ({ MultipleProps }: { MultipleProps: React.ComponentType<MultipleProps> }) =>
      <MultipleProps foo1={1} foo2={2} />;

    it('should stub render calls', function() {
      const M = createReactStub<MultipleProps>();
      M.withProps({ foo1: 1 }).renders(<span>foobar</span>);

      const $x = $render(<X MultipleProps={M} />);

      expect($x.text()).to.contain('foobar');
    });

    it('should spy on render calls', function() {
      const M = createReactStub<MultipleProps>();

      $render(<X MultipleProps={M} />);

      expect(M.renderedWith({ foo1: 1 })).to.be.true;
    });
  });
});
