import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  duration: {
    hours: {
      type: Number,
      required: true
    },
    minutes: {
      type: Number,
      default: 0
    }
  },
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  category: {
    type: String,
    enum: ['Education', 'Health', 'Environment', 'Community', 'Other'],
    required: true
  },
  requiredSkills: [{
    type: String
  }],
  maxVolunteers: {
    type: Number,
    required: true
  },
  volunteers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'attended', 'no-show'],
      default: 'pending'
    },
    hoursLogged: Number,
    feedback: String,
    applicationDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  images: [{
    url: String,
    caption: String
  }]
}, {
  timestamps: true
});

eventSchema.index({ 'location.coordinates': '2dsphere' });

const Event = mongoose.model('Event', eventSchema);
export default Event; 