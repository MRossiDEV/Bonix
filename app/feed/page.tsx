"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import getActivePromos from "@/lib/promos/get-promos";

import {
  Bell,
  ChevronDown,
  Clock3,
  Filter,
  Flame,
  Map,
  MapPin,
  Search,
  User2,
} from "lucide-react";

import UserAppLayout from "@/app/components/UserAppLayout";
import { createClient } from "@/lib/supabase/client";
import { mapPromoRowToCard, PromoCardData } from "@/lib/promos";
import { PromoFeed } from "@/app/components/feed/PromoFeed";


const categories = [
  "Under $300",
  "2x1",
  "Happy Hour",
  "Cheap Lunch",
  "Tonight Deals",
  "Coffee",
  "Burgers",
  "Pizza",
];

function formatTimeLeft(expiresAt?: string) {
  if (!expiresAt) return "Limited time";

  const now = Date.now();
  const end = new Date(expiresAt).getTime();

  const diff = end - now;

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) {
    const mins = Math.floor(
      diff / (1000 * 60)
    );

    return `Ends in ${mins}m`;
  }

  if (hours < 24) {
    return `Ends in ${hours}h`;
  }

  const days = Math.floor(hours / 24);

  return `Ends in ${days}d`;
}

// export default function FeedPage() {
//   const [promos, setPromos] = useState<
//     PromoCardData[]
//   >([]);

//   const [loading, setLoading] =
//     useState(true);

//   const supabase = useMemo(
//     () => createClient(),
//     []
//   );

//   useEffect(() => {
//     const loadPromos = async () => {
//       setLoading(true);
//       getActivePromos();
//     }

//     loadPromos();
//   });

//   return (
//     <UserAppLayout
//       basePath=""
//       userName="Bonix Member"
//       userEmail="member@bonix.app"
//     >
//       <div className="min-h-screen bg-[#080808] text-white">
//         {/* HEADER */}
//         <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-2xl">
//           <div className="px-4 pb-4 pt-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="flex items-center gap-2">
//                   <h1 className="text-2xl font-black tracking-tight">
//                     BONIX
//                   </h1>

//                   <div className="flex items-center gap-1 rounded-full bg-[#1A1A1A] px-2 py-1 text-xs text-[#9CA3AF]">
//                     <MapPin className="h-3 w-3" />

//                     <span>Montevideo</span>

//                     <ChevronDown className="h-3 w-3" />
//                   </div>
//                 </div>

//                 <p className="mt-1 text-sm text-[#9CA3AF]">
//                   Discover nearby savings
//                 </p>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#121212]">
//                   <Bell className="h-5 w-5" />
//                 </button>

//                 <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#121212]">
//                   <User2 className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             {/* SEARCH */}
//             <div className="mt-4 flex items-center gap-2">
//               <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-white/5 bg-[#121212] px-4">
//                 <Search className="h-5 w-5 text-[#6B7280]" />

//                 <input
//                   placeholder="Search burgers, coffee, cheap lunch..."
//                   className="w-full bg-transparent text-sm outline-none placeholder:text-[#6B7280]"
//                 />
//               </div>

//               <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#121212]">
//                 <Filter className="h-5 w-5" />
//               </button>

//               <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#121212]">
//                 <Map className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* MODO AHORRO */}
//         <section className="mt-4">
//           <div className="mb-3 px-4">
//             <div className="flex items-center gap-2">
//               <Flame className="h-5 w-5 text-[#FF7A00]" />

//               <h2 className="text-lg font-black">
//                 Modo Ahorro
//               </h2>
//             </div>
//           </div>

//           <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 pb-2">
//             {categories.map(
//               (category, index) => (
//                 <motion.button
//                   whileTap={{
//                     scale: 0.96,
//                   }}
//                   key={category}
//                   className={`whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-bold ${
//                     index === 0
//                       ? "bg-[#FF7A00] text-[#121212]"
//                       : "border border-white/5 bg-[#121212] text-white"
//                   }`}
//                 >
//                   {category}
//                 </motion.button>
//               )
//             )}
//           </div>
//         </section>

//         {/* FEED */}
//         <main className="space-y-5 px-4 pb-32 pt-5">
//           {loading &&
//             Array.from({ length: 4 }).map(
//               (_, index) => (
//                 <div
//                   key={index}
//                   className="animate-pulse overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]"
//                 >
//                   <div className="aspect-[16/10] bg-[#1A1A1A]" />

//                   <div className="space-y-3 p-5">
//                     <div className="h-4 w-32 rounded bg-[#1A1A1A]" />

//                     <div className="h-8 w-full rounded bg-[#1A1A1A]" />

//                     <div className="h-4 w-2/3 rounded bg-[#1A1A1A]" />
//                   </div>
//                 </div>
//               )
//             )}

//           {!loading &&
//             promos.map((promo, index) => (
//               <motion.div
//                 initial={{
//                   opacity: 0,
//                   y: 20,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 transition={{
//                   delay: index * 0.05,
//                 }}
//                 key={promo.id}
//               >
//                 <Link
//                   href={`/promo/${promo.slug}`}
//                 >
//                   <motion.article
//                     whileTap={{
//                       scale: 0.985,
//                     }}
//                     className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]"
//                   >
//                     {/* IMAGE */}
//                     <div className="relative aspect-[16/10] overflow-hidden">
//                       <Image
//                         src={
//                           promo.imageUrl ??
//                           "/placeholder.jpg"
//                         }
//                         alt={promo.title}
//                         fill
//                         className="object-cover"
//                       />

