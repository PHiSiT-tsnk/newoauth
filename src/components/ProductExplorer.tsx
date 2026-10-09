"use client";

import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import ProductSearchForm from "./ProductSearchForm";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type { Product, ProductDraft, ProductList, SearchQuery } from "@/lib/products";

type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ");
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");
    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  // โหลดข้อมูลอัตโนมัติครั้งแรกเมื่อเปิดหน้า
  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  // บันทึก (เพิ่มสินค้าใหม่ หรือ แก้ไขสินค้าเดิม)
  function handleSave(draft: ProductDraft) {
    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? { ...draft, id: p.id } : p)));
      setEditingProduct(null);
    } else {
      setProducts([...products, { ...draft, id: Date.now() }]);
    }
  }

  // ลบสินค้า
  function handleRemove(id: number) {
    setProducts(products.filter((p) => p.id !== id));
    if (editingProduct?.id === id) {
      setEditingProduct(null);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>รายการสินค้า</h1>
      
      <ProductSearchForm onSearch={loadProducts} />

      <div style={{ margin: "1.5rem 0" }}>
        <button
          type="button"
          onClick={() => loadProducts(defaultQuery)}
          disabled={status === "loading"}
        >
          {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
        </button>
      </div>

      {/* ฟอร์มเพิ่ม/แก้ไขสินค้า */}
      <ProductForm
        key={editingProduct ? editingProduct.id : "new"}
        editing={editingProduct}
        onSave={handleSave}
        onCancel={() => setEditingProduct(null)}
      />

      {/* ส่วนแสดงผลรายการสินค้าตามสถานะ */}
      <section aria-live="polite" style={{ marginTop: "2rem" }}>
        {status === "loading" && <p>กำลังโหลดข้อมูล</p>}
        {status === "error" && <p role="alert">{errorMessage}</p>}
        {status === "ready" && products.length === 0 && <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>}
        {status === "ready" && products.length > 0 && (
          <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>คงเหลือ</th>
                <th>หมวดหมู่</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.category}</td>
                  <td>
                    <button type="button" onClick={() => setEditingProduct(item)}>แก้ไข</button>{" "}
                    <button type="button" onClick={() => handleRemove(item.id)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}