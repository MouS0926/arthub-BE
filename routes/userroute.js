

const express=require("express")
const { User } = require("../model/User")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const { Blacklist } = require("../middleware/Blocklist")
const { Post } = require("../model/Post")
const { auth } = require("../middleware/auth")
const userroute=express.Router()

userroute.post("/register",async(req,res)=>{
    const {password,email}=req.body
    try {
       const user=await User.findOne({email})
        if(user){
    res.status(400).send("User already exist, please login")

        }
        else{
            const hash=bcrypt.hashSync(password,8)
          const newuser=  new User({...req.body,password:hash})
          await newuser.save()
          res.status(200).send({"msg":"User registered Successfully","user":{newuser}})
        }
    } catch (error) {
        console.log(error)
    }
})

userroute.post("/login",async(req,res)=>{
    const {email,password}=req.body
    try {
        const user=await User.findOne({email})
        if(user){
            bcrypt.compare(password,user.password,(err,result)=>{
                if(result){
                    const token=jwt.sign( { userId: user._id,user:user.username },"masai") 
                //    const token=jwt.sign({payload:user.email},"masai") 
                  
                   res.status(201).send({"msg":"Login Successfully",token,username:user.username})
                }
                else{
                    res.status(401).send("Invalid credentials")  
                }
            })
            

        }
        else{
            res.status(401).send("Invalid credentials")  
        }
    } catch (error) {
        console.log(error)
        res.status(401).send("Something is wrong")  
    }
})
userroute.get("/logout",async(req,res)=>{
    const token=req.headers.authorization?.split(" ")[1]
    try {
        Blacklist.push(token)
        // console.log(Blacklist)
        res.status(200).send("logout success")  
    } catch (error) {
        console.log(error)
        res.status(401).send("Something is wrong")  
    }
    
   
})

//get all users/creators
userroute.get("/creators",async(req,res)=>{
    
    try {
        const allusers=await User.find()
        res.status(200).send(allusers)  
    } catch (error) {
        console.log(error)
        res.status(401).send(error)  
    }
    
   
})


//particular user post route without authentication
userroute.get("/creators/post/:userId",async(req,res)=>{
    try {
        const {userId}=req.params
      const allposts =await Post.find({userId:userId})
      
      res.status(200).send(allposts)
    } catch (error) {
     
      res.status(400).send({"error": error});
    }
  })

//   userroute.patch("/user/:userId",auth,async(req,res)=>{
//     try {
//         const {userId}=req.params
//       const updatedpost =await User.findByIdAndUpdate({_id:userId},req.body)
      
//       res.status(200).send("post is updated",updatedpost)
//     } catch (error) {
     
//       res.status(400).send({"error": error});
//     }
//   })



module.exports={userroute}
