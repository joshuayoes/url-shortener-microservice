import mongoose from 'mongoose';

// Mongo DB connection
if (process.env.MONGO_URI === undefined) {
    throw Error('Please include MONGO_URI in your .env file in the root directory')
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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

export const createNewUrlEntry = async (url: string): Promise<any> => {
    const newId = (await allUrlsCount()) + 1;
    
    const newUrl = new Url({
        id: newId,
        url,
    });

    return await newUrl.save();
}

export const getUrlById = async (id: number): Promise<any> => {
    const query = Url.find({ id });

    const ids = await query.exec();

    return ids[0];
}