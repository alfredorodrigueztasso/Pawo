import { Container } from "@orion-ds/react/client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle p-4">
      <Container size="sm">{children}</Container>
    </div>
  );
}
