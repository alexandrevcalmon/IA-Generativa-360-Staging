import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface StripePlan {
  id: string
  name: string
  max_collaborators: number
  subscription_period_days: number
  stripe_product_id: string
  stripe_price_id: string
  price?: number
  currency?: string
  features?: any[]
  created_at: string
  updated_at: string
}

export function useStripePrices() {
  const [plans, setPlans] = useState<StripePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true)
        setError(null)

        // Usar a URL correta da Edge Function com timestamp para evitar cache
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const timestamp = Date.now()
        const response = await fetch(`${supabaseUrl}/functions/v1/get-stripe-prices?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          // Adicionar cache busting
          cache: 'no-cache'
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Edge Function error:', errorText)
          throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('🔄 Stripe prices received:', {
          count: data.plans?.length || 0,
          plans: data.plans?.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stripe_price_id: p.stripe_price_id,
            subscription_period_days: p.subscription_period_days
          }))
        })
        setPlans(data.plans || [])
      } catch (err) {
        console.error('Error fetching Stripe prices:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch prices')
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  const getPlanById = (id: string) => {
    return plans.find(plan => plan.id === id)
  }

  const getPlansByPeriod = (period: 'semestral' | 'anual') => {
    return plans.filter(plan => {
      const isSemestral = plan.subscription_period_days === 180
      const isAnual = plan.subscription_period_days === 365
      
      if (period === 'semestral') return isSemestral
      if (period === 'anual') return isAnual
      
      return false
    })
  }

  return {
    plans,
    loading,
    error,
    getPlanById,
    getPlansByPeriod,
  }
} 
