export type WeddingEvent = {
  id: string;
  date: "2026-12-11" | "2026-12-12" | "2026-12-13";
  label: string;
  description?: string;
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
  venue: {
    name: "Agrasen Bhavan",
    locality: "New Khursipar, Bhilai",
    address: "6C53+2WF, New Khursipar, Bhilai,Distt, Chhattisgarh 490011",
    fullAddress: "Agrasen Bhavan, New Khursipar, 6C53+2WF, New Khursipar, Bhilai,Distt, Chhattisgarh 490011",
  },
  family: {
    groomBrother: {
      name: "Sheshu",
      relation: "Groom's Brother",
      note: "Watching my brother begin this beautiful new chapter is a moment I will always cherish. Sunil and Pooja, may your life together be filled with endless happiness, laughter, love, and memories that grow more beautiful with every passing year. So happy to celebrate this special day with both of you.",
    },
    brideBrother: {
      name: "Sai",
      relation: "Bride's Brother",
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
      label: "Rata Snanamu",
      description: "Sacred commencement and morning ritual marking the beginning of festivities.",
      start: "07:30",
      end: "08:30",
    },
    {
      id: "pelli",
      date: "2026-12-11",
      label: "Pellikuthuru & Pellikoduku",
      description: "Ceremonial blessings and traditional adorning of the bride and groom.",
      start: "09:00",
    },
    {
      id: "pradanam",
      date: "2026-12-12",
      label: "Pradanamu",
      description: "The sacred engagement and formal exchange of wedding auspiciousness.",
      start: "08:00",
    },
    {
      id: "haldi",
      date: "2026-12-12",
      label: "Mangala Snanamu",
      description: "Traditional turmeric ceremony and joyful celebrations with family.",
      start: "14:30",
      featured: true,
    },
    {
      id: "barat",
      date: "2026-12-12",
      label: "Edurukolu",
      description: "Grand celebratory procession and warm traditional welcoming of the groom.",
      start: "18:00",
      featured: true,
    },
    {
      id: "reception",
      date: "2026-12-12",
      label: "Sangeetham & Reception",
      description: "An evening of music, dinner, and togetherness with family and friends.",
      start: "19:30",
      featured: true,
    },
    {
      id: "muhurtham",
      date: "2026-12-13",
      label: "Sumuhurthamu",
      description: "Jeelakarra Bellam & Mangalyadharana in the auspicious Brahma Muhurtham.",
      start: "04:05",
      venue: "Agrasen Bhavan, New Khursipar, 6C53+2WF, New Khursipar, Bhilai,Distt, Chhattisgarh 490011",
      featured: true,
    },
  ] satisfies WeddingEvent[],
} as const;

export const dateChapters = [
  { date: "2026-12-11", eyebrow: "Friday · Shukravaramu", title: "The festivities begin" },
  { date: "2026-12-12", eyebrow: "Saturday · Shanivaramu", title: "A day of celebration" },
  { date: "2026-12-13", eyebrow: "Sunday · Adivaramu", title: "The sacred hour" },
] as const;
