import { onRequest } from 'firebase-functions/v2/https';

type Indexable = { [key: string]: any };
export const helloWorld = onRequest((req, res) => {
    debugger;
    const name = req.params[0].replace('/', '');
    const items: Indexable = { lamp: "This is a lamp.", chair: "Good chair."};
    const message = items[name];
    res.send(`<h1>${message}<\h1>`);
});