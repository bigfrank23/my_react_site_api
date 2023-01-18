const router = require("express").Router();
const cookieParser = require("cookie-parser");
const Post = require("../models/Post");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const multer = require("multer");
// import upload from "../utils/multer.js";

const auth = require("../middleware/auth");
const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Schema.Types;
// const cors = require("cors");
// Use the cookie-parser middleware
router.use(cookieParser());

// create Post
router.post("/", auth,  upload.single("image"), (async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    //create instance of user
    let user = new Post({
      title: req.body.title,
      desc: req.body.desc,
      creator: req.userId,
      username: req.body.username,
      profilePic: req.body.profilePic,
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
      userId: req.body.userId
    });

    //save user
    await user.save();
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
}));

// create Post with no cloudinary image
router.post("/create", auth, async (req, res) => {

  const newPost = new Post({ ...req.body, creator: req.userId });
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Post
router.get("/all", async (req, res) => {
  try {
    let user = await Post.find().sort({ _id: -1 })
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  // const numPosts = req.query.numPosts || 3; // default to 0
  // try {
  //   let user = await Post.find().sort({ _id: -1 }).skip(numPosts).limit(3)
  //   res.json(user);
  // } catch (error) {
  //   console.log(error);
  //   res.status(404).json({ message: error.message });
  // }

   try {
     const page = parseInt(req.query.page, 10) || 1;
     const limit = 3;
     const skip = (page - 1) * limit;

     const totalCount = await Post.countDocuments();
     const totalPages = Math.ceil(totalCount / limit);

     const items = await Post.find({}).sort({ _id: -1 }).skip(skip).limit(limit);

     res.json({ items, totalPages });
   } catch (err) {
     console.error(err.message);
     res.status(500).send("Server Error");
   }
});

// Get Single Post
router.get("/:id", async (req, res) => {

  const { id } = req.params;
  try {
    // console.log(mongoose.Types.ObjectId.isValid(id));
    // console.log(mongoose.isValidObjectId(id));
    // console.log(mongoose.Types.ObjectId.index);
    const post = await Post.findById(id);
    post.comments.reverse();
    res.status(200).json(post);
    //   var d = post.comments.map(v=> v.likes)
    //  console.log(d);

  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});


// Delete Post
router.delete("/:id", async (req, res) => {
  try {
    let user = await Post.findById(req.params.id);

    //delete image from cloudinary
    await cloudinary.uploader.destroy(user.cloudinary_id);

    //delete user from db
    await user.remove();
    res.json();
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});

// Edit Post
router.put("/:id ", auth, upload.single("image"), async (req, res) => {
  try {
    let user = await Post.findById(req.params.id);

    //Delete Image from Cloudinary
    await cloudinary.uploader.destroy(user.cloudinary_id);
    
    let result;
    if (req.file) {
      //Upload Image to Cloudinary
      result = await cloudinary.uploader.upload(req.file.path);
      
    }
    const data = {
      // name: req.body.name || user.name,
      title: req.body.title || user.title,
      desc: req.body.desc || user.desc,
      avatar: result?.secure_url || user.avatar,
      cloudinary_id: result?.public_id || user.cloudinary_id,
    };

    user = await Post.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});


  router.patch("/:id ", async (req, res) => {
    const { id } = req.params;

    if (!req.body.userId) {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id ===String(req.body.userId));

    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.body.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.status(200).json(updatedPost);
})

router.put("/likePost", async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(req.body.postId, {$push: {likes: req.body.userId}}, {new: true} )
    return res.json(result)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.put("/unLikePost", async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.body.userId } },
      { new: true }
    ).exec();
    return res.json(result)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.put("/like", (req, res) => {
  const { userId, name, image } = req.body;
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: { userId, name, image }},
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});
router.put("/unlike", (req, res) => {
  const { userId, name, image } = req.body;
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: { userId, name, image } },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.put("/views", (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { views: req.body.userIP },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});
router.put("/views", (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { views: req.body.userIP },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.post("/views:id", (req, res) => {
  // const pageId = req.params.id;
    Post.findOneAndUpdate(
      {pageId: req.body.id},
      {$inc: {views: 1}}, {new: true}, (err, page) =>{
        if(err){
          console.error(err)
          // res.sendStatus(500)
          res.send(err)
        }else{
          res.sendStatus(200)
          res.json({views: page.views})
        }
      }
      )
});

router.get("/views:id", (req, res) => {
  // const pageId = req.params.id
  //find the page in the database and return the view count
    Post.findOne({pageId: req.params.id},(err, page) =>{
        if(err){
          console.error(err)
          // res.sendStatus(500)
          res.send(err)
        }else{
          res.json({views: page.views})
        }
      }
      )
});

// Set up the endpoint for updating the view count
// Set up the endpoint for retrieving the view count
router.get('/view/:id', async (req, res) => {
  try {
    const viewCount = await Post.findOne({ pageId: req.params.id });
    return res.send({ views: viewCount.views });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

// Set up the endpoint for updating the view count
router.post('/view', async (req, res) => {
  try {
    // Find the view count document for the item
    const viewCount = await Post.findOne({ pageId: req.body.id });

    // const { password, ...others } = user._doc;
    // res.status(200).json(others);

    const {result} = viewCount

    // If the document doesn't exist, create it with a view count of 1
    if (!viewCount) {
      const newViewCount = new Post({ pageId: req.body.id, views: 1 });
      await newViewCount.save();
      return res.send({ views: 1 });
    }

    // If the document does exist, increment the view count and save it
    viewCount.views += 1;
    await viewCount.save();
    return res.send({ views: viewCount.views });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});


  router.post("/:id/commentPost", async(req, res) => {
    const { id } = req.params;
    const value = req.body.messageData
    const user = req.body.userName

    const post = await Post.findById(id);

    post.comments.push(value);
    post.commentWriter.push(user)
    // post.comments.user.push(user);

    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
});

router.post('/add-comment', async(req, res) => {
  try {
    const comment = await Post.updateOne(
      { _id: req.body.postId },
      {
        $push: {
          comments: req.body,
        },
      }
    );
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).send(err);
  }

  // db.test.aggregate([
  //   {$unwind: '$comments'},
  //   {$sort: {'comments._id': -1}},
  //   {$group: {_id: '$_id', comments: {$push: "comments"}}},
  //   {'$project': {'comments': 1}}
  // ])
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const {
      profilePic,
      like,
      desc,
      creator,
      avatar,
      cloudinary_id,
      title,
      userId,
      ...others
    } = post._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Set up a route to handle post views
router.get('/:id/viewer', async (req, res) => {
  // Increment the view count for the post
  const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  // Set a cookie on the user's browser to track their visit
  // res.cookie('post_view', 'true', { expires: new Date(Date.now() + 900000) }, );
  res.cookie("post_view", true, {
    maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    domain: "localhost", // only send the cookie to requests made to 'localhost'
    httpOnly: true,
  });

  // Send a response to the client
  res.send('Post view counted');
});

router.put("/like-comment/:postId", (req, res) => {
  Post.findByIdAndUpdate(
    { _id: req.params.postId, "comments._id": req.body.commentId },
    { $push: { "comments.$.likes": req.body.userId } },
    { new: true },
    (err, post) => {
      if (err) {
        res.send(err);
      }
      res.json(post);
    }
  );
});

router.patch("/:postId/comments/:commentId", (req, res) => {
  const userId = req.body.userId;
  const action = req.query.action;
  if (action === "like") {
    Post.findOneAndUpdate(
      { _id: req.params.postId, "comments._id": req.params.commentId },
      { $push: { "comments.$.likes": userId } },
      { new: true }
    )
      .then((post) => {
        const updatedComment = post.comments.find(
          (comment) => comment._id == req.params.commentId
        );
        res.json(updatedComment);
      })
      .catch((error) => {
        res.status(500).send({ message: "Error liking comment" });
      });
  } else if (action === "unlike") {
    Post.findOneAndUpdate(
      { _id: req.params.postId, "comments._id": req.params.commentId },
      { $pull: { "comments.$.likes": userId } },
      { new: true }
    )
      .then((post) => {
        const updatedComment = post.comments.find(
          (comment) => comment._id == req.params.commentId
        );
        res.json(updatedComment);
      })
      .catch((error) => {
        res.status(500).send({ message: "Error unliking comment" });
      });
  } else {
    res.status(400).send({ message: "Invalid action" });
  }
});


module.exports = router;

 
