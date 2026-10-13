"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { dateChapters, invitation, type WeddingEvent } from "@/data/invitation";
import { FloralDivider, Monogram } from "./Ornaments";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: invitation.timezone,
});

const eventDate = (event: WeddingEvent, time = event.start) =>
  new Date(`${event.date}T${time}:00+05:30`);

const formatTime = (event: WeddingEvent) => {
  const format = (time: string) =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: invitation.timezone,
    }).format(eventDate(event, time));
  return event.end ? `${format(event.start)}–${format(event.end)}` : format(event.start);
};

function makeFullCalendarICS(events: readonly WeddingEvent[]) {
  const clean = (value: string) => value.replace(/[-:]/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sunil & Pooja//Wedding Celebrations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Sunil & Pooja Wedding Celebrations",
    "X-WR-TIMEZONE:Asia/Kolkata",
  ];

  events.forEach((event) => {
    const start = `${clean(event.date)}T${clean(event.start)}00`;
    const end = event.end
      ? `${clean(event.date)}T${clean(event.end)}00`
      : `${clean(event.date)}T${clean(event.start)}00`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@sunil-pooja-wedding-celebrations`,
      `DTSTART;TZID=Asia/Kolkata:${start}`,
      `DTEND;TZID=Asia/Kolkata:${end}`,
      `SUMMARY:${event.label} — Sunil & Pooja Wedding`,
      `LOCATION:${event.venue || invitation.venue.fullAddress}`,
      `DESCRIPTION:${event.description || event.label}. All timings are in India Standard Time (IST).`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadFullCalendar() {
  const blob = new Blob([makeFullCalendarICS(invitation.events)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "sunil-pooja-wedding-celebrations.ics";
  anchor.click();
  URL.revokeObjectURL(url);
}

function HeroInvitation() {
  const onContinue = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("story");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="hero" id="invitation" aria-labelledby="invitation-title">
      <div className="hero__frame" aria-hidden="true">
        <Image
          className="hero__temple-art"
          src={invitation.assets.templeFacade}
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__ambient" />
      </div>

      <div className="hero__container">
        <div className="hero__card">
          <div className="hero__blessing-wrap">
            <p className="hero__blessing">With the blessings of Lord Ganesha</p>
            <div className="hero__blessing-divider" aria-hidden="true">
              <span />
              <i>❖</i>
              <span />
            </div>
          </div>

          <h1 id="invitation-title" className="hero__names">
            <span className="hero__name hero__name--first">{invitation.couple.first}</span>
            <span className="hero__ampersand" aria-hidden="true">&amp;</span>
            <span className="hero__name hero__name--second">{invitation.couple.second}</span>
          </h1>

          <p className="hero__invitation-text">
            Together with our families, we invite you to celebrate our wedding.
          </p>

          <div className="hero__meta">
            <p className="hero__date">{invitation.dateLine}</p>
            <p className="hero__muhurtham">Sumuhurthamu · 13 December, 4:05 AM IST</p>
          </div>

          <div className="hero__action-wrap">
            <a
              className="hero__action"
              href="#story"
              onClick={onContinue}
              aria-label="View celebrations, continue to wedding story"
            >
              <span>View celebrations</span>
              <span className="hero__action-icon" aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero__scroll-cue" aria-hidden="true">
          <span className="hero__scroll-line" />
        </div>
      </div>

      <div className="hero__transition" aria-hidden="true" />
    </section>
  );
}

function PetSticker() {
  return (
    <div className="family__art" data-reveal>
      <Image
        src={invitation.assets.petSticker}
        width={1254}
        height={1254}
        sizes="(max-width: 900px) 280px, 420px"
        alt="Mummble and Max artwork with floral wreath"
      />
    </div>
  );
}

function CalendarOverview() {
  return (
    <div className="calendar" data-reveal aria-label="December 2026 calendar with wedding dates highlighted">
      <div className="calendar__heading">
        <span>December</span>
        <strong>2026</strong>
      </div>
      <div className="calendar__weekdays" aria-hidden="true">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="calendar__days">
        {Array.from({ length: 35 }, (_, index) => {
          const day = index - 1;
          const selected = day >= 11 && day <= 13;
          return (
            <span className={selected ? `is-wedding-day day-${day}` : ""} key={index}>
              {day > 0 && day <= 31 ? day : ""}
            </span>
          );
        })}
      </div>
      <p>
        <i /> Wedding celebrations <b /> Sumuhurthamu
      </p>
    </div>
  );
}

function Schedule() {
  const groups = useMemo(
    () =>
      dateChapters.map((chapter) => ({
        ...chapter,
        events: invitation.events.filter((event) => event.date === chapter.date),
      })),
    []
  );

  const symbols: Record<string, string> = {
    rata: "✦",
    pelli: "❧",
    pradanam: "◇",
    haldi: "☼",
    barat: "♘",
    reception: "✧",
    muhurtham: "❋",
  };

  return (
    <div className="schedule" data-reveal>
      {groups.map((group) => (
        <section className="schedule__day" key={group.date} aria-labelledby={`date-${group.date}`}>
          <header>
            <p>{group.eyebrow}</p>
            <h3 id={`date-${group.date}`}>
              {dateFormat.format(new Date(`${group.date}T12:00:00+05:30`))}
            </h3>
          </header>
          <div className="schedule__events">
            {group.events.map((event) => (
              <article
                className={`schedule__event ${
                  event.id === "muhurtham" ? "schedule__event--muhurtham" : ""
                }`}
                key={event.id}
              >
                <span className="schedule__symbol" aria-hidden="true">
                  {symbols[event.id]}
                </span>
                <div className="schedule__details">
                  <h4>{event.label}</h4>
                  {event.description && <p>{event.description}</p>}
                </div>
                <time
                  className="schedule__time"
                  dateTime={`${event.date}T${event.start}:00+05:30`}
                >
                  {formatTime(event)} <small>IST</small>
                </time>
              </article>
            ))}
          </div>
        </section>
      ))}
      <div className="schedule__footer">
        <button
          className="button button--ivory schedule__calendar-action"
          type="button"
          onClick={downloadFullCalendar}
        >
          <span aria-hidden="true">📅</span>
          <span>Save schedule to calendar</span>
        </button>
      </div>
    </div>
  );
}

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () =>
      setRemaining(
        Math.max(0, new Date(invitation.muhurthamISO).getTime() - Date.now())
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (remaining === 0)
    return <p className="countdown-complete">The sacred hour has arrived.</p>;

  const values =
    remaining === null
      ? null
      : [
          Math.floor(remaining / 86400000),
          Math.floor(remaining / 3600000) % 24,
          Math.floor(remaining / 60000) % 60,
          Math.floor(remaining / 1000) % 60,
        ];

  return (
    <div className="countdown" aria-label="Countdown to the sumuhurthamu">
      {["days", "hours", "minutes", "seconds"].map((label, index) => (
        <span key={label}>
          {values ? String(values[index]).padStart(2, "0") : "—"}
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}

function CoupleFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayFallback, setShowPlayFallback] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const userPaused = useRef(false);
  const isVisible = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      setReducedMotion(motionQuery.matches);
      if (motionQuery.matches) {
        userPaused.current = true;
        video.pause();
        setShowPlayFallback(true);
      }
    };
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryPlay = async () => {
      if (
        motionQuery.matches ||
        userPaused.current ||
        document.hidden ||
        !isVisible.current
      )
        return;
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
        setShowPlayFallback(false);
      } catch {
        setShowPlayFallback(true);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (isVisible.current) void tryPlay();
        else video.pause();
      },
      { threshold: [0, 0.35, 0.75] }
    );

    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
      else void tryPlay();
    };

    observer.observe(frame);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  const playManually = async () => {
    const video = videoRef.current;
    if (!video) return;
    userPaused.current = false;
    try {
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setShowPlayFallback(false);
    } catch {
      setShowPlayFallback(true);
    }
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void playManually();
    else {
      userPaused.current = true;
      video.pause();
    }
  };

  return (
    <div className="film__player">
      <div className="container film__frame" data-reveal ref={frameRef}>
        <div className="film__corners" aria-hidden="true" />
        <video
          ref={videoRef}
          src={invitation.assets.film.src}
          poster={invitation.assets.film.poster}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          Your browser does not support inline video.
        </video>
        {showPlayFallback && !isPlaying && (
          <button className="film__play" type="button" onClick={playManually}>
            Play film
          </button>
        )}
      </div>
      <button
        className="film__toggle"
        type="button"
        onClick={togglePlayback}
        aria-pressed={!isPlaying}
      >
        {isPlaying ? "Pause film" : reducedMotion ? "Play film" : "Resume film"}
      </button>
    </div>
  );
}

export function InvitationExperience() {
  const main = useRef<HTMLElement>(null);
  const [shareLabel, setShareLabel] = useState("Share invitation");

  // Hero Opening Choreography (Runs once on mount for 1.4s, clears inline styles when done)
  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          gsap.set(
            ".hero__temple-art, .hero__card, .hero__blessing-wrap, .hero__name--first, .hero__ampersand, .hero__name--second, .hero__invitation-text, .hero__meta, .hero__action-wrap, .hero__scroll-cue",
            { clearProps: "transform,opacity" }
          );
        },
      });

      tl.fromTo(
        ".hero__temple-art",
        { opacity: 0.7, scale: 1.02 },
        { opacity: 1, scale: 1, duration: 1.1 }
      )
        .fromTo(
          ".hero__card",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.8"
        )
        .fromTo(
          ".hero__blessing-wrap",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.55"
        )
        .fromTo(
          ".hero__name--first",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.35"
        )
        .fromTo(
          ".hero__ampersand",
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.4 },
          "-=0.35"
        )
        .fromTo(
          ".hero__name--second",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.35"
        )
        .fromTo(
          ".hero__invitation-text",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          ".hero__meta",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          ".hero__action-wrap",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.25"
        )
        .fromTo(
          ".hero__scroll-cue",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.2"
        );
    },
    { scope: main }
  );

  // High-performance IntersectionObserver reveal system (reveals ONCE, unobserves immediately: zero jitter)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            obs.unobserve(entry.target); // Unobserve immediately: stays visible permanently, never re-animates
          }
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll("[data-reveal]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const share = async () => {
    const data = {
      title: "Sunil & Pooja — Wedding Invitation",
      text: "Join us for Sunil & Pooja’s wedding celebrations, 11–13 December 2026. Sumuhurthamu: 13 December at 4:05 AM IST.",
      url: location.href,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(`${data.text} ${data.url}`);
        setShareLabel("Invitation copied");
        window.setTimeout(() => setShareLabel("Share invitation"), 1800);
      }
    } catch {
      /* sharing cancelled */
    }
  };

  return (
    <main ref={main}>
      <HeroInvitation />

      <section className="story section" id="story" aria-labelledby="story-title">
        <div className="container story__grid">
          <div className="story__portraits" data-reveal>
            <figure className="arched-photo arched-photo--main">
              <Image
                src={invitation.assets.couplePortraitOne}
                fill
                sizes="(max-width: 767px) 78vw, 460px"
                alt="Sunil and Pooja walking hand in hand"
              />
            </figure>
            <figure className="arched-photo arched-photo--inset">
              <Image
                src={invitation.assets.couplePortraitTwo}
                fill
                sizes="(max-width: 767px) 42vw, 230px"
                alt="Sunil and Pooja together by a waterfall"
              />
            </figure>
          </div>
          <div className="story__copy" data-reveal>
            <h2 id="story-title">Two hearts, one beginning</h2>
            <FloralDivider />
            <p>
              As we begin this new chapter, your presence and blessings would make our
              celebration complete.
            </p>
            <p className="signature">
              Sunil <i>&amp;</i> Pooja
            </p>
          </div>
        </div>
      </section>

      <section className="film section" aria-labelledby="film-title">
        <div className="container film__heading" data-reveal>
          <h2 id="film-title">A little glimpse of us</h2>
          <p>A small memory we are happy to share with you.</p>
        </div>
        <CoupleFilm />
      </section>

      <section className="family section" aria-labelledby="pets-title">
        <div className="container family__grid">
          <div className="family__copy" data-reveal>
            <h2 id="pets-title">Our little family</h2>
            <div className="family__mobile-art">
              <PetSticker />
            </div>
            <p className="pet-names">{invitation.pets.join(" · ")}</p>
            <p>Our celebration would not be complete without their paw prints.</p>
          </div>
          <div className="family__desktop-art">
            <PetSticker />
          </div>
        </div>
        <div className="container welcome" data-reveal>
          <p>
            With love from <strong>{invitation.brother}</strong>, the groom’s brother.
          </p>
        </div>
      </section>

      <section
        className="celebrations section"
        id="celebrations"
        aria-labelledby="celebrations-title"
      >
        <div className="container celebrations__intro">
          <div data-reveal>
            <h2 id="celebrations-title">Celebrate with us</h2>
            <p>
              All timings are in India Standard Time (IST). The Sumuhurthamu begins early on 13
              December, following the reception night.
            </p>
          </div>
          <CalendarOverview />
        </div>
        <div className="container">
          <Schedule />
        </div>
      </section>

      <section className="venue section" id="venue" aria-labelledby="venue-title">
        <div className="container venue__card" data-reveal>
          <div className="venue__crest">
            <Monogram />
          </div>
          <div className="venue__copy">
            <h2 id="venue-title">We’ll meet you here</h2>
            <p className="venue__name">{invitation.venue.name}</p>
            <p className="venue__locality">{invitation.venue.locality}</p>
            <p className="venue__address">{invitation.venue.address}</p>
            <a
              className="button"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                invitation.venue.fullAddress
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="closing section" aria-labelledby="closing-title">
        <div className="container closing__content" data-reveal>
          <Monogram />
          <p className="closing__blessing" aria-label="Mee Raaka Maa Aanandam">
            Mee Raaka Maa Aanandam
          </p>
          <h2 id="closing-title">
            With love,<br />
            Sunil <i>&amp;</i> Pooja
          </h2>
          <p>We cannot wait to celebrate with you.</p>
          <p className="closing__date">Sumuhurthamu · 13 December 2026 · 4:05 AM IST</p>
          <Countdown />
          <div className="closing__actions">
            <button className="button button--ivory" onClick={share} type="button">
              {shareLabel}
            </button>
            <button
              className="button button--gold-subtle"
              onClick={downloadFullCalendar}
              type="button"
            >
              Save to calendar
            </button>
          </div>
          <small>Wedding celebrations · 11–13 December 2026 · New Khursipar, Bhilai</small>
        </div>
      </section>
    </main>
  );
}
