const mongoose = require("mongoose");

const ItinerarySchema = mongoose.Schema({
  tourId: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  month: {
    type: String,
  },
  duration: {
    type: String,
  },
  coverPhoto: {
    type: String,
  },
  price: {
    type: String,
  },
  destination: [
    {
      type: String,
    },
  ],
  exclusive: [
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
      },
    },
  ],
  accomodation: [
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
      },
    },
  ],
  transport: [
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
      },
    },
  ],
  place: [
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
      },
    },
  ],
  days: [
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
      },
      journey: {
        type: String,
      },
      note: {
        type: String,
      },
      highlight: {
        type: String,
      },
      stay: {
        type: String,
      },
      meals: {
        type: String,
      },
      whatmore: {
        type: String,
      },
      sightseeing: {
        type: String,
      },
    },
  ],
  tAndc: [
    {
      term: {
        type: String,
      },
      conditions: {
        type: String,
      },
    },
  ],
  qa: [
    {
      q: {
        type: String,
      },
      a: {
        type: String,
      },
    },
  ],

  userId: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "user",
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "college",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "agency",
  },
});

module.exports = Itinerary = mongoose.model("itinerary", ItinerarySchema);
