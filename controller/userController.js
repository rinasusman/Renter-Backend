import bcrypt from 'bcrypt'
import User from '../models/userSchema.js'
import nodemailer from 'nodemailer';
import { generateAuthToken } from '../middleware/auth.js';
import Home from '../models/homeModel.js';
import Favorites from '../models/favoritesModel.js';
import Booking from '../models/bookingModel.js';



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


export const ForgotSendOtp = async (req, res) => {
  console.log("Received a request to /sendotp");
  try {

    const emailExist = await User.findOne({ email: req.body.email ? req.body.email : email });
    if (emailExist) {
      if (!saveOtp) {
        let generatedOtp = generateOTP();
        saveOtp = generatedOtp;
        otpcreated = Date.now()
        email = req.body.email ? req.body.email : email;
        setTimeout(() => {
          saveOtp = null;
        }, 120 * 1000);
        const result = await sendOtpMail(email, saveOtp);
        res.json(result)

      }
    } else {
      res
        .status(400)
        .json({ error: "Userdata does not exists" })

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



export const verifyforgotOTP = async (req, res) => {

  const otp = req.body.otp;

  if (otp === saveOtp) {

    res.json({ success: true, message: " Success" });
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
        userSignUp.message = "Please enter correct Password or Email";
        res.send({ userSignUp });
      }
    } else {
      userSignUp.Status = false;
      userSignUp.message = "User not registered";
      res.send({ userSignUp });
    }

  } catch (error) {
    res.json({ status: "failed", message: "User not registered" });
  }

};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};



export const addHome = async (req, res) => {
  try {
    const { user } = req;
    const {
      category,
      location,
      guestCount,
      roomCount,
      bathroomCount,
      imageSrc,
      title,
      description,
      price,
    } = req.body;

    // Check if a home with the same title already exists
    const existingHome = await Home.findOne({ title: title });

    if (existingHome) {
      return res.status(400).json({ message: 'A home with the same title already exists' });
    }

    // If no existing home with the same title, create and save the new home
    const newHome = new Home({
      userId: user._id,
      category,
      location,
      guestCount,
      roomCount,
      bathroomCount,
      imageSrc,
      title,
      description,
      price,
      status: false,
    });

    await newHome.save();

    // Send a success response
    res.status(201).json({ message: 'Home added successfully' });
  } catch (error) {
    // Handle other errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Failed to add a home' });
  }
};


export const HomeList = async (req, res) => {
  try {
    const category = req.query.category;


    let homeDatas

    if (category) {
      homeDatas = await Home.find({ status: "true", category })
    } else {
      homeDatas = await Home.find({ status: "true" })
    }



    res.json(homeDatas)
  } catch (error) {
    console.log(error);
  }
}


export const SearchHomeList = async (req, res) => {
  try {

    const { location, startDate, endDate, guestCount, roomCount, bathroomCount } = req.query;

    let homeDatas
    if (location || startDate || endDate || guestCount || roomCount || roomCount) {
      const regex = new RegExp(location, 'i')
      homeDatas = await Home.find({ status: "true", location: { $regex: regex }, guestCount: { $gte: guestCount }, roomCount: { $gte: roomCount }, bathroomCount: { $gte: bathroomCount } })
    }
    else {
      homeDatas = await Home.find({ status: "true" })
    }




    res.json(homeDatas)
  } catch (error) {
    console.log(error);
  }
}

