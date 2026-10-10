import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/server'
import { getPortfolio } from '@/lib/portfolio/data'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  const portfolio = await getPortfolio()
  return <AdminDashboard initial={portfolio} ownerEmail={session.email} />
}
