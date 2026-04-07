import prisma from "../../config/prisma.js";

export const getAllUsers = async () => {
  return await prisma.nguoidung.findMany();
};

export const createUser = async (userData) => {
  return await prisma.nguoidung.create({
    data: userData,
  });
};