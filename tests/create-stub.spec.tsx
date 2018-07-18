import * as React from 'react';
import { expect } from 'chai';
import { createReactStub } from '../src';
import { $render } from './render-helper';

describe('createStub', () => {
  it('should stub render calls', function () {
    interface BarProps {
      bar: number;
    }

    interface FooProps {
      // eslint-disable-next-line no-use-before-define
      Bar: React.ComponentType<BarProps>;
    }

    class Foo extends React.Component<FooProps> {
      render() {
        const { Bar } = this.props;
        return <Bar bar={42} />;
      }
    }

    const Bar = createReactStub<BarProps>();
    Bar.withProps({ bar: 42 }).renders(<span>I am Bar</span>).verifiable();

    const $foo = $render(<Foo Bar={Bar} />);

    Bar.verifyAll();
    expect($foo.text()).to.contain('I am Bar');
  });
});
