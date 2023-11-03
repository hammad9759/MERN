const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
const auth = require('../middlewares/auth');


// user
// register
router.post('/register', authController.register);
// login
router.post('/login', authController.login);
// Logout route
router.post('/logout', auth, authController.logout);
//refresh
router.get('/refresh', authController.refresh);

// blog
// create
router.post('/blog/create', auth, blogController.create);
// get all
router.get('/blog/all', auth, blogController.getAll);
// get blog by id
router.get('/blog/:id', auth, blogController.getById);
// update
router.put('/blog', auth, blogController.update);
// delete
router.delete('/blog/:id', auth, blogController.delete);



// Comments
// create
router.post('/comment/create', auth, commentController.create);
// get all
router.get('/comment/:id', auth, commentController.getById);

router.get('/', (req, res) => { res.send('Welcome to the API!'); });

module.exports = router;
