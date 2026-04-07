import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()



export const unregisteredCourses = async (id)=>{
  
    const registered = await prisma.enrollment.findMany({
  where: {
     userId: id ,
    },
  select: { courseId: true }
})

const ids = registered.map(r => r.courseId)
let time =new Date(Date.now())
const unregistered = await prisma.courses.findMany({
  where: { 
    id: {
      notIn: ids
    },
    endtime :{
      gte : time
    },
    isDeleted:false
  }
})

return unregistered
}