export const SingleHomeList = async (req, res) => {

  const itemId = req.params.id;
  console.log(itemId, "itemidddddddddddd")
  try {
    const listing = await Home.findById(itemId).populate('userId');
    console.log(listing, "dattttttttttttttta")
    if (listing) {
      res.status(200).json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}




export const SingleHomeListuser = async (req, res) => {

  const { user } = req;
  console.log(user, "uuuuuuuuuuuuuuuuuuuuu")
  try {
    const listings = await Home.find({
      userId: user._id,
      status: true
    });
    console.log(listings, "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm")
    if (listings) {
      res.status(200).json(listings);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.error('Error fetching home details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



export const DeleteHomeList = async (req, res) => {

  try {
    const listing = await Home.findById(req.params.id);
    console.log(listing, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await Home.deleteOne({ _id: req.params.id })

    res.json({ message: 'Listing deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}



export const ResetPassword = async (req, res) => {

  const password = req.body.password;


  console.log(password, "secureeeeeeeeeeeee")
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    const securedPassword = await securePassword(password);
    User.updateOne({
      email: email
    }, { $set: { password: securedPassword } })


    res.json({ success: true, message: "Password update Successfully" });
  } else {
    res.status(400).json({ success: false, message: "Something wrong" })
  }

}

export const AddFavorites = async (req, res) => {

  const { user } = req;
  const { listingId } = req.body
  console.log(user, "pppppppppppppppppppppp")
  console.log(listingId, "listingidddddddddddddddddddd")
  try {
    const existingFavorite = await Favorites.findOne({ userId: user._id, });
    if (existingFavorite) {
      // Update the existing user's favorites list
      existingFavorite.item.push({ home: listingId });
      await existingFavorite.save();
      res.json({ message: 'Added to favorites' });
    } else {
      // Create a new favorites document for the user
      const newFavorite = new Favorites({
        userId: user._id,
        item: [{ home: listingId }],
      });
      await newFavorite.save();
      res.json({ message: 'Added to favorites' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}


export const RemoveFavorites = async (req, res) => {
  const { listingId } = req.body;
  const { user } = req

  if (!listingId) {
    return res.status(400).json({ error: 'Listing ID is required' });
  }

  try {

    const userFavorites = await Favorites.findOne({ userId: user._id });
    console.log(user._id, "UserId:.............")
    if (!userFavorites) {
      return res.status(404).json({ error: 'User not found in favorites' });
    }


    const index = userFavorites.item.findIndex((item) => item.home.toString() === listingId);

    if (index !== -1) {

      userFavorites.item.splice(index, 1);
      await userFavorites.save();

      return res.status(200).json({ message: 'Listing removed from favorites' });
    } else {
      return res.status(404).json({ error: 'Listing not found in favorites' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}




export const getFavoriteHome = async (req, res) => {
  const { user } = req;
  console.log(user, "user:......");

  try {
    const listings = await Favorites.find({
      userId: user._id,
    }).populate('item.home');
    console.log(listings, "fav:..........");

    if (listings.length > 0) {
      const detailsData = listings.map((favorite) => favorite.item[0].home);
      console.log("data:", detailsData);
      res.status(200).json(detailsData);
    } else {
      res.status(404).json({ message: 'No favorite listings found' });
    }
  } catch (error) {
    console.error('Error fetching home details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



export const bookHome = async (req, res) => {
  try {
    console.log('Request received');
    const { user } = req;
    const {
      startDate,
      endDate,
      totalPrice,
      paymentType,
      homeid
    } = req.body;
    console.log(req.body, "body:");
    const existingBooking = await Booking.findOne({
      'item.home': homeid,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'A home with the same date already booked' });
    }

    // If no existing home with the same title, create and save the new home
    const newBooking = new Booking({
      userId: user._id,
      item: [{ home: homeid }],
      totalPrice: totalPrice,
      startDate: startDate,
      endDate: endDate,
      bookingDate: Date.now(),
      paymentType: paymentType,
      status: "Booked"
    });
    console.log('Before saving the new booking');
    await newBooking.save();
    console.log('After saving the new booking')
    console.log(newBooking, "booking::::")
    // Send a success response
    res.status(201).json({ message: 'Home booked successfully' });
  } catch (error) {
    // Handle other errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Failed to book a home' });
  }
};


export const checkbookHome = async (req, res) => {
  const { startDate, endDate, homeid } = req.body;

  const existingBooking = await Booking.findOne({
    'item.home': homeid,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }

  });
  if (existingBooking) {
    res.json({ isBooked: true });
  } else {
    res.json({ isBooked: false });
  }
}