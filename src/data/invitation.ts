export type WeddingEvent = {
  id: string;
  date: "2026-12-11" | "2026-12-12" | "2026-12-13";
  label: string;
  start: string;
  end?: string;
  venue?: string;
  featured?: boolean;
};

export const invitation = {
  couple: { first: "Sunil", second: "Pooja", display: "Sunil & Pooja" },
  dateLine: "11–13 December 2026",
  timezone: "Asia/Kolkata",
  muhurthamISO: "2026-12-13T04:05:00+05:30",
  venue: { name: "Agrasen Bhavan", locality: "New Khursipar", search: "Agrasen Bhavan, New Khursipar" },
  brother: "Sheshu Sai",
  pets: ["Max", "Mummble", "Evii", "Pica", "Guffy"],
  assets: {
    templeFacade: "/media/temple-facade.jpg",
    templeDoors: "/media/temple-doors.jpg",
    couplePortraitOne: "/media/couple-portrait-01.jpeg",
    couplePortraitTwo: "/media/couple-portrait-02.jpeg",
    films: [
      { src: "/media/couple-film-1.mp4", poster: "/media/couple-film-1-poster.jpg", label: "Sunrise" },
      { src: "/media/couple-film-2.mp4", poster: "/media/couple-film-2-poster.jpg", label: "Together" },
      { src: "/media/couple-film-3.mp4", poster: "/media/couple-film-3-poster.jpg", label: "By the falls" },
      { src: "/media/couple-film-4.mp4", poster: "/media/couple-film-4-poster.jpg", label: "The climb" },
    ],
    petSticker: "/media/max-mummble.jpeg",
    backgroundAudio: null as string | null,
  },
  events: [
    { id: "rata", date: "2026-12-11", label: "Rata", start: "07:30", end: "08:30" },
    { id: "pelli", date: "2026-12-11", label: "Pelli Kuturu & Pelli Koduku", start: "09:00" },
    { id: "pradanam", date: "2026-12-12", label: "Pradanam", start: "08:00" },
    { id: "haldi", date: "2026-12-12", label: "Haldi", start: "14:30", featured: true },
    { id: "barat", date: "2026-12-12", label: "Barat", start: "18:00", featured: true },
    { id: "reception", date: "2026-12-12", label: "Reception", start: "19:30", featured: true },
    { id: "muhurtham", date: "2026-12-13", label: "Muhurtham", start: "04:05", venue: "Agrasen Bhavan, New Khursipar", featured: true },
  ] satisfies WeddingEvent[],
} as const;

export const dateChapters = [
  { date: "2026-12-11", eyebrow: "Friday", title: "The festivities begin" },
  { date: "2026-12-12", eyebrow: "Saturday", title: "A day of celebration" },
  { date: "2026-12-13", eyebrow: "Sunday · early morning", title: "The sacred hour" },
] as const;
