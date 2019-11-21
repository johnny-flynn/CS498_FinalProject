const User = require('../models/User') //relative path to the User model from user

const is_whitelisted = async (linkblue_username) => {
    // try to pull user from the user table using the linkblue username
    const user = await User.query()
        .findById(linkblue_username)
        // if we get a user back, return true

        if (user) {
            return true;
        }
        else {
            return false;
        }
        // else return false

}

module.exports.is_whitelisted = is_whitelisted