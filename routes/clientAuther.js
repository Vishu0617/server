const express = require("express");
const router = express.Router();
router.use(express.json());
//it is used to password hash
const bcrypt = require("bcryptjs");
const path = require("path");
//cookie-parser
const cookieparser=require('cookie-parser')
//user module
const Client = require("../models/client");
//client payment
const ClientPayment = require("../models/clientPayment");
//client otp
//clientmessge
const contectMessage = require("../models/ContectDetail");
//vehicale
const Vehicale = require("../models/vehicale");
// booking vehical
const BookingVehicale=require("../models/VehicaleBooking")
//goods
const Goods = require("../models/goods");
//feedback
const FeedBack = require("../models/Feedback");
// CLientFeedback
const CLientFeedback = require("../models/ClientFeedback");
//jwt
const jwtoken = require("jsonwebtoken");
//nodemailer
const nodemailer = require("nodemailer");
//file upload
const multer = require("multer");



//register
const clientFile = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "C:/Transport Triangle/server/Upload/User/");
  },
  filename: (req, res, cb) => {
    const clientNewFile = Date.now() + path.extname(res.originalname);
    cb(null, clientNewFile);
  },
});

const clientUpload = multer({ storage: clientFile });

router.post("/clientRegi", clientUpload.single("file"), async (req, res) => {
  const { name, email, phone, pwd, cpwd } = req.body;
  const file = req.file;
  // console.log(req.body);
  // console.log(req.file.originalname)
  if (!name || !email || !phone || !pwd || !cpwd || !file) {
    return res.status(422).json({ error: "Please Field The Reagistration Detail" });
  }

  try {
    const clientExit = await Client.findOne({ email: email });
    if (clientExit) {
      return res
        .status(422)
        .json({ error: "This E-mail Alredy Used..Tray Another E-mail...." });
    } else if (pwd != pwd) {
      return res
        .status(4200)
        .json({ error: "Password & Conform Password Dosen't Match ..." });
    } else {
      const client = new Client({
        name,
        email,
        phone,
        pwd,
        cpwd,
        file: file.filename,
      });

      //password hashing

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
        subject: "Registration For The Transport Triangle Client Side",
        html: `<h1>Hello ${name}</h1><hr/>You have successfully registered.!<br/>Your email is :-<b><u>${email}</u></b> <br/> password is :-<b><u>${pwd}</b></u> <br/> Keep save in secure  for the future used......<br/>Thank You For Registration<br><br/><hr/>`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log(error);
          return res.status(400).json({ error: "Server Error...Please Chak Youre Internet " });
        } else {
          console.log("Your User Name and Password Send in Your E-mail...!!!");
          return res.status(201).json({
            emailMessage: "Your User Name and Password Send in Your E-mail...!!!",
          });
        }
      });

      await client.save();
      return res.status(201).json({
        message: ` Dear, ${name} you have successfuly register.......Youre User Name and Password Sent to Your Mail...!!!`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Server Error..." });
  }
});

