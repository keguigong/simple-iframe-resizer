import { useEffect, useRef, useState } from 'react';
import { useThrottleFn } from 'ahooks';
import { BirpcReturn } from 'birpc';
import { createPostMessageRpcClient } from './rpc-client';

interface ParentFunctions {
  onResize: (rect: DOMRectReadOnly) => void;
  onUnmount: () => void;
}

interface ChildFunctions {
  getSize: () => DOMRectReadOnly | undefined;
}

type ParentRpcClient = BirpcReturn<ParentFunctions, ChildFunctions>;

type ChildRpcClient = BirpcReturn<ChildFunctions, ParentFunctions>;

/**
 * Observes element resizing on child side
 */
export const useResizeChild = <T extends Element>(
  id: string, //
): [React.RefObject<T>, ParentRpcClient | undefined] => {
  const domRef = useRef<T>(null);
  const domRectRef = useRef<DOMRectReadOnly>();
  const windowRef = useRef(window.parent);
  const rpcClientRef = useRef<ParentRpcClient>();

  const resizeObserverCallback: ResizeObserverCallback = (entries) => {
    for (const entry of entries) {
      domRectRef.current = entry.contentRect;
      rpcClientRef.current?.onResize(entry.contentRect);
    }
  };

  // Avoid `ResizeObserver loop completed with undelivered notifications` error
  const { run: throttledCallback } = useThrottleFn(resizeObserverCallback, {
    wait: 16.67, // Execute callback in next frame
  });

  useEffect(() => {
    const methods = {
      getSize: () =>
        domRectRef.current || domRef.current?.getBoundingClientRect(),
    };

    const rpcClient = createPostMessageRpcClient<
      ParentFunctions,
      ChildFunctions
    >(methods, {
      messageKey: id,
      windowRef,
      targetOrigin: '*',
    });
    rpcClientRef.current = rpcClient;

    const observer = new ResizeObserver(throttledCallback);

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      rpcClient.onUnmount();
      rpcClient.$close();
      observer.disconnect();
    };
  }, []);

  return [domRef, rpcClientRef.current];
};

/**
 * Listens resize event, used on the parent side
 */
export const useResizeParent = (
  id: string,
  windowRef: React.MutableRefObject<Window | undefined>,
): [DOMRectReadOnly | undefined, ChildRpcClient | undefined] => {
  const [rect, setRect] = useState<DOMRectReadOnly>();
  const rpcClientRef = useRef<ChildRpcClient>();

  useEffect(() => {
    const methods: ParentFunctions = {
      onResize: setRect,
      onUnmount: () => setRect(undefined), // Resets rect, uses default height
    };

    const rpcClient = createPostMessageRpcClient<
      ChildFunctions,
      ParentFunctions
    >(methods, {
      messageKey: id,
      windowRef,
      targetOrigin: '*',
    });
    rpcClientRef.current = rpcClient;

    return () => {
      rpcClient.$close();
    };
  }, []);

  return [rect, rpcClientRef.current];
};
