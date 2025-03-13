export function getConstructor<T = any>(instance: unknown): T {
  return Object.getPrototypeOf(instance).constructor
}

export function assign<T extends object | any[]>(target: T, source: any) {
  if (Array.isArray(source)) {
    ;(target as any[]).length = 0
    source.forEach((item: any) => (target as any[]).push(item))
  } else {
    for (const key in source) {
      ;(target as any)[key] = source[key]
    }
  }
  return target
}

export function merge<T extends Record<any, any>, B = unknown>(
  target: Partial<T>,
  ...sources: (Partial<B> | undefined)[]
): T & B {
  if (!sources.length) return target as T & B
  for (const source of sources) {
    if (!source) continue
    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue
      }
      if (typeof source[key] === "object" && target[key] && typeof target[key] === "object") {
        merge(target[key] as any, source[key] as any)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return target as T & B
}

export function deepcopy<T>(obj: T): T {
  if (typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map(deepcopy) as T
  return Object.entries(obj as any).reduce((acc, [key, value]): Record<any, any> => {
    return { ...acc, [key]: deepcopy(value) }
  }, {} as T)
}
