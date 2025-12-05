import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorHandling({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-10">

      <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full text-center">

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/20 rounded-full border border-red-400/40">
            <AlertTriangle size={48} className="text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">
          Terjadi Kesalahan
        </h1>

        <p className="text-gray-300 leading-relaxed mb-6">
          Kami tidak dapat memuat data quiz.
          Hal ini biasanya terjadi karena koneksi lambat, data belum tersedia, atau game belum disiapkan dengan benar.
        </p>

        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all py-3 rounded-xl font-semibold shadow-md active:scale-95"
        >
          <RefreshCw size={20} />
          Coba Lagi
        </button>

        <p className="text-xs text-white-900 mt-4">
          Jika masalah terus berlanjut, pastikan host telah memilih quiz dengan benar.
        </p>
      </div>
    </div>
  );
}
