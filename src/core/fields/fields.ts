import { assert_ok, throwError } from "@/errors"
import { BaseModel, ModelType, Validator } from "@/index"
import { format as formatDate, toZonedTime } from "date-fns-tz"
import { Decimal } from "decimal.js"
import { Field, FieldOptions } from "./base"
import { fieldDecorator } from "./fieldDecorator"

export class StringField extends Field<string> {
  static defaultValidators: Validator[] = [(v) => typeof v === "string" || "Must be a string"]

  get default() {
    return ""
  }
}
export const stringField = fieldDecorator(StringField)

export class IntegerField extends Field<number> {
  static defaultValidators: Validator[] = [
    (v) => (typeof v === "number" && Number.isInteger(v)) || "Must be an integer"
  ]

  get default() {
    return 0
  }
}
export const integerField = fieldDecorator(IntegerField)

export class FloatField extends Field<number> {
  static defaultValidators: Validator[] = [(v) => typeof v === "number" || "Must be a float"]

  get default() {
    return 0
  }
}
export const floatField = fieldDecorator(FloatField)

export class BooleanField extends Field<boolean> {
  static defaultValidators: Validator[] = [(v) => typeof v === "boolean" || "Must be a boolean"]

  get default() {
    return false
  }
}
export const booleanField = fieldDecorator(BooleanField)

export type TimestampFieldOptions = FieldOptions<Date> & { format?: string; timeZone?: string }
export class TimestampField extends Field<Date> {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  timeZone!: string

  init(options?: TimestampFieldOptions) {
    super.init(options)
    this.timeZone = options?.timeZone || (this.constructor as typeof TimestampField).defaultTimeZone
  }

  toInternalValue(data: any) {
    if (data instanceof Date) return data
    return new Date(data)
  }

  toRepresentation(data: Date): any {
    return toZonedTime(data, this.timeZone).getTime()
  }

  get default() {
    return new Date()
  }
}
export const timestampField = fieldDecorator(TimestampField)

export type DateTimeFieldOptions = TimestampFieldOptions & { format?: string }
export class DateTimeField extends TimestampField {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS"
  static defaultTimeZone = TimestampField.defaultTimeZone

  format!: string

  init(options?: DateTimeFieldOptions) {
    super.init(options)
    this.format = options?.format || (this.constructor as typeof DateTimeField).defaultFormat
  }

  toRepresentation(data: Date): any {
    return formatDate(toZonedTime(data, this.timeZone), this.format)
  }
}
export const dateTimeField = fieldDecorator(DateTimeField)

export class DateField extends DateTimeField {
  static defaultValidators: Validator[] = [(v) => v instanceof Date || "Must be a Date"]
  static defaultFormat = "yyyy-MM-dd"
  static defaultTimeZone = DateTimeField.defaultTimeZone
}
export const dateField = fieldDecorator(DateField)

export class DecimalField extends Field<Decimal> {
  static defaultValidators: Validator[] = [(v) => v instanceof Decimal || "Must be a decimal"]

  toInternalValue(data: any): Decimal {
    if (data instanceof Decimal) return data
    return new Decimal(data)
  }

  toRepresentationValue(data: Decimal): string {
    return data.toString()
  }

  get default(): Decimal {
    return new Decimal(0)
  }
}
export const decimalField = fieldDecorator(DecimalField)

export type EnumFieldOptions<T = any> = FieldOptions<T> & { type: any }
export class EnumField<T> extends Field<T> {
  static defaultValidators: Validator[] = [
    (v, f) => Object.values(f.type).includes(v) || "Must be one of the enum values"
  ]

  declare type: any

  init(options?: EnumFieldOptions<T>) {
    super.init(options)
    assert_ok(!!options?.type, "Please specify the type of the enum field")
    this.type = options!.type
  }

  get default(): T {
    return throwError("Please specify the default value")
  }
}
export const enumField = fieldDecorator(EnumField)

export type ModelFieldOptions<T extends BaseModel = BaseModel> = FieldOptions<T> & { type?: ModelType<T> }
export class ModelField<T extends BaseModel> extends Field<T> {
  static defaultValidators: Validator[] = [
    (v) => v instanceof Object || "Must be a model",
    (v: BaseModel) => v.runValidators() || true
  ]

  declare type: ModelType<T>

  init(options?: ModelFieldOptions<T>) {
    super.init(options)
    if (options?.type) this.type = options?.type
  }

  processTypeClass(type: any) {
    assert_ok(type !== Object, "Please specify the type of the model field")
    return type
  }

  toInternalValue(data: any): T {
    if (data instanceof this.type) return data as T
    return this.type.init(data)
  }

  toRepresentation(data: T) {
    return data.toRepresentation()
  }

  get default() {
    return this.type.init()
  }
}
export const modelField = fieldDecorator(ModelField)
