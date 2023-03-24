const headerValidator = require('../../middleware/validator')
const locals = require('../../locales')
const PostAPI = require('./Post')
const PatchAPI = require('./Patch')
const GetAPI = require('./Get')
module.exports = [
    {
        method: 'post',
        path: '/balance',
        handler: PostAPI.handler,
        config: {
            cors: true,
            description: locals["users"].Post.ApiDescription,
            tags: ['api', 'userbalance'],
            auth: {
                strategies: ['admin']
            },
            validate: {
                headers: headerValidator.headerAuth,
                payload: PostAPI.validator,
                failAction: (req, reply, source, error) => {
                    headerValidator.faildAction(req, reply, source, error)
                }
            },
           // response: PostAPI.response
        }
    },
    {
        method: 'get',
        path: '/balance',
        handler: GetAPI.handler,
        config: {
            cors: true,
            description: locals["users"].Get.ApiDescription,
            tags: ['api', 'user'],
            auth: {
                strategies: ['basic', 'user', 'admin']
            },
            validate: {
                headers: headerValidator.headerAuth,
                query: GetAPI.validator,
                failAction: (req, reply, source, error) => {
                    headerValidator.faildAction(req, reply, source, error)
                }
            },
            response: GetAPI.response
        }
    },
    {
        method: 'patch',
        path: '/balance',
        handler: PatchAPI.handler,
        config: {
            cors : true,
            description: locals["users"].Post.ApiDescription,
            tags: ['api', 'users'],
            auth: {
                strategies: ['user', 'admin']
            },
            validate: {
                headers: headerValidator.headerAuth,
                payload: PatchAPI.validator,
                query:PatchAPI.queryvalidator,
                failAction: (req, reply, source, error) => {
                    headerValidator.faildAction(req, reply, source, error)
                }
            },
            response: PatchAPI.response
        }
    },
]