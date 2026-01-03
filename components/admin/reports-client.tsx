'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  updateReportStatus,
  deactivateJobPost,
  deactivateFreelancerProfile,
  deactivateCompanyProfile,
  reactivateProfile,
} from '@/lib/actions/reports'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Flag,
  Briefcase,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Ban,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'

interface Report {
  id: string
  reportType: 'job_post' | 'freelancer' | 'company'
  targetId: string
  reportedBy: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy: string | null
  reviewedAt: Date | null
  adminNotes: string | null
  createdAt: Date
  targetDetails: Record<string, unknown>
  reporterEmail?: string
}

interface ReportsClientProps {
  reports: Report[]
}

export function ReportsClient({ reports: initialReports }: ReportsClientProps) {
  const [reports, setReports] = useState(initialReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'review' | 'deactivate' | 'dismiss' | 'reactivate'>('review')
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const pendingReports = reports.filter((r) => r.status === 'pending')
  const reviewedReports = reports.filter((r) => r.status === 'reviewed')
  const resolvedReports = reports.filter((r) => r.status === 'resolved')
  const dismissedReports = reports.filter((r) => r.status === 'dismissed')

  const typeIcons = {
    job_post: Briefcase,
    freelancer: User,
    company: Building2,
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800',
  }

  function openActionDialog(report: Report, action: typeof actionType) {
    setSelectedReport(report)
    setActionType(action)
    setAdminNotes('')
    setActionDialogOpen(true)
  }

  async function handleAction() {
    if (!selectedReport) return

    setLoading(true)
    try {
      if (actionType === 'review') {
        await updateReportStatus({
          reportId: selectedReport.id,
          status: 'reviewed',
          adminNotes,
        })
        toast.success('Report marked as reviewed')
      } else if (actionType === 'dismiss') {
        await updateReportStatus({
          reportId: selectedReport.id,
          status: 'dismissed',
          adminNotes,
        })
        toast.success('Report dismissed')
      } else if (actionType === 'deactivate') {
        if (selectedReport.reportType === 'job_post') {
          await deactivateJobPost({
            jobId: selectedReport.targetId,
            reason: adminNotes || selectedReport.reason,
            reportId: selectedReport.id,
          })
        } else if (selectedReport.reportType === 'freelancer') {
          await deactivateFreelancerProfile({
            freelancerUserId: selectedReport.targetId,
            reason: adminNotes || selectedReport.reason,
            reportId: selectedReport.id,
          })
        } else if (selectedReport.reportType === 'company') {
          await deactivateCompanyProfile({
            companyUserId: selectedReport.targetId,
            reason: adminNotes || selectedReport.reason,
            reportId: selectedReport.id,
          })
        }
        toast.success(
          selectedReport.reportType === 'company'
            ? 'Company profile and all its job posts have been deactivated'
            : 'Target has been deactivated'
        )
      } else if (actionType === 'reactivate') {
        await reactivateProfile({
          type: selectedReport.reportType,
          targetId: selectedReport.targetId,
        })
        toast.success('Target has been reactivated')
      }

      // Refresh reports
      const updatedReports = reports.map((r) => {
        if (r.id === selectedReport.id) {
          return {
            ...r,
            status: actionType === 'dismiss' ? 'dismissed' : actionType === 'deactivate' ? 'resolved' : 'reviewed',
            adminNotes,
          } as Report
        }
        return r
      })
      setReports(updatedReports)
      setActionDialogOpen(false)
    } catch (error) {
      toast.error('Failed to perform action')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function ReportCard({ report }: { report: Report }) {
    const Icon = typeIcons[report.reportType]
    const isTargetActive = report.targetDetails?.isActive !== false

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {report.reportType === 'job_post' && (report.targetDetails?.title as string || 'Job Post')}
                    {report.reportType === 'freelancer' && (report.targetDetails?.name as string || 'Freelancer')}
                    {report.reportType === 'company' && (report.targetDetails?.companyName as string || 'Company')}
                  </span>
                  <Badge className={statusColors[report.status]}>
                    {report.status}
                  </Badge>
                  {!isTargetActive && (
                    <Badge variant="destructive">Deactivated</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Reason:</span> {report.reason}
                </p>
                {report.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {report.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Reported by: {report.reporterEmail}</span>
                  <span>{format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {report.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openActionDialog(report, 'review')}
                    className="gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openActionDialog(report, 'deactivate')}
                    className="gap-1"
                  >
                    <Ban className="w-3 h-3" />
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openActionDialog(report, 'dismiss')}
                    className="gap-1 text-gray-500"
                  >
                    <XCircle className="w-3 h-3" />
                    Dismiss
                  </Button>
                </>
              )}
              {report.status === 'reviewed' && isTargetActive && (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openActionDialog(report, 'deactivate')}
                    className="gap-1"
                  >
                    <Ban className="w-3 h-3" />
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openActionDialog(report, 'dismiss')}
                    className="gap-1 text-gray-500"
                  >
                    <XCircle className="w-3 h-3" />
                    Dismiss
                  </Button>
                </>
              )}
              {!isTargetActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openActionDialog(report, 'reactivate')}
                  className="gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reactivate
                </Button>
              )}
            </div>
          </div>

          {report.adminNotes && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Admin Notes:</span> {report.adminNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  function ReportsList({ reportsList }: { reportsList: Report[] }) {
    if (reportsList.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No reports in this category</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {reportsList.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingReports.length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reviewedReports.length}</p>
              <p className="text-sm text-gray-500">Reviewed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resolvedReports.length}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{dismissedReports.length}</p>
              <p className="text-sm text-gray-500">Dismissed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            All Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-1">
                Pending
                {pendingReports.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{pendingReports.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <ReportsList reportsList={pendingReports} />
            </TabsContent>
            <TabsContent value="reviewed">
              <ReportsList reportsList={reviewedReports} />
            </TabsContent>
            <TabsContent value="resolved">
              <ReportsList reportsList={resolvedReports} />
            </TabsContent>
            <TabsContent value="dismissed">
              <ReportsList reportsList={dismissedReports} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'review' && <Eye className="w-5 h-5 text-blue-600" />}
              {actionType === 'deactivate' && <AlertTriangle className="w-5 h-5 text-red-600" />}
              {actionType === 'dismiss' && <XCircle className="w-5 h-5 text-gray-600" />}
              {actionType === 'reactivate' && <RotateCcw className="w-5 h-5 text-green-600" />}
              {actionType === 'review' && 'Mark as Reviewed'}
              {actionType === 'deactivate' && 'Deactivate Target'}
              {actionType === 'dismiss' && 'Dismiss Report'}
              {actionType === 'reactivate' && 'Reactivate Target'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'deactivate' && selectedReport?.reportType === 'company' && (
                <span className="text-red-600 font-medium">
                  Warning: Deactivating a company will also deactivate ALL their job posts.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedReport && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Report Type:</span>{' '}
                  {selectedReport.reportType.replace('_', ' ')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Reason:</span> {selectedReport.reason}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this action..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={loading}
              className={`flex-1 ${
                actionType === 'deactivate'
                  ? 'bg-red-600 hover:bg-red-700'
                  : actionType === 'reactivate'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }`}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
