import { PrismaClient } from "@prisma/client";

import {unregisteredCourses } from '../Repository/userRepo.js'

const prisma = new PrismaClient();


export const searchSimilarCourses = async (starttime, endtime, mode) => {

    // cant crete course on same day and overlapping applied
  const newStart = new Date(starttime);
  const newEnd = new Date(endtime);

  
  const startOfDay = new Date(newStart);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(newStart);
  endOfDay.setHours(23, 59, 59, 999);

  const res = await prisma.courses.findFirst({
    where: {
      mode: mode,

      AND: [
        
        {
          starttime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },

       
        {
          starttime: {
            lt: newEnd
          }
        },
        {
          endtime: {
            gt: newStart
          }
        },{
            isDeleted : false
        }
      ]
    }
  });

  return res !== null;
};

export const createCoursehelper = async (courseId,courseName,starttime,endtime,mode,id)=>{
    const newStart = new Date(starttime);
    const newEnd = new Date(endtime);
    return await prisma.courses.create({
        data : {
            courseId : courseId,
            courseName : courseName,
            starttime : newStart,
            endtime : newEnd,
            mode : mode,
            isDeleted :false,
            createdBy: id
        }
    })
}



export const searchSimilarCourseId =async (courseId,endtime)=>{
    
    const res=await prisma.courses.findFirst({
        where :{
            courseId : courseId,
            starttime :{
                lte :endtime
            },
            isDeleted:false
        }
    })
    if(res!=null)
    {
        return true;
    }
    return false;
}

export const registerCourseId = async (userId, courseId) => {
    try {
        return await prisma.enrollment.create({
            data: { userId, courseId }
        });

    } catch (err) {
        if (err.code === "P2002") {
            return false; 
        }
        throw err;
    }
};


export const registeredUsers= async (courseId)=>{
    let users=[]
    console.log(courseId)
    users =await prisma.enrollment.findMany({
        where :{
            courseId : courseId
        }
    })
    const userIds = users.map(u => u.userId);

const userDetails = await prisma.user.findMany({
  where: {
    id: {
      in: userIds
    }
  },
  select: {
    email: true
  }
});
    /// from userId get username,email
    
    return userDetails;
}

export const getAvailableCourses = async (id)=>{

   
    return await unregisteredCourses(id)

    // return courses - registeredCourses


}

export const getRegisteredCoursesHelper =async(id)=>{
    let registeredCoursesId=[]

    registeredCoursesId = await prisma.enrollment.findMany({
        where : {
            userId : id
        },
        select :{
            courseId :true
        } 
    })
   

        const registeredCourses = registeredCoursesId.map(u => u.courseId);
        let time =new Date(Date.now())
        const courseDetails = await prisma.courses.findMany({
        where: {
            id: {
            in: registeredCourses
            },
            endtime :{
                gte : time
            }
        }
        });

        return courseDetails
}

export const coursesCreatedHelper = async(id) =>{
    const time =new Date(Date.now())
    const courses= await prisma.courses.findMany({
        where : {
            createdBy : id,
            isDeleted :false,
            endtime :{
                gte :time
            }
        },
        omit :{
            createdBy:true
        }
    })
    console.log(courses)
    return courses
}

export const updateCourse = async (courseId,courseName,endtime,mode,starttime)=>{
    return await prisma.courses.update({
        where :{
            id : courseId
        },
        data :{
            courseName :courseName,
            starttime :starttime,
            endtime :endtime,
            mode : mode
        }
    })
}

export const unEnrollStud = async (courseId,id) =>{
    return await prisma.enrollment.delete({
  where: {
    userId_courseId: {
      userId: id,
      courseId: courseId
    }
  }
})};

export const deleteCoursehelper = async (courseId)=>{
  return await prisma.$transaction([
  prisma.courses.update({
    where: {
      id: courseId
    },
    data: {
      isDeleted: true
    }
  }),

  prisma.enrollment.deleteMany({
    where: {
      courseId: courseId
    }
  })
]);
}