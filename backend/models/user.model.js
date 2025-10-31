import mongoose from "mongoose";
import bcrypt from "bcrypt";

  const userSchema = new mongoose.Schema({
    // user credentials 
    username:{
        type:String,
        unique:true,
        index:true,
        trim:true,
        required:true,
        maxlength:20,
        minlength:3,
    },
    email :{
        type:String,
        unique:true,
        index:true,
        trim:true,
        required:true,
        match:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    isEmailVarified:{
      type:Boolean,
      default:false
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
    default:null,
   }


  },{timestamps:true});


const User = mongoose.model("User", userSchema);


userSchema.pre("save",async function(next) {
  if(!this.isModified(this.password))return next();
   this.password = bcrypt.hash(this.password,10);
   next();
})

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password);
}











export {User};