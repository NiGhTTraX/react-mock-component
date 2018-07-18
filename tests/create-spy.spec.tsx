import * as React from 'react';
import { expect } from 'chai';
import { createReactSpy } from '../src';
import { $render } from './render-helper';
import { BarProps, Foo } from './test-components';

describe('createSpy', () => {
  it('should spy on render calls', function () {
    const Bar = createReactSpy<BarProps>();

    $render(<Foo Bar={Bar} />);

    expect(Bar.renderedWith({ bar: 42 })).to.be.true;
  });
});
