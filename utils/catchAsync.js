module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next) //go to error handler
    }
}