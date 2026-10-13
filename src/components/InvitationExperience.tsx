"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dateChapters, invitation, type WeddingEvent } from "@/data/invitation";
import { FloralDivider, Monogram } from "./Ornaments";

gsap.registerPlugin(ScrollTrigger, useGSAP);
const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: invitation.timezone });
const eventDate = (event: WeddingEvent, time = event.start) => new Date(`${event.date}T${time}:00+05:30`);
const formatTime = (event: WeddingEvent) => {
  const format = (time: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: invitation.timezone }).format(eventDate(event, time));
  return event.end ? `${format(event.start)}–${format(event.end)}` : format(event.start);
};
function makeICS(event: WeddingEvent) {
  const clean = (value: string) => value.replace(/[-:]/g, "");
  const start = `${clean(event.date)}T${clean(event.start)}00`, end = event.end ? `${clean(event.date)}T${clean(event.end)}00` : null;
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sunil and Pooja//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${event.id}@sunil-pooja-wedding`, `DTSTART;TZID=Asia/Kolkata:${start}`, end ? `DTEND;TZID=Asia/Kolkata:${end}` : "", `SUMMARY:${event.label} — Sunil & Pooja`, event.venue ? `LOCATION:${event.venue}` : "", "DESCRIPTION:All timings are in India Standard Time (IST).", "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
}
function downloadCalendar(event: WeddingEvent) {
  const url = URL.createObjectURL(new Blob([makeICS(event)], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `sunil-pooja-${event.id}.ics`; anchor.click(); URL.revokeObjectURL(url);
}
function HeroInvitation() {
  return <section className="hero" id="invitation" aria-labelledby="invitation-title"><div className="hero__stage">
    <Image className="hero__architecture" src={invitation.assets.templeFacade} width={1024} height={1536} priority sizes="(max-width: 900px) 540px, 960px" alt="" />
    <div className="hero__card"><p className="hero__blessing">With the blessings of Lord Ganesha</p><h1 id="invitation-title"><span>Sunil</span><i>&amp;</i><span>Pooja</span></h1><p className="hero__message">Together with our families, we invite you to celebrate our wedding.</p><div className="hero__details"><p className="hero__date">{invitation.dateLine}</p><p className="hero__muhurtham">Muhurtham · 13 December, 4:05 AM IST</p></div><a className="button hero__action" href="#celebrations">View celebrations <span aria-hidden="true">↓</span></a></div>
  </div></section>;
}

function PetSticker() {
  return <div className="family__art" data-reveal><Image src={invitation.assets.petSticker} width={1254} height={1254} sizes="(max-width: 900px) 300px, 520px" alt="Max and Mummble artwork with blue-and-white flowers" /></div>;
}
function CalendarOverview() {
  return <div className="calendar" data-reveal aria-label="December 2026 calendar with wedding dates highlighted"><div className="calendar__heading"><span>December</span><strong>2026</strong></div><div className="calendar__weekdays" aria-hidden="true">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar__days">{Array.from({ length: 35 }, (_, index) => { const day = index - 1, selected = day >= 11 && day <= 13; return <span className={selected ? `is-wedding-day day-${day}` : ""} key={index}>{day > 0 && day <= 31 ? day : ""}</span>; })}</div><p><i /> Wedding celebrations <b /> Muhurtham</p></div>;
}
function Schedule() {
  const groups = useMemo(() => dateChapters.map(chapter => ({ ...chapter, events: invitation.events.filter(event => event.date === chapter.date) })), []);
  const symbols: Record<string, string> = { rata: "✦", pelli: "❧", pradanam: "◇", haldi: "☼", barat: "♘", reception: "✧", muhurtham: "❋" };
  return <div className="schedule" data-reveal>{groups.map(group => <section className="schedule__day" key={group.date} aria-labelledby={`date-${group.date}`}><header><p>{group.eyebrow}</p><h3 id={`date-${group.date}`}>{dateFormat.format(new Date(`${group.date}T12:00:00+05:30`))}</h3></header><div className="schedule__events">{group.events.map(event => <article className={`schedule__event ${event.id === "muhurtham" ? "schedule__event--muhurtham" : ""}`} key={event.id}><span className="schedule__symbol" aria-hidden="true">{symbols[event.id]}</span><div><h4>{event.label}</h4>{event.id === "muhurtham" && <p>Early morning, following the reception night.</p>}</div><time dateTime={`${event.date}T${event.start}:00+05:30`}>{formatTime(event)} <small>IST</small></time><button onClick={() => downloadCalendar(event)} aria-label={`Add ${event.label} on ${dateFormat.format(eventDate(event))} to calendar`}>＋<span>Add</span></button></article>)}</div></section>)}</div>;
}
function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => { const tick = () => setRemaining(Math.max(0, new Date(invitation.muhurthamISO).getTime() - Date.now())); tick(); const id = window.setInterval(tick, 1000); return () => window.clearInterval(id); }, []);
  if (remaining === 0) return <p className="countdown-complete">The sacred hour has arrived.</p>;
  const values = remaining === null ? null : [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  return <div className="countdown" aria-label="Countdown to the muhurtham">{["days", "hours", "minutes", "seconds"].map((label, index) => <span key={label}>{values ? String(values[index]).padStart(2, "0") : "—"}<small>{label}</small></span>)}</div>;
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
      if (motionQuery.matches || userPaused.current || document.hidden || !isVisible.current) return;
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
        setShowPlayFallback(false);
      } catch {
        setShowPlayFallback(true);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting && entry.intersectionRatio >= .35;
      if (isVisible.current) void tryPlay();
      else video.pause();
    }, { threshold: [0, .35, .75] });
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

  return <div className="film__player">
    <div className="container film__frame" data-reveal ref={frameRef}>
      <div className="film__corners" aria-hidden="true" />
      <video ref={videoRef} src={invitation.assets.film.src} poster={invitation.assets.film.poster} muted loop playsInline preload="metadata" disablePictureInPicture disableRemotePlayback onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}>Your browser does not support inline video.</video>
      {showPlayFallback && !isPlaying && <button className="film__play" type="button" onClick={playManually}>Play film</button>}
    </div>
    <button className="film__toggle" type="button" onClick={togglePlayback} aria-pressed={!isPlaying}>{isPlaying ? "Pause film" : reducedMotion ? "Play film" : "Resume film"}</button>
  </div>;
}
export function InvitationExperience() {
  const main = useRef<HTMLElement>(null); const [shareLabel, setShareLabel] = useState("Share invitation");
  useGSAP(() => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; gsap.fromTo(".hero__card > *", { y: 12, opacity: .45 }, { y: 0, opacity: 1, duration: .6, stagger: .045, ease: "power2.out" }); gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => gsap.fromTo(element, { y: 18 }, { y: 0, duration: .7, ease: "power2.out", immediateRender: false, scrollTrigger: { trigger: element, start: "top 88%", once: true } })); }, { scope: main });
  const share = async () => { const data = { title: "Sunil & Pooja — Wedding Invitation", text: "Join us for Sunil & Pooja’s wedding celebrations, 11–13 December 2026. Muhurtham: 13 December at 4:05 AM IST.", url: location.href }; try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); setShareLabel("Invitation copied"); window.setTimeout(() => setShareLabel("Share invitation"), 1800); } } catch { /* sharing cancelled */ } };
  return <main ref={main}><HeroInvitation />
    <section className="story section" id="story" aria-labelledby="story-title"><div className="container story__grid"><div className="story__portraits" data-reveal><figure className="arched-photo arched-photo--main"><Image src={invitation.assets.couplePortraitOne} fill sizes="(max-width: 767px) 78vw, 460px" alt="Sunil and Pooja walking hand in hand" /></figure><figure className="arched-photo arched-photo--inset"><Image src={invitation.assets.couplePortraitTwo} fill sizes="(max-width: 767px) 42vw, 230px" alt="Sunil and Pooja together by a waterfall" /></figure></div><div className="story__copy" data-reveal><h2 id="story-title">Two hearts, one beginning</h2><FloralDivider /><p>As we begin this new chapter, your presence and blessings would make our celebration complete.</p><p className="signature">Sunil <i>&amp;</i> Pooja</p></div></div></section>
    <section className="film section" aria-labelledby="film-title"><div className="container film__heading" data-reveal><h2 id="film-title">A little glimpse of us</h2><p>A small memory we are happy to share with you.</p></div><CoupleFilm /></section>
    <section className="family section" aria-labelledby="pets-title"><div className="container family__grid"><div className="family__copy" data-reveal><h2 id="pets-title">Our little family</h2><div className="family__mobile-art"><PetSticker /></div><p className="pet-names">{invitation.pets.join(" · ")}</p><p>Our celebration would not be complete without their paw prints.</p></div><div className="family__desktop-art"><PetSticker /></div></div><div className="container welcome" data-reveal><p>With love from <strong>{invitation.brother}</strong>, the groom’s brother.</p></div></section>
    <section className="celebrations section" id="celebrations" aria-labelledby="celebrations-title"><div className="container celebrations__intro"><div data-reveal><h2 id="celebrations-title">Celebrate with us</h2><p>All timings are IST. The muhurtham begins early on 13 December, following the reception night.</p></div><CalendarOverview /></div><div className="container"><Schedule /></div></section>
    <section className="venue section" id="venue" aria-labelledby="venue-title"><div className="container venue__card" data-reveal><div className="venue__crest"><Monogram /></div><div className="venue__copy"><h2 id="venue-title">We’ll meet you here</h2><p className="venue__name">{invitation.venue.name}</p><p className="venue__locality">{invitation.venue.locality}</p><p className="venue__address">{invitation.venue.address}</p><a className="button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venue.fullAddress)}`} target="_blank" rel="noopener noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a></div></div></section>
    <section className="closing section" aria-labelledby="closing-title"><div className="container closing__content" data-reveal><Monogram /><h2 id="closing-title">With love,<br />Sunil <i>&amp;</i> Pooja</h2><p>We cannot wait to celebrate with you.</p><p className="closing__date">13 December 2026 · 4:05 AM IST</p><Countdown /><button className="button button--ivory" onClick={share}>{shareLabel}</button><small>Wedding celebrations · 11–13 December 2026 · New Khursipar</small></div></section>
  </main>;
}
