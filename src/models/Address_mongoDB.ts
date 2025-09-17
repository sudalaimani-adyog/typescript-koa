import mongoose, { Document, Schema } from "mongoose";



export interface IAddress extends Document {
    studentId: mongoose.Types.ObjectId,
    street: string,
    city: string,
    state: string,
    zip: string,
    country: string,
};

const AddressSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: false },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
});

export const AddressModel = mongoose.model<IAddress>("Address", AddressSchema);