const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended:true }));

app.use(express.static(path.join(__dirname, "..")));

mongoose.connect("mongodb://127.0.0.1:27017/foodwaste")
.then(()=>console.log("MongoDB Connected"))
.catch((error)=>console.log(error));

const donationSchema = new mongoose.Schema({

    foodname:String,
    quantity:String,
    location:String,
    contact:String,
    foodtype:String,
    details:String,
status:{
type:String,
default:"Pending"
}

});

const Donation = mongoose.model("Donation", donationSchema);

// ================= USER SCHEMA =================

const userSchema = new mongoose.Schema({

    name: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    phone: String

});

const User = mongoose.model("User", userSchema);

// ===============================================

app.get("/", (req,res)=>{

    res.sendFile(path.join(__dirname,"..","index.html"));

});



app.post("/donate", async (req,res)=>{

    try{

        console.log(req.body);

        const newDonation = new Donation({

            foodname:req.body.foodname,
            quantity:req.body.quantity,
            location:req.body.location,
            contact:req.body.contact,
            foodtype:req.body.foodtype,
            details:req.body.details

        });

        await newDonation.save();

        console.log("Data Saved");

        res.send("Donation Saved Successfully");

    }

    catch(error){

        console.log(error);

        res.send("Error");

    }

});
// ================= REGISTER =================

app.post("/register", async (req,res)=>{

    try{

        const existingUser = await User.findOne({
            email:req.body.email
        });

        if(existingUser){

            return res.send("Email already registered");

        }

        const newUser = new User({

            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            phone:req.body.phone

        });

        await newUser.save();

        res.send("Registration Successful");

    }

    catch(error){

        console.log(error);

        res.send("Error");

    }

});

// ===========================================
// ================= LOGIN =================

app.post("/login", async (req,res)=>{

    try{

        const user = await User.findOne({

            email:req.body.email,
            password:req.body.password

        });

        if(user){

            res.send("Login Successful");

        }

        else{

            res.send("Invalid Email or Password");

        }

    }

    catch(error){

        console.log(error);

        res.send("Error");

    }

});

// =========================================
app.get("/donations", async (req,res)=>{

    const data = await Donation.find();

    res.json(data);

});

app.delete("/delete/:id", async (req,res)=>{

    await Donation.findByIdAndDelete(req.params.id);

    res.send("Donation Deleted");

});
app.put("/status/:id", async (req,res)=>{

await Donation.findByIdAndUpdate(req.params.id,{

status:req.body.status

});

res.send("Status Updated");

});

app.get("/stats", async (req,res)=>{

const totalDonations = await Donation.countDocuments();

const ngos = 5;

const mealsSaved = totalDonations * 10;

res.json({

donations: totalDonations,

ngos: ngos,


meals: mealsSaved

});

});

app.listen(5000, ()=>{

    console.log("Server Running Successfully");

});