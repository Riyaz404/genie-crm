'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface LogoutButtonProps {
  fullWidth?: boolean
}

export function LogoutButton({ fullWidth = false }: LogoutButtonProps) {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  if (!user) return null

  return (
    <div
      className={
        fullWidth
          ? 'w-full flex flex-col gap-2'
          : 'flex items-center gap-4'
      }
    >
      <div className={fullWidth ? 'w-full' : 'hidden sm:block text-right'}>
        <p className="text-sm font-medium text-foreground">
          {user.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {user.role}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className={fullWidth ? 'w-full' : ''}
      >
        Logout
      </Button>
    </div>
  )
}