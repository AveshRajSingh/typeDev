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
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },  
    isAdmin:{
      type:Boolean,
      default:false
    },
    
    password:{
        type:String,
        required:true,
        trim:true,
    },
    isEmailVerified:{
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
    bestAccuracy: {
      type: Number,
      default: 0,
    },
    testsCompleted: {
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
      default: 3, // guest users get 3, logged-in users get 20 (set on registration)
    },
    freeParagraphGenLeft: {
      type: Number,
      default: 5, // logged-in users get 5 free AI paragraph generations
    },
    refreshToken : {
    type:String,
    trim:true,
    default:null,
   }


  },{timestamps:true});


  
  
userSchema.pre("save",async function(next) {
  if(!this.isModified("password"))return next();
   this.password = await bcrypt.hash(this.password,10);
   next();
})

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password);
}


const User = mongoose.model("User", userSchema);

export {User};