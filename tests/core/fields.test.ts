import {
  booleanField,
  DateTimeField,
  dateTimeField,
  enumField,
  EnumField,
  floatField,
  integerField,
  Model,
  stringField
} from "@/core"
import { IntegerField, StringField } from "@/index"

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

test("Test DateTimeField", () => {
  class Test extends Model {
    @dateTimeField datetime!: Date
  }
  const field = Test.fields.datetime as DateTimeField
  expect(field.toRepresentation(field.default)).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}/)
})
