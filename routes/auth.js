
import express from "express";
import { tokenVerify } from "../middleware/token.js";
import { loginUser,registerUser} from "../Controllers/auth.js";

const router=express.Router();




// Google Callback Route
router.post(
	"/login",tokenVerify,loginUser
);
router.post(
	"/register",
	tokenVerify,
	registerUser
);


export default router;