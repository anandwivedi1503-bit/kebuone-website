import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

const iconPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%2318B368' stroke-width='1.2'%3E%3Ccircle cx='36' cy='40' r='14'/%3E%3Cpath d='M86 30h30M86 42h22M24 104h36M42 86v36M118 88l20 20M118 108l20-20'/%3E%3Crect x='108' y='28' width='30' height='20' rx='4'/%3E%3C/g%3E%3C/svg%3E\")";

export function BrandHero({
  title,
  accent,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  posterSrc,
  posterAlt,
}: {
  title: string;
  accent: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  posterSrc: string;
  posterAlt: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-[0.12]"
        style={{ backgroundImage: iconPattern }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#7CFFB2_0%,#18B368_46%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-28 h-64 w-64 rounded-full opacity-35 [background-image:radial-gradient(#ffffff_1.1px,transparent_1.15px)] [background-size:13px_13px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:px-10">
        <div>
          <Image
            src="/Evuddy-logo-dark-E.png"
            alt="EVUDDY"
            width={260}
            height={78}
            className="h-12 w-auto object-contain sm:h-14"
          />
          <p className="mt-3 text-[11px] font-bold tracking-[0.32em] text-[#08112F]">
            SMART · ELECTRIC · MOBILITY
          </p>
          <h1 className="mt-8 text-5xl font-black tracking-[-0.06em] sm:text-7xl">
            {title} <span className="text-[#18B368]">{accent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.28)]"
            >
              {primaryLabel} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-bold text-[#18B368]"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>

        <figure className="overflow-hidden rounded-[32px] bg-white p-3 shadow-[0_36px_100px_rgba(8,17,47,0.12)] ring-1 ring-[#18B368]/10">
          <img
            src={posterSrc}
            alt={posterAlt}
            className="h-auto w-full rounded-[24px] object-cover"
          />
        </figure>
      </div>
    </section>
  );
}

export function BrandStatement({
  label,
  paragraphs,
}: {
  label: string;
  paragraphs: string[];
}) {
  return (
    <section className="px-4 pb-6 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-6xl">
        <div
          aria-hidden
          className="absolute inset-x-4 top-3 h-[calc(100%-0.75rem)] rounded-[32px] bg-[#F59E0B] sm:inset-x-2"
        />
        <div className="relative rounded-[32px] bg-[#08112F] px-6 py-10 text-center text-white sm:px-12 sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6EE7A8]">
            {label}
          </p>
          {paragraphs.map((text) => (
            <p
              key={text}
              className="mx-auto mt-5 max-w-4xl text-base leading-8 text-white/92 sm:text-lg"
            >
              {text}
            </p>
          ))}
          <div className="mt-10 rounded-2xl bg-[#18B368] px-5 py-3">
            <p className="text-sm font-black tracking-wide">#safeRideWithEvuddy</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandCta({
  title,
  href,
  label,
}: {
  title: string;
  href: string;
  label: string;
}) {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[32px] bg-[#08112F] px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <p className="text-sm font-bold text-[#86EFAC]">#safeRideWithEvuddy</p>
          <h2 className="mt-2 text-3xl font-black">{title}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 font-bold text-[#08112F]"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}

export function BrandCardGrid({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
      <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">{title}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function BrandCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

export function BrandSplit({
  eyebrow,
  title,
  text,
  image,
  alt,
  reverse = false,
  video,
}: {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  reverse?: boolean;
  video?: boolean;
}) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-10">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 ${
          reverse ? "lg:[&>figure]:order-2" : ""
        }`}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18B368]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">{title}</h2>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">{text}</p>
        </div>
        <figure className="aspect-video overflow-hidden rounded-[32px] bg-[#08112F] shadow-[0_30px_80px_rgba(8,17,47,0.14)]">
          {video ? (
            <video
              src={image}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-contain object-center"
            />
          ) : (
            <img
              src={image}
              alt={alt}
              className="h-full w-full object-cover object-center"
            />
          )}
        </figure>
      </div>
    </section>
  );
}

export function BrandMosaic({
  title,
  text,
  photos,
}: {
  title: string;
  text: string;
  photos: Array<{ src: string; alt: string }>;
}) {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{text}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <figure
              key={photo.src}
              className={`overflow-hidden rounded-[28px] ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className={`w-full object-cover ${index === 0 ? "h-full min-h-[320px]" : "h-48 sm:h-full min-h-[160px]"}`}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandFilm({
  src,
  eyebrow,
  title,
}: {
  src: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#08112F]">
        <div className="relative aspect-video">
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08112F] via-[#08112F]/25 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-10 sm:left-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6EE7A8]">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-black tracking-[-0.04em] sm:text-4xl">
            {title}
          </h2>
        </div>
      </div>
    </section>
  );
}
