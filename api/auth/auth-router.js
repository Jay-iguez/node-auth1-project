// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const { checkUsernameFree, checkUsernameExists, checkPasswordLength } = require('../auth/auth-middleware')
const Users_model = require('../users/users-model')
const bcrypt = require('bcryptjs')
const express = require('express')
const router = express.Router()

router.post('/register', [checkUsernameFree, checkUsernameExists, checkPasswordLength], async (req, res, next) => {
  try {
    const new_user = await Users_model.add(req.body)

    res.status(200).json(new_user)
  } catch (err) {
    next({ status: 500, message: "Error in posting new user: " + err.message })
  }
})
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

  router.post('/login', async (req, res, next) => {
    try {
      const {password, username} = req.body

      Users_model.findBy({username: username})
        .then(user => {
          if (user && bcrypt.compareSync(password, user.password)){
            req.session.chocolatechip = user
            res.status(200).json({
              message: "Welcome " + user.username + "!"
            })
          } else {
            next({status: 401, message: "Invalid credentials"})
          }
        })
        .catch(err => {
          next({status: 500, message: "Error in comparing passwords: " + err})
        })
    } catch(err) {
      next({status: 500, message: "Error in logging in: " + err.message})
    }
  })

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

  router.get('/logout', async (req, res, next) => {
    try {
      if (req.session && req.session.chocolatechip){
        req.session.destroy(err => {
          if (err) {
            res.status(200).json({message: "failed to log out: " + err.message})
          } else {
            res.status(200).json({message: "logged out"})
          }
        })
      } else {
        res.status(200).json({message: "no session"})
      }
    } catch(err) {
      next({status: 500, message: "Error in logging out: " + err.message})
    }
  })

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

module.exports = router

// Don't forget to add the router to the `exports` object so it can be required in other modules
