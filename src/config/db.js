const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
}

module.exports = { connect };
