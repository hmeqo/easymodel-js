import { Field, FieldType } from "./base"

export function fieldDecorator<T, OptsT>(fieldType: FieldType<T, OptsT>) {
  function decorator(options?: OptsT): (target: any, propertyKey: string) => void

  function decorator(target: any, propertyKey: string): void

  function decorator(optionsOrTarget?: any, propertyKey?: string) {
    if (propertyKey) return (fieldType as unknown as typeof Field<T>).init().call(optionsOrTarget, propertyKey)
    return (fieldType as unknown as typeof Field<T>).init(optionsOrTarget).call
  }

  return decorator
}
