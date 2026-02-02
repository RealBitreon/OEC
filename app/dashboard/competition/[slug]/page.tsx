import { redirect } from 'next/navigation'

export default function DashboardCompetitionPage({ params }: { params: { slug: string } }) {
  // Redirect to the public competition page for preview
  // Admins can view it like regular users
  redirect(`/competition/${params.slug}`)
}
