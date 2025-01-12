import { createBirpc } from 'birpc';

export const createMessageChannelRpcClient = <
  RemoteFunctions = Record<string, never>,
  LocalFunctions extends object = Record<string, never>,
>(
  localFunctions: LocalFunctions,
) => {
  const ac = new AbortController();

  return createBirpc<RemoteFunctions, LocalFunctions>(localFunctions, {
    post: (data) =>
      window.postMessage(data, {
        targetOrigin: '*',
      }),
    on: (fn) => {
      window.addEventListener('message', (event) => fn(event.data), {
        signal: ac.signal,
      });
    },
    off: () => ac.abort(),
  });
};
