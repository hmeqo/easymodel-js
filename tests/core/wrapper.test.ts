import { useBranch } from "@/index"
import { User } from "./models"

test("Test Wrappers", () => {
  const user = useBranch(User.init({ name: "John" }))

  user.name = "John Doe"
  expect(user.name).toEqual("John Doe")
  user.$rollback()
  expect(user.name).toEqual("John")

  user.name = "Bob"
  user.$snapshot()
  user.name = "Rob"
  user.$rollback()
  expect(user.name).toEqual("Bob")

  const user2 = user.$subBranch()
  user2.name = "Ethan"
  expect(user.name).toEqual("Bob")
  expect(user2.name).toEqual("Ethan")
  user2.$push()
  expect(user.name).toEqual("Ethan")

  const user3 = user.$copy()
  user3.name = "Tom"
  expect(user.name).toEqual("Ethan")
  expect(user3.name).toEqual("Tom")
})
