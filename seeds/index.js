const mongoose = require('mongoose');
const Summercamp = require('../models/summercamp');

mongoose.connect('mongodb://localhost:27017/summercamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Summercamp.deleteMany({});
    const c = new Summercamp({ title: 'Art House' });
    await c.save();
}

seedDB();
