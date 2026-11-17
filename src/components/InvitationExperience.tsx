"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { dateChapters, invitation, type WeddingEvent } from "@/data/invitation";
import { FloralDivider, Monogram } from "./Ornaments";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: invitation.timezone,
});

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const COUNTDOWN_UNITS = ["DAYS", "HOURS", "MINUTES", "SECONDS"] as const;
const EVENT_SYMBOLS: Record<string, string> = {
  rata: "✦",
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
    "PRODID:-//Poojitha & Sunil//Wedding Celebrations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Poojitha & Sunil Wedding Celebrations",
    "X-WR-TIMEZONE:Asia/Kolkata",
  ];

  events.forEach((event) => {
    const start = `${clean(event.date)}T${clean(event.start)}00`;
    const end = event.end
      ? `${clean(event.date)}T${clean(event.end)}00`
      : `${clean(event.date)}T${clean(event.start)}00`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@poojitha-sunil-wedding-celebrations`,
      `DTSTART;TZID=Asia/Kolkata:${start}`,
      `DTEND;TZID=Asia/Kolkata:${end}`,
      `SUMMARY:${event.label} — Poojitha & Sunil Wedding`,
      `LOCATION:${event.venue || invitation.venue.fullAddress}`,
      `DESCRIPTION:${event.description || event.label}${event.timeNote ? ` ${event.timeNote}` : ""}. All timings are in India Standard Time (IST).`,
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
  anchor.download = "poojitha-sunil-wedding-celebrations.ics";
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
  const [isOpening, setIsOpening] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const openingTimer = useRef<number | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const previousScrollBehavior = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current);
      if (previousScrollBehavior.current !== null) {
        document.documentElement.style.scrollBehavior =
          previousScrollBehavior.current;
      }
    },
    [],
  );

  useLayoutEffect(() => {
    if (hasOpened) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      history.scrollRestoration = previousScrollRestoration;
      if (openingTimer.current) window.clearTimeout(openingTimer.current);
    };
  }, [hasOpened]);

  const onContinue = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isOpening) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const revealInvitation = () => {
      const destination = document.getElementById("family-blessings");
      if (!destination) {
        setIsOpening(false);
        return;
      }

      if (reducedMotion) {
        destination.scrollIntoView({ behavior: "auto", block: "start" });
        setIsOpening(false);
        return;
      }

      const startY = window.scrollY;
      const targetY = destination.getBoundingClientRect().top + startY;
      const duration = 1150;
      const startTime = performance.now();
      previousScrollBehavior.current =
        document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      const easeInOutQuint = (progress: number) =>
        progress < 0.5
          ? 16 * progress ** 5
          : 1 - (-2 * progress + 2) ** 5 / 2;

      const scroll = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = easeInOutQuint(progress);
        window.scrollTo(0, startY + (targetY - startY) * eased);

        if (progress < 1) {
          scrollFrame.current = window.requestAnimationFrame(scroll);
        } else {
          scrollFrame.current = null;
          document.documentElement.style.scrollBehavior =
            previousScrollBehavior.current ?? "";
          previousScrollBehavior.current = null;
          setIsOpening(false);
        }
      };

      scrollFrame.current = window.requestAnimationFrame(scroll);
    };

    setIsOpening(true);
    openingTimer.current = window.setTimeout(
      () => {
        setHasOpened(true);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(revealInvitation);
        });
      },
      reducedMotion ? 0 : 880,
    );
  };

  return (
    <section
      className={`hero${isOpening ? " hero--opening" : ""}`}
      id="invitation"
      aria-labelledby="invitation-title"
    >
      <div className="hero__frame" aria-hidden="true">
      </div>

      <div className="hero__veil" aria-hidden="true" />

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
              {invitation.couple.second}
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
              className={`hero__action${isOpening ? " is-opening" : ""}`}
              href="#family-blessings"
              onClick={onContinue}
              aria-busy={isOpening}
              aria-label="View invitation, continue to wedding story"
            >
              <span className="hero__action-shine" aria-hidden="true" />
              <span className="hero__action-label">
                {isOpening ? "Opening Invitation" : "View Invitation"}
              </span>
              <span className="hero__action-icon" aria-hidden="true">
                ↓
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
  const { brideBrother } = invitation.family;

  return (
    <section
      className="brother-note section"
      id="brother-note"
      aria-labelledby="brother-notes-title"
    >
      <h2 className="sr-only" id="brother-notes-title">
        A message from the bride&apos;s brother
      </h2>
      <div className="container brother-note__list">
        <article className="brother-note__card" data-reveal>
          <div className="brother-note__ornament" aria-hidden="true">
            <FloralDivider />
          </div>

          <p className="brother-note__eyebrow">
            A note from the {brideBrother.relation}
          </p>

          <div className="brother-note__header">
            <h3 className="brother-note__name">{brideBrother.name}</h3>
            <p className="brother-note__relation">{brideBrother.relation}</p>
          </div>

          <div className="brother-note__body">
            <p className="brother-note__message">
              &ldquo;{brideBrother.note}&rdquo;
            </p>
          </div>

          <div className="brother-note__closing" aria-hidden="true">
            <span className="brother-note__closing-line" />
            <span className="brother-note__closing-motif">❦</span>
            <span className="brother-note__closing-line" />
          </div>
        </article>
      </div>
    </section>
  );
}

function FamilyBlessings() {
  const compliments = [
    "D. Prabhavati",
    "V. Eshwar Rao",
    "V. Venkateshvar Rao",
    "Late G. Kamala",
    "K. Gauri",
    "V. Ramesh",
    "Nirmala Naidu",
    "M.S. Vasu",
    "T. Bhavani",
    "All Relatives & Friends",
  ];

  return (
    <section
      className="family-blessings section"
      id="family-blessings"
      aria-labelledby="family-blessings-title"
    >
      <h2 className="sr-only" id="family-blessings-title">
        Family blessings for Poojitha and Sunil
      </h2>
      <div className="family-blessings__sheet" data-reveal>
        <div className="family-blessings__artwork-wrap">
          <Image
            src="/media/family-blessings-header.webp"
            alt="Sacred temple arch with Lord Ganesha, ceremonial elephants, and deities"
            width={1024}
            height={226}
            priority
            className="family-blessings__artwork-img"
            sizes="(max-width: 960px) 100vw, 960px"
          />
        </div>

        <div className="family-blessings__content">
          <div className="invitation-group invitation-group--invocation">
            <p>
              <span>Shri Rastu</span>
              <b aria-hidden="true">·</b>
              <span>Shubhamastu</span>
              <b aria-hidden="true">·</b>
              <span>Avighnamastu</span>
            </p>
          </div>

          <div className="invitation-divider" aria-hidden="true">
            <span />
            <i>❦</i>
            <span />
          </div>

          <div className="invitation-group">
            <p className="invitation-kicker">
              With the blessings of our beloved Parents
            </p>
            <p className="invitation-emphasis">
              Late Shri Madasu Chitti Babu &amp; Smt. Suryakantam
            </p>
            <p className="invitation-emphasis">
              Late Shri Vaddadi Narayan Rao &amp; Late Smt. V. Laxmi Bai
            </p>
          </div>

          <div className="invitation-divider" aria-hidden="true">
            <span />
            <i>❦</i>
            <span />
          </div>

          <div className="invitation-group invitation-group--message">
            <p>
              With the blessings of our elders and the grace of God, we
              cordially invite you and your family to grace the auspicious
              occasion of our daughter&apos;s wedding.
            </p>
          </div>

          <div className="invitation-couple" aria-label="Wedding couple">
            <div className="invitation-person invitation-person--bride">
              <span className="invitation-person__prefix">Chy. Sow.</span>
              <h3 className="invitation-person__name">M. Poojitha (Pooja)</h3>
              <p className="invitation-person__parents">
                D/o Shri M. Surya Prakash &amp; Smt. Krishna Kumari
              </p>
            </div>

            <div className="invitation-weds" aria-label="Weds">
              <span className="invitation-weds__line" aria-hidden="true" />
              <span className="invitation-weds__text">weds</span>
              <span className="invitation-weds__line" aria-hidden="true" />
            </div>

            <div className="invitation-person invitation-person--groom">
              <span className="invitation-person__prefix">Chy.</span>
              <h3 className="invitation-person__name">L. Sunil Kumar</h3>
              <p className="invitation-person__parents">
                Elder S/o Shri L. Srinivas Rao &amp; Smt. L. Jayanti
              </p>
            </div>
          </div>

          <div className="invitation-divider" aria-hidden="true">
            <span />
            <i>❦</i>
            <span />
          </div>

          <div className="invitation-group invitation-list">
            <h3>WITH BEST COMPLIMENTS FROM</h3>
            <p className="invitation-names-flow">
              {compliments.map((name, i) => (
                <span key={name} className="invitation-name-tag">
                  {name}
                  {i < compliments.length - 1 && <b aria-hidden="true">·</b>}
                </span>
              ))}
            </p>
          </div>

          <div className="invitation-divider" aria-hidden="true">
            <span />
            <i>❦</i>
            <span />
          </div>

          <div className="invitation-group invitation-list">
            <h3>R.S.V.P.</h3>
            <p>
              Shri M. Surya Prakash
              <br />
              Smt. Krishna Kumari
              <br />
              Sarthak Homes, Flat 131/C, Kukda Road, Kumhari, Dist-Durg (C.G.)
            </p>
          </div>
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
        <i /> Wedding celebrations <b /> Subha Muhurtham
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
                className={`schedule__event ${event.id === "muhurtham" ? "schedule__event--muhurtham" : ""
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
                  {event.timeNote ? ` ${event.timeNote}` : ""}
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

function getMuhurthamRemaining() {
  const target =
    Date.parse(invitation.muhurthamISO) || Date.UTC(2026, 11, 12, 22, 35, 0);
  return Math.max(0, target - Date.now());
}

function Countdown() {
  const [remaining, setRemaining] = useState<number>(getMuhurthamRemaining);

  useEffect(() => {
    setRemaining(getMuhurthamRemaining());
    const id = window.setInterval(() => {
      setRemaining(getMuhurthamRemaining());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (remaining === 0)
    return <p className="countdown-complete">The sacred hour has arrived.</p>;

  const values = [
    Math.floor(remaining / 86400000),
    Math.floor(remaining / 3600000) % 24,
    Math.floor(remaining / 60000) % 60,
    Math.floor(remaining / 1000) % 60,
  ];

  return (
    <div className="countdown" aria-label="Countdown to the sumuhurtham">
      {COUNTDOWN_UNITS.map((label, index) => (
        <div className="countdown__item" key={label}>
          <span className="countdown__digit" suppressHydrationWarning>
            {String(values[index]).padStart(2, "0")}
          </span>
          <span className="countdown__label">{label}</span>
        </div>
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

function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.42;

    const startAudio = async () => {
      try {
        await audio.play();
        window.removeEventListener("pointerdown", startAudio);
        window.removeEventListener("keydown", startAudio);
      } catch {
        // Browsers may require a visitor gesture before allowing sound.
      }
    };

    void startAudio();
    window.addEventListener("pointerdown", startAudio);
    window.addEventListener("keydown", startAudio);

    return () => {
      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("keydown", startAudio);
      audio.pause();
    };
  }, []);

  const toggleMute = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || audio.paused) {
      audio.muted = false;
      setIsMuted(false);
      try {
        await audio.play();
      } catch {
        return;
      }
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/audio.mpeg"
        preload="auto"
        loop
        playsInline
      />
      <button
        className="ambient-audio"
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        aria-pressed={isMuted}
        title={isMuted ? "Unmute music" : "Mute music"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9.5v5h3.5l4.5 3.75V5.75L7.5 9.5H4Z" />
          {isMuted ? (
            <path d="m16 9 5 5m0-5-5 5" />
          ) : (
            <path d="M15.5 9.2a4 4 0 0 1 0 5.6m2.8-8.4a8 8 0 0 1 0 11.2" />
          )}
        </svg>
      </button>
    </>
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
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.05,
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
      title: "Poojitha & Sunil — Wedding Invitation",
      text: "Join us for Poojitha & Sunil’s wedding celebrations, 11–13 December 2026. Sumuhurthamu: 13 December at 4:05 AM IST.",
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
      <AmbientAudio />
      <HeroInvitation />

      <FamilyBlessings />

      <section
        className="celebrations section"
        id="celebrations"
        aria-labelledby="celebrations-title"
      >
        <div className="container celebrations__intro">
          <div data-reveal>
            <h2 id="celebrations-title">Celebrate with us</h2>
            <p>
              All timings are in India Standard Time (IST). The Subha Muhurtham
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
                alt="Poojitha and Sunil walking hand in hand"
              />
            </figure>
            <figure className="arched-photo arched-photo--inset">
              <Image
                src={invitation.assets.couplePortraitTwo}
                fill
                sizes="(max-width: 767px) 42vw, 230px"
                alt="Poojitha and Sunil together by a waterfall"
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
              Poojitha <i>&amp;</i> Sunil
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
            With love   from{" "}
            <strong>{invitation.family.brideBrother.name}</strong>{" "}
            <span className="welcome__relation">
              ({invitation.family.brideBrother.relation})
            </span>
            .
          </p>
        </div>
      </section>

      <BrotherNote />

      <section
        className="venue"
        id="venue"
        aria-labelledby="venue-title"
      >
        <div className="venue__shade" aria-hidden="true" />
        <div className="venue__content" data-reveal>
          <p className="venue__eyebrow">The place where we celebrate</p>
          <h2 id="venue-title">We&apos;ll meet you here</h2>
          <svg
            className="venue__ornament"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="4" />
            <path d="M32 8v16m0 16v16M8 32h16m16 0h16M24 24l-7-7m23 7 7-7m-23 23-7 7m23-7 7 7" />
          </svg>
          <p className="venue__name">{invitation.venue.name}</p>
          <p className="venue__locality">{invitation.venue.locality}</p>
          <p className="venue__address">
            {invitation.venue.address.replace(",Distt", ", Distt")}
          </p>
          <a
            className="venue__maps"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              invitation.venue.fullAddress,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Open in Google Maps</span>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 15 15 5m-7 0h7v7" />
            </svg>
          </a>
        </div>
      </section>

      <section className="closing" id="closing" aria-labelledby="closing-title">
        <div className="closing__backdrop" aria-hidden="true">
          <Image
            src="/media/closing-bg-clean.webp"
            alt="Poojitha and Sunil dancing in a flower meadow at sunset"
            fill
            priority
            quality={92}
            sizes="100vw"
            className="closing__bg-image"
          />
          <div className="closing__overlay" />
        </div>

        <div className="closing__content" data-reveal>
          <p className="closing__blessing" aria-label="Mee Raaka Maa Aanandam">
            Mee Raaka Maa Aanandam
          </p>

          <div className="closing__divider" aria-hidden="true">
            <span className="closing__divider-line" />
            <svg
              className="closing__divider-blossom"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="1.8" fill="currentColor" />
              <path
                d="M10 2.5a1.5 1.5 0 0 0-1.5 1.5c0 1.2 1.5 3 1.5 3s1.5-1.8 1.5-3a1.5 1.5 0 0 0-1.5-1.5zM10 17.5a1.5 1.5 0 0 0 1.5-1.5c0-1.2-1.5-3-1.5-3s-1.5 1.8-1.5 3a1.5 1.5 0 0 0 1.5 1.5zM2.5 10a1.5 1.5 0 0 0 1.5 1.5c1.2 0 3-1.5 3-1.5s-1.8-1.5-3-1.5a1.5 1.5 0 0 0-1.5 1.5zM17.5 10a1.5 1.5 0 0 0-1.5-1.5c-1.2 0-3 1.5-3 1.5s1.8 1.5 3 1.5a1.5 1.5 0 0 0 1.5-1.5zM4.7 4.7a1.5 1.5 0 0 0 .3 2.1c1 .7 2.8 1 2.8 1s-.3-1.8-1-2.8a1.5 1.5 0 0 0-2.1-.3zM15.3 15.3a1.5 1.5 0 0 0-.3-2.1c-1-.7-2.8-1-2.8-1s.3 1.8 1 2.8a1.5 1.5 0 0 0 2.1.3zM4.7 15.3a1.5 1.5 0 0 0 2.1.3c.7-1 1-2.8 1-2.8s-1.8.3-2.8 1a1.5 1.5 0 0 0-.3 2.1zM15.3 4.7a1.5 1.5 0 0 0-2.1-.3c-.7 1-1 2.8-1 2.8s1.8-.3 2.8-1a1.5 1.5 0 0 0 .3-2.1z"
                fill="currentColor"
              />
            </svg>
            <span className="closing__divider-line" />
          </div>

          <h2 id="closing-title" className="closing__title">
            With love,
            <br />
            Poojitha <span className="closing__amp">&amp;</span> Sunil
          </h2>

          <p className="closing__subtitle">
            We cannot wait to celebrate with you.
          </p>

          <p className="closing__date">
            Sumuhurtham · 13 December 2026 · 4:05 AM IST
          </p>

          <div className="closing__divider" aria-hidden="true">
            <span className="closing__divider-line" />
            <svg
              className="closing__divider-blossom"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="1.8" fill="currentColor" />
              <path
                d="M10 2.5a1.5 1.5 0 0 0-1.5 1.5c0 1.2 1.5 3 1.5 3s1.5-1.8 1.5-3a1.5 1.5 0 0 0-1.5-1.5zM10 17.5a1.5 1.5 0 0 0 1.5-1.5c0-1.2-1.5-3-1.5-3s-1.5 1.8-1.5 3a1.5 1.5 0 0 0 1.5 1.5zM2.5 10a1.5 1.5 0 0 0 1.5 1.5c1.2 0 3-1.5 3-1.5s-1.8-1.5-3-1.5a1.5 1.5 0 0 0-1.5 1.5zM17.5 10a1.5 1.5 0 0 0-1.5-1.5c-1.2 0-3 1.5-3 1.5s1.8 1.5 3 1.5a1.5 1.5 0 0 0 1.5-1.5zM4.7 4.7a1.5 1.5 0 0 0 .3 2.1c1 .7 2.8 1 2.8 1s-.3-1.8-1-2.8a1.5 1.5 0 0 0-2.1-.3zM15.3 15.3a1.5 1.5 0 0 0-.3-2.1c-1-.7-2.8-1-2.8-1s.3 1.8 1 2.8a1.5 1.5 0 0 0 2.1.3zM4.7 15.3a1.5 1.5 0 0 0 2.1.3c.7-1 1-2.8 1-2.8s-1.8.3-2.8 1a1.5 1.5 0 0 0-.3 2.1zM15.3 4.7a1.5 1.5 0 0 0-2.1-.3c-.7 1-1 2.8-1 2.8s1.8-.3 2.8-1a1.5 1.5 0 0 0 .3-2.1z"
                fill="currentColor"
              />
            </svg>
            <span className="closing__divider-line" />
          </div>

          <Countdown />

          <div className="closing__actions">
            <button
              className="closing__btn closing__btn--share"
              onClick={share}
              type="button"
              aria-label="Share Poojitha and Sunil's wedding invitation"
            >
              <span>{shareLabel === "Share invitation" ? "SHARE INVITATION" : shareLabel.toUpperCase()}</span>
              <svg className="closing__btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="closing__btn closing__btn--calendar"
              onClick={saveCalendar}
              type="button"
              aria-label="Download the complete wedding schedule as a calendar file"
            >
              <span>{calendarLabel === "Save to calendar" ? "SAVE TO CALENDAR" : calendarLabel.toUpperCase()}</span>
              <svg className="closing__btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <line
                  x1="16"
                  y1="2"
                  x2="16"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="10"
                  x2="21"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
            <span className="sr-only" aria-live="polite">
              {shareLabel !== "Share invitation" ? shareLabel : calendarLabel}
            </span>
          </div>

          <div className="closing__divider closing__divider--bottom" aria-hidden="true">
            <span className="closing__divider-line" />
            <svg
              className="closing__divider-blossom"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="1.8" fill="currentColor" />
              <path
                d="M10 2.5a1.5 1.5 0 0 0-1.5 1.5c0 1.2 1.5 3 1.5 3s1.5-1.8 1.5-3a1.5 1.5 0 0 0-1.5-1.5zM10 17.5a1.5 1.5 0 0 0 1.5-1.5c0-1.2-1.5-3-1.5-3s-1.5 1.8-1.5 3a1.5 1.5 0 0 0 1.5 1.5zM2.5 10a1.5 1.5 0 0 0 1.5 1.5c1.2 0 3-1.5 3-1.5s-1.8-1.5-3-1.5a1.5 1.5 0 0 0-1.5 1.5zM17.5 10a1.5 1.5 0 0 0-1.5-1.5c-1.2 0-3 1.5-3 1.5s1.8 1.5 3 1.5a1.5 1.5 0 0 0 1.5-1.5zM4.7 4.7a1.5 1.5 0 0 0 .3 2.1c1 .7 2.8 1 2.8 1s-.3-1.8-1-2.8a1.5 1.5 0 0 0-2.1-.3zM15.3 15.3a1.5 1.5 0 0 0-.3-2.1c-1-.7-2.8-1-2.8-1s.3 1.8 1 2.8a1.5 1.5 0 0 0 2.1.3zM4.7 15.3a1.5 1.5 0 0 0 2.1.3c.7-1 1-2.8 1-2.8s-1.8.3-2.8 1a1.5 1.5 0 0 0-.3 2.1zM15.3 4.7a1.5 1.5 0 0 0-2.1-.3c-.7 1-1 2.8-1 2.8s1.8-.3 2.8-1a1.5 1.5 0 0 0 .3-2.1z"
                fill="currentColor"
              />
            </svg>
            <span className="closing__divider-line" />
          </div>
        </div>
      </section>
    </main>
  );
}
