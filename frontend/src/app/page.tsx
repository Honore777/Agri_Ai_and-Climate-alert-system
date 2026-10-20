'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Leaf,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Upload,
  UserCheck,
} from 'lucide-react';
import Logo from '@/components/layout/Logo';
import ImigongoBand from '@/components/layout/ImigongoBand';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import Footer from '@/components/layout/Footer';
import Showcase, { type ShowcaseItem } from '@/components/landing/Showcase';
import { useTranslation } from '@/i18n/LocaleContext';

const featureIcons = [
  { key: 'instantAnalysis', icon: ScanSearch, image: '/images/step-detect.jpg' },
  { key: 'expertValidation', icon: UserCheck, image: '/images/feature-validation.jpg' },
  { key: 'continuousLearning', icon: RefreshCw, image: '/images/feature-learning.jpg' },
  { key: 'secure', icon: ShieldCheck, image: '/images/feature-secure.jpg' },
  { key: 'regionalCoverage', icon: BarChart3, image: '/images/feature-coverage.jpg' },
  { key: 'diseaseClasses', icon: Leaf, image: '/images/feature-diseases.jpg' },
];

const stepDefs = [
  { key: 'capture', image: '/images/step-capture.jpg' },
  { key: 'detect', image: '/images/step-detect.jpg' },
  { key: 'act', image: '/images/step-act.jpg' },
];

const statDefs = [
  { value: '38', labelKey: 'landing.stats.diseases' },
  { value: '99.6%', labelKey: 'landing.stats.accuracy' },
  { value: '4', labelKey: 'landing.stats.roles' },
  { value: '24/7', labelKey: 'landing.stats.availability' },
];

export default function Home() {
  const { t } = useTranslation();

  const stepItems: ShowcaseItem[] = stepDefs.map((s, i) => ({
    key: s.key,
    image: s.image,
    badge: String(i + 1).padStart(2, '0'),
    title: t(`landing.steps.${s.key}.title`),
    description: t(`landing.steps.${s.key}.description`),
  }));

  const featureItems: ShowcaseItem[] = featureIcons.map((f) => ({
    key: f.key,
    image: f.image,
    icon: f.icon,
    title: t(`landing.features.${f.key}.title`),
    description: t(`landing.features.${f.key}.description`),
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:text-brand-600"
            >
              {t('nav.signIn')}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
        <ImigongoBand height="h-16" variant="white" />
      </nav>

      {/* Hero — full-bleed field photo so visitors instantly see the product's purpose */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/farmer-woman.jpg"
          alt={t('landing.photoCaption1')}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* dark scrim keeps text readable over any photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-900/70 to-brand-900/50" />
        <div className="relative mx-auto max-w-7xl px-6 pb-40 pt-32 lg:pt-44">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t('landing.heroTitle1')}{' '}
              <span className="bg-gradient-to-r from-brand-300 to-emerald-300 bg-clip-text text-transparent">
                {t('landing.heroTitle2')}
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              {t('landing.heroSubtitle')}
            </p>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-brand-900/30 transition-all hover:bg-brand-400 hover:shadow-xl"
              >
                {t('landing.startDetecting')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/40 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                {t('common.signIn')}
              </Link>
            </div>
            <p className="mt-6 text-xs font-medium uppercase tracking-widest text-brand-200/80">
              {t('landing.madeIn')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-100 bg-gray-50/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4">
          {statDefs.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wide text-gray-500">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Rwanda context — photo + story */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <figure className="group overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/farmer-man.jpg"
              alt={t('landing.photoCaption2')}
              className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </figure>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('landing.contextTitle')}
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t('landing.contextText1')}
            </p>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t('landing.contextText2')}
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 pb-28 pt-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('landing.howTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{t('landing.howSubtitle')}</p>
        </div>
        <div className="mt-16">
          <Showcase items={stepItems} intervalMs={7000} />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('landing.featuresTitle')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{t('landing.featuresSubtitle')}</p>
          </div>
          <div className="mt-16">
            <Showcase items={featureItems} intervalMs={8000} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-28 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-800 to-emerald-700 px-8 py-20 text-center sm:px-16">
          <Upload className="mx-auto h-10 w-10 text-brand-200" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('landing.ctaTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            {t('landing.ctaSubtitle')}
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50"
          >
            {t('landing.ctaButton')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
