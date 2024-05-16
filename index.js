const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Home Page Route'));
// Add more routes as needed

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
