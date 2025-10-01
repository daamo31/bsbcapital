import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/SupabaseAuthContext'
import { supabase } from '../lib/customSupabaseClient'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2, Lock, Play, CheckCircle } from 'lucide-react'

export const ProtectedContent = ({ contentId, children }) => {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contentInfo, setContentInfo] = useState(null)
  const [requiredPlans, setRequiredPlans] = useState([])

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        // Verificar acceso del usuario a este contenido
        const { data: accessData, error: accessError } = await supabase
          .rpc('check_user_content_access', {
            user_uuid: user.id,
            content_uuid: contentId
          })

        if (accessError) throw accessError

        // Obtener información del contenido
        const { data: content, error: contentError } = await supabase
          .from('course_content')
          .select(`
            *,
            subscription_plans:required_plans(name, price, currency)
          `)
          .eq('id', contentId)
          .single()

        if (contentError) throw contentError

        // Obtener planes que dan acceso a este contenido
        const planIds = content.required_plans
        const { data: plans, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .in('id', planIds)

        if (plansError) throw plansError

        setHasAccess(accessData)
        setContentInfo(content)
        setRequiredPlans(plans)
      } catch (error) {
        console.error('Error checking content access:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, contentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando acceso...</span>
      </div>
    )
  }

  if (!user) {
    return <LoginPrompt />
  }

  if (!hasAccess) {
    return (
      <UpgradePrompt 
        contentInfo={contentInfo}
        requiredPlans={requiredPlans}
      />
    )
  }

  return (
    <div className="relative">
      <AccessBadge contentInfo={contentInfo} />
      {children}
    </div>
  )
}

const LoginPrompt = () => (
  <Card className="max-w-md mx-auto">
    <CardHeader className="text-center">
      <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <CardTitle>Acceso Restringido</CardTitle>
      <CardDescription>
        Necesitas iniciar sesión para acceder a este contenido
      </CardDescription>
    </CardHeader>
    <CardContent className="text-center">
      <Button asChild className="w-full">
        <a href="/login">Iniciar Sesión</a>
      </Button>
      <p className="mt-4 text-sm text-gray-600">
        ¿No tienes cuenta? <a href="/signup" className="text-blue-600 hover:underline">Regístrate aquí</a>
      </p>
    </CardContent>
  </Card>
)

const UpgradePrompt = ({ contentInfo, requiredPlans }) => {
  const cheapestPlan = requiredPlans.reduce((min, plan) => 
    plan.price < min.price ? plan : min, requiredPlans[0]
  )

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Lock className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <CardTitle>Contenido Premium</CardTitle>
        <CardDescription>
          Este contenido está disponible para miembros premium
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contentInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{contentInfo.title}</h3>
            <p className="text-gray-600 mb-3">{contentInfo.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Play className="h-4 w-4 mr-1" />
                {contentInfo.duration_minutes} min
              </span>
              <Badge variant="outline" className="capitalize">
                {contentInfo.content_type}
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-semibold">Planes que incluyen este contenido:</h4>
          <div className="grid gap-3">
            {requiredPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`p-4 border rounded-lg transition-colors ${
                  plan.id === cheapestPlan?.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{plan.name}</h5>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ${plan.price} {plan.currency}
                    </div>
                    {plan.duration_months ? (
                      <div className="text-sm text-gray-500">
                        {plan.duration_months} meses
                      </div>
                    ) : (
                      <Badge variant="secondary">Lifetime</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Button asChild className="w-full" size="lg">
              <a href="/membresias">
                Ver Planes de Membresía
              </a>
            </Button>
            <p className="text-center text-sm text-gray-500 mt-2">
              Acceso inmediato después del pago
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const AccessBadge = ({ contentInfo }) => {
  if (!contentInfo) return null

  return (
    <div className="absolute top-4 right-4 z-10">
      <Badge variant="success" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Acceso Premium
      </Badge>
    </div>
  )
}

// Hook para verificar acceso a contenido
export const useContentAccess = (contentId) => {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !contentId) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .rpc('check_user_content_access', {
            user_uuid: user.id,
            content_uuid: contentId
          })

        if (error) throw error
        setHasAccess(data)
      } catch (error) {
        console.error('Error checking access:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, contentId])

  return { hasAccess, loading }
}

// Componente para mostrar progreso del usuario
export const UserProgress = ({ contentId }) => {
  const { user } = useAuth()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !contentId) return

      const { data, error } = await supabase
        .from('user_progress')
        .select('progress_percentage')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .limit(1)

      if (!error && data && data.length > 0) {
        setProgress(data[0].progress_percentage)
      } else {
        setProgress(0) // Sin progreso inicial
      }
    }

    loadProgress()
  }, [user, contentId])

  const updateProgress = async (newProgress) => {
    if (!user || !contentId) return

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        content_id: contentId,
        progress_percentage: newProgress,
        last_accessed_at: new Date().toISOString()
      })

    if (!error) {
      setProgress(newProgress)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progreso</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}