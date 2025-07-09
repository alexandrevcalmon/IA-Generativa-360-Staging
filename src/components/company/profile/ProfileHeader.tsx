
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Edit, Save } from "lucide-react";

interface ProfileHeaderProps {
  userEmail?: string;
  userCreatedAt?: string;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export const ProfileHeader = ({ 
  userEmail, 
  userCreatedAt, 
  isEditing, 
  onToggleEdit 
}: ProfileHeaderProps) => {
  const getUserInitials = () => {
    return userEmail?.charAt(0).toUpperCase() || 'E';
  };

  const getDisplayName = () => {
    if (userEmail) {
      const emailPrefix = userEmail.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Empresa';
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        {isEditing && (
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-bold text-gray-900">
          {getDisplayName()}
        </h2>
        <p className="text-gray-600">{userEmail || 'email@empresa.com'}</p>
        <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
          <Badge variant="secondary">Empresa</Badge>
          <Badge variant="outline">
            Membro desde {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Data não disponível'}
          </Badge>
        </div>
      </div>

      <Button 
        onClick={onToggleEdit}
        variant={isEditing ? "default" : "outline"}
      >
        {isEditing ? (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </>
        ) : (
          <>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </>
        )}
      </Button>
    </div>
  );
};
