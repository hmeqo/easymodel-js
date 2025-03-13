export class NotImplementedError extends Error {
  name = "NotImplementedError"

  constructor(message?: string) {
    super(message)
  }
}
