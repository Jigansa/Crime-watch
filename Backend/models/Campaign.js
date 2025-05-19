import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  goal: {
    type: Number,
    required: true,
    min: 0
  },
  raised: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['Food', 'Education', 'Health', 'Environment', 'Emergency', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  images: [{
    url: String,
    caption: String
  }],
  updates: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  donors: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign; 