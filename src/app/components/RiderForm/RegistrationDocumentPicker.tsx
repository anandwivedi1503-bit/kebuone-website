"use client";

import { useRef } from "react";

type RegistrationDocumentPickerProps = {
  title: string;
  icon: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  file: File | null;
  onSelect: (file: File | null) => void;
  onClear: () => void;
  allowPdf?: boolean;
  photoOnly?: boolean;
};

const IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/*";

const GALLERY_WITH_PDF =
  "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,image/*";

export default function RegistrationDocumentPicker({
  title,
  icon,
  required,
  optional,
  hint = "Use camera or choose from gallery",
  file,
  onSelect,
  onClear,
  allowPdf = false,
  photoOnly = false,
}: RegistrationDocumentPickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const galleryAccept = photoOnly
    ? IMAGE_ACCEPT
    : allowPdf
      ? GALLERY_WITH_PDF
      : IMAGE_ACCEPT;

  const handleChange = (picked: File | null) => {
    onSelect(picked);
  };

  const cardClass = `
    border-2
    border-dashed
    border-[#18B368]/25
    rounded-3xl
    p-8
    bg-[#F0F7F3]/50
    hover:scale-[1.03]
    hover:shadow-xl
    hover:border-[#FF165E]
    hover:bg-[#F0F7F3]
    transition-all
    duration-300
    text-center
  `;

  const actionBtnClass = `
    min-h-11
    px-4
    py-2
    rounded-xl
    text-sm
    font-semibold
    border
    border-[#18B368]/30
    bg-white
    text-[#0A1134]
    hover:border-[#FF165E]
    hover:text-[#FF165E]
    transition-colors
  `;

  return (
    <div className={cardClass}>
      <div className="text-5xl mb-4">{icon}</div>

      <h4 className="font-bold text-[#0A1134] mb-2">{title}</h4>

      {required && (
        <p className="text-xs text-red-500 mb-2 font-medium">Required</p>
      )}
      {optional && (
        <p className="text-xs text-orange-500 mb-2 font-medium">Optional</p>
      )}

      <p className="text-[#444] text-sm mb-3">{hint}</p>
      <p className="text-xs text-gray-400 mt-2">Maximum size: 5 MB</p>
      <p className="text-xs text-[#666] mt-1">
        {photoOnly ? "JPG · PNG · WEBP" : "PDF · JPG · PNG · WEBP"}
      </p>

      {file && (
        <>
          <p className="mt-3 text-green-600 text-sm font-semibold">
            ✅ {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-3 text-red-600 text-sm font-semibold hover:underline"
          >
            Remove file
          </button>
        </>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          className={actionBtnClass}
          onClick={() => cameraInputRef.current?.click()}
        >
          📷 Take photo
        </button>
        <button
          type="button"
          className={actionBtnClass}
          onClick={() => galleryInputRef.current?.click()}
        >
          🖼 Upload from gallery
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={galleryAccept}
        className="hidden"
        onChange={(e) => {
          handleChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
