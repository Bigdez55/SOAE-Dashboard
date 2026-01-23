import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart2, Truck, Calendar, TrendingUp } from 'lucide-react';
import { KPICard, SectionHeader, DataTable } from '../common';
import { Card, Grid } from '../layout';
import { formatNum, formatPct } from '../../utils/formatters';

/**
 * Intelligence Tab Component
 * Patterns, trends, and analytics
 */
export function IntelligenceTab({ data, stats }) {
  const soaeData = data?.soae || [];
  const dispatchData = data?.dispatch || [];

  // Event type distribution
  const byEventType = soaeData.reduce((acc, item) => {
    const type = item.eventType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const eventTypeData = Object.entries(byEventType)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Vehicle analysis
  const byVehicle = soaeData.reduce((acc, item) => {
    const vehicle = item.vehicle || 'Unknown';
    if (!acc[vehicle]) acc[vehicle] = { total: 0, late: 0 };
    acc[vehicle].total++;
    if (item.timeliness === 'Late') acc[vehicle].late++;
    return acc;
  }, {});

  const vehicleData = Object.entries(byVehicle)
    .map(([vehicle, data]) => ({
      vehicle,
      total: data.total,
      late: data.late,
      onTime: data.total - data.late,
      latePct: data.total > 0 ? (data.late / data.total * 100) : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  // Day of week analysis
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const byDayOfWeek = soaeData.reduce((acc, item) => {
    if (item.date) {
      const day = new Date(item.date).getDay();
      if (!acc[day]) acc[day] = { total: 0, late: 0 };
      acc[day].total++;
      if (item.timeliness === 'Late') acc[day].late++;
    }
    return acc;
  }, {});

  const dayOfWeekData = dayNames.map((name, index) => ({
    day: name,
    total: byDayOfWeek[index]?.total || 0,
    late: byDayOfWeek[index]?.late || 0,
    onTime: (byDayOfWeek[index]?.total || 0) - (byDayOfWeek[index]?.late || 0)
  }));

  // Hour of day analysis (if time data available)
  const byHour = soaeData.reduce((acc, item) => {
    if (item.createdTime) {
      const hour = new Date(item.createdTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
    }
    return acc;
  }, {});

  const hourData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    count: byHour[hour] || 0
  }));

  // Vehicle columns
  const vehicleColumns = [
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'onTime', label: 'On Time', align: 'right', className: 'text-success-700' },
    { key: 'late', label: 'Late', align: 'right', className: 'text-danger-700' },
    { key: 'latePct', label: 'Late %', align: 'right', render: (v) => formatPct(v) }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary */}
      <Grid cols="4" gap="3">
        <KPICard
          label="Unique Vehicles"
          value={formatNum(Object.keys(byVehicle).length)}
          icon={Truck}
          color="blue"
        />
        <KPICard
          label="Event Types"
          value={formatNum(Object.keys(byEventType).length)}
          icon={BarChart2}
          color="purple"
        />
        <KPICard
          label="Peak Day"
          value={dayOfWeekData.reduce((max, d) => d.total > max.total ? d : max, { day: '-', total: 0 }).day}
          subValue={`${dayOfWeekData.reduce((max, d) => d.total > max.total ? d : max, { day: '-', total: 0 }).total} events`}
          icon={Calendar}
          color="cyan"
        />
        <KPICard
          label="Avg Events/Day"
          value={formatNum(soaeData.length > 0 ? Math.round(soaeData.length / 7) : 0)}
          icon={TrendingUp}
          color="green"
        />
      </Grid>

      {/* Event Type Distribution */}
      <Card>
        <SectionHeader
          title="Event Type Distribution"
          subtitle="Most common event types"
          icon={BarChart2}
        />
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="type"
                width={120}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.length > 20 ? v.substring(0, 20) + '...' : v}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Day of Week Analysis */}
      <Card>
        <SectionHeader
          title="Day of Week Analysis"
          subtitle="Event patterns by day"
          icon={Calendar}
        />
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" stackId="a" fill="#22c55e" name="On Time" />
              <Bar dataKey="late" stackId="a" fill="#ef4444" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Vehicle Performance */}
      <Card>
        <SectionHeader
          title="Vehicle Analysis"
          subtitle="SOAE timeliness by vehicle"
          icon={Truck}
        />
        <DataTable
          columns={vehicleColumns}
          data={vehicleData}
          maxRows={15}
          ariaLabel="Vehicle performance analysis"
        />
      </Card>

      {/* Hour of Day (if data available) */}
      {Object.keys(byHour).length > 0 && (
        <Card>
          <SectionHeader
            title="Hour of Day Analysis"
            subtitle="When SOAEs are created"
            icon={TrendingUp}
          />
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

export default IntelligenceTab;
