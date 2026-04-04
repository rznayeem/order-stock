import { prisma } from "@repo/database";
import { ICategory } from "./category.interface";
import AppError from "../../errors/AppError";

const createCategory = async (data: ICategory) => {
  const exists = await prisma.category.findFirst({ where: { name: data.name, userId: data.userId } });
  if (exists) throw new AppError(400, "Category with this name already exists");

  const result = await prisma.category.create({ data });

  await prisma.activityLog.create({
    data: { userId: data.userId, type: "CATEGORY_CREATED", message: `Category "${result.name}" created` },
  });
  return result;
};

const getCategories = async (userId: string) => {
  return prisma.category.findMany({
    where: { userId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
};

const updateCategory = async (id: string, userId: string, data: Partial<ICategory>) => {
  return prisma.category.update({ where: { id, userId }, data });
};

const deleteCategory = async (id: string, userId: string) => {
  const productCount = await prisma.product.count({ where: { categoryId: id, userId } });
  if (productCount > 0) throw new AppError(400, "Cannot delete category with existing products");
  return prisma.category.delete({ where: { id, userId } });
};

export const CategoryService = { createCategory, getCategories, updateCategory, deleteCategory };
