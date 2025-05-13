import type { BirpcOptions } from "birpc"
import { createBirpc } from "birpc"

export interface RpcMessage<T = unknown> {
  key: string
  payload: T
}

export function isRpcMessage<T = unknown>(
  event: MessageEvent<unknown>,
  options: {
    messageKey: string
    targetOrigin: string
  },
) {
  const data = event.data as Partial<RpcMessage>
  if (options.targetOrigin !== "*" && event.origin !== options.targetOrigin)
    return false
  if (data.key !== options.messageKey)
    return false

  return data as RpcMessage<T>
}

/**
 * Create birpc client with window.postMessage
 */
export function createPostMessageRpcClient<
  RemoteFunctions extends object = Record<string, unknown>,
  LocalFunctions extends object = Record<string, unknown>,
>(
  localFunctions: LocalFunctions,
  options: Partial<BirpcOptions<RemoteFunctions>> & {
    windowRef: React.RefObject<Window | undefined>
    messageKey: string
    targetOrigin: string
  },
) {
  const ac = new AbortController()
  const { windowRef, messageKey, targetOrigin, ...birpcOptions } = options

  return createBirpc<RemoteFunctions, LocalFunctions>(localFunctions, {
    post: data =>
      windowRef.current?.postMessage(
        { key: messageKey, payload: data } satisfies RpcMessage,
        targetOrigin,
      ),
    on: (fn) => {
      window.addEventListener(
        "message",
        (event) => {
          const rpcMessage = isRpcMessage(event, { messageKey, targetOrigin })
          if (rpcMessage) {
            fn(rpcMessage.payload)
          }
        },
        { signal: ac.signal },
      )
    },
    timeout: 5000,
    onTimeoutError: (functionName) => {
      console.error(window.origin, `function ${functionName} timed out`)
    },
    onError: (error, functionName) => {
      console.error(window.origin, `function ${functionName} errored`, error)
    },
    off: () => {
      ac.abort()
    },
    ...birpcOptions,
  })
}
