import express from "express";
import { createCourse,deleteCourse, getRegisteredUsers,registerCourse,getAllCourses,getRegisteredCourses ,getAllCreatedCourses, editCourse, unEnroll} from "../controller/userController.js";
const router = express.Router();

router.post("/createCourse",createCourse);
router.get("/getRegisteredUsers",getRegisteredUsers);
router.post("/registerCourse",registerCourse);
router.get("/getAllCourses",getAllCourses);
router.get("/getRegisteredCourses",getRegisteredCourses);
router.get("/getAllCreatedCourses",getAllCreatedCourses);
router.put("/updateCourse",editCourse);
router.post("/unenrollCourse",unEnroll);
router.delete("/deleteCourse",deleteCourse);


export default router;