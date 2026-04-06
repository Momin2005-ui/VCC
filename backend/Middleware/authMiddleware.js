import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        console.log("tpken from authmiddleware" , token)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        console.log("reached................................")
        const decoded = jwt.verify(token, process.env.JWTSECRETKEY);
        console.log(req.body)
        
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};