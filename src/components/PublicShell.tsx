import { PublicFooterLinks } from "@/components/public/PublicFooterLinks";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-center">
        {children}
        <PublicFooterLinks />
      </div>
    </main>
  );
}
