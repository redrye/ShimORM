import Model from "@/Database/Shim/Model";
class User extends Model {
    constructor() {
        super();
        console.log("User model initialized");
    }
}

export default User;