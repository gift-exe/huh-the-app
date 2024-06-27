const express = require('express');
const axios = require('axios');
const app = express();
const port = 9000;

//dicionary api (would probably change this to my custom python api later)
const DICT_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

app.get('/define/:word', async (req, res) => {
    const word = req.params.word;
    console.log(word)
    try {
        const response = await axios.get(`${DICT_API_URL}${word}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error Fetching Definition');
    }
});

app.listen(port, () => {
    console.log(`Server Running At http://localhost:${port}`);
});

