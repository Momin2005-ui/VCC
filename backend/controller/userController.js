// have to create another middleware for all these endpoint only admin can do these operations -- those endpoints are registerCourse,


import { searchSimilarCourses,unEnrollStud,updateCourse,coursesCreatedHelper,searchSimilarCourseId,createCoursehelper,registerCourseId,registeredUsers,getAvailableCourses, getRegisteredCoursesHelper, deleteCoursehelper } from "../service/userService.js";

export const createCourse =async (req,res)=>{
    
    // get courseName ,time (it is in string) ,Mode (Online or offline) from req
    // check if the courseName and time , Mode  is provided or not
    // if provided check the provided time with the other courses with same details  ... loop the course table
    // create the course in the course table
    const nowTime = new Date(); // already UTC internally


    
    
    const {courseId,courseName,starttime,endtime,mode} = req.body;
         const start = new Date(starttime);
    const role=  req.user.role
    const id =req.user.id

    if(role!="ADMIN")
    {
        return res.status(404).json({
            success : false,
            message : "Method not allowed"
        })
    }

    if(!courseName || !starttime || !endtime || !mode || !courseId){
        return res.status(400).json({
            message: "please provide all the details",
            success : false
        })
    }
    console.log(nowTime>start)
    if(nowTime>= new Date(starttime)){
        return res.status(400).json({
            success :false,
            message : "Invalid start time"
        })
    }

    if (new Date(starttime) >= new Date(endtime)) {
    return res.status(400).json({
        success: false,
        message: "Invalid time range"
    });
}
    
    if(await searchSimilarCourses(starttime,endtime,mode))
    {
        return res.status(400).json({
            success : false,
            message : "Timimg class another course already registered"
        })
    }

    if(await searchSimilarCourseId(courseId,endtime)){
        return res.status(400).json({
            success : false,
            message : "Course ID already exists"
        })
    }


    const course = await createCoursehelper(courseId,courseName,starttime,endtime,mode,id);
    if(course){
        return res.status(200).json({
            success :true,
            message : "Course created successfully"
        })
    }
    return res.status(500).json({
        success :false,
        message :"Something went wrong"
    })
    
}

export const registerCourse = async (req,res)=>{
   
    // get userId , courseid from the request  courseId i will get so userId from accessToken;
    // add them to enrollment userId enrolls courseId
    // 
  
  
    const courseId =req.body.courseId;
    const {id,role} = req.user;

    if(!courseId)
    {
        return res.status(400).json({
            status :false,
            message : "select proper course"     
        })
    }
    if(!id || !role)
    {
        return res.status(400).json({
            status : false,
            message : "Something happened try again"
        })
    }
    const response =await registerCourseId(id,courseId);
    if(!response)
    {
        return res.status(400).json({
            status : false,
            message : "User already registerd"
        })
    }

    return res.status(200).json({
        status: true,
        message : "Successfully registered"
    })

}


export const getRegisteredUsers= async (req,res)=>{

    // req body = get the course id get the id of course and then search in enrollement table using the id and get the user id =====>   user id ----> course id
    // from enrollment table we have retrieve the user names or userids and return it.
    console.log(req.query)
    const courseId =req.query.courseId; /// this is the only req body
    
     const role=  req.user.role

    if(role!="ADMIN")
    {
        return res.status(404).json({
            success : false,
            message : "Method not allowed"
        })
    }


    if(!courseId){
        return res.status(400).json({
            success :false,
            message : "courseId cannot be empty"
        })
    }

    let users= await registeredUsers(courseId);
    // console.log(users[0].userId)
   
    

    if(users.length==0)
    {
        return res.status(200).json({
            success :true,
            message : "No users registered for this course",
            users : users
        })
    }
    return res.status(200).json({
        success :true,
        message : "No users registered for this course",
        users : users
    })







    
}

export const getAllCourses = async (req,res)=>{  
    
    // from couurse table u have to retrieve all the courses but always starttime > date.now() ....
    // remove the courses where user has already registered.    
    // another idea is use this end point to retrieve all the courses  minus  use getRegistredUsers endpoint to retrive the courses but too costly

    // params :  userId , role
    const id = req.user.id;
    console.log(id)
    // get all the courses from course table where startime> data.now()

   try {
     let availableCourses = await  getAvailableCourses(id);
     console.log(availableCourses)
     return res.status(200).json({
        success :true,
        data : availableCourses
     })
   } catch (error) {
     console.log(error)
      return res.status(400).json({
        success : false,
        message : "Something happened try again"
      })
   }






}

export const getAllCreatedCourses =async (req,res)=>{
   
     // check if he is admin
     // fetch all courses created createdBy = id

    const {id,role} =req.user

    if(role!='ADMIN'){
        return res.status(401).json({
            success :false,
            message : "Unauthorized Method Not Allowed"
        })
    }

    const c= await coursesCreatedHelper(id);
    console.log("from controller",c)
    return res.status(200).json({
        success :true,
        data : c
    })
}

export const getRegisteredCourses = async (req,res)=>{

    const id =req.user.id;
     
    // from enrollment table retrieve all the courses where particular userId is enrolled and also starttime> date.now()
    let courses=[]

    courses =await getRegisteredCoursesHelper(id) 
     console.log("q")
    console.log(courses)
    return res.status(200).json({
        success :true,
        data : courses
    })
}

export const editCourse = async (req,res)=>{

    const {courseId,courseName,endtime,mode,starttime} = req.body;

    const update =await updateCourse(courseId,courseName,endtime,mode,starttime);

    console.log(update)

    if(update){
        return res.status(200).json({
            success: true,
            message : "Successfully Course Updated"
        })
    }

    return res.status(500).json({
        success :false,
        message : "Failed to upadate"
    })
}

export const deleteCourse =async(req,res)=>{

    const courseId =req.body.courseId;
    const role = req.user.role

    if(role!='ADMIN'){
        return res.status(401).json({
            success :false,
            message : "You think you are Smart!!"
        })
    }
     
    // delete the course which means make isdeleted true and 
    // delte the users in that course 
    // both the thing should happen or shoud not happen so have to use transaction
    // get the users related to the course
    // make the isdeleted coloumn true
    // loop through (users,courseId) and delete the enrollments ====> this i not needed courseId cannot be same in near future
    const resp =await deleteCoursehelper(courseId)
    console.log("I hpe it is deleted",resp);
    return res.status(200).json({
        success :true,
        message : "Course removed Successfully"
    })
}

export const unEnroll = async (req,res)=>{

    const courseId = req.body.courseId;
    const id =req.user.id;
    console.log(id,courseId)
    const response =await unEnrollStud(courseId,id);
    console.log("response",response)
    if(response){
        return res.status(200).json({
            success :true,
            message : "Successfully unenrolled from course"
        })
    }
    else{
        return res.status(500).json({
            success :false,
            message : "Something happened try again"
        })
    }
}


