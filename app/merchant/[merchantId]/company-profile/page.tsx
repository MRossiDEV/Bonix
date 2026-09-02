"use client";

import Image from "next/image";
import {
  Camera,
  Clock3,
  Edit3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  Store,
  Upload,
} from "lucide-react";

export default function BusinessProfilePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0B0B]/80 px-5 py-4 backdrop-blur-xl">
        <h1 className="text-2xl font-black">
          Business Profile
        </h1>

        <p className="mt-1 text-sm text-[#9CA3AF]">
          Manage how customers discover your business.
        </p>
      </div>

      {/* COVER */}

      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src="/placeholder-cover.jpg"
          alt="Business Cover"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-black/30 to-transparent" />

        <button className="absolute right-4 top-4 flex items-center gap-2 rounded-2xl bg-black/60 px-4 py-2 text-sm font-semibold backdrop-blur-xl">
          <Camera className="h-4 w-4" />
          Change Cover
        </button>
      </div>

      {/* PROFILE */}

      <div className="relative px-5">
        <div className="-mt-16 flex items-end gap-4">
          <div className="relative h-28 w-28 overflow-hidden rounded-[2rem] border-4 border-[#0B0B0B]">
            <Image
              src="/placeholder-logo.jpg"
              alt="Business Logo"
              fill
              className="object-cover"
            />
          </div>

          <button className="mb-3 flex items-center gap-2 rounded-2xl bg-[#FF7A00] px-4 py-3 text-sm font-bold text-black">
            <Upload className="h-4 w-4" />
            Update Logo
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black">
                Smash House Burgers
              </h2>

              <p className="mt-2 text-[#9CA3AF]">
                Burgers • Fast Casual • Montevideo
              </p>
            </div>

            <button className="rounded-2xl border border-white/10 p-3">
              <Edit3 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-[#00E5A8]/10 px-3 py-1">
              <Star className="h-4 w-4 text-[#00E5A8]" />

              <span className="text-sm font-bold">
                4.8
              </span>
            </div>

            <div className="rounded-full bg-[#7B61FF]/10 px-3 py-1 text-sm font-bold text-[#B5A6FF]">
              Smart-Spending Partner
            </div>
          </div>
        </div>
      </div>

      {/* ABOUT */}

      <section className="px-5 pt-8">
        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <h3 className="text-lg font-bold">
            About Your Business
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
            We serve handcrafted burgers,
            fries and drinks designed for
            students, workers and families
            looking for quality food without
            overspending.
          </p>
        </div>
      </section>

      {/* BUSINESS DETAILS */}

      <section className="space-y-4 px-5 pt-5">
        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <h3 className="mb-4 text-lg font-bold">
            Contact Information
          </h3>

          <div className="space-y-4">
            <InfoRow
              icon={<Phone size={18} />}
              label="+598 99 123 456"
            />

            <InfoRow
              icon={<Mail size={18} />}
              label="contact@burgerhouse.uy"
            />

            <InfoRow
              icon={<Globe size={18} />}
              label="www.burgerhouse.uy"
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <h3 className="mb-4 text-lg font-bold">
            Location
          </h3>

          <InfoRow
            icon={<MapPin size={18} />}
            label="Av. Italia 1234, Montevideo"
          />

          <button className="mt-4 w-full rounded-2xl border border-[#FF7A00]/20 bg-[#FF7A00]/10 py-3 text-sm font-bold text-[#FFB067]">
            Open Map
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <h3 className="mb-4 text-lg font-bold">
            Opening Hours
          </h3>

          <InfoRow
            icon={<Clock3 size={18} />}
            label="Mon-Sun · 11:00 - 23:00"
          />
        </div>
      </section>

      {/* SMART-SPENDING POSITION */}

      <section className="px-5 py-5">
        <div className="rounded-[2rem] border border-[#00E5A8]/20 bg-[#00E5A8]/10 p-5">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-[#00E5A8]" />

            <div>
              <h3 className="font-bold">
                Smart-Spending Identity
              </h3>

              <p className="mt-1 text-sm text-[#D1FAE5]">
                Customers discover your
                business as a place where
                they can enjoy quality
                experiences all month long.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}

      <section className="px-5 pb-8">
        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">
              Photos
            </h3>

            <button className="text-sm font-bold text-[#FF7A00]">
              Add Photos
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(
              (photo) => (
                <div
                  key={photo}
                  className="aspect-square rounded-2xl bg-[#1A1A1A]"
                />
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-[#FF7A00]">
        {icon}
      </div>

      <span className="text-[#D1D5DB]">
        {label}
      </span>
    </div>
  );
}