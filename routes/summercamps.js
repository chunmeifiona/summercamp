const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Summercamp = require('../models/summercamp');
const { summercampSchema } = require('../schemas.js');

const validateSummercamp = (req, res, next) => {
    const { error } = summercampSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
// app.get('/makesummercamp', async (req, res) => {
//     const camp = new Summercamp({ title: 'Flower mound CAC', description: 'cheap camp' });
//     await camp.save();
//     res.send(camp);
// })
// SHOW - display all
router.get('/', catchAsync(async (req, res) => {
    const summercamps = await Summercamp.find({})
    res.render('summercamps/index', { summercamps })
}))

///////////////////////////////////////
//=============creat new==============
///////////////////////////////////////
//form to creat new -> summercamps/new.ejs
//一定要在'/summercamps/:id'之前，不然new被认为是id
router.get('/new', (req, res) => {
    res.render('summercamps/new')
})
//creat new on server        // next to error handler
router.post('/', validateSummercamp, catchAsync(async (req, res, next) => {
    const summercamp = new Summercamp(req.body.summercamp)
    await summercamp.save()
    req.flash('success', 'Successfully made a new summercamp!')
    res.redirect(`/summercamps/${summercamp._id}`)
}))
//////////////////end creat///////////////////////
// SHOW one specific(id)
router.get('/:id', catchAsync(async (req, res) => { //进去这个网址 site address: /summercamps/:id
    const summercamp = await Summercamp.findById(req.params.id).populate('reviews')
    if (!summercamp) {
        req.flash('error', 'Can not find that summercamp!')
        return res.redirect('/summercamps')
    }
    res.render('summercamps/show', { summercamp }) // 打开 file show.ejs
}))
///////////////////////////////////////
//=============start edit==============
///////////////////////////////////////
//form to edit
router.get('/:id/edit', catchAsync(async (req, res) => {
    const summercamp = await Summercamp.findById(req.params.id)
    if (!summercamp) {
        req.flash('error', 'Can not find that summercamp!')
        return res.redirect('/summercamps')
    }
    res.render('summercamps/edit', { summercamp })
}))
//update specific one
router.put('/:id', validateSummercamp, async (req, res, next) => {
    try {
        const { id } = req.params
        const summercamp = await Summercamp.findByIdAndUpdate(id, { ...req.body.summercamp })
        req.flash('success', 'Successfully updated this summercamp!')
        res.redirect(`/summercamps/${summercamp._id}`)
    } catch (e) {
        next(e)// next to error handler //
    }
})
/////////////////end edit////////////////////////
//delete
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Summercamp.findByIdAndDelete(id)
    req.flash('success', 'deleted this summercamp!')
    res.redirect('/summercamps')
}))

module.exports = router