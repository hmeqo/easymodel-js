## Easymodel

Easily define your data models use decorator.

## Installation

```bash
npm install @hmeqo/easymodel
```

Add `experimentalDecorators` and `emitDecoratorMetadata` to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true /* Enable experimental support for legacy experimental decorators. */,
    "emitDecoratorMetadata": true /* Emit design-type metadata for decorated declarations in source files. */,
  }
}
```

### Define a model

Define a base model, is clear and is easy to use:

```ts
import { Model, dateTimeField, integerField, stringField } from "@hmeqo/easymodel"

class User extends Model {
  @stringField name: string = ""
  @integerField age!: number
  @dateTimeField createdAt!: Date
}

class UserSet extends User.modelSet() {}

const user = User.init({ name: "Eugene", age: 27 })
console.log(user.name) // Eugene

const userList = UserSet.init([user])
console.log(userList[0].name) // Eugene
```
