import { assign, deepcopy, merge } from "@/utils"

test("Test Utils", () => {
  {
    const obj1 = { a: { b: 1, c: 1 }, d: 1 }
    const obj2 = { a: { b: 2 }, e: 2 }
    const result = merge(obj1, obj2)
    expect(result).toEqual({ a: { b: 2, c: 1 }, d: 1, e: 2 })
    expect(result).toEqual(obj1)

    const objA = deepcopy(obj1)
    objA.a.b = 3
    expect(objA).toEqual({ a: { b: 3, c: 1 }, d: 1, e: 2 })
    expect(obj1).toEqual({ a: { b: 2, c: 1 }, d: 1, e: 2 })

    expect(deepcopy([1, 2, 3])).toEqual([1, 2, 3])
  }
  {
    const a = {
      list: [1, 2, 3],
      test() {}
    }
    expect(deepcopy(a)).toEqual(a)
  }
  {
    const obj = { a: 1 }
    expect(assign(obj, { b: 2 })).toEqual(obj)
    expect(obj).toEqual({ a: 1, b: 2 })
  }
})
