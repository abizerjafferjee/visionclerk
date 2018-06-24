var AccessControl = require('accesscontrol');

let grantsObject = {
    admin: {
        products: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*']
        }
    },
    user: {
        products: {
            'read:any': ['*'],
        }
    }
};
const ac = new AccessControl(grantsObject);

module.exports = ac;
