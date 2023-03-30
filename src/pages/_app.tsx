import { CommandPalette } from "@/components/CommandPalette";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-gray-50/80 backdrop-blur dark:bg-slate-900/80 ">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <CommandPalette />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-4">
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
