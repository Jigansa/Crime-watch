import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  services: [{
    type: String,
    enum: ['Food', 'Education', 'Health', 'Environment', 'Women Empowerment', 'Child Care', 'Elder Care', 'Animal Welfare', 'Disability', 'Rural Development', 'Other']
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  peopleHelped: {
    type: Number,
    default: 0
  },
  contact: {
    phone: String,
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    }
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadDate: Date
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const NGO = mongoose.model('NGO', ngoSchema);
export default NGO; 