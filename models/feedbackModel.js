import mongoose from "mongoose";

const feedbackModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: true,
        },

        homeId: {
            type: mongoose.Types.ObjectId,
            ref: 'home',
            required: true,
        },

        star: {
            type: String,
            required: true,
        },
        feedback: {
            type: String,
            required: true,
        },

    },
);
const Feedback = mongoose.model("feedback", feedbackModel);
export default Feedback;