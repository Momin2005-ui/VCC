import express from 'express'

import {login,refresh,register, sendMail, verifyEmailToken,verifyGoogleToken,whoAmI} from "../controller/authController.js"

const router =express.Router();

router.post("/login",login);
router.post("/register",register);
router.post("/sendEmail",sendMail);
router.post("/verify",verifyEmailToken)
router.get("/me",whoAmI)
router.post("/refresh",refresh)
router.post("/google",verifyGoogleToken)

export default router;