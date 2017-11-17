const express = require('express')
const router = express.Router()
const ctrl = require('./controllers')

router.get('/scores', ctrl.getAll)
router.post('/scores', ctrl.create)
router.put('/scores/:name', ctrl.editOne)

module.exports = router