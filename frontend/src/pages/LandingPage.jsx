import { Link } from "react-router";

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 relative p-4">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 relative z-10">
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
          <span className="text-white font-semibold text-lg">Chatify</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 relative z-10">
        <div className="text-center">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight">Chat that feels familiar</h1>
          <p className="text-slate-300 mt-4 sm:mt-6 text-lg sm:text-xl max-w-3xl mx-auto">A clean, WhatsApp-like interface with real-time messaging, media, replies and more. Built with modern tooling and tuned for focus.</p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 text-center font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-cyan-500/25">Get started</Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-slate-800/50 text-white hover:bg-slate-700/50 text-center font-semibold text-lg transition-all duration-200 hover:scale-105 border border-slate-600 hover:border-slate-500">I have an account</Link>
          </div>
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm text-slate-300 max-w-4xl mx-auto">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-200">Familiar layout and shortcuts</div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-200">Image sharing & replies</div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-200">Lightweight & responsive</div>
          </div>
        </div>

        {/* Message View Image - Below the content */}
        <div className="mt-16 sm:mt-20 mb-16 sm:mb-24">
          <div className="relative max-w-6xl mx-auto">
            {/* Glow effect behind the image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative rounded-2xl sm:rounded-3xl border-2 border-slate-600 overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="wa-header px-3 sm:px-8 py-3 sm:py-5 border-b border-slate-600 text-[var(--wa-text-dim)] text-center font-semibold text-sm sm:text-lg flex items-center justify-center gap-2">
                <span className="text-cyan-400">✨</span>
                <span>See Chatify in Action</span>
                <span className="text-emerald-400">✨</span>
              </div>
              <div className="wa-wallpaper p-1 sm:p-4">
                <img
                  src="/MessageView.png"
                  alt="Chatify Message View Preview"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-slate-600/50 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full rounded-2xl shadow-2xl border border-slate-600/50 bg-slate-800 flex items-center justify-center" style={{display: 'none'}}>
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


