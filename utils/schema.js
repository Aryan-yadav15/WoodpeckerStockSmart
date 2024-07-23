import { pgTable, varchar, serial, boolean, text, date, uuid } from "drizzle-orm/pg-core";

export const Inventory = pgTable("Inventory", {
  id: varchar("id").primaryKey(),
  budget: varchar("budget").notNull(),
  lastUpdated: varchar("lastUpdated"),
  email:varchar('email').notNull()
});


export const Stock = pgTable("stock",{
    id: serial("id").primaryKey(),
    inventoryId: varchar("inventory_id").notNull(),
    ProductQuantity: varchar("ProductQuantity").notNull(),
    lastUpdated: varchar("lastUpdated"),
})




export const Product = pgTable("Product", {
  id: uuid("id").primaryKey(), // Change to uuid if using uuidv4
  suggestedStock: varchar("suggested_stock"),
  name: varchar("name").notNull(),
  price: varchar("price").notNull(),
  lastSoldPrice: varchar("last_sold_price"),
  lastMonthStock: varchar("last_month_stock"),
  inventoryId: varchar("inventory_id").notNull(),
  understock: boolean("understock"),
  overstock: boolean("overstock"),
  desc: text("desc"),
  quantity: varchar('quantity').notNull(),
  rating:varchar('rating'),
  url:varchar('url')
});




export const Money = pgTable("Money", {
  id: serial("id").primaryKey(),
  inventoryId: varchar("inventory_id").notNull(),
  profit: varchar("profitCurrent"),
  expenses: varchar("expenses").notNull(),
  lastUpdated: varchar("lastUpdated"),
});
