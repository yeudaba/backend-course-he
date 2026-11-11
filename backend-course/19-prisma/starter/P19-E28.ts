// P19-E28: repository לקטגוריות — חזרה על interface, class, extends Error ו־switch
// כתוב וייצא type CategorySummary { id, name, productCount }, interface CategoryRepository { list, create, rename },
// class ConflictError / NotFoundError (extends Error), ו־class PrismaCategoryRepository implements CategoryRepository:
//   constructor(prisma) — בשדה פרטי #prisma | list() — לפי שם, עם מספר מוצרים | create(name), rename(id, name) — אחרי trim
//   שם ריק → RangeError("שם קטגוריה ריק") | P2002 → ConflictError(`קטגוריה בשם ${name} כבר קיימת`)
//   P2025 → NotFoundError(`קטגוריה ${id} לא קיימת`) | הבחירה לפי err.code — עם switch
// import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";
//
// בדיקה:  npm run check P19-E28
