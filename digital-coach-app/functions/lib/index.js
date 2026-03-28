"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = void 0;
const https_1 = require("firebase-functions/v2/https");
exports.helloWorld = (0, https_1.onRequest)((req, res) => {
    debugger;
    const name = req.params[0].replace('/', '');
    const items = { lamp: "This is a lamp.", chair: "Good chair." };
    const message = items[name];
    res.send(`<h1>${message}<\h1>`);
});
//# sourceMappingURL=index.js.map