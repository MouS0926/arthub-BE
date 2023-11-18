const mongoose=require("mongoose")



const newschema=mongoose.Schema({
title: String,
date :String,
rating : String,
comments: [
    {
      userId: String,
      username: String,
      comment: String,
    },
  ],
price:Number,
image:String,
publisher:String,
category:String,
userId:String,
username:String,
likecount: Number,
likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ]
},
{
    versionKey:false
})

const Post=new mongoose.model("post",newschema)
module.exports={Post}