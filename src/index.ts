require('dotenv').config();
import express, {Application, Request, Response} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dns from 'dns';

import { findUrls, allUrlsCount, createNewUrlEntry } from './mongodb'

// Basic Configuration 
const app: Application = express();
const port = process.env.PORT || 3000;

// // Mongo DB connection
// mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true });

// // Setup Url schema
// const Schema = mongoose.Schema;

// const urlSchema = new Schema({
//     id: {
//         type: Number,
//         required: true,
//     }, 
//     url: {
//         type: String,
//         required: true,
//     }
// });

// const Url = mongoose.model('Url', urlSchema);

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))

// Set public directory for assets
app.use('/public', express.static(__dirname + '/public'));

// Routes
app.get('/', (req: Request, res: Response): void => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl/new', async (req: Request, res: Response) => {
    const { url } = req.body;
    
    // strips http(s):// and routes (i.e. hostname/api/routes) from url
    const regex = /(http:|https:)\/\/|\/[\d\w-\$\_\.\+\!\*\‘\(\)\,\%\?\=\#]*/gi;
    const host = url.replace(regex, '');

    // async wrapper for dns.lookup() method
    const dnsLookup = (host: string): Promise<{address: string; family: number}> => {
        return new Promise((resolve, reject) => {
            dns.lookup(host, (err, address, family) => {
                if (err) {
                    reject(err);
                }

                resolve({ address, family })
            });
        });
    };

    try {
        // validate that url is valid 
        await dnsLookup(host);
    } catch {
        // send error if invalid url 
        return res.status(400).json({
            "error": "invalid URL"
        })
    };

    // check to see if Url is already in database
    const urlExistsInDatabase = (await findUrls(url)).length === 1;

    // if Url is already in database, return existing short_url
    if (urlExistsInDatabase) {
        const existingUrl = (await findUrls(url))[0];

        return res.status(200).json({
            "original_url": url,
            "short_url": existingUrl.id
        });
    }

    // if Url is not in database, create new entry
    try {
        const newUrl = await createNewUrlEntry(url);
        
        res.status(200).json({
            "original_url": newUrl.url,
            "short_url": newUrl.id, 
        });
    
    } catch (err) {
        // send error if invalid url 
        return res.status(500).send(err)
    }
})

// Mount server
app.listen(port, () => console.log('Listening on port 3000...'))