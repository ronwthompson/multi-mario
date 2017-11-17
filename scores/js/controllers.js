const model = require('./models')

function getAll (req, res, next) {
    model.getAll().then(result => {
        res.status(200).json({ data: result })
    })
}

function create (req, res, next) {
    model.create(req.body).then(result => {
        if (result.errors) return next(result.errors)
        res.status(201).json({ data: result })
    })
}

function editOne (req, res, next) {
    model.editOne(req.body, req.params.name).then(result => {
        if (result.errors) return next(result.errors)
        res.status(201).json({ data: result })
    })
    
}

module.exports = { getAll, create, editOne }