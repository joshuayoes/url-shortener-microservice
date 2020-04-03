import express, {Application, Request, Response} from 'express';
import mongo from 'mongodb';
import mongoose from 'mongoose';
import cors from 'cors';

// Basic Configuration 
const app: Application = express();
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/views/index.html');
});


app.listen(port, () => console.log('Listening on port 3000...'))