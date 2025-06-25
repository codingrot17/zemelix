"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
var dummyUsers_1 = require("../api/dummyUsers");
function login(email, password) {
    var user = dummyUsers_1.dummyUsers.find(function (u) { return u.email === email && u.password === password; });
    return user !== null && user !== void 0 ? user : null;
}
exports.login = login;
