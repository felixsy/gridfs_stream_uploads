const mongoose = require("mongoose");
const schema = mongoose.Schema;

const signupSchema = new schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

mongoose.model("signup", signupSchema);
