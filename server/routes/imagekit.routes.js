const express = require('express')
const { getAuthParameters } = require('../controllers/imagekit.controller')
const { protect } = require('../middleware/auth.middleware')

const router = express.Router();

router.get('/auth', protect, getAuthParameters)

module.exports = router;
