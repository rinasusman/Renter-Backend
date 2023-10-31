import mongoose from "mongoose";

const categoryModel = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        }
    },
);
const Category = mongoose.model("category", categoryModel);
export default Category;