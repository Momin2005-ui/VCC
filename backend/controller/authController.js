import { getUser,getUserViaId,verify,isPresent,passwordEncrypt,saveUser, verifyToken,sendMailfun, googleSave, setAccessTokenCookie, setRefreshTokenCookie,generateAccessToken ,generateRefreshToken, getUserEmail} from "../service/authService.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const register=async (req,res)=>{

 // 1. deconstruct the username,email,password
 // 2. check if user , email,password present if not return
 // 3. check if email is present in db if yes return
 // 4. hash the password before storing in db.
 // 4. register it to db if successfull return role as USER[Always] else return something went wrong

    const {email,password} =req.body;
    console.log(email,password)
    if(!email || !password)
    {
        return res.status(400).json({
            success: false,
            message: "Invalid Email or password"
        })
    }
    
    if(!email.endsWith("@iiitdwd.ac.in"))
    {
        return res.status(400).json({
            success : false,
            message : "Use College Email"
        })
    }

    const isRegistered= await isPresent(email);
    console.log(isRegistered)
    if(isRegistered)
    {
        return res.status(400).json({
            success : false,
            message : "Already Registered"
        })
    }
    
    try {
        console.log("hihihi")
        const hashedPassword= await passwordEncrypt(password)
        console.log(hashedPassword)
        await saveUser(email,hashedPassword);
        return res.status(201).json({
            success :true,
            message : "Successfully created"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something happened try again"
        })
    }

}

export const login=async (req,res)=>{
    
    // 1. user sents email,password,role
    //        --  check if email,password,role is empty
    //        --  search using email find user , check the role
    // 2. takes the password hash it 
    // 3. take the email check the password
    // 4. check user is verified or not
    // 5. if not verified sent email with a signed jwt token  taken care by another endpoint
    // 7. 
    // 4. if user found and verified create accessToken and refresh Token , store refresh token in db
    // 8. send accessToken as cookie 
    // 9. in future store refresh in redis if redis fails get it from db
    const {email,password} =req.body

    if(!email || !password )
    {
        return res.status(400).json({
            success: false,
            message : "Fill all the details"
        })
    }

    try {
        const user =await getUser(email);
        if(user.provider=="google"){
            return res.status(404).json({
                success : false,
                message : "Login through Google Oauth"
            })
        }
        const isSame=await bcrypt.compare(password, user.password)
        console.log(isSame);
        if(!isSame)
        {
            return res.status(400).json({
                success:false,
                message : "Invalid password"
            })
        }
        console.log(user.isVerified) 
        if(!user.isVerified)
        {
            return res.status(403).json({
                success :false,
                message : "Verify your email"
            })
        }
        const refresh= await generateRefreshToken(user.id);
        console.log(refresh)
        setAccessTokenCookie(res, await generateAccessToken(user.id,user.role));
        setRefreshTokenCookie(res, refresh);
       
        await prisma.user.update({
            where : {
                email : email
            },
            data : {
                refreshToken : refresh
            }

        })

        return res.status(200).json({
            success : true,
            message : "Successfully logged in"
        })


         
    } catch (error) {
        return res.status(500).json({
            message: "Something happened Try again"
        })
    }


}

export const sendMail=async (req,res)=>{
    const receiverEmail=req.body.email;
    console.log(receiverEmail)
    try {
        await sendMailfun(receiverEmail);
        return res.status(200).json({
            success:true,
            message :"Email sent Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Somrthing happened Try again"
        })
    }
}

export const verifyEmailToken = async (req,res)=>{
    const token=req.body.token;
    console.log(token)
    return await verifyToken(token,res);
}

export const verifyGoogleToken =async (req,res)=>{
    const token =req.body.token;
    console.log(token)
    try {
        const email= await verify(token,res);
        console.log(email)
        const isUser=await isPresent(email);
        let user;
        if(!isUser)
        {
            await googleSave(email);

        }
        else{
            user =await getUser(email);
            if(user.provider=="local")
        {
            return res.status(400).json({
                success :false,
                message : "Use Google OAuth"
            })
        }
        }

        const refresh= await generateRefreshToken(user.id);
        console.log(refresh)
        setAccessTokenCookie(res, await generateAccessToken(user.id,user.role));
        setRefreshTokenCookie(res, refresh);
       
        await prisma.user.update({
            where : {
                email : email
            },
            data : {
                refreshToken : refresh
            }

        })

        return res.status(200).json({
            success : true,
            message : "Successfully logged in"
        })

        // set the cookies and send

    } catch (error) {
        return res.status(500).json({
            success :false,
            message : "Something happened"
        })
    }

}

export const refresh = async (req, res) => {
    const cookieOptions = { httpOnly: true, sameSite: "None", path: "/", secure: true };

     // when refresh comes check if refresh token exist in cookies if not return unauthorized
    // if exist verify it decode it get the email 
    // query it in db if db.refresh != provided =====>>> unauthorised
    // set new access and refresh tokens and send it back and store it in db new refresh token
    
    const refreshToken = req.cookies?.refreshToken;
    console.log("Hello from refresh endpoint.............");
    
    if (!refreshToken) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({
            success: false,
            message: "Session Expired Login again!!!"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWTSECRETKEY);
    } catch (error) {
        console.log("invalid refresh");
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    const userId = decoded.userId;
    console.log(userId);
    
    const user = await getUserViaId(userId);
    console.log(user);
    
    if (!user) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({
            success: false,
            message: "User not found"
        });
    }

    if (user.refreshToken !== refreshToken) {
        console.log("I am the problem");
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({
            success: false,
            message: "Invalid"
        });
    }

    console.log("Hi finally gonna produce accessToken");
    
    try {
        const newRefreshToken = await generateRefreshToken(user.id);
        console.log("refresh new", newRefreshToken);
        
        setAccessTokenCookie(res, await generateAccessToken(user.id, user.role));
        setRefreshTokenCookie(res, newRefreshToken);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });

        return res.status(200).json({
            success: true,
            message: "Successfully logged in"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something happened try again"
        });
    }
};


export const whoAmI = async(req,res)=>{
    const token =req.cookies?.accessToken;
    console.log(req.cookies)
    console.log("token :" ,token)
    if(!token){
        return res.status(401).json({
            success :false,
            message: "Unauthorized"
        })
    }

    const decoded = jwt.verify(token, process.env.JWTSECRETKEY);
     console.log(decoded)
            
    if(!decoded){
        return res.status(401).json({
            success :false,
            message : "Token invalid"
        })
    }
    const email =await getUserEmail(decoded.userId);
    return res.status(200).json({
        success :true,
        data :{
            role :decoded.role,
            email : email
        }
    })


}



export const logout = async (req, res) => {
    // Clear cookies with the same options they were set
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    });

    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWTSECRETKEY);
            if (decoded && decoded.userId) {
                await prisma.user.update({
                    where: { id: decoded.userId },
                    data: { refreshToken: null }
                });
            }
        } catch (error) {
            // Ignore error if token is expired or invalid
        }
    }

    return res.status(200).json({
        success: true,
        message: "Successfully logged out"
    });
};
