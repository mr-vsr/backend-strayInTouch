import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    websiteLink: {
        type: String,
        trim: true,
    },
    bannerUrl: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true
});

const Ngo = mongoose.model('Ngo', ngoSchema);

module.exports = Ngo;
