const groceries = require('./objects/groceries');

module.exports.default = { 
    "expression": "online\/rest\/some\/api\/.*\/and\/.*",
    "method": "GET",
    "name": "list",
    "isArray": true,
    "responses": {
        "groceries": {
            "status": 200,
            "data": groceries,
            "headers": {"Content-type":"application/json"},
            "statusText": "text"
        },
        "wishes": {
            "data": [{"title":"Ferrari f40"}, {"title": "Koenigsegg One:1"}]
        },
        "other": {
            "data": [{"title":"Red-bull RB13"}],
            "delay": 4000
        },
        "internal-server-error": {
            "status":500
        }
    }
};