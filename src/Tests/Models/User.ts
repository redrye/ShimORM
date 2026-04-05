import Model from "@/Model.ts";

class User extends Model {
    constructor() {
        super();
        console.log("User model initialized");
    }
}

export default User;