# simple-iframe-resizer

simple-iframe-resizer helps you to auto resize cross-domain iframe dimensions based on the content size

**It works as react hooks, and is only compatible with React>=16.8.0**

## Installation

```sh
# npm
npm install simple-iframe-resizer --save
# yarn
yarn add simple-iframe-resizer
# pnpm
pnpm add simple-iframe-resizer
```

### Basic Concepts

Two hooks are used in iframe and host respectively, `useResizeChild` and `useResizeParent`. For convenience, we treat iframe as child and host as parent.

- `useResizeChild`: used within iframe context.
- `useResizeParent`: used within host context that containing a iframe element

### Usage

1. Name a unique resize event name

Use it in both parent and child side. `simple-iframe-resizer` will use this event name to communicate between parent and child through `postMessage`. Make sure the event name is unique to avoid interference.

```tsx
// Example event name
const RESIZE_EVENT_NAME = "__simple_iframe_resizer_demo_9f9292a4";
```

2. On child side

```tsx
import { useResizeChild } from "simple-iframe-resizer";

function ChildApp() {
  const [domRef] = useResizeChild(RESIZE_EVENT_NAME);

  return <div ref={domRef}>Hello World</div>;
}
```

3. On parent side

```tsx
import { useResizeParent } from "simple-iframe-resizer";

function ParentApp() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeWindowRef = useRef<Window | undefined>();

  useEffect(() => {
    iframeWindowRef.current = iframeRef.current?.contentWindow || undefined;
  }, []);

  const [rect] = useResizeParent(RESIZE_EVENT_NAME, iframeWindowRef);

  return (
    <iframe
      ref={iframeRef}
      src="https://www.example.com"
      height={rect.height || "100%"}
      width={rect.width || "100%"}
    />
  );
}
```

### Advanced Usage

1. Trigger `onUnmount` event and reset the iframe height

```tsx
const [domRef, rpcClient] = useResizeChild(RESIZE_EVENT_NAME);

useEffect(() => {
  return () => rpcClient.onUnmount();
}, []);
```

2. Manually get dimensions of child from parent

```tsx
const [rect, childRpcClient] = useResizeParent(
  RESIZE_EVENT_NAME,
  iframeWindowRef,
);

useEffect(() => {
  childRpcClient.getSize().then((rect) => {
    console.log(rect);
  });
}, []);
```

### Type Definition

```ts
interface ParentFunctions {
  onResize: (rect: DOMRectReadOnly) => void;
  onUnmount: () => void;
}
```

```ts
interface ChildFunctions {
  getSize: () => DOMRectReadOnly | undefined;
}
```

```ts
declare const useResizeChild: <T extends Element>(
  id: string,
) => [React.RefObject<T>, ParentRpcClient | undefined];
```

```ts
declare const useResizeParent: (
  id: string,
  windowRef: React.MutableRefObject<Window | undefined>,
) => [DOMRectReadOnly | undefined, ChildRpcClient | undefined];
```
