"use client";

import { useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Users,
  CalendarDays,
} from "lucide-react";

const objectives = [
  {
    id: "month-end",
    title: "Increase end-of-month traffic",
    description:
      "Bring customers during the last week of the month.",
  },
  {
    id: "lunch",
    title: "Fill lunch hours",
    description:
      "Increase visits during lunch periods.",
  },
  {
    id: "happy-hour",
    title: "Boost slow hours",
    description:
      "Attract customers during low-demand times.",
  },
  {
    id: "return",
    title: "Increase repeat visits",
    description:
      "Encourage customers to come back more often.",
  },
  {
    id: "new-customers",
    title: "Attract new customers",
    description:
      "Introduce your business to new local customers.",
  },
  {
    id: "weekday",
    title: "Fill slow weekdays",
    description:
      "Increase traffic on traditionally weak days.",
  },
  {
    id: "family",
    title: "Increase group visits",
    description:
      "Bring couples, families and friends together.",
  },
  {
    id: "loyalty",
    title: "Build customer loyalty",
    description:
      "Reward repeat customers and increase retention.",
  },
];

export default function NewSmartPlanPage() {
  const [step, setStep] = useState(1);

  const [objective, setObjective] =
    useState<string>("");

  const [form, setForm] = useState({
    planName: "",
    productName: "",
    regularPrice: "",
    smartPrice: "",
    capacity: "",
    startDay: "",
    endDay: "",
    startTime: "",
    endTime: "",
  });

  const selectedObjective = useMemo(
    () =>
      objectives.find(
        (item) => item.id === objective
      ),
    [objective]
  );

  const projectedVisits = useMemo(() => {
    return Math.max(
      0,
      Number(form.capacity || 0) * 20
    );
  }, [form.capacity]);

  const projectedRevenue = useMemo(() => {
    return (
      Number(form.smartPrice || 0) *
      projectedVisits
    );
  }, [
    form.smartPrice,
    projectedVisits,
  ]);

  const occupancyGain = useMemo(() => {
    return Math.min(
      60,
      Math.round(projectedVisits / 5)
    );
  }, [projectedVisits]);

  const updateField = (
    field: string,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canContinue =
    objective.length > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
          BONIX Smart Plans
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Create Smart Plan
        </h1>

        <p className="mt-2 text-sm text-[#9CA3AF]">
          Create a revenue optimization plan
          designed to help customers spend
          smarter and keep your business busy
          all month.
        </p>
      </section>

      {/* PROGRESS */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
        <div className="flex items-center justify-between">
          {[
            "Goal",
            "Setup",
            "Projection",
            "Review",
          ].map((item, index) => (
            <div
              key={item}
              className="flex flex-1 items-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                  step >= index + 1
                    ? "bg-[#FF7A00] text-black"
                    : "bg-black/30 text-[#6B7280]"
                }`}
              >
                {step > index + 1 ? (
                  <Check size={18} />
                ) : (
                  index + 1
                )}
              </div>

              {index < 3 && (
                <div
                  className={`h-1 flex-1 ${
                    step > index + 1
                      ? "bg-[#FF7A00]"
                      : "bg-white/5"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* STEP 1 */}

      {step === 1 && (
        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
          <h2 className="text-2xl font-black">
            What challenge are you trying
            to solve?
          </h2>

          <p className="mt-2 text-sm text-[#9CA3AF]">
            Select one objective.
          </p>

          <div className="mt-6 space-y-3">
            {objectives.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setObjective(item.id)
                }
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  objective === item.id
                    ? "border-[#FF7A00] bg-[#FF7A00]/10"
                    : "border-white/5 bg-black/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-[#9CA3AF]">
                      {item.description}
                    </p>
                  </div>

                  {objective ===
                    item.id && (
                    <Check className="text-[#FF7A00]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
          <h2 className="text-2xl font-black">
            Smart Setup
          </h2>

          <p className="mt-2 text-sm text-[#9CA3AF]">
            Configure your plan.
          </p>

          <div className="mt-6 space-y-4">
            <input
              value={form.planName}
              onChange={(e) =>
                updateField(
                  "planName",
                  e.target.value
                )
              }
              placeholder="Plan Name"
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4"
            />

            <input
              value={form.productName}
              onChange={(e) =>
                updateField(
                  "productName",
                  e.target.value
                )
              }
              placeholder={
                objective === "lunch"
                  ? "Lunch Menu"
                  : "Product / Service"
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                value={form.regularPrice}
                onChange={(e) =>
                  updateField(
                    "regularPrice",
                    e.target.value
                  )
                }
                placeholder="Regular Price"
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              />

              <input
                value={form.smartPrice}
                onChange={(e) =>
                  updateField(
                    "smartPrice",
                    e.target.value
                  )
                }
                placeholder="Smart Price"
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              />
            </div>

            {objective ===
              "month-end" && (
              <>
                <input
                  placeholder="Start Day"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 p-4"
                />

                <input
                  placeholder="End Day"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 p-4"
                />
              </>
            )}

            {(objective ===
              "lunch" ||
              objective ===
                "happy-hour") && (
              <>
                <input
                  placeholder="Start Time"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 p-4"
                />

                <input
                  placeholder="End Time"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 p-4"
                />
              </>
            )}

            <input
              value={form.capacity}
              onChange={(e) =>
                updateField(
                  "capacity",
                  e.target.value
                )
              }
              placeholder="Daily Capacity"
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4"
            />
          </div>
        </section>
      )}

      {/* STEP 3 */}

      {step === 3 && (
        <section className="space-y-5">
          <div className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/5 p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-[#FF7A00]" />

              <h2 className="text-xl font-black">
                BONIX Projection
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-black/20 p-5">
                <Users className="text-[#00E5A8]" />

                <p className="mt-3 text-3xl font-black">
                  +
                  {
                    projectedVisits
                  }
                </p>

                <p className="text-sm text-[#9CA3AF]">
                  Extra Visits
                </p>
              </div>

              <div className="rounded-2xl bg-black/20 p-5">
                <TrendingUp className="text-[#00E5A8]" />

                <p className="mt-3 text-3xl font-black">
                  $
                  {projectedRevenue.toLocaleString()}
                </p>

                <p className="text-sm text-[#9CA3AF]">
                  Estimated Revenue
                </p>
              </div>

              <div className="rounded-2xl bg-black/20 p-5">
                <CalendarDays className="text-[#00E5A8]" />

                <p className="mt-3 text-3xl font-black">
                  +
                  {
                    occupancyGain
                  }
                  %
                </p>

                <p className="text-sm text-[#9CA3AF]">
                  Occupancy Gain
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 4 */}

      {step === 4 && (
        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
          <h2 className="text-2xl font-black">
            Review & Submit
          </h2>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-[#6B7280]">
                Objective
              </p>

              <p className="font-bold">
                {
                  selectedObjective?.title
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-[#6B7280]">
                Plan
              </p>

              <p className="font-bold">
                {form.planName}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#6B7280]">
                Product
              </p>

              <p className="font-bold">
                {form.productName}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#6B7280]">
                Smart Price
              </p>

              <p className="font-bold">
                ${form.smartPrice}
              </p>
            </div>
          </div>

          <button className="mt-8 w-full rounded-2xl bg-[#FF7A00] py-4 text-lg font-black text-black">
            Submit For Agent Review
          </button>
        </section>
      )}

      {/* NAVIGATION */}

      <section className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() =>
              setStep((s) => s - 1)
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 py-4"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        )}

        {step < 4 && (
          <button
            disabled={
              step === 1 &&
              !canContinue
            }
            onClick={() =>
              setStep((s) => s + 1)
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FF7A00] py-4 font-black text-black disabled:opacity-40"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        )}
      </section>
    </div>
  );
}