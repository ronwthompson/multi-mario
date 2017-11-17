const knex = require('./db')

function getAll(){
    return knex('player')
}

function create(body) {
    return knex('player')
            .insert(body)
}

function editOne (body, id) {
    return knex('player')
            .update(body)
            .where('name', id)
}

module.exports = { getAll, create, editOne }