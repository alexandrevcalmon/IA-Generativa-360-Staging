
import { Loader2 } from 'lucide-react';

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <div className="text-xl font-semibold text-white">
          Verificando autenticação...
        </div>
        <div className="text-sm text-gray-300 text-center max-w-xs">
          Carregando suas informações de perfil
        </div>
      </div>
    </div>
  );
}
