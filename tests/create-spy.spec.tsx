import * as React from 'react';
import { expect } from 'chai';
import { createReactSpy } from '../src';
import { $render } from './render-helper';

describe('createSpy', () => {
  it('should spy on render calls', function () {
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

    const Bar = createReactSpy<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.renderedWith({ bar: 42 })).to.be.true;
  });
});
