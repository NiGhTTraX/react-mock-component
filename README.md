> Create type safe mock React components to use in tests

## Usage

[![Greenkeeper badge](https://badges.greenkeeper.io/NiGhTTraX/react-mock-component.svg)](https://greenkeeper.io/)

```typescript jsx
interface BarProps {
  bar: number;
}

interface FooProps {
  Bar: React.ComponentType<BarProps>;
}

function Foo({ Bar }) {
  return <Bar bar={42} />;
}

const Bar = createReactStub<BarProps>();
Bar.withProps({ bar: 42 }).renders('fake content');

const $foo = $render(<Foo Bar={Bar} />);

Bar.renderedWith({ bar: 42 }); // true
expect($foo.text()).to.contain('fake content');
```

You can of course use this library without TypeScript, you just won't
get any errors if you for instance check for the wrong prop.

In an IDE with good support for TypeScript e.g. WebStorm you can get automatic renaming of props across code and tests:

![demo](./demo.gif)