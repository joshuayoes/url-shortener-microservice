require('dotenv').config();
import express, {Application, Request, Response} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dns, { resolve } from 'dns';

// Basic Configuration 
const app: Application = express();
const port = process.env.PORT || 3000;

// Mongo DB connection
mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))

// Set public directory for assets
app.use('/public', express.static(__dirname + '/public'));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl/new', async (req: Request, res: Response) => {
    const { url } = req.body;
    
    // strips http(s):// and routes (i.e. hostname/api/routes) from url
    const regex = /(http:|https:)\/\/|\/[\d\w-\$\_\.\+\!\*\‘\(\)\,\%\?\=\#]*/gi;
    const host = url.replace(regex, '');

    // async wrapper for dns.lookup() method
    const dnsLookup = async (host: string) => {
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
        const hostName = await dnsLookup(host);
        console.log(hostName);

        res.status(200).json({
            "original_url": url,
            "short_url": 1
        });    
    } catch {
        return res.status(400).json({
            "error": "invalid URL"
        })
    };
})

// Mount server
app.listen(port, () => console.log('Listening on port 3000...'))