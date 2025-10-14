import { Link } from "react-router";

function LandingPage() {
  return (
    <div className="min-h-screen wa-app wa-wallpaper relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-3xl" />

      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold">C</div>
          <span className="text-[var(--wa-text)] font-semibold text-lg">Chatify</span>
        </div>
      
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div>
          <h1 className="text-[var(--wa-text)] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">Chat that feels familiar</h1>
          <p className="text-[var(--wa-text-dim)] mt-3 sm:mt-4 text-base sm:text-lg">A clean, WhatsApp-like interface with real-time messaging, media, replies and more. Built with modern tooling and tuned for focus.</p>
          <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link to="/signup" className="px-5 sm:px-6 py-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 text-center">Get started</Link>
            <Link to="/login" className="px-5 sm:px-6 py-3 rounded-full bg-[var(--wa-item)] text-[var(--wa-text)] hover:bg-[var(--wa-item-hover)] text-center">I have an account</Link>
          </div>
          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm text-[var(--wa-text-dim)]">
            <div className="p-3 rounded-lg bg-[var(--wa-item)]">Familiar layout and shortcuts</div>
            <div className="p-3 rounded-lg bg-[var(--wa-item)]">Image sharing & replies</div>
            <div className="p-3 rounded-lg bg-[var(--wa-item)]">Lightweight & responsive</div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="wa-header px-4 py-3 border-b border-slate-800 text-[var(--wa-text-dim)]">Preview</div>
            <div className="wa-wallpaper p-6">
              <div className="space-y-3 max-w-md">
                <div className="inline-block bg-[var(--wa-incoming)] text-[var(--wa-text)] px-3 py-2 rounded-lg">Hi there 👋</div>
                <div className="block" />
                <div className="inline-block bg-[var(--wa-outgoing)] text-[var(--wa-text)] px-3 py-2 rounded-lg self-end">Welcome to Chatify</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;


