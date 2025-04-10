import {
  booleanField,
  dateField,
  DateField,
  enumField,
  EnumField,
  floatField,
  integerField,
  Model,
  stringField,
  TimestampField,
  timestampField
} from "@/core"
import { IntegerField, StringField } from "@/index"
import dayjs from "dayjs"
import { datePattern, datetimePattern } from "./models"

test("Test EnumStringField", () => {
  class Test extends Model {
    @stringField({ readonly: true }) label!: string
  }
  const field = Test.fields.label as StringField
  expect(field.default).toEqual("")
  expect(Test.init().toRepresentation()).toEqual({})
})

test("Test IntegerField", () => {
  class Test extends Model {
    @integerField count!: number
  }
  const field = Test.fields.count as IntegerField
  expect(field.default).toEqual(0)
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
    @booleanField flag!: number
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
  expect(field.default).toEqual(TE.A)
  expect(field.runValidators(TE.A)).toBeUndefined()
  expect(field.runValidators("d")).not.toBeUndefined()
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

  expect(typeof field1.default).toEqual("number")
  expect(typeof field2.default).toEqual("object")
  expect(typeof field3.default).toEqual("object")

  expect(field1.toRepresentation(field1.default)).toMatch(datetimePattern)
  expect(field2.toRepresentation(field2.default)).toMatch(datetimePattern)
  expect(field3.toRepresentation(field3.default)).toMatch(datePattern)
})
