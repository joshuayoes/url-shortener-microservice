import mongoose from 'mongoose';

// Mongo DB connection
mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true });

// Setup Url schema
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    id: {
        type: Number,
        required: true,
    }, 
    url: {
        type: String,
        required: true,
    }
});

const Url = mongoose.model('Url', urlSchema);

// Utility functions

export const findUrls = async (url: string): Promise<mongoose.Document[]> => {
    const query = Url.find({ url });

    const dbUrls = await query.exec();

    return dbUrls;
}

export const allUrlsCount = async (): Promise<number> => {
    const allUrls = await Url.estimatedDocumentCount();
    return allUrls;
}

// interface MongooseUrl {
//     id: number;
//     url: string;
// } 

export const createNewUrlEntry = async (url: string): Promise<any> => {
    const newId = (await allUrlsCount()) + 1;
    
    const newUrl = new Url({
        id: newId,
        url,
    });

    return await newUrl.save();
}