import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()



export const unregisteredCourses = async (id)=>{
    return  await prisma.courses.findMany({
  where: {
    enrollments: {
      none: {
        userId: id
      }
    }
  }
});
}