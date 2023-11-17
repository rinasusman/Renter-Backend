import mongoose from "mongoose";

const bookingModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: true,
        },
        item: [{
            home: {
                type: mongoose.Types.ObjectId,
                ref: 'home',
                required: true,
            }
        }],
        totalPrice: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,

        },
        endtDate: {
            type: Date,
            required: true,
        },
        bookingDate: {
            type: Date,
            default: Date.now()
        },
        paymentType: {
            type: String,
        },
        status: {
            type: String,
            default: "Booked"
        },
    },
);
const Booking = mongoose.model("booking", bookingModel);
export default Booking;