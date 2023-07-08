const app = require('./index').app;
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}!`);
});