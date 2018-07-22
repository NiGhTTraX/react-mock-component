import * as React from 'react';
import { expect } from 'chai';
import { createReactStub } from '../src';
import { $render } from './render-helper';
import { BarProps, Foo } from './test-components';

describe('createStub', () => {
  it('should stub render calls', function () {
    const Bar = createReactStub<BarProps>();
    Bar.withProps({ bar: 42 }).renders(<span>I am Bar</span>);

    const $foo = $render(<Foo Bar={Bar} />);

    expect($foo.text()).to.contain('I am Bar');
  });

  it('should spy on render calls', function () {
    const Bar = createReactStub<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.renderedWith({ bar: 42 })).to.be.true;
  });
});
