
import { Loader2 } from 'lucide-react';

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <div className="text-lg">Verificando autenticação...</div>
      </div>
    </div>
  );
}
