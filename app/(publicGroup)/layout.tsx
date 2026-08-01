import { Navbar } from "@/components/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
