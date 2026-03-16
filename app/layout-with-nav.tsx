import SimpleNavbar from './components/layout/SimpleNavbar';

export default function LayoutWithNav({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SimpleNavbar />
      <main className="pt-20">
        {children}
      </main>
    </>
  );
}
