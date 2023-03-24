const headerValidator = require('../../middleware/validator')
const locals = require('../../locales')
const PostAPI = require('./Post')
const PatchAPI = require('./Patch')
const GetAPI = require('./Get')
module.exports = [
    {
        method: 'patch',
        path: '/bankDetail',
        handler: PatchAPI.handler,
        config: {   
            cors: true,
            description: locals["users"].Post.ApiDescription,
            tags: ['api', 'bankDetails'],
            auth: {
                strategies: ['admin']
            },
            payload: {
                maxBytes: 20715200,
                parse: true,
                output: 'data',
                allow: 'multipart/form-data',
                multipart: true
            },
            validate: {
                headers: headerValidator.headerAuth,
                payload: PatchAPI.validator,
                query: PatchAPI.query,
                failAction: (req, reply, source, error) => {
                    headerValidator.faildAction(req, reply, source, error)
                }
            },
            response: PatchAPI.response
        }
    },
    {
        method: 'post',
        path: '/bankDetails',
        handler: PostAPI.handler,
        config: {   
            cors: true,
            description: locals["users"].Post.ApiDescription,
            tags: ['api', 'bankDetails'],
            auth: {
                strategies: ['admin']
            },
            payload: {
                maxBytes: 20715200,
                parse: true,
                output: 'data',
                allow: 'multipart/form-data',
                multipart: true
            },
            validate: {
                headers: headerValidator.headerAuth,
                payload: PostAPI.validator,
                failAction: (req, reply, source, error) => {
                    headerValidator.faildAction(req, reply, source, error)
                }
            },
            response: PostAPI.response
        }
    },
    {
        method: 'get',
        path: '/bankDetails',
        handler: GetAPI.handler,
        config: {
            cors: true,
            description: locals["users"].Get.ApiDescription,
            tags: ['api', 'bankDetails'],
            auth: {
                strategies: ['user', 'admin']
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
    }
]