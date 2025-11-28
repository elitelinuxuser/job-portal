import { getApplicationById } from '@/lib/actions/freelancer'
import { ApplicationDetails } from '@/components/freelancer/application-details'
import { notFound } from 'next/navigation'

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await getApplicationById(id)

  if (!application) {
    notFound()
  }

  return <ApplicationDetails application={application} />
}
