import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  qty: number;
  stock?: number;
};

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  update: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | undefined>(undefined);
const KEY = "alluring_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  function add(item: Omit<CartItem, "qty">, qty = 1) {
    setItems((cur) => {
      const existing = cur.find((i) => i.productId === item.productId);
      if (existing) {
        return cur.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...cur, { ...item, qty }];
    });
    toast.success(`${item.name} added to bag`);
  }

  function update(productId: string, qty: number) {
    setItems((cur) => cur.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i)));
  }

  function remove(productId: string) {
    setItems((cur) => cur.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * Number(i.price), 0);

  return <Ctx.Provider value={{ items, count, subtotal, add, update, remove, clear }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
