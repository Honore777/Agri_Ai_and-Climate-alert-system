'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Loader2, MapPin, TrendingUp } from 'lucide-react';
import predictionsService, { OrgDiseaseSummary } from '@/services/predictions.service';
import { getErrorMessage } from '@/utils/errors';
import { diseaseLabel } from '@/utils/disease';
import { useTranslation } from '@/i18n/LocaleContext';

/**
 * Cooperative disease-surveillance tab: aggregated predictions across the
 * whole organization — what diseases are spreading and where.
 */
export default function DiseaseOutbreaksSection() {
  const { t } = useTranslation();
  const [data, setData] = useState<OrgDiseaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    predictionsService
      .getOrgSummary()
      .then(setData)
      .catch((e) => setError(getErrorMessage(e, t('outbreaks.loadError'))))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }
  if (!data) return null;

  const maxDisease = Math.max(...data.diseases.map((d) => d.count_30d), 1);
  const maxWeek = Math.max(...data.weekly.map((w) => w.count), 1);

  return (
    <div className="space-y-6">
      {/* OUTBREAK ALERTS — same disease ≥3× in one area */}
      {data.outbreak_alerts.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold">{t('outbreaks.alerts')}</h3>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {data.outbreak_alerts.map((a, i) => (
              <li key={i}>
                <strong>{diseaseLabel(t, a.disease)}</strong> — {a.count}{' '}
                {t('outbreaks.reportsIn')} <strong>{a.location}</strong>{' '}
                {t('outbreaks.lastDays')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('outbreaks.reports7d'), value: data.totals.last_7d, color: 'text-blue-600' },
          { label: t('outbreaks.reports30d'), value: data.totals.last_30d, color: 'text-purple-600' },
          { label: t('outbreaks.diseased30d'), value: data.totals.diseased_30d, color: 'text-red-600' },
          { label: t('outbreaks.healthy30d'), value: data.totals.healthy_30d, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-sm text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* DISEASE BREAKDOWN */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <Activity className="h-4 w-4 text-blue-600" /> {t('outbreaks.diseasesTitle')}
          </h3>
          {data.diseases.length === 0 ? (
            <p className="text-sm text-gray-500">{t('outbreaks.noPredictions')}</p>
          ) : (
            <div className="space-y-2">
              {data.diseases.map((d) => (
                <div key={d.disease}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{diseaseLabel(t, d.disease)}</span>
                    <span className="text-gray-500">
                      {d.count_30d}
                      {d.count_7d > 0 && (
                        <span className="ml-1 text-red-500">(+{d.count_7d} {t('outbreaks.thisWeek')})</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-0.5 h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${d.disease.toLowerCase().includes('healthy') ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ width: `${(d.count_30d / maxDisease) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HOTSPOTS + WEEKLY TREND */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
              <MapPin className="h-4 w-4 text-red-500" /> {t('outbreaks.hotspots')}
            </h3>
            {data.hotspots.length === 0 ? (
              <p className="text-sm text-gray-500">{t('outbreaks.noReports')}</p>
            ) : (
              <ul className="space-y-2">
                {data.hotspots.map((h) => (
                  <li key={h.location} className="flex justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
                    <span className="font-medium text-gray-800">{h.location}</span>
                    <span className="font-bold text-red-600">{h.reports} {t('outbreaks.reports')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
              <TrendingUp className="h-4 w-4 text-purple-500" /> {t('outbreaks.weeklyTrend')}
            </h3>
            {data.weekly.length === 0 ? (
              <p className="text-sm text-gray-500">{t('outbreaks.noData')}</p>
            ) : (
              <div className="flex items-end gap-2">
                {data.weekly.map((w) => (
                  <div key={w.week} className="flex-1 text-center">
                    <div
                      className="mx-auto w-full rounded-t bg-purple-400"
                      style={{ height: `${Math.max((w.count / maxWeek) * 80, 4)}px` }}
                    />
                    <p className="mt-1 text-xs font-semibold">{w.count}</p>
                    <p className="text-[10px] text-gray-500">{w.week}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
