const router = require("express").Router();
const Likes = require("../models/Likes");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

router.post('/', async(req, res)=>{
    try {
        const likeResult = await Likes.findByIdAndUpdate(
          { _id: ObjectId("5f5f5f5f5f5f5f5f5f5f5f5f") },
          { $inc: { likes: 1 } },
          { new: true, upsert: true }
        );
        res.json(likeResult)
    } catch (error) {
        console.log(error);
    }
})

router.get('/', async(req,res)=>{
    try{
        const likeRes = await Likes.find()
        res.json(likeRes)
    }catch(error){
        console.log(error)
    }
})

module.exports = router;