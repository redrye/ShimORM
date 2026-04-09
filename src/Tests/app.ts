

import Connection from "@/Database/Connection"
import Model from "@/Database/Shim/Model"

class User extends Model {}

const connection = new Connection({ database: "app", version: 1 })
User.setConnection(connection)
User.setTable("users")

await connection.schema().createTable({
    name: "users",
    keyPath: "id",
    autoIncrement: true,
})

User.create({
    name: "Jane",
    email: "jane@example.com"
})

const users = await User.all()

const first = users[0]
const fields = Object.keys(first)
for (const field of fields) {
    $('.table').find('thead').append(`<th>${field}</th>`)
}

for (const user of users) {
    var rows: any = []
    for(var i = 0; i < users.length; i++) {
        var row = '<tr>';
        for(var j = 0; j < fields.length; j++) {
            row += '<td>' + users[i][fields[j]] + '</td>';
        }
        row += '</tr>';
        rows.push(row);
    }
    $('.table').find('tbody').append(rows)
}
