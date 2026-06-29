const imagekit = require("../config/imagekit");

/**
 * Controller to generate signed authentication parameters for ImageKit uploads.
 * Endpoint: GET /api/imagekit/auth
 */

const getAuthParameters = (req, res, next) => {
    try {
        const authenticationParams = imagekit.getAuthenticationParameters();

        res.status(200).json({
            status: 'success',
            data: authenticationParams
        })
    } catch (error) {
        console.error('ImageKit Auth Signature Generation Error:', error.message);
        next(error)
    }
}

module.exports = { getAuthParameters };