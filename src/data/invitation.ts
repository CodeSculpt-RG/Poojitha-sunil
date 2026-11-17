export type WeddingEvent = {
  id: string;
  date: "2026-12-11" | "2026-12-12" | "2026-12-13";
  label: string;
  description?: string;
  start: string;
  end?: string;
  timeNote?: string;
  venue?: string;
  featured?: boolean;
};

export const invitation = {
  couple: { first: "Poojitha", second: "Sunil", display: "Poojitha & Sunil" },
  dateLine: "11–13 December 2026",
  timezone: "Asia/Kolkata",
  muhurthamISO: "2026-12-13T04:05:00+05:30",
  venue: {
    name: "Agrasen Bhavan",
    locality: "New Khursipar, Bhilai",
    address: "6C53+2WF, New Khursipar, Bhilai,Distt, Chhattisgarh 490011",
    fullAddress:
      "Agrasen Bhavan, New Khursipar, 6C53+2WF, New Khursipar, Bhilai,Distt, Chhattisgarh 490011",
  },
  family: {
    brideBrother: {
      name: "Sai",
      relation: "Bride's Brother",
      note: "Watching my sister begin this beautiful new chapter fills my heart with happiness and pride. Poojitha and Sunil, may your journey together always be filled with understanding, laughter, strength, and a love that grows deeper with every passing day. I am so happy to welcome Sunil into our family and to celebrate this unforgettable moment with you both.",
    },
  },
  pets: ["Mummble", "Max"],
  assets: {
    templeFacade: "/media/temple-facade.jpg",
    couplePortraitOne: "/media/couple-portrait-01.jpeg",
    couplePortraitTwo: "/media/couple-portrait-02.jpeg",
    film: { src: "/assets/v2.mp4", poster: "/media/couple-film-2-poster.jpg" },
    petSticker: "/media/max-mummble.jpeg",
  },
  events: [
    {
      id: "rata",
      date: "2026-12-11",
      label: "Pandiri Rata",
      description: "Following Mehandi at Residence.",
      start: "08:00",
      venue: "Residence",
    },
    {
      id: "pradanam",
      date: "2026-12-12",
      label: "Pradanam",
      description: "At the venue.",
      start: "08:00",
      end: "08:50",
    },
    {
      id: "reception",
      date: "2026-12-12",
      label: "Reception & Dinner",
      description:
        "Venue: Agrasen Bhavan, New Khursipar, Bhilai, Distt. Durg (C.G.).",
      start: "19:00",
      timeNote: "onwards",
      venue: "Agrasen Bhavan, New Khursipar, Bhilai, Distt. Durg (C.G.)",
      featured: true,
    },
    {
      id: "muhurtham",
      date: "2026-12-13",
      label: "Subha Muhurtham",
      description:
        "Margashira Masam, Uttarashada Nakshatram, Tula Lagnam.",
      start: "04:05",
      timeNote: "(early morning)",
      venue:
        "Agrasen Bhavan, New Khursipar, 6C53+2WF, New Khursipar, Bhilai,Distt, Chhattisgarh 490011",
      featured: true,
    },
  ] satisfies WeddingEvent[],
} as const;

export const dateChapters = [
  {
    date: "2026-12-11",
    eyebrow: "Friday · Shukravaramu",
    title: "The festivities begin",
  },
  {
    date: "2026-12-12",
    eyebrow: "Saturday · Shanivaramu",
    title: "A day of celebration",
  },
  {
    date: "2026-12-13",
    eyebrow: "Sunday · Adivaramu",
    title: "The sacred hour",
  },
] as const;