//login
router.post("/clientLogin", async (req, res) => {
  try {
    let token;
    const { email, pwd } = req.body;
    console.log(req.body);
    if (!email || !pwd) {
      return res.status(400).json({ error: "Please Field The Login Detail" });
    }

    const clientFind = await Client.findOne({ email: email });
    //check email alredy used or note
    if (clientFind) {
      const isMatch = await bcrypt.compare(pwd, clientFind.pwd);

      token = await clientFind.generateAuthToken();
      console.log(token);

      res.cookie("clientJWToken", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });
      //password compare
      if (!isMatch) {
        return res.status(400).json({ error: "Password Note Match" });
      } else {
        const { pwd, cpwd, ...data } = clientFind._doc;
        res.status(200).json({
          message: ` Welcome Dear,${clientFind.name} you have Successfuly login..`,
          data,
        });
      }
    } else {
      return res.status(400).json({ error: "Youre E-mail is Wrong..." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//password new update
router.put("/clientPwdUpdate/:id", async (req, res) => {
  const { id } = req.params;
  const { pwd } = req.body;
  console.log(id, pwd);

  if (!pwd) {
    return res.status(400).json({ error: "Please Genrate New Password.." });
  }

  try {
    const clietnValid = await Client.findById({ _id: id });
    if (!clietnValid) {
      return res.status(401).json({ message: "You Are Note A User" });
    } else {
      const clienPwdHash = await bcrypt.hash(pwd, 12);
      const newClientPwd = await Client.findByIdAndUpdate(
        { _id: id },
        { pwd: clienPwdHash }
      );
      console.log(newClientPwd);
      return res
        .status(201)
        .json({ message: "Youre Password Successfully Updated", data: newClientPwd });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Server Error..." });
  }
});

router.get("/fetchData/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  try {
    const data = await Client.findById({ _id: id });

    return res
      .status(200)
      .json({ success: true, count: data.lenght, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/fetachAll", async (req, res) => {
  try {
    const data = await Client.find();
    // console.log(data)
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

const uclientFile = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "C:/Transport Triangle/server/Upload/User/");
  },
  filename: (req, res, cb) => {
    const clientNewFile = Date.now() + path.extname(res.originalname);
    cb(null, clientNewFile);
  },
});

const uclientUpload = multer({ storage: uclientFile });
//file upload
router.put(  "/fileUpload/:id",uclientUpload.single("file"),async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    // console.log(id,file)
    try {
      const data = Client.findOneAndReplace({_id:id},{file:file.filename});

      console.log("Profile Update success",data)
      return res.status(200).json({
        message: "Profile Update success",
        success: true,
        count: data.length,
        data: data.name,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  }
);

//update data
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const data = await Client.updateOne(
      { name: name },
      { email: email },
      { phone: phone }
    );

    return res.status(200).json({
      message: "Youre Data Update Successfully",
      success: true,
      count: data.length,
      data: data.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//delete client
router.delete("/deleteClient/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const data = await Client.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "This Data Delete Permanenent", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//update userpresnal feedback
router.post("/persnalfeedback/:id", async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const current = new Date();
  const time = `${current.getHours()}:${current.getUTCMinutes()}`;
  const ndate = `${current.getDate()}-${
    current.getMonth() + 1
  }-${current.getFullYear()}`;
  console.log(id, feedback);

  //utc time zone
  // const utcTime = new Date('2023-03-10T12:00:00Z');
  // indiaTime = new Date(utcTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  // console.log(indiaTime);
  if(!feedback){
    return res.status(400).json({ error: "Please Field The Input Detail" });
  }
  try {
    const data = new CLientFeedback({
      feedback,
      date: ndate,
      time: time,
      client: id,
    });

    await data.save();

    return res.status(201).json({
      message: `Thank You For Youre Feedback`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//fetch persnal feedback
router.get("/getPersnalFeedback/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await CLientFeedback.find({ client: id });
    return res.status(200).json({
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//add vehicale
router.post("/addVehicale/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, demail,vname, vnumber, capacity, slocation, dlocation } = req.body;
  // console.log(req.body,id)
  if (!name || !phone ||  !phone || !vname || !vnumber || !capacity || !slocation || !dlocation) {
    return res.status(422).json({ error: "Please Field The Input Detail" });
  }
  try {
    const addVehicale = new Vehicale({name,phone,demail,vname,vnumber,capacity,slocation,dlocation,client: id});
    await addVehicale.save();
    return res.status(201).json({message: `Youre Vehicale Added Success...`, data: addVehicale});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//fetch persnal vehicale
router.get("/fetchSingleVehicale/:id", async (req, res) => {
  const clientid = req.params.id;
  // console.log(clientid);
  try {
    if (clientid) {
      const data = await Vehicale.find({ client: clientid });
      return res.status(200).json({
        success: true,
        count: data.length,
        data: data,
      });
    } else {
      return res
        .status(500)
        .json({ error: "You Have Note Add Youre Vehicale" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

//fetch vehicale
router.get("/fetchVehicacle", async (req, res) => {
  try {
    const data = await Vehicale.find();
    // console.log(data)
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//vehicale delete
router.delete("/vehicaleDelete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Vehicale.findByIdAndDelete({ _id: id });
    return res
      .status(200)
      .json({ message: "This Vehicale Delete Permanently", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//add goods
router.post("/addgoods/:id", async (req, res) => {
  const { id } = req.params;
  const { spoint, dname, cphone, date, km, price, descr, status } = req.body;

  if(!spoint || !dname || !cphone || !date || !km || !price || !descr){
    return res.status(422).json({ error: "Please Field The Input Detail..." });
  }

  try {
    const data = Goods({
      spoint,
      dname,
      cphone,
      date,
      km,
      price,
      descr,
      status,
      client: id,
    });

    await data.save();
    return res.status(201).json({
      message: `Youre Data Update Success`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//fetch good by client id
router.get("/fetchgoods/:id", async (req, res) => {
  const clientid = req.params.id;
  // console.log(clientid);
  try {
    if (clientid) {
      const data = await Goods.find({ client: clientid });
      return res.status(200).json({
        success: true,
        count: data.length,
        data: data,
      });
    } else {
      return res.status(500).json({ error: "Somthng error" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

//goods fetch
router.get("/fetchgoodsAll", async (req, res) => {
  try {
    const data = await Goods.find().populate("client", {
      name: 1,
      email: 1,
      file: 1,
      phone: 1,
    });
    return res.status(200).json({
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//delete goods
router.delete("/goodsDelete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Goods.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "This Transection Delete Permanently", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//edit goods status
router.get("/editStatus/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const data = await Goods.findById({ _id: id });
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

//edit goods status
router.put("/statusUpdate/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const data = await Goods.findByIdAndUpdate({ _id: id }, { status: status });

    return res.status(200).json({
      message: "Youre Data Update success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//client contect
router.post("/clientMessage", async (req, res) => {
  const { cname, cemail, cphone, address, msg } = req.body;
  console.log(req.body);

  if (!cname || !cemail || !cphone || !address || !msg) {
    return res.status(422).json({ error: "Please Field The Input Data ..." });
  }

  try {
    const clientData = new contectMessage({
      cname,
      cemail,
      cphone,
      address,
      msg,
    });

    await clientData.save();

    return res.status(201).json({
      message: `Thank you for youre suggestion`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//CLIENT MESSAGE FETCH
router.get("/messageFetch", async (req, res) => {
  try {
    const data = await contectMessage.find();
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//CLIENT MESSAGE DELETE
router.delete("/messageDelete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await contectMessage.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "This Message Delete Permanently", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//client feedback
router.post("/feedback/:id", async (req, res) => {
  const { id } = req.params;
  const { fbphone, fbemail, fbmessage } = req.body;
  console.log(req.params, req.body);

  if(!fbphone || !fbemail || !fbmessage){
    return res.status(422).json({ error: "Please Field The Input Data..." });
  }

  try {
    const data = new FeedBack({
      fbphone,
      fbemail,
      fbmessage,
      client: id,
    });
    await data.save();
    return res.status(201).json({
      message: `Thank you...for youre feedback `,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//fetch feedback
router.get("/fetchFeedback", async (req, res) => {
  try {
    const data = await FeedBack.find({}).populate("client", {
      name: 1,
      file: 1,
    });
    return res.status(200).json({
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

// delete feedback
router.delete("/deleteFeedback/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const data = await FeedBack.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "This Data Delete Permanently", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//forget passwor..........................
//send link on email
router.post("/userSendLink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;
  if (!email) {
    return res.status(401).json({ error: "Please Field The Input Data" });
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

    const clientFind = await Client.findOne({ email: email });

    const token = jwtoken.sign({ _id: clientFind }, process.env.SECRET_KEY, {
      expiresIn: 300000,
    });
    // console.log(token);

    const setClientToken = await Client.findByIdAndUpdate(
      { _id: clientFind._id },
      { verify: token },
      { new: true }
    );
    // console.log(setClientToken);

    if (setClientToken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Email Reset password",
        text: `this link valid in 2 minits http://localhost:3000/UserComponent/FoorgetPassword/UserResetPassword/${clientFind._id}`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          res.status(401).json({ error: "email note send" });
        } else {
          console.log("Password reset link send successfuly to youre email...");
          res.status(201).json({
            message: "Password reset link send successfuly to youre email... ",
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "invalid user" });
  }
});

//veryfy user
router.get("/userFind/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const clientValid = await Client.findById({ _id: id });
    // console.log(clientValid)

    if (clientValid) {
      return res.status(201).json({ clientValid });
    } else {
      return res.status(401).json({ message: "User Note Exist...." });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "invalid user" });
  }
});

//client payment
router.post("/clientPayment/:id/:pri/:email/:tid", async (req, res) => {
  const { id, pri, email, tid } = req.params;
  console.log(pri, email, id);
  const { cname, cnumber, exptime, cvv } = req.body;
  console.log(req.params, req.body);

  const current = new Date();
  const ndate = `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`;
  //  const time=`${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}`;

  if (!cname || !cnumber || !exptime || !cvv) {
    return res.status(422).json({ error: "Please Field The Payment Detail" });
  }
  try {
    const clientFind = await Client.findOne({ email: email });
    if (clientFind) {
      const OTP = Math.floor(100000 + Math.random() * 900000);

      const savePaymentData = new ClientPayment({
        cname,
        cnumber,
        exptime,
        cvv,
        email,
        date: ndate,
        otp: OTP,
        amount: pri,
        client: id,
        productId: tid,
      });
      await savePaymentData.save();

      await Goods.findByIdAndUpdate(
        { _id: tid },
        {
          $set: { paymentStatus: "Paid" },
        }
      );
      //send otp via email
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
        subject: "Payment Verification code ",
        text: `The OTP is :-${OTP}. This is one time verification code do note sher it anywhere`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log(error);
          return res.status(400).json({ error: "Server Error...Please Chak Youre Internet " });
        } else {
          console.log("Cheack youre email...sent a otp");
          return res.status(200).json({ message: "Cheack youre email...sent a otp " });
        }
      });
    } else {
      return res
        .status(422)
        .json({ error: "Plz Re-Login...!!" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Server Error..." });
  }
});

//otp vwrification
router.post("/clientOtpVerification/:id", async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;
  console.log(otp, id);

  if (!otp) {
      return res.status(400).json({ error: "Please Field The Input Data ..." });
  }
  try {
    const findOtp = await ClientPayment.findOne({ otp: otp });
    if (!findOtp) {
      return res.status(400).json({ error: "Enter OTP is wrong" });
    } else {
      return res.status(200).json({ message: `Youre Payment Suucess...`, data: findOtp });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//payment history
router.get("/paymentHistory/:id", async (req, res) => {
  const cid = req.params.id;
  try {
    const paymentData = await ClientPayment.find({ client: cid });
    if (!paymentData) {
      return res.status(401).json({ message: "Payment Pending" });
    } else {
      return res.status(200).json({
        message: "payment success",
        count: paymentData.length,
        data: paymentData,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//payment history fetch all
router.get("/paymentHistoryAll", async (req, res) => {
  try {
    const paymentData = await ClientPayment.find().populate("client", {
      name: 1,
      phone: 1,
    });
    return res.status(200).json({
      count: paymentData.length,
      data: paymentData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//payment history clear
router.delete("/paymentRemove/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await ClientPayment.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "Remove Transection Permanently", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//booking vehicale
router.post("/vehicaleBook",async(req,res)=>{
  const vid=req.body.vid;
  const id=req.body.id;
  const demail=req.body.demail
  const address= req.body.address

  const current = new Date();
  const ndate = `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`;

  if(!address){
    return res.status(422).json({ error: "Please Field The Input Data..." });
  }
  
  console.log("vehicale id"+vid,"user id"+id,address)
  try {

    const data=new BookingVehicale({client:id,vehicaleId:vid,date:ndate,address})
    
    await data.save();
    //send otp via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: demail,
      subject: "Vehicale Booking",
      html: `<h3>youre vehicale has been successfuly booking as soon as come into below address:<h3>
               
               <h4>The Location is : <u><b> ${address} </b></u> <h4>
              <p></p>
               Thank you..`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        res.status(400).json({ error: "email note send" });
      } else {
        console.log("Now, You Have Conform Booking This Vehicale");
        res.status(200).json({ message: "Now, You Have Conform Booking This Vehicale" });
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }

})

module.exports = router;
