"use client";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
};

export default function SectionHeader({
  title,
  subtitle,
  rightContent,
}: SectionHeaderProps) {
  return (
    <div
      className="
      flex
      flex-col
      lg:flex-row
      lg:items-center
      lg:justify-between
      gap-5
      mb-8
      "
    >
      <div>

        <h2
          className="
          text-2xl
          sm:text-3xl
          md:text-5xl
          font-black
          bg-gradient-to-r
          from-[#D6006E]
          via-[#FF165E]
          to-[#FF5556]
          bg-clip-text
          text-transparent
          "
        >
          {title}
        </h2>

        {subtitle && (
          <p className="mt-3 text-gray-500 text-base leading-7">
            {subtitle}
          </p>
        )}

      </div>

      {rightContent && (
        <div className="flex items-center">
          {rightContent}
        </div>
      )}

    </div>
  );
}