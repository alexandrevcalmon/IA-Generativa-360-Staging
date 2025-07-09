
import { supabase } from '@/integrations/supabase/client';
import { updateUserMetadata } from './authUtils';

export const createProducerSignInService = (toast: any) => {
  const signInProducer = async (email: string, password: string) => {
    console.log(`[ProducerSignIn] Attempting sign-in. Email: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error(`[ProducerSignIn] Producer login error for ${email}: ${error.message}`);
      toast({ title: "Erro no Login", description: error.message, variant: "destructive" });
      return { error };
    }
    
    if (data.user) {
      // Check if user is actually a producer using the enhanced function
      const { data: producerData, error: producerError } = await supabase.rpc('is_current_user_producer_enhanced');

      if (producerError || !producerData) {
        console.error(`[ProducerSignIn] User ${email} is not a producer or is inactive`);
        toast({ 
          title: "Acesso Negado", 
          description: "Esta conta não tem permissões de produtor ou está inativa.", 
          variant: "destructive" 
        });
        // Sign out the user since they don't have producer access
        await supabase.auth.signOut();
        return { error: new Error("User is not a producer") };
      }

      console.log(`[ProducerSignIn] Producer login confirmed for ${email}`);
      
      // Update user metadata to ensure consistency
      if (data.user.user_metadata?.role !== 'producer') {
        console.log(`[ProducerSignIn] Updating metadata to 'producer' for ${email}`);
        await updateUserMetadata({ role: 'producer' });
      }
      
      toast({ title: "Login de Produtor bem-sucedido!", description: "Bem-vindo!" });
      return { error: null, user: data.user, session: data.session, needsPasswordChange: false };
    }
    
    console.error(`[ProducerSignIn] Producer login for ${email} succeeded but user data is missing.`);
    return { error: new Error("User data not found for producer.") };
  };

  return { signInProducer };
};
