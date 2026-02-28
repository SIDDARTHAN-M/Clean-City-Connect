const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    area: { type: String, required: true },
    description: { type: String },
    rating: { type: Number },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Awaiting Admin Review', 'Completed', 'Rework Required'],
        default: 'Pending'
    },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completionImage: { type: String }, // Can keep for legacy or temporary storage
    cleanedImageUrl: { type: String }, // Explicit new field for the uploaded cleanup image
    workerCompletionComment: { type: String },
    adminApprovalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminReviewedAt: { type: Date },
    adminRemarks: { type: String },
    history: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        comment: String
    }]
}, { timestamps: true });

// Index for geo-spatial queries if needed, though we will use Haversine for manual calc
complaintSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('Complaint', complaintSchema);
