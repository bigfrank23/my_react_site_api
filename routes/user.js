const router = require("express").Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const mongoose = require("mongoose");

const User = require('../models/User')


router.post("/signin", async(req, res) =>{
    // const {email, password} = req.body

    try {
        const existingUser = await User.findOne({email: req.body.email})
        if(!existingUser) return res.status(404).json({message: "User does not exist"})

        const isPasswordCorrect = await bcrypt.compare(req.body.password, existingUser.password)
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid Credentials"})

        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, 'test', {expiresIn: "1h"})

        // const email = existingUser._doc.email
        // const pass = existingUser._doc.password
        // const newId = existingUser._doc._id

        // const data = {newEmail, newId}

        const {  password, profilePic , ...others } = existingUser._doc;

        res.status(200).json({result:  others, token})
    } catch (error) {
        res.status(500).json({ message: "Something went wrong. That's all we know"});
        console.log(error);
    }

}) 

router.post("/signup", async(req, res) =>{
    const {firstName, lastName, email, password, confirmPassword} = req.body;

    try {
        const existingUser = await User.findOne({email})
        if(existingUser) return res.status(400).json({message: "User Already Exist"})

        if(password !== confirmPassword) return res.status(400).json({message: "Password don't match"})

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await User.create({email, password: hashedPassword, firstName, lastName})

        const token = jwt.sign({email: result.email, id: result._id}, 'test', {expiresIn: "1h"})

        res.status(200).json({ result , token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong. That's all we know"});
        console.log(error);
    }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/:id", async (req, res) => {
  // if (!mongoose.Types.ObjectId.isValid(id)) return false;
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
    // console.log(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/find:id", async (req, res) => {
  // if (!mongoose.Types.ObjectId.isValid(id)) return false;
  try {
    const existingUser = await User.findOne(req.body.userId)
    res.status(200).json(existingUser);
    // console.log(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
