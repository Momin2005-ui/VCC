import { PrismaClient } from "@prisma/client";

import {unregisteredCourses } from '../Repository/userRepo.js'

const prisma = new PrismaClient();


export const searchSimilarCourses = async (starttime, endtime, mode) => {
    const newStart = new Date(starttime);
    const newEnd = new Date(endtime);
    const res = await prisma.courses.findFirst({
        where: {
            mode: mode,
            AND: [
                {
                    starttime: {
                        lt: newEnd   // existing.start < new.end
                    }
                },
                {
                    endtime: {
                        gt: newStart // existing.end > new.start
                    }
                }
            ]
        }
    });

    return res !== null;
};

export const createCoursehelper = async (courseId,courseName,starttime,endtime,mode)=>{
    const newStart = new Date(starttime);
    const newEnd = new Date(endtime);
    return await prisma.courses.create({
        data : {
            courseId : courseId,
            courseName : courseName,
            starttime : newStart,
            endtime : newEnd,
            mode : mode
        }
    })
}



export const searchSimilarCourseId =async (courseId)=>{
    const res=await prisma.courses.findFirst({
        where :{
            courseId : courseId
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