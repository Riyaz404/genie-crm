'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton({ fullWidth }: { fullWidth?: boolean }) {
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
    <div className={`flex items-center gap-2 sm:gap-4 ${fullWidth ? 'w-full' : ''}`}>
      <div className={`${fullWidth ? 'flex-1' : 'text-right hidden sm:block'}`}>
        <p className="text-sm font-medium text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout} className={fullWidth ? 'w-full' : ''}>
        Logout
      </Button>
    </div>
  )
}
