import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  semester_price: number | null;
  annual_price: number | null;
  max_students: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  price?: number; // Make price optional since we use semester_price and annual_price
  semester_price?: number;
  annual_price?: number;
  max_students: number;
  features: string[];
}

export interface UpdatePlanData extends CreatePlanData {
  id: string;
  is_active?: boolean;
}

// New interface for plan selection with billing period
export interface PlanSelection {
  plan_id: string;
  billing_period: 'semester' | 'annual';
  price: number;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      console.log('📋 Fetching subscription plans...');
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching subscription plans:', error);
        throw error;
      }

      console.log('✅ Subscription plans fetched:', {
        count: data?.length || 0,
        plans: data?.map(p => ({
          id: p.id,
          name: p.name,
          is_active: p.is_active,
          semester_price: p.semester_price,
          annual_price: p.annual_price
        }))
      });

      return data as SubscriptionPlan[];
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planData: CreatePlanData) => {
      // Set price to 0 if not provided, since it's required in the database but we use semester/annual prices
      const dataToInsert = {
        ...planData,
        price: planData.price || 0
      };

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription plan:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['companies-with-plans'] });
      toast({
        title: "Plano criado com sucesso!",
        description: "O novo plano de assinatura foi adicionado.",
      });
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast({
        title: "Erro ao criar plano",
        description: "Ocorreu um erro ao criar o plano de assinatura.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planData: UpdatePlanData) => {
      const { id, ...updateData } = planData;
      // Set price to 0 if not provided
      const dataToUpdate = {
        ...updateData,
        price: updateData.price || 0
      };

      const { data, error } = await supabase
        .from('subscription_plans')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription plan:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['companies-with-plans'] });
      toast({
        title: "Plano atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast({
        title: "Erro ao atualizar plano",
        description: "Ocorreu um erro ao atualizar o plano de assinatura.",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planId: string) => {
      // Instead of deleting, we'll mark as inactive
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', planId);

      if (error) {
        console.error('Error deactivating subscription plan:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['companies-with-plans'] });
      toast({
        title: "Plano desativado com sucesso!",
        description: "O plano foi desativado e não aparecerá mais para novas assinaturas.",
      });
    },
    onError: (error) => {
      console.error('Error deactivating plan:', error);
      toast({
        title: "Erro ao desativar plano",
        description: "Ocorreu um erro ao desativar o plano.",
        variant: "destructive",
      });
    }
  });
};
