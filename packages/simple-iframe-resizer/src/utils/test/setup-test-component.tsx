import { cleanup, render } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, vi } from "vitest"

export function setupTestComponent(
  TestComponent: React.ComponentType<any>,
  {
    init,
  }: {
    init?: (TestComponent: React.ComponentType<any>) => React.ReactNode
  } = {},
) {
  beforeEach(() => {
    render(init?.(TestComponent) ?? <TestComponent />)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })
}
