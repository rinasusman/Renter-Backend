import bcrypt from 'bcrypt'
import User from '../models/userSchema.js'
import nodemailer from 'nodemailer';
import { generateAuthToken } from '../middleware/auth.js';


let saveOtp;
let name;
let email;
let password;
let otpcreated;

function generateOTP() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp
}

export const SendOtp = async (req, res) => {
  console.log("Received a request to /sendotp");
  try {

    const emailExist = await User.findOne({ email: req.body.email ? req.body.email : email });
    if (!emailExist) {
      if (!saveOtp) {
        let generatedOtp = generateOTP();
        saveOtp = generatedOtp;
        otpcreated = Date.now()
        name = req.body.name ? req.body.name : name;
        email = req.body.email ? req.body.email : email;
        password = req.body.password ? req.body.password : password;
        setTimeout(() => {
          saveOtp = null;
        }, 120 * 1000);
        const result = await sendOtpMail(email, saveOtp);
        res.json(result)

      }
    } else {
      res
        .status(400)
        .json({ error: "Userdata already exists" })

    }
  } catch (error) {
    console.log(error);
    res.status(500)
      .json({ success: false, message: "Something error happened" })
  }
};


async function sendOtpMail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shoeme442@gmail.com',
        pass: 'tnrhkkmrxhkxzifo'
      }
    });
    const mailOptions = {
      from: 'shoeme442@gmail.com',
      to: email,
      subject: 'Your OTP for user verification',
      text: `Your OTP is ${otp}. Please enter this code to verify your account.`
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.log('Error sending email:', error);
  }
}

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}



export const verifyOTP = async (req, res) => {

  const otp = req.body.otp;

  if (otp === saveOtp) {
    const securedPassword = await securePassword(password);
    User.create({
      name: name,
      email: email,
      password: securedPassword,

    });

    res.json({ success: true, message: "Account Created Successfully" });
  } else {
    res.status(400).json({ success: false, message: "Incorrect OTP" })
  }

}

export const LoginUser = async (req, res, next) => {
  let userSignUp = {
    Status: false,
    message: null,
    token: null,
    name: null,
  };


  try {
    const { email, password } = req.body.data;

    const userExist = await User.findOne({ email });
    console.log(userExist.status, "stattussssssss")
    if (userExist) {
      const isMatch = await bcrypt.compare(password, userExist.password);
      if (isMatch === true && userExist.status) {
        const token = generateAuthToken(userExist);
        const name = userExist.name;
        userSignUp.Status = true;
        userSignUp.message = "You are logged";
        userSignUp.token = token;
        userSignUp.name = userExist.name;
        console.log(token, "toooooooooooooooooooo")
        const obj = {
          token,
          name,
        };

        res.cookie("jwt", obj, {
          httpOnly: false,
        })
          .status(200)
          .send({ userSignUp });

      } else {
        userSignUp.Status = false;
        userSignUp.message = "Please enter correct Password";
        res.send({ userSignUp });
      }
    } else {
      userSignUp.Status = false;
      userSignUp.message = "Please enter correct Email";
      res.send({ userSignUp });
    }

  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }

};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
