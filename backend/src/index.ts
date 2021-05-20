import express from 'express';

const app = express();
const port = 8080;

app.get('/', (req:any, res:any) => {
    res.send('testwas');
});

app.listen(port, () => {
    console.log(`Start listening at ${port}`);
});