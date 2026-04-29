/** Full-height, overflow-hidden shell for the tailor application view. */
export default function TailorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden bg-[#F5F3FF]">{children}</div>
  );
}
