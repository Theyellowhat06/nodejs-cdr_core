// const { MongoClient } = require("mongodb");
// require("dotenv").config();

// let dbConnetion;

// module.exports = {
//   connectToDb: (cb) => {
//     MongoClient.connect(
//       `mongodb://${process.env.MONGO_DB_HOST}:${MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`
//     )
//       .then((client) => {
//         dbConnetion = client.db();
//         return cb();
//       })
//       .catch((err) => {
//         console.log(err);
//         return cb(err);
//       });
//   },
//   getDb: () => dbConnetion,
// };

const mongoose = require('mongoose')
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`MongoDB Connected ${conn.connection.host}`);
    } catch(error) {
        console.log(error)
    }
}

module.exports = connectDB;