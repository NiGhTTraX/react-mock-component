import * as React from 'react';

export interface BarProps {
  bar: number;
}

export interface FooProps {
  // eslint-disable-next-line no-use-before-define
  Bar: React.ComponentType<BarProps>;
}

export class Foo extends React.Component<FooProps> {
  render() {
    const { Bar } = this.props;
    return <Bar bar={42} />;
  }
}
