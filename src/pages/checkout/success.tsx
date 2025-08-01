import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowRight, Home } from 'lucide-react';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session_id = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular verificação da sessão (opcional)
    if (session_id) {
      setLoading(false);
    }
  }, [session_id]);

  if (loading) {
    return (
      <div className="min-h-screen !bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 !border-green-500 mx-auto mb-4"></div>
          <p className="!text-gray-300">Confirmando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen !bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full !bg-green-500/20 mb-6">
            <CheckCircle className="h-8 w-8 !text-green-400" />
          </div>
          <h1 className="text-3xl font-bold !text-white mb-2">
            Pagamento Realizado com Sucesso!
          </h1>
          <p className="text-lg !text-gray-300">
            Sua assinatura foi ativada e sua empresa está sendo configurada.
          </p>
        </div>

        <Card className="mb-8 !bg-gray-800 !border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 !text-white">
              <Mail className="h-5 w-5 !text-blue-400" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 !bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-medium !text-blue-400">
                1
              </div>
              <div>
                <h3 className="font-medium !text-white">Verifique seu email</h3>
                <p className="text-sm !text-gray-300">
                  Enviamos um convite para o email cadastrado com instruções para ativar sua conta e definir sua senha.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 !bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-medium !text-blue-400">
                2
              </div>
              <div>
                <h3 className="font-medium !text-white">Ative sua conta</h3>
                <p className="text-sm !text-gray-300">
                  Clique no link do email para ativar sua conta e definir sua senha de acesso.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 !bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-medium !text-blue-400">
                3
              </div>
              <div>
                <h3 className="font-medium !text-white">Comece a usar a plataforma</h3>
                <p className="text-sm !text-gray-300">
                  Após ativar sua conta, você poderá acessar a área da empresa e começar a cadastrar seus colaboradores.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 !border-yellow-500/30 !bg-yellow-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 !text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium !text-yellow-300">Não recebeu o email?</h3>
                <p className="text-sm !text-yellow-200 mb-3">
                  Verifique sua caixa de spam ou entre em contato conosco se não receber o convite em alguns minutos.
                </p>
                <p className="text-sm !text-yellow-200">
                  <strong>Email de suporte:</strong> suporte@exemplo.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="!bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !text-white !shadow-lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
          
          <p className="text-sm !text-gray-400">
            Sessão ID: {session_id}
          </p>
        </div>
      </div>
    </div>
  );
} 
