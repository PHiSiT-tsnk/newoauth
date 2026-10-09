import { randomUUID } from "node:crypto";
import { db } from "./src/lib/db";
import { products } from "./src/lib/schema";

async function runSeed() {
  console.log("กำลังดึงสินค้าจาก DummyJSON...");
  const res = await fetch("https://dummyjson.com/products?limit=20");
  const data = await res.json();

  const formattedProducts = data.products.map((item: any) => ({
    id: randomUUID(), // สร้าง UUID ให้กับทุกแถวเพื่อไม่ให้ id เป็น null
    name: item.title,
    description: item.description,
    price: Number(item.price),
    category: item.category || "general",
    thumbnail: item.thumbnail || "https://dummyjson.com/icon/default.png",
  }));

  console.log(`กำลังบันทึกสินค้า ${formattedProducts.length} รายการลง Neon...`);
  await db.insert(products).values(formattedProducts);
  console.log("เสร็จสมบูรณ์! ข้อมูลเข้าฐานข้อมูลเรียบร้อยแล้ว 🎉");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("เกิดข้อผิดพลาด:", err);
  process.exit(1);
});