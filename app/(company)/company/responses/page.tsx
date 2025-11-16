import { getCompanyJobs } from '@/lib/actions/jobs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SendBookingRequest } from '@/components/company/send-booking-request'
import { Avatar } from '@/components/ui/avatar'

export default async function ResponsesPage() {
  const jobs = await getCompanyJobs()

  // Get all responses across all jobs
  const allResponses = jobs.flatMap((job) =>
    job.responses.map((response) => ({
      ...response,
      job,
    }))
  )

  const interestedResponses = allResponses.filter((r) => r.status === 'interested')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Responses</h1>
        <p className="text-gray-600 mt-1">Review freelancer applications</p>
      </div>

      {interestedResponses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No responses yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Post jobs to start receiving applications
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interestedResponses.map((response) => (
            <Card key={response.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Response to: {response.job.title}
                    </CardTitle>
                    <Badge variant="default" className="mt-2">Interested</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {response.freelancer.freelancerProfile?.name || 'Unnamed'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {response.freelancer.email}
                        </p>
                      </div>
                      
                      {response.freelancer.freelancerProfile && (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Location:</span>
                              <span className="ml-2 font-medium">
                                {response.freelancer.freelancerProfile.location}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">WhatsApp:</span>
                              <span className="ml-2 font-medium">
                                {response.freelancer.freelancerProfile.whatsappNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Verification:</span>
                              <Badge variant="outline" className="ml-2">
                                {response.freelancer.freelancerProfile.verificationStatus}
                              </Badge>
                            </div>
                          </div>

                          {response.freelancer.freelancerProfile.equipmentList && 
                           (response.freelancer.freelancerProfile.equipmentList as string[]).length > 0 && (
                            <div>
                              <span className="text-sm text-gray-600">Equipment:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(response.freelancer.freelancerProfile.equipmentList as string[]).map((item, idx) => (
                                  <Badge key={idx} variant="secondary">{item}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {response.freelancer.freelancerProfile.portfolioLinks &&
                           (response.freelancer.freelancerProfile.portfolioLinks as string[]).length > 0 && (
                            <div>
                              <span className="text-sm text-gray-600">Portfolio:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {(response.freelancer.freelancerProfile.portfolioLinks as string[]).map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    Portfolio {idx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {response.message && (
                        <div className="pt-3 border-t">
                          <span className="text-sm text-gray-600">Message:</span>
                          <p className="mt-1 text-sm">{response.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <SendBookingRequest
                      jobId={response.job.id}
                      freelancerId={response.freelancerId}
                      freelancerName={response.freelancer.freelancerProfile?.name || 'Freelancer'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

