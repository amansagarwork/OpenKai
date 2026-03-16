import Container from '../components/layout/Container';


export default function ProductManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container fullWidth>
      {children}
    </Container>
  );
}
