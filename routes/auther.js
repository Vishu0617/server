const express = require("express");
const router = express.Router();
router.use(express.json());
//it is used to password hash
const bcrypt = require("bcryptjs");
const path = require("path");
//user module
const User = require("../models/user");
//jwt
const jwtoken = require("jsonwebtoken");
//moment
const nodemailer = require("nodemailer");
//file upload
const multer = require("multer");
//middelware
const authenticate = require("../middlewares/authenticate.jsx");
const { verify } = require("crypto");

router.get("/", (req, res) => {
  res.send("Hello World....Server");
});

//file upload
const storeFile = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "C:/Transport Triangle/server/Upload/Admin/");
  },
  filename: (req, res, cb) => {
    const newfilename = Date.now() + path.extname(res.originalname);
    cb(null, newfilename);
  },
});

const adminUpload = multer({ storage: storeFile });

//admin data
router.post("/regi", adminUpload.single("file"), async (req, res) => {
  const { name, email, phone, pwd, cpwd } = req.body;
  const file = req.file;
  // console.log(file.filename)
  if (!name || !email || !phone || !pwd || !cpwd || !file) {
    return res.status(422).json({ error: "Please Field The Reagistration Detail Properly..." });
  }

  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res
        .status(422)
        .json({ error: "This E-mail Alredy Used...Tray Another E-mail..." });
    } else if (pwd != cpwd) {
      return res
        .status(422)
        .json({ error: "Passwrod & Conform Password Note Match..." });
    } else {
      const user = new User({
        name,
        email,
        phone,
        pwd,
        cpwd,
        file: file.filename,
      });

      //password hasing

      //email verification
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Registration For The Transport Triangle",
        html: `<h1>Hello ${name}</h1><hr/>You have successfully registered.!<br/>Your email is :-<b><u>${email}</u></b> <br/> password is :-<b><u>${pwd}</b></u> <br/> Keep save in secure  for the future used......<br/>Thank You For Registration<br><br/><hr/>`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log("Error", error);
        } else {
          console.log("Your User Name and Password Send in Your E-mail...!!!");
          return res.status(201).json({
            emailMessage: "Your User Name and Password Send in Your E-mail...!!!",
          });
        }
      });

      await user.save();
      return res.status(201).json({
        message: `Dear, ${name} You Have  Successfuly Registration....Youre User Name and Password Sent to Your Mail...!!!`,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Server Error..." });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    let token;
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      return res.status(400).json({ error: "Please Field The Login Detail Properly..." });
    }

    const userLogin = await User.findOne({ email: email });
    // email cheack
    if (userLogin) {
      //password check
      const isMatch = await bcrypt.compare(pwd, userLogin.pwd);

      token = await userLogin.generateAuthToken();
      // console.log(token)

       res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });

      if (!isMatch) {
        return res.status(400).json({ error: "Password Note Match" });
      } else {
        const { pwd, cpwd, ...data } = userLogin._doc;
        return  res.status(200).json({
          message: ` Welcome, Mr/Ms ${userLogin.name} You Have Successfuly Login..`,
          token,
          data,
        });
      }
    } else {
      return res.status(400).json({ error: "Youre E-mail is Wrong..." });
    }
  } catch (error) {
    console.log(error);
  }
});

//fetch data
router.get("/fetchAdmin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findById({ _id: id });
    return res.status(200).json({ count: data.lenght, data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

//forget password
router.post("/sendLink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;
  if (!email) {
   return res.status(401).json({ error: "Please Field The Input Detail Properly... " });
  }

  try {
    //email config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const userFind = await User.findOne({ email: email });

    //tokent genrate for reset password
    const token = jwtoken.sign({ _id: userFind }, process.env.SECRET_KEY, {
      expiresIn: 300000,
    });
    // console.log(token)

    //store token in database
    const setUserToken = await User.findByIdAndUpdate(
      { _id: userFind._id },
      { verify: token },
      { new: true }
    );
    console.log(setUserToken);

    if (setUserToken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset E-mail",
        text: `this link valid in 2 minits http://localhost:3000/AdminComponent/PasswordReset/PasswordReset/${userFind._id}`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return  res.status(401).json({ error: "Somthing Went Wrong" });
        } else {
          console.log("Password Re-set Link send Successfuly to Youre E-mail...");
          return res.status(201).json({
            message: "Password Re-set Link send Successfuly to Youre E-mail... ",
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "invalid user" });
  }
});

//veryfiy user for forget password
router.get("/findId/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
   
  if(!id){
   return res.status(401).json({ error: "Please Field The Input Detail Properly... " });
  }

  try {
    //veryfy user
    const userValid = await User.findOne({ _id: id });
    console.log(userValid);

    if (userValid) {
      return res.status(201).json({ userValid });
    } else {
      return res.status(401).json({ message: "You Are Note A User..!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
    ;

  }
});

//password update
router.put("/updatePwd/:id", async (req, res) => {
  const { id } = req.params;
  const { pwd } = req.body;
  console.log(id, pwd);

  if(!pwd){
   return res.status(401).json({ error: "Please Field The Input Detail Properly... " });
  }

  try {
    //veryfiy user
    const userValid = await User.findOne({ _id: id });
    // console.log(userValid);

    if (!userValid) {
      return res.status(401).json({ error: "You Are Note A User..!!" });
    } else {
      //password update
      const pwdHash = await bcrypt.hash(pwd, 12);
      const newUser = await User.findByIdAndUpdate(
        { _id: id },
        { pwd: pwdHash }
      );
      console.log(newUser);

      return res
        .status(201)
        .json({ message: "Youre New Password Successfully Update", data: newUser });
    }
  } catch (error) {
    console.log(error);
       return res.status(500).json({ error: "server error" });

  }
});

//admin update
router.put("/adminUpdate/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const data = await User.updateOne({ id:id},{name:name},{email:email},{phone:phone});

    return res.status(200).json({
      message: "Youre Data Successfully Update",
      success: true,
      count: data.length,
      data: data.name,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

//admin change profile
const ustoreFile = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "C:/Transport Triangle/server/Upload/Admin/");
  },
  filename: (req, res, cb) => {
    const newfilename = Date.now() + path.extname(res.originalname);
    cb(null, newfilename);
  },
});

const uadminUpload = multer({ storage: ustoreFile });

router.put("/changeProfile/:id",uadminUpload.single("file"), async (req,res)=>{
  // const {id}=req.params;
  try {
    const data =await User.findByIdAndUpdate(
      { _id:req.params.id },
      { 
        $set:{file:req.file.filename},
      },
      {upsert:true},
    )
    console.log("Profile Update success");
    return res.status(200).json({
      message: "Profile Update success",
      count: data.length,
      data: data.filename,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
})

//logout
router.get("/logout", (req, res) => {
  console.log("you are logout successfully....");
  res.clearCookie("jwtoken", { path: "/" });
  return res.status(200).json({ message: "you are logout successfully...." });
});

module.exports = router;
