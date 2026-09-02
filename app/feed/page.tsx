"use client";


import { PromoFeed } from "../components/feed/PromoFeed";


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


export default function FeedPage() {
  return (
    <div>
      <PromoFeed />
    </div>
  );
}