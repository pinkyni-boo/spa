const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    beforeImage: {
        type: String, // URL of the image
        required: function() { return this.type === 'result'; } // Required for Before/After
    },
    afterImage: {
        type: String, // URL of the image
        required: function() { return this.type === 'result'; } // Required for Before/After
    },
    imageUrl: {
        type: String, // Single image for facility/other types
    },
    description: {
        type: String
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    type: {
        type: String,
        enum: ['result', 'facility'], // 'result' = Before/After, 'facility' = Space/Ambience
        default: 'result'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
