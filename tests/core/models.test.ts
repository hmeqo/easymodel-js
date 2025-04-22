import { IntField, isModel, Model, ModelSet, modelToRaw, StrField } from "@/index"
import { datetimePattern, User, UserSet } from "./models"

test("Test Model", () => {
  const user = User.init({ name: "Eugene Reese" })

  expect(user.name).toEqual("Eugene Reese")
  expect(user.toRepresentation()).toEqual({
    name: "Eugene Reese",
    age: 999,
    email: "",
    created_at: expect.stringMatching(datetimePattern),
    address: null
  })

  class NewUser extends User.exclude("id", "email", "created_at").include({
    nickname: StrField.init({ default: "Nickname" }),
    subscribe: IntField.init({ many: true }),
    phone_number: StrField.init({ default: "998" })
  }) {
    name = "John Doe"

    getName() {
      return this.name
    }
  }

  expect(NewUser.init().getName()).toEqual("John Doe")
  expect(NewUser.init().nickname.toLowerCase()).toEqual("nickname")
  expect(NewUser.init().phone_number).toEqual("998")
  expect(NewUser.init({ address: "Address" }).toRepresentation()).toEqual({
    name: "John Doe",
    age: 999,
    nickname: "Nickname",
    subscribe: [],
    phone_number: "998",
    address: "Address"
  })

  expect(Model.isModel(user)).toBe(true)
  expect(isModel(user)).toBe(true)

  class AUser extends User.pick("name") {}

  expect(AUser.init({ name: "Eugene Reese" }).toRepresentation()).toEqual({ name: "Eugene Reese" })
})

test("Test ModelSet", () => {
  const user = User.init({ name: "Eugene Reese" })
  const userList = UserSet.init([user, { name: "John Doe" }])

  expect(UserSet.model).toEqual(User)
  expect(userList[0]).toStrictEqual(user)
  userList.forEach((x) => expect(x).toBeInstanceOf(User))

  expect(ModelSet.isModel(userList)).toBe(true)
  expect(isModel(userList)).toBe(true)
})

test("Test Model Utils", () => {
  const obj = User.init({ name: "Eugene Reese" })

  expect(modelToRaw(obj).name).toEqual("Eugene Reese")
  expect(modelToRaw(obj).age).toEqual(999)
})
