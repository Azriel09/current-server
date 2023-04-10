const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // email
  name: {
    type: String,
    required: [true, "Please provide a name"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email Exist"],
  },

  //   password
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
  token: {
    type: String,
    default: "",
  },
  rates: {
    type: Array,
    unique: true,
    default: "",
    required: true,
  },
});

// export UserSchema
module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
