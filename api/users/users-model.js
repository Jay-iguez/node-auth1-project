const db = require('../../data/db-config')
const bcrypt = require('bcryptjs')

/**
  resolves to an ARRAY with all users, each user having { user_id, username }
 */
async function find() {
  return await db('users')
    .select('user_id', 'username')
}

/**
  resolves to an ARRAY with all users that match the filter condition
 */
async function findBy(filter) {
  const [searched] = await db('users').where(filter)

  return searched
}

/**
  resolves to the user { user_id, username } with the given user_id
 */
async function findById(user_id) {
  const selected_user = await db('users').where('user_id', user_id)

  return selected_user
}

/**
  resolves to the newly inserted user { user_id, username }
 */
async function add(user) {
  const hash = bcrypt.hashSync(user.password, 12)
  const payload_body = {...user, password: hash}

  const [id] = await db('users').insert(payload_body)

  const [new_user] = await findById(id)

  return {user_id: new_user.user_id, username: new_user.username}
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  find,
  findBy,
  findById,
  add
}
