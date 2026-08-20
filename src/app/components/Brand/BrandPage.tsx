import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

const iconPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%2318B368' stroke-width='1.2'%3E%3Ccircle cx='36' cy='40' r='14'/%3E%3Cpath d='M86 30h30M86 42h22M24 104h36M42 86v36M118 88l20 20M118 108l20-20'/%3E%3Crect x='108' y='28' width='30' height='20' rx='4'/%3E%3C/g%3E%3C/svg%3E\")";

function MediaFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-[22px] bg-[#08112F] p-2 shadow-[0_20px_50px_rgba(8,17,47,0.12)] sm:rounded-[28px] sm:p-3 ${className}`}
    >
      {children}
    </figure>
  );
}

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
    <section className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 opacity-[0.12] sm:block"
        style={{ backgroundImage: iconPattern }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 hidden h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#7CFFB2_0%,#18B368_46%,transparent_70%)] sm:block"
      />

      <div className="relative mx-auto grid max-w-6xl items-start gap-8 px-4 py-8 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10">
        <div>
          <Image
            src="/Evuddy-logo-dark-E.png"
            alt="EVUDDY"
            width={260}
            height={78}
            className="h-10 w-auto max-w-full object-contain sm:h-14"
          />
          <p className="mt-3 text-[10px] font-bold tracking-[0.22em] text-[#08112F] sm:text-[11px] sm:tracking-[0.32em]">
            SMART · ELECTRIC · MOBILITY
          </p>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.05em] sm:mt-8 sm:text-6xl lg:text-7xl">
            {title} <span className="text-[#18B368]">{accent}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
            {subtitle}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-6 text-sm font-bold text-white sm:h-14 sm:w-auto sm:px-8 sm:text-base"
            >
              {primaryLabel} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#18B368] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>

        <MediaFrame>
          <img
            src={posterSrc}
            alt={posterAlt}
            className="mx-auto h-auto w-full rounded-[16px] object-contain sm:rounded-[20px]"
          />
        </MediaFrame>
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
          className="absolute inset-x-3 top-2 hidden h-[calc(100%-0.5rem)] rounded-[28px] bg-[#F59E0B] sm:block"
        />
        <div className="relative rounded-[24px] bg-[#08112F] px-5 py-8 text-center text-white sm:rounded-[32px] sm:px-12 sm:py-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6EE7A8] sm:text-[11px] sm:tracking-[0.22em]">
            {label}
          </p>
          {paragraphs.map((text) => (
            <p
              key={text}
              className="mx-auto mt-4 max-w-4xl text-sm leading-7 text-white/92 sm:mt-5 sm:text-lg sm:leading-8"
            >
              {text}
            </p>
          ))}
          <div className="mt-7 rounded-2xl bg-[#18B368] px-4 py-3 sm:mt-10">
            <p className="text-xs font-black tracking-wide sm:text-sm">#safeRideWithEvuddy</p>
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
    <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-[24px] bg-[#08112F] px-5 py-8 text-white sm:rounded-[32px] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
        <div>
          <p className="text-sm font-bold text-[#86EFAC]">#safeRideWithEvuddy</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-8 font-bold text-[#08112F] sm:h-14 sm:w-auto"
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
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">{title}</h2>
      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">{children}</div>
    </section>
  );
}

export function BrandCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:rounded-[28px] sm:p-6">
      <h3 className="text-lg font-black sm:text-xl">{title}</h3>
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
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-2 lg:gap-10 ${
          reverse ? "lg:[&>figure]:order-2" : ""
        }`}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#18B368] sm:text-[11px]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:mt-3 sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
            {text}
          </p>
        </div>
        <MediaFrame>
          {video ? (
            <video
              src={image}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="mx-auto h-auto w-full rounded-[16px] object-contain"
            />
          ) : (
            <img
              src={image}
              alt={alt}
              className="mx-auto h-auto w-full rounded-[16px] object-contain"
            />
          )}
        </MediaFrame>
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
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-2xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-4 sm:text-lg sm:leading-8">
          {text}
        </p>
        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {photos.map((photo) => (
            <MediaFrame key={photo.src}>
              <img
                src={photo.src}
                alt={photo.alt}
                className="mx-auto h-auto w-full rounded-[16px] object-contain"
              />
            </MediaFrame>
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
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[24px] bg-[#08112F] sm:rounded-[36px]">
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="mx-auto h-auto w-full object-contain"
        />
        <div className="px-5 py-5 text-white sm:px-10 sm:py-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6EE7A8] sm:text-[11px] sm:tracking-[0.22em]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.04em] sm:text-3xl lg:text-4xl">
            {title}
          </h2>
        </div>
      </div>
    </section>
  );
}
