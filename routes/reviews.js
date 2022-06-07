const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Summercamp = require('../models/summercamp');
const { reviewSchema } = require('../schemas.js');
const Review = require('../models/review');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//make review
router.post('/', catchAsync(async (req, res) => {
    const summercamp = await Summercamp.findById(req.params.id)
    const review = new Review(req.body.review)
    summercamp.reviews.push(review)
    await review.save()
    await summercamp.save()
    req.flash('success', 'Successfully made a new review!')
    res.redirect(`/summercamps/${summercamp._id}`)

}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Summercamp.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'deleted this review!')
    res.redirect(`/summercamps/${id}`)
}))

module.exports = router