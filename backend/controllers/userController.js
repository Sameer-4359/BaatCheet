const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const registerUser = async(req,res)=> {
    try{
        let { name, email, password, confirmPassword } = req.body;
        name = name.trim(); //to avoid accidental spaces
        email = email.trim().toLowerCase(); //emails are not case sensitive

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const userExist= await User.findOne({email});
        if(userExist){
            return res.status(409).json({message:"user already exist"})
        }

        //user must enter a strong password
        if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minUppercase: 1 })) {
            return res.status(400).json({ message: "Password must be at least 8 characters long, include a number and an uppercase letter" });
          }


        //double check for password 
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash password
    const salt = await bcrypt.genSalt(10);  //The number 10 is called the salt rounds—higher means more security but takes more time.
    const hashedPassword = await bcrypt.hash(password, salt); //adding this random generated salt to the passord to hash it

    
    const newUser = await User.create({
        name, 
        email ,
        password:hashedPassword,
    });

    if(newUser){
        return res.status(201).json({message:"User Registered sucessfully."})
    }
    else{
        return res.status(400).json({message:"Invalid user data"})
    }

    }
    catch(error){
        return res.status(500).json({message: error.message})
    }
};



const login = async (req,res) => {

    try{
        let {email,password}=req.body
        email=email.trim().toLowerCase()

        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }


        const validUser = await bcrypt.compare(password, user.password);
        if(!validUser){
            return res.status(401).json({message:"Invalid Credentials"})
        }

        // jwt token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
                message:"Login Sucessful",
                token,
                user: { id: user._id, name: user.name, email: user.email }
            });

    } catch (error) {
         return res.status(500).json({message: error.message})

    }

}

module.exports={registerUser,login}