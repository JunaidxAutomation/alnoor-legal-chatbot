import ChatWidget from "@/components/chat/ChatWidget";
import { BUSINESS_INFO } from "@/lib/data/faq";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <section className="w-full max-w-lg space-y-6 text-center">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Legal Assistant
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {BUSINESS_INFO.name}
          </h1>
          <p className="text-muted-foreground">{BUSINESS_INFO.location}</p>
        </header>

        <section className="rounded-xl border bg-card p-6 text-left text-sm shadow-sm ring-1 ring-foreground/10">
          <dl className="space-y-3">
            <div>
              <dt className="font-medium text-foreground">Speciality</dt>
              <dd className="text-muted-foreground">{BUSINESS_INFO.speciality}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Timing</dt>
              <dd className="text-muted-foreground">{BUSINESS_INFO.timing}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Phone</dt>
              <dd className="text-muted-foreground">{BUSINESS_INFO.phone}</dd>
            </div>
          </dl>
        </section>

        <p className="text-sm text-muted-foreground">
          Neeche right corner pe chat button dabayein — fees, timing, aur documents
          ke sawalat ke jawab foran milenge.
        </p>
      </section>

      <ChatWidget />
    </main>
  );
}
