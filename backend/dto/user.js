// DTO/UserDTO.js

class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.username = user.username;
        this.email = user.email;
        this.name = user.name;
    }
}

module.exports = UserDTO;
