import "reflect-metadata"
import { Model } from "../models"
import { Serializer } from "../serializers"
import { ValidateErrorType, Validator } from "../validators"

export type FieldType<T, OptsT> = {
  new (): Field<T> & { init: (options?: OptsT) => void }
}

export type FieldOptions<T = any> = {
  source?: string
  type?: unknown
  validators?: Validator<T>[]
  nullable?: boolean
  readonly?: boolean
  many?: boolean | ListFieldOptions<T>
  default?: T | (() => T)
}

export class Field<T = any> implements Serializer {
  static fieldOptions?: FieldOptions
  static defaultValidators: Validator[] = []

  source?: string
  type?: any
  validators?: Validator<T>[]
  nullable?: boolean
  readonly?: boolean

  /**
   * Creates a new instance of the specified field class and initializes it with the provided options.
   */
  static init<T, OptsT>(this: FieldType<T, OptsT>, options?: OptsT & { many?: false }): Field<T>
  static init<T, OptsT>(this: FieldType<T, OptsT>, options?: OptsT & { many: true | ListFieldOptions<T> }): ListField<T>
  static init<T, OptsT>(this: FieldType<T, OptsT>, options?: OptsT & { many?: boolean | ListFieldOptions<T> }) {
    const inst = new this()
    inst.init(options)
    if (options?.many) return inst.many(options.many === true ? {} : options.many)
    return inst
  }

  init(options?: FieldOptions<T>) {
    this.source = options?.source ?? this.source
    this.validators = options?.validators ?? this.validators
    this.nullable = options?.nullable ?? this.nullable
    this.readonly = options?.readonly ?? this.readonly
    if (options?.default)
      Object.defineProperty(this, "default", {
        [typeof options.default === "function" ? "get" : "value"]: options.default
      })
  }

  many(options?: ListFieldOptions<T>) {
    return ListField.init({ ...options, child: this })
  }

  get call() {
    return (target: { constructor: typeof Model }, propertyKey: string) => {
      if (!Object.prototype.hasOwnProperty.call(target.constructor, "fields")) target.constructor.fields = {}
      const type = Reflect.getMetadata("design:type", target, propertyKey)
      this.type = this.processTypeClass(this.type || type)
      if (this.nullable === undefined) this.nullable = type === Object
      target.constructor.fields[propertyKey] = this
    }
  }

  processTypeClass(type: any): any {
    return type
  }

  toInternalValue(data: any): T {
    return data
  }

  toRepresentation(data: any): any {
    return data
  }

  setInternalValueToObj(obj: Record<string, any>, name: string, data: any): any {
    const value = data[this.source ?? name]
    if (value === undefined) return
    obj[name] = this.toInternalValue(value)
  }

  setRepresentationToObj(obj: Record<string, any>, name: string, data: any): any {
    if (this.readonly) return
    let value = data[name]
    if (this.nullable && value === null) value = null
    else value = this.toRepresentation(data[name])
    obj[this.source ?? name] = value
  }

  /**
   * Runs the validators for the given value and returns any validation errors found.
   */
  runValidators(value: any) {
    if (value === null || value === undefined) {
      if (this.nullable) return
      throw new Error("Value cannot be null")
    }
    for (const validator of [...(this.constructor as typeof Field).defaultValidators, ...(this.validators || [])]) {
      const trueOrError = validator(value, this)
      if (trueOrError !== true) return trueOrError
    }
  }

  get default(): T {
    return undefined as T
  }
}

export type ListFieldOptions<T = any> = FieldOptions<T[]> & { child?: Field<T> }

export class ListField<T> extends Field<T[]> {
  static defaultValidators: Validator[] = [(v) => Array.isArray(v) || "Must be an array"]
  static defaultChild: Field = new Field()

  child!: Field<T>

  static init<T>(this: new () => ListField<T>, options?: ListFieldOptions<T>) {
    const inst = new this()
    inst.init(options)
    return inst
  }

  init(options?: ListFieldOptions<T>) {
    super.init(options)
    this.child = options?.child ?? this.child ?? (this.constructor as typeof ListField).defaultChild
  }

  runValidators(value: any[]) {
    if (value === null || value === undefined) {
      if (this.nullable) return
      throw new Error("Value cannot be null")
    }
    const errors: Record<string, ValidateErrorType> = {}
    for (const [index, i] of Object.entries(value)) {
      const error = this.child.runValidators(i)
      if (error !== undefined) errors[index] = i
    }
    return errors
  }

  get default(): T[] {
    return []
  }
}
