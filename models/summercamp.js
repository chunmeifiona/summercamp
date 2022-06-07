const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const SummercampSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    time: String,
    description: String,
    location: String,
    website: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
    //categories: [String]
})

SummercampSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('summercamp', SummercampSchema);