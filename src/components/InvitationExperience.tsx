"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { dateChapters, invitation, type WeddingEvent } from "@/data/invitation";
import { FloralDivider, Monogram } from "./Ornaments";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: invitation.timezone,
});

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const COUNTDOWN_UNITS = ["days", "hours", "minutes", "seconds"];
const EVENT_SYMBOLS: Record<string, string> = {
  rata: "✦",
  pelli: "❧",
  pradanam: "◇",
  haldi: "☼",
  barat: "♘",
  reception: "✧",
  muhurtham: "❋",
};
const schedule = dateChapters.map((chapter) => ({
  ...chapter,
  events: invitation.events.filter((event) => event.date === chapter.date),
}));

const toEventDate = (event: WeddingEvent, time = event.start) =>
  new Date(`${event.date}T${time}:00+05:30`);

const formatTime = (event: WeddingEvent) => {
  const format = (time: string) =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: invitation.timezone,
    }).format(toEventDate(event, time));
  return event.end
    ? `${format(event.start)}–${format(event.end)}`
    : format(event.start);
};

function buildCalendar(events: readonly WeddingEvent[]) {
  const clean = (value: string) => value.replace(/[-:]/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sunil & Poojitha//Wedding Celebrations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Sunil & Poojitha Wedding Celebrations",
    "X-WR-TIMEZONE:Asia/Kolkata",
  ];

  events.forEach((event) => {
    const start = `${clean(event.date)}T${clean(event.start)}00`;
    const end = event.end
      ? `${clean(event.date)}T${clean(event.end)}00`
      : `${clean(event.date)}T${clean(event.start)}00`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@sunil-poojitha-wedding-celebrations`,
      `DTSTART;TZID=Asia/Kolkata:${start}`,
      `DTEND;TZID=Asia/Kolkata:${end}`,
      `SUMMARY:${event.label} — Sunil & Poojitha Wedding`,
      `LOCATION:${event.venue || invitation.venue.fullAddress}`,
      `DESCRIPTION:${event.description || event.label}. All timings are in India Standard Time (IST).`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadCalendar() {
  const blob = new Blob([buildCalendar(invitation.events)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "sunil-poojitha-wedding-celebrations.ics";
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyInvitation(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard unavailable");
}

function HeroInvitation() {
  const onContinue = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById("story")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className="hero"
      id="invitation"
      aria-labelledby="invitation-title"
    >
      <div className="hero__frame" aria-hidden="true">
      </div>

      <div className="hero__container">
        <div className="hero__card">
          <div className="hero__blessing-wrap">
            <svg
              className="hero__ganesha"
              viewBox="0 0 64 64"
              aria-hidden="true"
            >
              <path d="M33 8c-4 0-7 3-7 7 0 3 2 5 5 6m-6-4c-7 0-12 5-12 12 0 6 4 10 9 10 4 0 7-2 8-5m9-17c7 0 12 5 12 12 0 6-4 10-9 10m-10-18c5 0 8 3 8 8 0 9-12 10-12 18 0 5 4 8 8 8 5 0 8-4 8-9m-29-19c-3-1-6 1-6 4 0 4 4 6 8 4m34-8c3-1 6 1 6 4 0 4-4 6-8 4M32 8V3m-4 4 4-4 4 4" />
            </svg>
            <p className="hero__blessing">With the blessings of Lord Ganesha</p>
            <div className="hero__blessing-divider" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
          </div>

          <p className="hero__eyebrow">You are invited to</p>

          <h1 id="invitation-title" className="hero__names">
            <span className="hero__name hero__name--first">
              {invitation.couple.first}
            </span>
            <span className="hero__ampersand" aria-hidden="true">
              &amp;
            </span>
            <span className="hero__name hero__name--second">
              Poojitha
            </span>
          </h1>

          <div className="hero__lotus-rule" aria-hidden="true">
            <span />
            <i>♧</i>
            <span />
          </div>

          <p className="hero__invitation-text">
            Together with our families, we invite you to celebrate our wedding.
          </p>

          <div className="hero__action-wrap">
            <a
              className="hero__action"
              href="#story"
              onClick={onContinue}
              aria-label="View invitation, continue to wedding story"
            >
              <span>View Invitation</span>
              <span className="hero__action-icon" aria-hidden="true">
                →
              </span>
            </a>
          </div>
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

function BrotherNote() {
  const { groomBrother } = invitation.family;

  return (
    <section
      className="brother-note section"
      id="brother-note"
      aria-labelledby="brother-note-title"
    >
      <div className="container brother-note__card" data-reveal>
        <div className="brother-note__ornament" aria-hidden="true">
          <FloralDivider />
        </div>

        <p className="brother-note__eyebrow">
          A note from the Groom&apos;s Brother
        </p>

        <div className="brother-note__header">
          <h2 id="brother-note-title" className="brother-note__name">
            {groomBrother.name}
          </h2>
          <p className="brother-note__relation">{groomBrother.relation}</p>
        </div>

        <div className="brother-note__body">
          <p className="brother-note__message">
            &ldquo;{groomBrother.note}&rdquo;
          </p>
        </div>

        <div className="brother-note__closing" aria-hidden="true">
          <span className="brother-note__closing-line" />
          <span className="brother-note__closing-motif">❦</span>
          <span className="brother-note__closing-line" />
        </div>
      </div>
    </section>
  );
}

function CalendarOverview() {
  return (
    <div
      className="calendar"
      data-reveal
      aria-label="December 2026 calendar with wedding dates highlighted"
    >
      <div className="calendar__heading">
        <span>December</span>
        <strong>2026</strong>
      </div>
      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="calendar__days">
        {Array.from({ length: 35 }, (_, index) => {
          const day = index - 1;
          const selected = day >= 11 && day <= 13;
          return (
            <span
              className={selected ? `is-wedding-day day-${day}` : ""}
              key={index}
            >
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
  return (
    <div className="schedule" data-reveal>
      {schedule.map((group) => (
        <section
          className="schedule__day"
          key={group.date}
          aria-labelledby={`date-${group.date}`}
        >
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
                  {EVENT_SYMBOLS[event.id]}
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
          onClick={downloadCalendar}
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
        Math.max(0, new Date(invitation.muhurthamISO).getTime() - Date.now()),
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
      {COUNTDOWN_UNITS.map((label, index) => (
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
        isVisible.current =
          entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (isVisible.current) void tryPlay();
        else video.pause();
      },
      { threshold: [0, 0.35, 0.75] },
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
  const [calendarLabel, setCalendarLabel] = useState("Save to calendar");
  const shareTimer = useRef<number | null>(null);
  const calendarTimer = useRef<number | null>(null);

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
            obs.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.1,
      },
    );

    const elements = document.querySelectorAll("[data-reveal]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (shareTimer.current) window.clearTimeout(shareTimer.current);
      if (calendarTimer.current) window.clearTimeout(calendarTimer.current);
    },
    [],
  );

  const resetLabel = (
    timer: React.MutableRefObject<number | null>,
    callback: () => void,
  ) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(callback, 2000);
  };

  const share = async () => {
    const data = {
      title: "Sunil & Poojitha — Wedding Invitation",
      text: "Join us for Sunil & Poojitha’s wedding celebrations, 11–13 December 2026. Sumuhurthamu: 13 December at 4:05 AM IST.",
      url: location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setShareLabel("Invitation shared");
      } else {
        await copyInvitation(`${data.text}\n${data.url}`);
        setShareLabel("Invitation copied");
      }
      resetLabel(shareTimer, () => setShareLabel("Share invitation"));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareLabel("Try again");
      resetLabel(shareTimer, () => setShareLabel("Share invitation"));
    }
  };

  const saveCalendar = () => {
    try {
      downloadCalendar();
      setCalendarLabel("Calendar saved");
    } catch {
      setCalendarLabel("Try again");
    }
    resetLabel(calendarTimer, () => setCalendarLabel("Save to calendar"));
  };

  return (
    <main ref={main}>
      <HeroInvitation />

      <section
        className="story section"
        id="story"
        aria-labelledby="story-title"
      >
        <div className="container story__grid">
          <div className="story__portraits" data-reveal>
            <figure className="arched-photo arched-photo--main">
              <Image
                src={invitation.assets.couplePortraitOne}
                fill
                sizes="(max-width: 767px) 78vw, 460px"
                alt="Sunil and Poojitha walking hand in hand"
              />
            </figure>
            <figure className="arched-photo arched-photo--inset">
              <Image
                src={invitation.assets.couplePortraitTwo}
                fill
                sizes="(max-width: 767px) 42vw, 230px"
                alt="Sunil and Poojitha together by a waterfall"
              />
            </figure>
          </div>
          <div className="story__copy" data-reveal>
            <h2 id="story-title">Two hearts, one beginning</h2>
            <FloralDivider />
            <p>
              As we begin this new chapter, your presence and blessings would
              make our celebration complete.
            </p>
            <p className="signature">
              Sunil <i>&amp;</i> Poojitha
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
            <p>
              Our celebration would not be complete without their paw prints.
            </p>
          </div>
          <div className="family__desktop-art">
            <PetSticker />
          </div>
        </div>
        <div className="container welcome" data-reveal>
          <p>
            With love and blessings from{" "}
            <strong>{invitation.family.groomBrother.name}</strong>{" "}
            <span className="welcome__relation">
              ({invitation.family.groomBrother.relation})
            </span>{" "}
            and <strong>{invitation.family.brideBrother.name}</strong>{" "}
            <span className="welcome__relation">
              ({invitation.family.brideBrother.relation})
            </span>
            .
          </p>
        </div>
      </section>

      <BrotherNote />

      <section
        className="celebrations section"
        id="celebrations"
        aria-labelledby="celebrations-title"
      >
        <div className="container celebrations__intro">
          <div data-reveal>
            <h2 id="celebrations-title">Celebrate with us</h2>
            <p>
              All timings are in India Standard Time (IST). The Sumuhurthamu
              begins early on 13 December, following the reception night.
            </p>
          </div>
          <CalendarOverview />
        </div>
        <div className="container">
          <Schedule />
        </div>
      </section>

      <section
        className="venue section"
        id="venue"
        aria-labelledby="venue-title"
      >
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
                invitation.venue.fullAddress,
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
            With love,
            <br />
            Sunil <i>&amp;</i> Poojitha
          </h2>
          <p>We cannot wait to celebrate with you.</p>
          <p className="closing__date">
            Sumuhurthamu · 13 December 2026 · 4:05 AM IST
          </p>
          <Countdown />
          <div className="closing__actions">
            <button
              className="button button--ivory"
              onClick={share}
              type="button"
              aria-label="Share Sunil and Poojitha's wedding invitation"
            >
              {shareLabel}
            </button>
            <button
              className="button button--gold-subtle"
              onClick={saveCalendar}
              type="button"
              aria-label="Download the complete wedding schedule as a calendar file"
            >
              {calendarLabel}
            </button>
            <span className="sr-only" aria-live="polite">
              {shareLabel !== "Share invitation" ? shareLabel : calendarLabel}
            </span>
          </div>
          <small>
            Wedding celebrations · 11–13 December 2026 · New Khursipar, Bhilai
          </small>
        </div>
      </section>
    </main>
  );
}
