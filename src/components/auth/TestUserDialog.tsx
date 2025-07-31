import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Eye, EyeOff, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestCredentials {
  email: string;
  password: string;
  role: string;
}

const testCredentials: TestCredentials[] = [
  {
    email: 'student@test.com',
    password: 'Test123!',
    role: 'Estudante'
  },
  {
    email: 'company@test.com', 
    password: 'Test123!',
    role: 'Empresa'
  },
  {
    email: 'producer@test.com',
    password: 'Test123!', 
    role: 'Produtor'
  }
];

interface TestUserDialogProps {
  onUseCredentials: (email: string, password: string) => void;
}

export function TestUserDialog({ onUseCredentials }: TestUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success({
      title: `${type} copiado!`,
      description: 'Colado na área de transferência'
    });
  };

  const useCredentials = (credentials: TestCredentials) => {
    onUseCredentials(credentials.email, credentials.password);
    setOpen(false);
    toast.success({
      title: 'Credenciais aplicadas!',
      description: `Email e senha de ${credentials.role.toLowerCase()} preenchidos`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <TestTube className="h-3 w-3 mr-1" />
          Testar com usuário demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Usuários de Teste
          </DialogTitle>
          <DialogDescription>
            Use essas credenciais para testar o sistema sem criar uma nova conta
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mostrar senhas</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid gap-4">
            {testCredentials.map((credentials, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {credentials.role}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Acesso completo às funcionalidades de {credentials.role.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Email:</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(credentials.email, 'Email')}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={credentials.email}
                      readOnly
                      className="text-xs h-8"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Senha:</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(credentials.password, 'Senha')}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={showPasswords ? credentials.password : '••••••••'}
                      readOnly
                      className="text-xs h-8"
                    />
                  </div>
                  
                  <Button
                    onClick={() => useCredentials(credentials)}
                    className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    Usar estas credenciais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Dica:</strong> Se você ainda não conseguir fazer login, pode ser que essas contas de teste não existam no sistema. 
              Entre em contato com o administrador para criar contas de teste ou verifique se você está usando as credenciais corretas da sua conta.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
