const dotenv = require("dotenv")
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const Post = require("./models/Post")
// const socketIO = require("socket.io");
// const io = socketIO();

const app = express();

const http = require("http")
const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer);
// const io = require("socket.io")(http, {
//   handlePreflightRequest: (req, res) => {
//     const headers = {
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
//       "Access-Control-Allow-Credentials": true,
//     };
//     res.writeHead(200, headers);
//     res.end();
//   },
// });
// 
dotenv.config();

const path = require("path");

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

//Configs
app.use(
  cors()
);
app.use(cookieParser())

// Static folder
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (req, res) => {
  if (req.cookies.post_view) {
    console.log("The 'myCookie' cookie is present");
    // The 'myCookie' cookie is present
  } else {
    console.log("The 'myCookie' cookie is not present");
    // The 'myCookie' cookie is not present
  }
  res.send('API running')
});

//Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "images")
    }, filename:(req,file,cb)=> {
        cb(null, req.body.name)
    }
})

const upload = multer({storage: storage})
app.post("/api/upload", upload.single("commentImg"), (req, res) => {
  res.status(200).json("File uploaded");
});

app.use("/api/auth", require("./routes/user.js"));
app.use("/api/posts", require("./routes/posts.js"));
app.use("/api/likes", require("./routes/likes.js"));

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

app.post('/checkout', (req, res, next)=> {
    const line_items = req.body.line_items;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const shippingname = req.body.name;
    const shippingstreet = req.body.street;
    const shippingtown_city = req.body.town_city;
    const shippingcounty_state = req.body.county_state;
    const shippingpostal_zip_code = req.body.postal_zip_code;
    const shippingcountry = req.body.country;
    // const fulfillment = req.body.fulfillment.shipping_method;

    const content = `${firstname} ${lastname} \n\n 
    email: ${email} \n\n line_items: ${line_items} \n\n 
    shipping street: ${shippingstreet} \n\n ${shippingtown_city} \n\n ${shippingpostal_zip_code} \n\n 
    shipping street: ${shippingcounty_state} \n\n ${shippingcountry} \n\n 
    shipping name: ${shippingname}`;

    const mailOption = {
      from: email,
      to: "ezeyimf@gmail.com",
      subject: `New message from 'PayStack & Commerce js' via  Contact Page`,
      text: content,
      // html: `${name} from ${company} <noreply@${name}.com> <br /> ${phone} <br /> ${location} <br /> ${message}`
    };

    transporter.sendMail(mailOption, (err, data)=> {
        if (err) {
            res.json({ status: err })
            console.log(err);
        }else{
            res.json({status: "success"})
            // console.log("Email Sent" + data.response);
        }
    })

})

app.post('/api/contact/', (req, res, next)=> {
    const name = req.body.name;
    const email = req.body.email;
    const location = req.body.location;
    const message = req.body.message;

    const content = `${name} from ${location} \n\n name: ${name} \n\n email: ${email} \n\n location: ${location} \n\n message: ${message}`;

    const mailOption = {
      from: email,
      to: "ezeyimf@gmail.com",
      subject: `New message from ${name} via Your React Website Contact Page`,
      text: content,
      // html: `${name} from ${company} <noreply@${name}.com> <br /> ${phone} <br /> ${location} <br /> ${message}`
    };

    transporter.sendMail(mailOption, (err, data)=> {
        if (err) {
            res.json({ status: err })
            console.log(err);
        }else{
            res.json({status: "success"})
            console.log("Email Sent" + data.response);
        }
    })

  })
  
  // io.on('connect', socket => {
  //   console.log(socket);
  //   });

  httpServer.listen(5000);

    io.on('connect', (socket) => {
  console.log('A client connected');

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});
    
    app.post("/api/posts/:id/my_comments", (req, res) => {
      Post.findByIdAndUpdate(
        req.params.id,
        {
          $push: { comments: req.body },
        },
        { new: true }, // Return the updated document
        (error, post) => {
          res.json(post.comments[post.comments.length - 1]);
          // Send a message to the WebSocket server
          io.emit("new comment", post.comments[post.comments.length - 1]);
        }
      );
    });
// Set up WebSocket server
// const io = socketIO(db);

const CONNECTION_URL = process.env.MONGO_URI;
const PORT = process.env.EPORT || 5000;

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Server listening on port ${PORT}`))
  .catch((error) => console.log(`${error} did not connect`));
// http.listen(5000, () => {
//   console.log("WebSocket server listening on port 5000");
// });
 module.exports = app