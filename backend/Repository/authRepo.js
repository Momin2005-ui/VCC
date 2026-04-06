import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();


export const checkIsRegistered = async (courseId, userId) => {
    const res = await prisma.enrollment.findFirst({
        where: {
            courseId: courseId,
            userId: userId
        }
    });

    return res !== null;
};




