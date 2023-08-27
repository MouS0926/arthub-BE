
const express=require("express")
const jwt=require("jsonwebtoken")
const { auth } = require("../middleware/auth")
const postroute=express.Router()
const {Post}=require("../model/Post")


postroute.post("/add",auth,async(req,res)=>{
    // const token= req.headers.authorization?.split(" ")[1]
    // const decoder=jwt.verify(token,"masai")
    //    const email=decoder.payload
       
try {
     
       const newpost= new Post(req.body) 
       await newpost.save()
        res.status(200).send("Post added successfully")
     
    
} catch (error) {
    console.log(error)
    res.status(201).send("something error")
}
})

postroute.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 9; 
    const skip = (page - 1) * limit;
    const filterOptions = {};
    if (req.query.category) {
      filterOptions.category = req.query.category;
    }
    if (req.query.rating) {
      filterOptions.rating = { $gte: parseInt(req.query.rating) };
    }
    if (req.query.comments) {
      filterOptions.comments = { $gte: parseInt(req.query.comments) };
    }
    if (req.query.price) {
      filterOptions.price = { $lte: parseInt(req.query.price) };
    }
    if (req.query.publisher) {
      filterOptions.publisher = req.query.publisher;
    }
    if (req.query.date) {
      filterOptions.date = { $gte: new Date(req.query.date) };
    }


    const searchQuery = req.query.search; 
    if (searchQuery) {
     
      filterOptions.title = { $regex: searchQuery, $options: 'i' };
    }

    const sorting = {};
    if (req.query.sortBy === 'rating') {
        sorting.rating = req.query.sortOrder === 'asc' ? 1 : -1;
      } else if (req.query.sortBy === 'price') {
        sorting.price = req.query.sortOrder === 'asc' ? 1 : -1;
      }
  
    try {
        const posts = await Post.find(filterOptions)
          .sort(sorting)
          .skip(skip)
          .limit(limit);
    
        const totalData = await Post.countDocuments(filterOptions);
    
        res.status(200).send({
          posts,
          currentPage: page,
          itemsPerPage: limit,
          totalItems: totalData,
        });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });

postroute.patch("/update/:postid",auth,async(req,res)=>{
    const {postid}=req.params
    const post=await Post.findOne({_id:postid})
    console.log(post);
    try {
       
        if(req.body.userId!=post.userId){
          res.status(200).send({"msg":"you are not authorized!"})
        }

        else{
          await Post.findByIdAndUpdate({_id:postid},req.body)
           res.status(200).send({"msg":`post with id ${postid} is updated`})
       }
    } catch (error) {
        console.log(error)
        res.status(400).send({"err":error})
    }
})






postroute.delete("/delete/:id",auth,async(req,res)=>{
    const {id}=req.params
    try {
        const post=await Post.findById(id)
        if(post){
            await Post.findByIdAndDelete(id)
            res.status(200).send("post deleted succesfully")
        }
    } catch (error) {
        console.log(error)
        res.status(400).send("error")
        
    }
})


module.exports=postroute