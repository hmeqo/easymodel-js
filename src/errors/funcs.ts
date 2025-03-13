export function throwError(error: string | Error): never {
  if (error instanceof Error) throw error
  throw new Error(error)
}

export function assert_ok(condition: boolean, error: string | Error | (() => Error | string)): never | void {
  if (condition) return
  if (error instanceof Function) error = error()
  throwError(error)
}
