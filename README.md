> Create type safe mock React components to use in tests

## Usage

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
