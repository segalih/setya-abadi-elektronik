import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        Setya Abadi Elektronik
      </h1>
      <p className="text-slate-400 max-w-md">
        Source code frontend terdeteksi hilang. Kontainer ini berjalan menggunakan boilerplate sementara. 
        Silakan kembalikan file source asli Anda ke folder <code className="bg-slate-800 px-1 rounded text-emerald-400">apps/web/src</code>.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <h3 className="font-semibold text-blue-400">API Status</h3>
          <p className="text-sm text-slate-500">Connected to Laravel</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <h3 className="font-semibold text-emerald-400">Database</h3>
          <p className="text-sm text-slate-500">External Host</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <h3 className="font-semibold text-purple-400">WA Service</h3>
          <p className="text-sm text-slate-500">Notification Active</p>
        </div>
      </div>
    </div>
  )
}

export default App
