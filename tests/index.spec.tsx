import React, { ComponentType } from 'react';
import { expect } from 'chai';
import createReactMock from '../src';
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
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 42 }).renders('I am Bar');

    const $foo = $render(<Foo Bar={Bar} />);

    expect($foo.text()).to.contain('I am Bar');
  });

  it('should stub render calls based on props', () => {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 42 }).renders(props => props.bar);

    const $foo = $render(<Foo Bar={Bar} />);

    expect($foo.text()).to.contain('42');
  });

  it('should stub multiple render calls', function() {
    const Bar = createReactMock<BarProps>();
    Bar.withProps({ bar: 1 }).renders('call 1');
    Bar.withProps({ bar: 2 }).renders('call 2');

    const $foo = $render(<Foo Bar={Bar} testbar={1} />);
    expect($foo.text()).to.contain('call 1');

    $render(<Foo Bar={Bar} testbar={2} />);
    expect($foo.text()).to.contain('call 2');
  });

  it('should spy on render calls', function () {
    const Bar = createReactMock<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.renderedWith({ bar: 42 })).to.be.true;
    expect(Bar.renderedWith({ bar: 43 })).to.be.false;
  });

  it('should expose the last received props', function() {
    const Bar = createReactMock<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.lastProps).to.deep.equal({ bar: 42 });
  });

  it('should not return last props if never rendered', function() {
    const Bar = createReactMock<BarProps>();

    expect(() => Bar.lastProps).to.throw(
      'Component never rendered!'
    );
  });

  it('should expose whether it was rendered', function() {
    const Bar = createReactMock<BarProps>();

    expect(Bar.rendered).to.be.false;
    $render(<Foo Bar={Bar} />);
    expect(Bar.rendered).to.be.true;
  });

  it('should expose all the received props', function () {
    const Bar = createReactMock<BarProps>();

    $render(<Foo Bar={Bar} testbar={1} />);
    $render(<Foo Bar={Bar} testbar={2} />);

    expect(Bar.props).to.deep.equal([{ bar: 1 }, { bar: 2 }]);
  });

  it('should expose the sinon stub', function() {
    const Stub = createReactMock();

    expect(Stub.sinonStub).to.have.property('args');
  });

  it('should return the original stub after an expectation', function() {
    const Stub = createReactMock<BarProps>();

    let ChainedStub: ComponentType<BarProps> = Stub
      .withProps({ bar: 1 }).renders('1')
      .withProps({ bar: 2 }).renders('2');

    let $chainedStub = $render(<ChainedStub bar={1}/>);
    expect($chainedStub.text()).to.equal('1');

    $chainedStub = $render(<ChainedStub bar={2}/>);
    expect($chainedStub.text()).to.equal('2');
  });

  it('should check children', () => {
    interface WithChildren {
      children: JSX.Element;
      foo: number;
    }

    const Stub = createReactMock<WithChildren>();

    Stub
      .withProps({ foo: 1, children: <Stub foo={2}><span>children</span></Stub> })
      .renders(<span>it really worked</span>);

    let $chainedStub = $render(<Stub foo={1}>
      <Stub foo={2}>
        <span>children</span>
      </Stub>
    </Stub>);

    expect($chainedStub.text()).to.contain('it really worked');
    expect(Stub.renderedWith({ children: <Stub foo={2}><span>children</span></Stub> })).to.be.true;
  });

  describe('partial props', function() {
    interface MultipleProps {
      foo1: number;
      foo2: number;
    }

    const X = ({ MultipleProps }: { MultipleProps: React.ComponentType<MultipleProps> }) =>
      <MultipleProps foo1={1} foo2={2} />;

    it('should stub render calls', function() {
      const M = createReactMock<MultipleProps>();
      M.withProps({ foo1: 1 }).renders('foobar');

      const $x = $render(<X MultipleProps={M} />);

      expect($x.text()).to.contain('foobar');
    });

    it('should spy on render calls', function() {
      const M = createReactMock<MultipleProps>();

      $render(<X MultipleProps={M} />);

      expect(M.renderedWith({ foo1: 1 })).to.be.true;
    });
  });
});
