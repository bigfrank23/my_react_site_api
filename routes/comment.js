const router = require("express").Router();

const Comments = require("../models/Comment.js")

//get documents from the collection. Limited by data sent in the POST request
router.post("/get-data", (req, res)=> {
    Comments.find({}, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send(data);
      }
    }).limit(req.body.limitNum);
})

//User create comment from Top comment box
router.post("/new-comment", (req, res)=> {
  let messageData = req.body.messageData

  new Comments({
    user: 'Super Franklin',
    message: messageData,
    likes: 0,
    editable: true,
    replies: []
  }).save()
  //Send back empty data so we can use promise
  res.send('')
})

//Intersection Observer wants more data
router.post("/get-more-data", (req, res)=> {
  let commentIncrement = req.body.commentIncrement;

  Comments.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send(data);
    }
  }).skip(commentIncrement).limit(10)
})

//User creates a new comment from Sub Box
router.post("/new-sub-comment", (req, res) => {
  let messageData = req.body.messageData;
  let messageId = req.body.messageId
  //Create new Subdata based on data POSTED
  const newSubMessage = {
    user: "Super Franklin",
    message: messageData,
    likes: 0
  }
  Comments.updateOne({_id: messageId}, {$push: {replies: newSubMessage}}, (err, data)=> {
    if (err) {
      console.log(err);
    }
    res.send('')
  })
})

//User update comment
router.post("/update-comment", (req, res)=> {
  let commentId = req.body.commentId

  Comments.findOne({_id: commentId}, (err, data) => {
    if(!err) res.send(data)
  })
})

//User delete comment
router.post("/delete-comment", (req, res)=> {
  let messageId = req.body.messageId

  Comments.deleteOne({_id: messageId}, (err, data) => {
    if(err) console.log(err);
     res.send("");
  })
})

//User delete sub-comment
router.post("/delete-sub-comment", (req, res)=> {
  let messageId = req.body.messageId
  let subId = req.body.subId

  Comments.updateOne({_id: messageId}, {$pull: {replies: {_id: subId}}}, (err, data)=> {
    if(err) console.log(err);
     res.send("");
  })
})

//user liked/unliked
router.post("/update-like", (req, res)=> {
  let messageId = req.body.messageId
  let likes = req.body.likes

  Comments.updateOne({_id: messageId}, {likes: likes}, (err, data)=> {
    if(err) console.log(err);
  })
})

//user liked/unliked sub msgs
router.post("/update-sub-like", (req, res)=> {
  let messageId = req.body.messageId
  let subId = req.body.subId;
  let likes = req.body.likes

  Comments.updateOne({_id: messageId, "replies._id": subId}, {$set: {"replies.$.likes": likes}}, (err, data)=> {
    if(err) console.log(err);
  })
})

module.exports = router;