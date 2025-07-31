
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { Mail, Phone, HelpCircle, ArrowLeft } from 'lucide-react';

interface AccountRecoveryOptionsProps {
  email?: string;
  onBack: () => void;
}

export function AccountRecoveryOptions({ email, onBack }: AccountRecoveryOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const recoveryOptions = [
    {
      id: 'email',
      title: 'Redefinir por Email',
      description: 'Receba um link de redefinição no seu email',
      icon: Mail,
      action: 'reset-email'
    },
    {
      id: 'contact',
      title: 'Contatar Suporte',
      description: 'Fale com nossa equipe para recuperar sua conta',
      icon: HelpCircle,
      action: 'contact-support'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Recuperar Conta</h2>
          <p className="text-sm text-gray-600">
            Escolha uma opção para recuperar o acesso à sua conta
          </p>
        </div>
      </div>

      {email && (
        <Alert>
          <AlertDescription>
            Tentando recuperar acesso para: <strong>{email}</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {recoveryOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedOption === option.id ? 'ring-2 ring-emerald-500' : ''
              }`}
              onClick={() => setSelectedOption(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-emerald-600" />
                  <div>
                    <CardTitle className="text-base">{option.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {selectedOption === option.id && (
                <CardContent className="pt-0">
                  {option.action === 'reset-email' && (
                    <ForgotPasswordDialog 
                      trigger={
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Enviar email de redefinição
                        </Button>
                      }
                    />
                  )}
                  {option.action === 'contact-support' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Entre em contato conosco com as seguintes informações:
                      </p>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Seu email: {email}</li>
                        <li>• Tipo de conta (Produtor, Empresa, Estudante)</li>
                        <li>• Último acesso conhecido</li>
                      </ul>
                      <Button 
                        className="w-full"
                        onClick={() => window.open('mailto:suporte@calmonacademy.com?subject=Recuperação de Conta&body=Email: ' + (email || '') + '%0D%0ATipo de conta: %0D%0AÚltimo acesso: ')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contatar Suporte
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
