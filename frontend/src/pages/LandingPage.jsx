import { Link } from "react-router";

function LandingPage() {
  return (
    <div className="min-h-screen wa-app wa-wallpaper relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-3xl" />

      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Chatify Logo" 
            className="w-9 h-9 rounded-xl"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold" style={{display: 'none'}}>C</div>
          <span className="text-[var(--wa-text)] font-semibold text-lg">Chatify</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="text-center">
          <h1 className="text-[var(--wa-text)] text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight">Chat that feels familiar</h1>
          <p className="text-[var(--wa-text-dim)] mt-4 sm:mt-6 text-lg sm:text-xl max-w-3xl mx-auto">A clean, WhatsApp-like interface with real-time messaging, media, replies and more. Built with modern tooling and tuned for focus.</p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 text-center font-semibold text-lg">Get started</Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-[var(--wa-item)] text-[var(--wa-text)] hover:bg-[var(--wa-item-hover)] text-center font-semibold text-lg">I have an account</Link>
          </div>
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm text-[var(--wa-text-dim)] max-w-4xl mx-auto">
            <div className="p-4 rounded-lg bg-[var(--wa-item)]">Familiar layout and shortcuts</div>
            <div className="p-4 rounded-lg bg-[var(--wa-item)]">Image sharing & replies</div>
            <div className="p-4 rounded-lg bg-[var(--wa-item)]">Lightweight & responsive</div>
          </div>
        </div>

        {/* Message View Image - Below the content */}
        <div className="mt-16 sm:mt-20 mb-20">
          <div className="relative max-w-6xl mx-auto">
            {/* Glow effect behind the image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative rounded-3xl border-2 border-slate-600 overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="wa-header px-8 py-5 border-b border-slate-600 text-[var(--wa-text-dim)] text-center font-semibold text-lg flex items-center justify-center gap-2">
                <span className="text-cyan-400">✨</span>
                <span>See Chatify in Action</span>
                <span className="text-emerald-400">✨</span>
              </div>
              <div className="wa-wallpaper p-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                <img
                  src="/MessageView.png"
                  alt="Chatify Message View Preview"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-slate-600/50 min-h-[600px] object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full min-h-[600px] rounded-2xl shadow-2xl border border-slate-600/50 bg-slate-800 flex items-center justify-center" style={{display: 'none'}}>
                  <div className="text-center text-slate-400">
                    <div className="text-6xl mb-4">📱</div>
                    <div className="text-xl font-semibold">Chat Preview</div>
                    <div className="text-sm mt-2">Image preview not available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;


