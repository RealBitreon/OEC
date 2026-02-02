import { redirect } from 'next/navigation'

export default function DashboardCompetitionWheelPage({ params }: { params: { slug: string } }) {
  // Redirect to the public wheel page for preview
  redirect(`/competition/${params.slug}/wheel`)
}
