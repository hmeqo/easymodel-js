import {
  AnyField,
  anyField,
  boolField,
  dateField,
  DateField,
  enumField,
  EnumField,
  floatField,
  intField,
  Model,
  strField,
  TimestampField,
  timestampField
} from "@/core"
import { IntField, StrField } from "@/index"
import dayjs from "dayjs"
import { datePattern, datetimePattern } from "./models"

test("Test AnyField", () => {
  class Test extends Model {
    @anyField v1!: any
    @anyField v2: string = ""
  }
  const field1 = Test.fields.v1 as AnyField
  const field2 = Test.fields.v2 as AnyField
  expect(field1.getDefault()).toBeNull()
  expect(field2.getDefault()).toBeUndefined()

  expect(field1.toRepresentation(field1.getDefault())).toBeNull()
  expect(field2.toRepresentation(field2.getDefault())).toBeUndefined()
})

test("Test EnumStringField", () => {
  class Test extends Model {
    @strField({ readonly: true }) label!: string
  }
  const field = Test.fields.label as StrField
  expect(field.getDefault()).toEqual("")
  expect(Test.init().toRepresentation()).toEqual({})
})

test("Test IntegerField", () => {
  class Test extends Model {
    @intField count!: number
  }
  const field = Test.fields.count as IntField
  expect(field.getDefault()).toEqual(0)
})

test("Test FloatField", () => {
  class Test extends Model {
    @floatField f!: number
    @floatField pi: number = 3.1415926
  }
  expect(Test.init()).toEqual({ f: 0, pi: 3.1415926 })
})

test("Test BooleanField", () => {
  class Test extends Model {
    @boolField flag!: number
  }
  expect(Test.init()).toEqual({ flag: false })
})

test("Test EnumField", () => {
  enum TE {
    A = 1,
    B = 2,
    C = 3
  }
  class Test extends Model {
    @enumField({ type: TE, default: () => TE.A }) te!: TE
  }
  const field = Test.fields.te as EnumField<TE>
  expect(field.getDefault()).toEqual(TE.A)
  expect(Test.init()).toEqual({ te: TE.A })
})

test("Test TimestampField and DateField", () => {
  class Test extends Model {
    @timestampField timestamp!: number
    @dateField datetime!: dayjs.Dayjs
    @dateField({ format: "date" }) date!: dayjs.Dayjs
  }

  const field1 = Test.fields.timestamp as TimestampField
  const field2 = Test.fields.datetime as DateField
  const field3 = Test.fields.date as DateField

  expect(typeof field1.getDefault()).toEqual("number")
  expect(typeof field2.getDefault()).toEqual("object")
  expect(typeof field3.getDefault()).toEqual("object")

  expect(field1.toRepresentation(field1.getDefault()!)).toMatch(datetimePattern)
  expect(field2.toRepresentation(field2.getDefault()!)).toMatch(datetimePattern)
  expect(field3.toRepresentation(field3.getDefault()!)).toMatch(datePattern)
})
