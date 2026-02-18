const express = require('express');
const app = express();
const port = 3111;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!<br>Паламарчук Ігор');
});

app.post('/data', (req, res) => {
  console.log('Body:', req.body);

  res.json({
    message: 'Data received!',
    yourData: req.body
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
