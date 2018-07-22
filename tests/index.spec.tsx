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
});
