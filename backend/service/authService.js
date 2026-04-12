import { PrismaClient, Role } from "@prisma/client";
import jwt from 'jsonwebtoken'
import transporter from "../config/emailConfig.js";
import jwtSecretKey from "../config/jwtConfig.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from 'bcrypt'


const prisma = new PrismaClient();
 const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const isPresent = async (email) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    console.log(user)
    if(user){
        return true;
    }
    return false;
};

export const saveUser = async (email, password) => {
    return await prisma.user.create({
        data: {
            email,
            password,
            provider: "local",
            isVerified : false,
            role: Role.USER
        }
    });
};

export const googleSave = async (email)=>{

    
    return await prisma.user.create({
        data: {
            email,
            password:"",
            provider: "google",
            isVerified : true,
            role: Role.USER
        }
    });
}

export const passwordEncrypt=async (password)=>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword)
    return hashedPassword;
}

export const getUser=async (email)=>{
    return prisma.user.findUniqueOrThrow({
        where :{
            email: email
        }
    })
}

export const sendMailfun=async (receiverMail)=>{
        let data={
    time : Date(),
    email : receiverMail,
}    
    
    const token=jwt.sign(data,jwtSecretKey,{
        expiresIn: "15m"
    })
    
    const mailOptions={
        from : process.env.MailService,
        to   :  receiverMail,
        subject : "Email Verification",
        text    : `click to verify ----${process.env.FRONTENDURL}/verify?token=${token}`
    }
    
    await transporter.sendMail(mailOptions);  
    return
} 

export const verifyToken = async (token, res) => {
  try {
    
    const decoded = jwt.verify(token, jwtSecretKey);
    console.log(decoded)
    if (!decoded.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const email = decoded.email;

  
    const user = await getUser(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

  
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

  
    
    await prisma.user.update({
      where: {
        email: email
      },
      data: {
        isVerified: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Verification error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const verify= async (token,res)=>{
   
    const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID, // MUST match
  });

  const payload=ticket.getPayload();

  if(!payload.email_verified)
  {
    return res.error;
  }

  return payload.email;

}

export const generateAccessToken =async (userId,role)=>{
    const accessToken = jwt.sign({userId,role}, jwtSecretKey, { expiresIn: "15m" });
    return accessToken;
}

export const generateRefreshToken = async (userId)=>{
    const refreshToken = jwt.sign({userId}, jwtSecretKey, { expiresIn: "7d" });
    return refreshToken;
}

export const setAccessTokenCookie = (res, accessToken) => {
    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    partitioned: true,
    maxAge: 15 * 60 * 1000
});
}

export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None", 
    partitioned: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
});
}

export const getUserViaId =(userId)=>{
  return prisma.user.findUnique({
    where :{
      id :userId
    }
  })
}

export const getUserEmail = (id) =>{
  return prisma.user.findUnique({
    where : {
      id : id
    },
    select : {
      email :true
    }
  })
}