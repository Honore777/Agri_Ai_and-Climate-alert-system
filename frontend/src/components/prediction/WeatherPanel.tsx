'use client';

import React from 'react';
import {
  CloudRain, Thermometer, Droplets, MapPin, AlertTriangle, Satellite,
} from 'lucide-react';
import { WeatherSnapshot } from '@/services/predictions.service';

/**
 * WEATHER PANEL
 *
 * Climate context attached to a prediction: where the coords came
 * from, 30-day rain history (mini bar chart), 7-day forecast strip,
 * plus risk alerts an agronomist scans at a glance.
 */

const SOURCE_LABELS: Record<string, { label: string; hint: string }> = {
  gps: { label: 'Precise GPS', hint: 'Weather for the farmer\'s exact location' },
  district_fallback: { label: 'District estimate', hint: 'No GPS — weather uses the district centroid' },
  manual: { label: 'Manual entry', hint: 'Coordinates entered by hand' },
};

export default function WeatherPanel({
  snapshot,
  compact = false,
}: {
  snapshot: WeatherSnapshot;
  /** compact: summary tiles + alerts only (cards/history lists) */
  compact?: boolean;
}) {
  const { summary, history, forecast } = snapshot.data;
  const source = SOURCE_LABELS[snapshot.location_source] ?? {
    label: snapshot.location_source,
    hint: '',
  };

  // Recent 14 days of history for the mini rain chart
  const recent = history.slice(-14);
  const maxRain = Math.max(1, ...recent.map((d) => d.rain_mm ?? 0));

  const stats = [
    {
      icon: <CloudRain className="h-5 w-5 text-sky-600" />,
      label: 'Rain · 7 days',
      value: summary.total_rain_7d_mm != null ? `${summary.total_rain_7d_mm} mm` : '—',
    },
    {
      icon: <CloudRain className="h-5 w-5 text-sky-700" />,
      label: 'Rain · 30 days',
      value: summary.total_rain_30d_mm != null ? `${summary.total_rain_30d_mm} mm` : '—',
    },
    {
      icon: <Thermometer className="h-5 w-5 text-orange-500" />,
      label: 'Avg temp · 7 days',
      value:
        summary.avg_temp_max_7d != null
          ? `${summary.avg_temp_max_7d}° / ${summary.avg_temp_min_7d ?? '—'}°C`
          : '—',
    },
    {
      icon: <Droplets className="h-5 w-5 text-cyan-600" />,
      label: 'Humidity · 7 days',
      value: summary.avg_humidity_7d != null ? `${summary.avg_humidity_7d}%` : '—',
    },
  ];

  return (
    <div className="mt-6 rounded-lg border border-sky-200 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Satellite className="h-5 w-5 text-sky-600" />
          Climate context
        </h3>
        <span
          className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
          title={source.hint}
        >
          <MapPin className="h-3.5 w-3.5" />
          {source.label}
        </span>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5">
              {s.icon}
              <p className="text-xs font-medium text-gray-500">{s.label}</p>
            </div>
            <p className="mt-1 text-sm font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Rain history — last 14 days */}
      {!compact && recent.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Rain history — last 14 days (mm/day)
          </p>
          <div className="flex h-24 items-end gap-1">
            {recent.map((d) => {
              const h = Math.max(2, ((d.rain_mm ?? 0) / maxRain) * 100);
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.rain_mm ?? 0} mm · ${d.temp_max ?? '—'}°C`}
                  className="flex-1 rounded-t bg-sky-400/80 transition-colors hover:bg-sky-600"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>{recent[0].date}</span>
            <span>{recent[recent.length - 1].date}</span>
          </div>
        </div>
      )}

      {/* Forecast strip */}
      {!compact && forecast.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Next 7 days
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {forecast.slice(0, 7).map((d) => (
              <div
                key={d.date}
                className="rounded-lg bg-slate-50 p-1.5 text-center"
                title={`${d.date}: rain ${d.rain_mm ?? 0}mm, ${d.temp_min ?? '—'}–${d.temp_max ?? '—'}°C`}
              >
                <p className="text-[10px] font-medium text-gray-400">
                  {d.date.slice(5).replace('-', '/')}
                </p>
                <p className="mt-0.5 text-xs font-bold text-sky-700">
                  {d.rain_mm != null && d.rain_mm > 0 ? `${d.rain_mm}mm` : '—'}
                </p>
                <p className="text-[10px] text-gray-500">{d.temp_max ?? '—'}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {summary.alerts?.length > 0 && (
        <div className="mt-4 space-y-2">
          {summary.alerts.map((a) => (
            <div
              key={a.type}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-5 text-amber-800">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
