"use client";

import EvuddyFestiveWelcomePoster from "@/app/components/Festive/EvuddyFestiveWelcomePoster";

type Props = {
  title: string;
  body: string;
};

export default function FestivePosterPreviewClient({ title, body }: Props) {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-[28px] bg-[#FFF7ED]/95 p-4 shadow-2xl sm:p-6">
      <EvuddyFestiveWelcomePoster open asModal={false} onClose={() => undefined} title={title} body={body} />
    </div>
  );
}
