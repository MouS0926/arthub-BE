
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
  const postData = req.body;
  if (postData.rating) {
    postData.rating = Number(postData.rating);
}
       const newpost= new Post(postData) 
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

  postroute.get("/userpost",auth,async(req,res)=>{
  try {
    const post =await Post.find({userId:req.body.userId})
    
    res.status(200).send(post)
  } catch (error) {
   
    res.status(400).send({"error": error});
  }
})


postroute.patch("/update/:postid",auth,async(req,res)=>{
    const {postid}=req.params
    const post=await Post.findOne({_id:postid})
    // console.log(post);
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


postroute.get("/post/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.status(200).send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error here");
  }
});



postroute.post("/like/:postId", auth, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Check if the user has already liked the post
    const likedIndex = post.likes.indexOf(req.body.userId);

    if (likedIndex === -1) {
      // User has not liked the post, so add the like
      post.likes.push(req.body.userId);
      post.likecount = post.likes.length;

      await post.save();

      res.status(200).send({ msg: "Post liked", likecount: post.likecount });
    } else {
      // User has already liked the post, so remove the like
      post.likes.splice(likedIndex, 1);
      post.likecount = post.likes.length;

      await post.save();

      res.status(200).send({ msg: "Post unliked", likecount: post.likecount });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


postroute.post("/comment/:postId", auth, async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Add the user's comment to the post
    post.comments.push({
      userId: req.body.userId,
      username: req.body.username,
      comment: comment,
    });

    await post.save();

    res.status(200).send({ msg: "Comment added successfully", comments: post.comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


module.exports=postroute