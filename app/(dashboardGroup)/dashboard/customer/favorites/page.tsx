import type { Metadata } from "next";
import { CustomerFavoritesPage } from "./_components/customer-favorites";

export const metadata: Metadata = {
  title: "Favorite Technicians | FixItNow",
};

export default function FavoritesPage() {
  return <CustomerFavoritesPage />;
}
