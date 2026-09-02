"use client";

import {
  Award,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Trophy,
  TrendingUp,
} from "lucide-react";

export default function AgentAcademyPage() {
  const courses = [
    {
      title: "Smart Spending Fundamentals",
      progress: 100,
    },
    {
      title: "End Of Month Booster Mastery",
      progress: 75,
    },
    {
      title: "Restaurant Growth Strategies",
      progress: 0,
    },
  ];

  const certifications = [
    "Bronze Agent",
    "Silver Agent",
    "Gold Agent",
    "Senior Growth Agent",
    "Master BONIX Consultant",
  ];

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
          BONIX Academy
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Agent Learning Center
        </h1>

        <p className="mt-3 text-sm text-[#9CA3AF]">
          Learn how to help merchants generate
          consistent revenue through Smart Spending
          strategies.
        </p>
      </section>

      {/* Performance */}

      <section className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/5 p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Your Development
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-4xl font-black">
              92
            </p>

            <p className="text-sm text-[#9CA3AF]">
              Agent Score
            </p>
          </div>

          <div>
            <p className="text-4xl font-black">
              6
            </p>

            <p className="text-sm text-[#9CA3AF]">
              Courses
            </p>
          </div>

          <div>
            <p className="text-4xl font-black">
              2
            </p>

            <p className="text-sm text-[#9CA3AF]">
              Certifications
            </p>
          </div>
        </div>
      </section>

      {/* Courses */}

      <section>
        <div className="mb-4 flex items-center gap-3">
          <GraduationCap className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Learning Paths
          </h2>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <article
              key={course.title}
              className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">
                  {course.title}
                </h3>

                <span className="font-black text-[#FF7A00]">
                  {course.progress}%
                </span>
              </div>

              <div className="mt-4 h-2 rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-[#FF7A00]"
                  style={{
                    width: `${course.progress}%`,
                  }}
                />
              </div>

              <button className="mt-4 flex items-center gap-2 text-sm font-bold text-[#FF7A00]">
                Continue
                <ChevronRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Smart Plan Training */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Smart Plan Training
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          {[
            "End Of Month Booster",
            "Lunch Recovery",
            "Happy Hour Accelerator",
            "Family Weekend Plan",
          ].map((plan) => (
            <div
              key={plan}
              className="flex items-center justify-between rounded-2xl bg-black/20 p-4"
            >
              <span>{plan}</span>

              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </section>

      {/* Industry Playbooks */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Industry Playbooks
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            "Restaurants",
            "Retail",
            "Beauty",
            "Fitness",
            "Entertainment",
            "Services",
          ].map((item) => (
            <button
              key={item}
              className="rounded-2xl border border-white/5 bg-black/20 p-4"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Certifications */}

      <section>
        <div className="mb-4 flex items-center gap-3">
          <Award className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Certifications
          </h2>
        </div>

        <div className="space-y-3">
          {certifications.map((cert) => (
            <div
              key={cert}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#121212] p-4"
            >
              <span>{cert}</span>

              <Trophy className="text-[#FF7A00]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}