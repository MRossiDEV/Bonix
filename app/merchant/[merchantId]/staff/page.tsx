"use client";

import {
  Plus,
  Shield,
  QrCode,
  BarChart3,
  Settings,
  User,
  ChevronRight,
  Lock,
  Clock3,
} from "lucide-react";

const staffMembers = [
  {
    id: 1,
    name: "Maria Rodriguez",
    role: "Manager",
    status: "Active",
    permissions: [
      "QR Scanning",
      "Smart Plans",
      "Reports",
    ],
  },
  {
    id: 2,
    name: "Juan Perez",
    role: "Cashier",
    status: "Active",
    permissions: ["QR Scanning"],
  },
  {
    id: 3,
    name: "Camila Silva",
    role: "Supervisor",
    status: "Active",
    permissions: [
      "QR Scanning",
      "Reports",
    ],
  },
];

const roles = [
  {
    icon: QrCode,
    title: "Scanner",
    description:
      "Can redeem customer Smart Plans.",
  },
  {
    icon: BarChart3,
    title: "Supervisor",
    description:
      "Can view reports and monitor activity.",
  },
  {
    icon: Settings,
    title: "Manager",
    description:
      "Can manage plans and staff access.",
  },
];

export default function StaffManagementPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0B0B]/80 px-5 py-4 backdrop-blur-xl">
        <h1 className="text-2xl font-black">
          Staff Access
        </h1>

        <p className="mt-1 text-sm text-[#9CA3AF]">
          Control who can operate BONIX
          inside your business.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="px-5 pt-5">
        <div className="rounded-[2rem] border border-[#7B61FF]/20 bg-[#7B61FF]/10 p-5">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#B5A6FF]" />

            <div>
              <h2 className="font-bold">
                Access Protection
              </h2>

              <p className="mt-1 text-sm text-[#D1D5DB]">
                Only authorized staff can
                redeem Smart Plans.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ADD STAFF */}

      <div className="px-5 pt-5">
        <button className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-[#FF7A00] py-4 font-black text-black">
          <Plus className="h-5 w-5" />
          Invite Staff Member
        </button>
      </div>

      {/* ROLE TYPES */}

      <section className="px-5 pt-6">
        <h2 className="mb-4 text-lg font-bold">
          Access Roles
        </h2>

        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <div
                key={role.title}
                className="rounded-[2rem] border border-white/5 bg-[#121212] p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1A1A]">
                    <Icon className="h-5 w-5 text-[#FF7A00]" />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      {role.title}
                    </h3>

                    <p className="text-sm text-[#9CA3AF]">
                      {role.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STAFF LIST */}

      <section className="px-5 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Team Members
          </h2>

          <span className="text-sm text-[#9CA3AF]">
            {staffMembers.length} active
          </span>
        </div>

        <div className="space-y-4">
          {staffMembers.map((member) => (
            <button
              key={member.id}
              className="w-full rounded-[2rem] border border-white/5 bg-[#121212] p-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1A1A]">
                    <User className="h-5 w-5 text-[#FF7A00]" />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#9CA3AF]">
                      {member.role}
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-[#6B7280]" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {member.permissions.map(
                  (permission) => (
                    <span
                      key={permission}
                      className="rounded-full bg-[#1A1A1A] px-3 py-1 text-xs text-[#D1D5DB]"
                    >
                      {permission}
                    </span>
                  )
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#00E5A8]" />

                  <span className="text-xs text-[#9CA3AF]">
                    {member.status}
                  </span>
                </div>

                <span className="text-xs text-[#9CA3AF]">
                  Last active today
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECURITY */}

      <section className="px-5 pb-8">
        <div className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/10 p-5">
          <div className="flex items-start gap-3">
            <Lock className="mt-1 h-5 w-5 text-[#FFB067]" />

            <div>
              <h3 className="font-bold">
                Security Recommendation
              </h3>

              <p className="mt-2 text-sm text-[#D1D5DB]">
                Give QR redemption access
                only to trusted staff.
                This helps prevent
                accidental or fraudulent
                redemptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT ACCESS LOG */}

      <section className="px-5 pb-10">
        <h2 className="mb-4 text-lg font-bold">
          Recent Access Activity
        </h2>

        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-[#FF7A00]" />

            <div>
              <p className="text-sm">
                Juan Perez redeemed a Smart
                Plan
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                12 minutes ago
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-[#FF7A00]" />

            <div>
              <p className="text-sm">
                Maria Rodriguez updated a
                Smart Plan
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                1 hour ago
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}