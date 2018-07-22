import * as React from 'react';

export interface BarProps {
  bar: number;
}

export interface FooProps {
  // eslint-disable-next-line no-use-before-define
  Bar: React.ComponentType<BarProps>;
  testbar?: number;
}

export class Foo extends React.Component<FooProps> {
  public static defaultProps: Partial<FooProps> = {
    testbar: 42
  };

  render() {
    const { Bar, testbar } = this.props;
    return <Bar bar={testbar as number} />;
  }
}
