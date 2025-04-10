import { IntegerField, isModel, Model, ModelSet, modelToRaw, StringField } from "@/index"
import { User, UserSet } from "./models"

test("Test Model", () => {
  const user = User.init({ name: "Eugene Reese" })
  expect(user.name).toEqual("Eugene Reese")
  expect(user.toRepresentation()).toEqual({
    name: "Eugene Reese",
    age: 999,
    email: "",
    created_at: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}Z/)
  })

  class NewUser extends User.exclude("id", "email", "created_at").include({
    nickname: StringField.init({ default: "Nickname" }),
    age: StringField.init(),
    subscribe: IntegerField.init({ many: true })
  }) {
    age = "998"
  }
  expect(NewUser.init().nickname.toLowerCase()).toEqual("nickname")
  expect(NewUser.init().toRepresentation()).toEqual({ name: "", age: "998", nickname: "Nickname", subscribe: [] })

  expect(Model.isModel(user)).toBe(true)
  expect(isModel(user)).toBe(true)
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
