import mongoose from 'mongoose';

const aidingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    ngo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ngo',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'complete'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Aiding = mongoose.model('Aiding', aidingSchema);

export default Aiding;
