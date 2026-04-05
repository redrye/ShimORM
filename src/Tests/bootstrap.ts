import Connection from "@/Database/Connection"
import Model from "@/Model"

class User extends Model {}

const connection = new Connection({ database: "app", version: 1 })
User.setConnection(connection)
User.setTable("users")

await connection.schema().createTable({
    name: "users",
    keyPath: "id",
    autoIncrement: true,
})

const user = await User.create({
    name: "Jane",
    email: "jane@example.com",
})

console.log(await User.all())