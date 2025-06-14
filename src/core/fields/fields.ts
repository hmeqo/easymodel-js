import { assert_ok, throwError } from "@/errors"
import dayjs from "dayjs"
import { Decimal } from "decimal.js"
import { BaseModel, ModelType } from "../models"
import { fieldSettings } from "../settings"
import { Field, FieldOptions } from "./base"
import { fieldDecorator } from "./fieldDecorator"

export class AnyField<T = any> extends Field<T> {}
export const anyField = fieldDecorator(AnyField)

export class StrField extends Field<string> {
  get default() {
    return ""
  }
}
export const strField = fieldDecorator(StrField)

export class IntField extends Field<number> {
  get default() {
    return 0
  }
}
export const intField = fieldDecorator(IntField)

export class FloatField extends Field<number> {
  get default() {
    return 0
  }
}
export const floatField = fieldDecorator(FloatField)

export class BoolField extends Field<boolean> {
  get default() {
    return false
  }
}
export const boolField = fieldDecorator(BoolField)

export type BaseDatetimeFieldOptions<T> = FieldOptions<T> & {
  format?: "timestamp" | "datetime" | "date" | (string & NonNullable<unknown>)
  timezone?: string
}
export class BaseDatetimeField<T> extends Field<T> {
  format!: BaseDatetimeFieldOptions<T>["format"]
  timezone!: string | null

  init(options?: BaseDatetimeFieldOptions<T>) {
    super.init(options)
    this.format = options?.format || "datetime"
    this.timezone = options?.timezone ?? fieldSettings.defaultTimezone
  }
}

function setDayjsTz(d: dayjs.Dayjs, tz: string): dayjs.Dayjs {
  if (!(d as any).tz) throw new Error("Date is not timezone aware, please ensure you have extend timezone plugin")
  return (d as any).tz(tz)
}

export class TimestampField extends BaseDatetimeField<number> {
  toInternalValue(data: any): number {
    let d = dayjs(typeof data === "number" ? data : data instanceof Date ? data.getTime() : Date.parse(data))
    if (this.timezone) d = setDayjsTz(d, this.timezone)
    return d.valueOf()
  }

  toRepresentation(data: number) {
    let d = dayjs(data)
    if (this.timezone) d = setDayjsTz(d, this.timezone)
    switch (this.format) {
      case "timestamp":
        return d.valueOf()
      case "datetime":
        return d.format("YYYY-MM-DDTHH:mm:ss.SSSZ")
      case "date":
        return d.format("YYYY-MM-DD")
      default:
        return d.format(this.format)
    }
  }

  get default() {
    return dayjs().valueOf()
  }
}
export const timestampField = fieldDecorator(TimestampField)

export class DateField extends BaseDatetimeField<dayjs.Dayjs> {
  toInternalValue(data: any) {
    let d = dayjs(data instanceof Date ? data : new Date(data))
    if (this.timezone) d = setDayjsTz(d, this.timezone)
    return d
  }

  toRepresentation(data: dayjs.Dayjs): any {
    let d = data
    if (this.timezone) d = setDayjsTz(d, this.timezone)
    switch (this.format) {
      case "timestamp":
        return d.valueOf()
      case "datetime":
        return d.format("YYYY-MM-DDTHH:mm:ss.SSSZ[Z]")
      case "date":
        return d.format("YYYY-MM-DD")
      default:
        return d.format(this.format)
    }
  }

  get default() {
    return dayjs()
  }
}
export const dateField = fieldDecorator(DateField)

export class DecimalField extends Field<Decimal> {
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
/**
 * @example
 * (ModelField<User>).init({ type: User })
 */
export class ModelField<T extends BaseModel> extends Field<T> {
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
