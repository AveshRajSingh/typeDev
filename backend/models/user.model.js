import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // user credentials 
    username:{
        type:String,
        unique:true,
        index:true,
        trim:true,
        required:true,
        max:20,
        min:3,
    },
    email :{
        type:String,
        unique:true,
        index:true,
        trim:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:32,
        trim:true,
    },
   
    // typing statistics
   testsTaken: {
      type: Number,
      default: 0,
    },
    avgWPM: {
      type: Number,
      default: 0,
    },
    bestWPM: {
      type: Number,
      default: 0,
    },
    avgAccuracy: {
      type: Number,
      default: 0,
    },
    

    // for payment and subscriptions
     isPremium:{
        type:Boolean,
        default:false,
    },
     premiumExpiresAt: {
      type: Date,
      default: null,
    },
    // ai feedback tracking

    lastFeedback: {
      paragraphId: { type: mongoose.Schema.Types.ObjectId, ref: "Paragraph" },
      feedback: String,
      createdAt: Date,
    },

   
    freeFeedbackLeft: {
      type: Number,
      default: 3, // new users get 3 free AI feedbacks
    },
   refreshToken : {
    type:String,
    trim:true,
   }


},{timestamps:true});


const User = mongoose.model("User", userSchema);

export {User};