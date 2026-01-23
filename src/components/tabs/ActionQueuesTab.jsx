import React from 'react';
import { AlertOctagon, Clock, AlertTriangle, Eye, CheckCircle } from 'lucide-react';
import { KPICard, SectionHeader, CollapsibleSection, DataTable, StatusBadge } from '../common';
import { Card, Grid } from '../layout';
import { formatCurrency, formatNum, getIdentifier } from '../../utils/formatters';

/**
 * Action Queues Tab Component
 * Prioritized action items requiring attention
 */
export function ActionQueuesTab({ data, stats }) {
  const lateSOAE = stats?.soaeLateItems || [];
  const missingDispatch = stats?.missingDispatch || [];
  const missingIncidents = stats?.missingIncidents || [];
  const missingAccidents = stats?.missingAccidents || [];
  const missingDowned = stats?.missingDowned || [];
  const needsReview = data?.dispatch?.filter(r => r.needsReview) || [];

  // Combine all missing items for priority queue
  const allMissing = [
    ...missingDispatch.map(r => ({ ...r, source: 'Dispatch' })),
    ...missingIncidents.map(r => ({ ...r, source: 'Incidents' })),
    ...missingAccidents.map(r => ({ ...r, source: 'Accidents' })),
    ...missingDowned.map(r => ({ ...r, source: 'Downed' }))
  ].sort((a, b) => (b.ld || 0) - (a.ld || 0));

  // Priority: Items overdue more than 7 days
  const criticalMissing = allMissing.filter(r => (r.daysOverdue || 0) > 7);
  const urgentMissing = allMissing.filter(r => (r.daysOverdue || 0) > 0 && (r.daysOverdue || 0) <= 7);

  // Late SOAE columns
  const lateColumns = [
    { key: 'id', label: 'ID', hideOnMobile: true },
    { key: 'date', label: 'Date' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    { key: 'hoursToCreate', label: 'Hours Late', align: 'right', render: (v) => ((v || 0) - 24).toFixed(1) },
    { key: 'ld', label: 'LD', align: 'right', render: (v) => formatCurrency(v || 0), className: 'text-danger-700 font-bold' }
  ];

  // Missing columns
  const missingColumns = [
    { key: 'source', label: 'Source' },
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category', render: (v, row) => v || row.incidentType || row.comment || '-' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    { key: 'daysOverdue', label: 'Days Over', align: 'right' },
    { key: 'ld', label: 'LD', align: 'right', render: (v) => formatCurrency(v || 0), className: 'text-danger-700 font-bold' }
  ];

  // Review columns
  const reviewColumns = [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    { key: 'comment', label: 'Notes', render: (v) => v || '-' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary */}
      <Grid cols="4" gap="3">
        <KPICard
          label="Late SOAE"
          value={formatNum(lateSOAE.length)}
          subValue={formatCurrency(stats?.ldFromLate || 0)}
          icon={Clock}
          color="red"
        />
        <KPICard
          label="Critical Missing"
          value={formatNum(criticalMissing.length)}
          subValue=">7 days overdue"
          icon={AlertOctagon}
          color="red"
        />
        <KPICard
          label="Urgent Missing"
          value={formatNum(urgentMissing.length)}
          subValue="1-7 days overdue"
          icon={AlertTriangle}
          color="orange"
        />
        <KPICard
          label="Needs Review"
          value={formatNum(needsReview.length)}
          icon={Eye}
          color="yellow"
        />
      </Grid>

      {/* Priority Queue 1: Late SOAE */}
      {lateSOAE.length > 0 && (
        <Card className="border-l-4 border-l-danger-500">
          <SectionHeader
            title="Queue 1: Late SOAE Submissions"
            subtitle={`${lateSOAE.length} items - LD already accrued`}
            icon={Clock}
            iconBg="bg-danger-100"
            iconColor="text-danger-700"
          />
          <DataTable
            columns={lateColumns}
            data={lateSOAE}
            maxRows={15}
            ariaLabel="Late SOAE submissions queue"
          />
        </Card>
      )}

      {/* Priority Queue 2: Critical Missing (>7 days) */}
      {criticalMissing.length > 0 && (
        <Card className="border-l-4 border-l-danger-500">
          <SectionHeader
            title="Queue 2: Critical Missing (>7 Days)"
            subtitle={`${criticalMissing.length} items - High LD exposure`}
            icon={AlertOctagon}
            iconBg="bg-danger-100"
            iconColor="text-danger-700"
          />
          <DataTable
            columns={missingColumns}
            data={criticalMissing}
            maxRows={15}
            ariaLabel="Critical missing SOAE queue"
          />
        </Card>
      )}

      {/* Priority Queue 3: Urgent Missing (1-7 days) */}
      {urgentMissing.length > 0 && (
        <Card className="border-l-4 border-l-warning-500">
          <SectionHeader
            title="Queue 3: Urgent Missing (1-7 Days)"
            subtitle={`${urgentMissing.length} items - Actively accruing`}
            icon={AlertTriangle}
            iconBg="bg-warning-100"
            iconColor="text-warning-700"
          />
          <DataTable
            columns={missingColumns}
            data={urgentMissing}
            maxRows={15}
            ariaLabel="Urgent missing SOAE queue"
          />
        </Card>
      )}

      {/* Priority Queue 4: Needs Review */}
      {needsReview.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <SectionHeader
            title="Queue 4: Needs Manual Review"
            subtitle={`${needsReview.length} items - Verify if SOAE required`}
            icon={Eye}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-700"
          />
          <DataTable
            columns={reviewColumns}
            data={needsReview}
            maxRows={15}
            ariaLabel="Items needing review"
          />
        </Card>
      )}

      {/* Empty State */}
      {lateSOAE.length === 0 && allMissing.length === 0 && needsReview.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-success-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500">No action items pending. Great job maintaining compliance.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ActionQueuesTab;