//                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />

//                       {/* TOP BADGES */}
//                       <div className="absolute left-4 top-4 flex items-center gap-2">
//                         <div className="rounded-full bg-black/50 px-3 py-1 text-xs font-bold backdrop-blur-xl">
//                           📍{" "}
//                           {
//                             promo.distanceLabel
//                           }
//                         </div>

//                         {promo.discountedPrice <=
//                           300 && (
//                           <div className="rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-black text-[#121212]">
//                             Modo Ahorro
//                           </div>
//                         )}
//                       </div>

//                       {/* SAVE */}
//                       <div className="absolute right-4 top-4 rounded-full bg-[#00E5A8] px-3 py-1 text-xs font-black text-[#121212]">
//                         SAVE $
//                         {Math.round(
//                           promo.originalPrice -
//                             promo.discountedPrice
//                         )}
//                       </div>

//                       {/* TIMER */}
//                       <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 backdrop-blur-xl">
//                         <Clock3 className="h-4 w-4 text-[#FF7A00]" />

//                         <span className="text-xs font-bold">
//                           {formatTimeLeft(
//                             (
//                               promo as PromoCardData & {
//                                 expiresAt?: string;
//                               }
//                             ).expiresAt
//                           )}
//                         </span>
//                       </div>
//                     </div>

//                     {/* CONTENT */}
//                     <div className="p-5">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-sm font-bold text-[#D1D5DB]">
//                             {
//                               promo.merchantName
//                             }
//                           </p>

//                           <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
//                             <span>
//                               {
//                                 promo.category
//                               }
//                             </span>

//                             <span>•</span>

//                             <span>
//                               {
//                                 promo.neighborhood
//                               }
//                             </span>
//                           </div>
//                         </div>

//                         {promo.isFeatured && (
//                           <div className="rounded-full bg-[#1A1A1A] px-3 py-1 text-xs font-bold text-[#FF7A00]">
//                             Trending
//                           </div>
//                         )}
//                       </div>

//                       {/* TITLE */}
//                       <h2 className="mt-4 text-2xl font-black leading-tight">
//                         {promo.title}
//                       </h2>

//                       <p className="mt-2 line-clamp-1 text-sm text-[#9CA3AF]">
//                         {promo.description}
//                       </p>

//                       {/* PRICE */}
//                       <div className="mt-5 flex items-end justify-between">
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <span className="text-sm text-[#6B7280] line-through">
//                               $
//                               {
//                                 promo.originalPrice
//                               }
//                             </span>

//                             <span className="rounded-full bg-[#FF7A00]/10 px-2 py-1 text-xs font-bold text-[#FF7A00]">
//                               {
//                                 promo.discountPercent
//                               }
//                               % OFF
//                             </span>
//                           </div>

//                           <div className="mt-2 flex items-end gap-2">
//                             <span className="text-4xl font-black">
//                               $
//                               {
//                                 promo.discountedPrice
//                               }
//                             </span>

//                             <span className="pb-1 text-sm font-semibold text-[#00E5A8]">
//                               +
//                               {
//                                 promo.cashbackPercent
//                               }
//                               % back
//                             </span>
//                           </div>
//                         </div>

//                         <motion.button
//                           whileTap={{
//                             scale: 0.95,
//                           }}
//                           className="rounded-2xl bg-[#FF7A00] px-5 py-4 text-sm font-black text-[#121212]"
//                         >
//                           Claim
//                         </motion.button>
//                       </div>
//                     </div>
//                   </motion.article>
//                 </Link>
//               </motion.div>
//             ))}

//           {!loading &&
//             promos.length === 0 && (
//               <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-[#121212] px-6 py-20 text-center">
//                 <div className="text-6xl">
//                   🍔
//                 </div>

//                 <h2 className="mt-5 text-2xl font-black">
//                   No deals nearby
//                 </h2>

//                 <p className="mt-3 max-w-sm text-sm text-[#9CA3AF]">
//                   Try expanding your
//                   search radius or check
//                   again later.
//                 </p>

//                 <button className="mt-6 rounded-2xl bg-[#FF7A00] px-6 py-4 font-bold text-[#121212]">
//                   Retry
//                 </button>
//               </div>
//             )}
//         </main>

//         {/* BOTTOM NAV */}
//         <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#080808]/90 backdrop-blur-2xl">
//           <div className="grid grid-cols-5 px-2 py-3">
//             {[
//               "Home",
//               "Saved",
//               "Map",
//               "Alerts",
//               "Profile",
//             ].map((item, index) => (
//               <button
//                 key={item}
//                 className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-semibold ${
//                   index === 0
//                     ? "text-[#FF7A00]"
//                     : "text-[#6B7280]"
//                 }`}
//               >
//                 <div
//                   className={`h-1.5 w-1.5 rounded-full ${
//                     index === 0
//                       ? "bg-[#FF7A00]"
//                       : "bg-transparent"
//                   }`}
//                 />

//                 {item}
//               </button>
//             ))}
//           </div>
//         </nav>
//       </div>
//     </UserAppLayout>
//   );
// }

export default function FeedPage() {
  return (
    <div>
      <PromoFeed />
    </div>
  );
}