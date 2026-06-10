import { getProducts } from "@/actions/products";
import GardenPageClient from "@/components/GardenPageClient";

// Force dynamic rendering to always load fresh products
export const revalidate = 0;

export default async function Home() {
  const dbProducts = await getProducts();
  
  // Serialize Decimal objects to numbers so they can be passed to Client Components
  const allProducts = dbProducts.map((p) => ({
    ...p,
    price: Number(p.price),
  })) as any;

  return <GardenPageClient products={allProducts} />;
}

