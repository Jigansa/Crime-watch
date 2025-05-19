// backend/models/Donation.js
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
        required: true
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Card', 'NetBanking', 'Other'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true
    },
    receiptNumber: {
        type: String,
        unique: true
    },
    category: {
        type: String,
        enum: ['Food', 'Education', 'Health', 'Environment', 'Emergency', 'Other'],
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    message: String,
    receiptUrl: String
}, {
    timestamps: true
});

// Generate receipt number before saving
donationSchema.pre('save', async function(next) {
    if (!this.receiptNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.receiptNumber = `DON${year}${month}${random}`;
    }
    next();
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;