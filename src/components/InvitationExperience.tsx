"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dateChapters, invitation, type WeddingEvent } from "@/data/invitation";
import { FloralDivider, Monogram } from "./Ornaments";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const fullDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: invitation.timezone });
const eventDate = (event: WeddingEvent, time = event.start) => new Date(`${event.date}T${time}:00+05:30`);
const formatTime = (event: WeddingEvent) => {
  const format = (time: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: invitation.timezone }).format(eventDate(event, time));
  return event.end ? `${format(event.start)}–${format(event.end)}` : format(event.start);
};

function InvitationCard({ compact = false }: { compact?: boolean }) {
  return <div className={`invitation-card ${compact ? "invitation-card--compact" : ""}`}>
    <div className="invitation-card__border" />
    <p className="telugu">శుభ వివాహ ఆహ్వానం</p><p className="eyebrow">Together with their families</p>
    <h1><span>Sunil</span><i>&</i><span>Pooja</span></h1><FloralDivider />
    <p className="invitation-card__date">Wedding celebrations · {invitation.dateLine}</p>
    <p className="invitation-card__muhurtham">Muhurtham · 13 December · 4:05 AM IST</p>
    {!compact && <p className="invitation-card__message">With joyful hearts, we invite you to share in the warmth of our wedding celebrations and bless our beginning.</p>}
  </div>;
}

function Intro({ onDone, replayKey }: { onDone: () => void; replayKey: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [opening, setOpening] = useState(false);
  const completed = useRef(false);
  const finish = useCallback(() => { if (completed.current) return; completed.current = true; sessionStorage.setItem("sp-invitation-opened", "true"); onDone(); }, [onDone]);
  useEffect(() => { completed.current = false; const fallback = window.setTimeout(finish, 9000); return () => window.clearTimeout(fallback); }, [finish, replayKey]);
  useGSAP(() => {
    if (!opening) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    const timeline = gsap.timeline({ onComplete: finish });
    timeline.to(".intro__actions", { opacity: 0, y: 8, duration: .25, pointerEvents: "none" })
      .to(".intro__seal", { opacity: 0, scale: .72, duration: .3 }, 0)
      .to(".intro-door--left", { rotateY: -108, duration: 1.9, ease: "power3.inOut" }, .2)
      .to(".intro-door--right", { rotateY: 108, duration: 1.9, ease: "power3.inOut" }, .2)
      .to(".intro__warmth", { opacity: .9, scale: 1.08, duration: 1.25, ease: "power2.out" }, .35)
      .fromTo(".intro__invitation", { scale: .91, filter: "brightness(.78)" }, { scale: 1, filter: "brightness(1)", duration: 1.2, ease: "power2.out" }, 1.15)
      .fromTo(".intro__invitation .invitation-card > *:not(.invitation-card__border)", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6, stagger: .055 }, 1.4)
      .to(root.current, { opacity: 0, duration: .55, ease: "power2.in" }, 2.55);
    return () => timeline.kill();
  }, { scope: root, dependencies: [opening, replayKey] });
  return <div className="intro" ref={root} aria-label="Temple invitation entrance"><div className="intro__stage">
    <div className="intro__warmth" /><div className="intro__invitation"><InvitationCard compact /></div><div className="intro__architecture" aria-hidden="true" />
    <div className="intro__doors" aria-hidden="true"><div className="intro-door intro-door--left"><span className="door-edge" /></div><div className="intro-door intro-door--right"><span className="door-edge" /></div><span className="intro__seal"><Monogram small /></span></div>
    <div className="intro__actions"><p>Sunil & Pooja</p><button className="button button--ivory" onClick={() => setOpening(true)}>Open our invitation</button></div><button className="intro__skip" onClick={finish}>Skip</button>
  </div></div>;
}

function makeICS(event: WeddingEvent) {
  const clean = (value: string) => value.replace(/[-:]/g, "");
  const start = `${clean(event.date)}T${clean(event.start)}00`, end = event.end ? `${clean(event.date)}T${clean(event.end)}00` : null;
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sunil and Pooja//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${event.id}@sunil-pooja-wedding`, `DTSTART;TZID=Asia/Kolkata:${start}`, end ? `DTEND;TZID=Asia/Kolkata:${end}` : "", `SUMMARY:${event.label} — Sunil & Pooja`, event.venue ? `LOCATION:${event.venue}` : "", "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
}
function downloadCalendar(event: WeddingEvent) { const url = URL.createObjectURL(new Blob([makeICS(event)], { type: "text/calendar;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `sunil-pooja-${event.id}.ics`; anchor.click(); URL.revokeObjectURL(url); }

function EventArtwork({ event }: { event: WeddingEvent }) { return <div className={`event-art event-art--${event.id}`} aria-hidden="true"><div className="event-art__sun" /><div className="event-art__temple" /><div className="event-art__lotus">✦</div><span>{event.label.slice(0, 1)}</span></div>; }

function CelebrationCarousel() {
  const [index, setIndex] = useState(0), touchStart = useRef<{ x: number; y: number } | null>(null);
  const events = invitation.events, event = events[index], change = (next: number) => setIndex((next + events.length) % events.length);
  return <div className="celebration-carousel" data-reveal><div className="celebration-card" onTouchStart={(e) => { const touch = e.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; }} onTouchEnd={(e) => { if (!touchStart.current) return; const touch = e.changedTouches[0], dx = touch.clientX - touchStart.current.x, dy = touch.clientY - touchStart.current.y; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) change(index + (dx < 0 ? 1 : -1)); touchStart.current = null; }}>
    <div className="celebration-card__border" /><EventArtwork event={event} /><div className="celebration-card__content"><p className="eyebrow">{fullDate.format(eventDate(event))}</p><h3>{event.label}</h3><time>{formatTime(event)} IST</time>{event.id === "muhurtham" && <p>Early morning, following the reception night.</p>}{event.venue && <p>{event.venue}</p>}<button className="calendar-button" onClick={() => downloadCalendar(event)}>＋ Add to calendar</button></div>
  </div><div className="carousel-controls"><button onClick={() => change(index - 1)} aria-label="Previous celebration">←</button><span><b>{String(index + 1).padStart(2, "0")}</b> / {String(events.length).padStart(2, "0")}</span><button onClick={() => change(index + 1)} aria-label="Next celebration">→</button></div></div>;
}

function CompactSchedule() {
  const groups = useMemo(() => dateChapters.map(chapter => ({ ...chapter, events: invitation.events.filter(event => event.date === chapter.date) })), []);
  return <div className="schedule" data-reveal>{groups.map(group => <div className="schedule__day" key={group.date}><header><p>{group.eyebrow}</p><h3>{fullDate.format(new Date(`${group.date}T12:00:00+05:30`))}</h3></header><div>{group.events.map(event => <div className="schedule__event" key={event.id}><span>{event.label}</span><time>{formatTime(event)} IST</time><button onClick={() => downloadCalendar(event)} aria-label={`Add ${event.label} to calendar`}>＋</button></div>)}</div></div>)}</div>;
}

function FilmGallery({ onPlay }: { onPlay: () => void }) {
  const [film, setFilm] = useState(2), [requested, setRequested] = useState(false), current = invitation.assets.films[film];
  const choose = (next: number) => { setFilm(next); setRequested(false); };
  return <div className="film-gallery" data-reveal><div className="film-gallery__screen">{requested ? <video key={current.src} src={current.src} poster={current.poster} controls autoPlay playsInline preload="metadata" onPlay={onPlay}>Your browser does not support inline video.</video> : <button className="film-poster" onClick={() => setRequested(true)} style={{ backgroundImage: `url(${current.poster})` }} aria-label={`Play ${current.label} film`}><span>▶</span><strong>Play our film</strong></button>}</div><div className="film-gallery__chapters" aria-label="Choose a film moment">{invitation.assets.films.map((item, itemIndex) => <button className={itemIndex === film ? "is-active" : ""} key={item.src} onClick={() => choose(itemIndex)}><Image src={item.poster} alt="" width={120} height={68} /><span>{item.label}</span></button>)}</div></div>;
}

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => { const tick = () => setRemaining(Math.max(0, new Date(invitation.muhurthamISO).getTime() - Date.now())); tick(); const id = window.setInterval(tick, 1000); return () => window.clearInterval(id); }, []);
  if (remaining === null) return <div className="countdown" aria-label="Countdown loading">{["days", "hours", "minutes", "seconds"].map(label => <span key={label}>—<small>{label}</small></span>)}</div>;
  if (remaining === 0) return <p className="countdown-complete">The sacred hour has arrived.</p>;
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  return <div className="countdown" aria-label="Countdown to the muhurtham">{values.map((value, index) => <span key={index}>{String(value).padStart(2, "0")}<small>{["days", "hours", "minutes", "seconds"][index]}</small></span>)}</div>;
}

export function InvitationExperience() {
  const main = useRef<HTMLElement>(null), audio = useRef<HTMLAudioElement>(null);
  const [ready, setReady] = useState(false), [introVisible, setIntroVisible] = useState(false), [replayKey, setReplayKey] = useState(0), [soundOn, setSoundOn] = useState(false), [shareLabel, setShareLabel] = useState("Share invitation");
  useEffect(() => { setIntroVisible(sessionStorage.getItem("sp-invitation-opened") !== "true"); setReady(true); }, []);
  useGSAP(() => {
    if (!ready || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => gsap.fromTo(element, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 84%", once: true } })));
    mm.add("(max-width: 767px)", () => gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => gsap.fromTo(element, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .65, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 91%", once: true } })));
    return () => mm.revert();
  }, { scope: main, dependencies: [ready] });
  const replay = () => { setReplayKey(value => value + 1); setIntroVisible(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const stopBackgroundSound = () => { audio.current?.pause(); setSoundOn(false); };
  const toggleSound = async () => { if (!audio.current || !invitation.assets.backgroundAudio) return; if (audio.current.paused) { await audio.current.play(); setSoundOn(true); } else stopBackgroundSound(); };
  const share = async () => { const data = { title: "Sunil & Pooja", text: "Join us for Sunil & Pooja’s wedding celebrations, 11–13 December 2026.", url: location.href }; try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); setShareLabel("Link copied"); window.setTimeout(() => setShareLabel("Share invitation"), 1800); } } catch { /* cancelled */ } };
  return <>{ready && introVisible && <Intro replayKey={replayKey} onDone={() => setIntroVisible(false)} />}<button className="replay-control" onClick={replay} aria-label="Replay temple entrance">↻ <span>Replay</span></button><button className="sound-control" onClick={toggleSound} disabled={!invitation.assets.backgroundAudio} aria-label={soundOn ? "Turn sound off" : "Turn sound on"} title={!invitation.assets.backgroundAudio ? "Optional background audio has not been supplied" : undefined}>{soundOn ? "♪" : "♫"}</button>{invitation.assets.backgroundAudio && <audio ref={audio} src={invitation.assets.backgroundAudio} loop preload="none" />}
    <main ref={main}>
      <section className="hero" id="invitation"><div className="hero__stage"><div className="hero__architecture" aria-hidden="true" /><div className="hero__card"><InvitationCard /></div></div><a className="scroll-cue" href="#celebrations"><span>Enter the celebration</span><i /></a></section>
      <section className="celebrations section" id="celebrations"><div className="section-heading" data-reveal><p className="eyebrow">11–13 December 2026</p><h2>Wedding<br />celebrations</h2><p>Three days held close in tradition, joy, and the company of those we love. All timings are IST.</p></div><CelebrationCarousel /><div className="schedule-heading" data-reveal><p className="eyebrow">At a glance</p><h2>The complete schedule</h2><p>The Muhurtham begins early on 13 December, following the reception night.</p></div><CompactSchedule /></section>
      <section className="couple-story section" id="couple"><div className="section-heading section-heading--light" data-reveal><p className="eyebrow">Two hearts, one celebration</p><h2>We would love<br />to have you with us.</h2><p>As we begin this new chapter, your presence and blessings would make our celebration complete.</p></div><div className="portraits"><figure className="portrait portrait--one" data-reveal><div className="portrait__arch"><Image src={invitation.assets.couplePortraitOne} fill sizes="(max-width: 768px) 84vw, 38vw" alt="Sunil and Pooja walking together" /></div><figcaption>Sunil <i>&</i> Pooja</figcaption></figure><figure className="portrait portrait--two" data-reveal><div className="portrait__arch"><Image src={invitation.assets.couplePortraitTwo} fill sizes="(max-width: 768px) 84vw, 38vw" alt="Sunil embracing Pooja by a waterfall" /></div><span className="portrait__lotus" aria-hidden="true">❦</span></figure></div><div className="film-intro" data-reveal><p className="eyebrow">A little pause in our story</p><h2>Our film</h2><p>Four moments from one journey, kept here to share with you.</p></div><FilmGallery onPlay={stopBackgroundSound} /></section>
      <section className="pets-family section" id="pets"><div className="pets"><div className="pets__art" data-reveal><Image src={invitation.assets.petSticker} fill sizes="(max-width: 768px) 88vw, 44vw" alt="Max and Mummble artwork with blue-and-white flowers" /></div><div className="pets__copy" data-reveal><p className="eyebrow">Our little family</p><h2>Our humans are<br />getting married.</h2><p className="pet-names">{invitation.pets.join(" · ")}</p><p>Celebrated by every member of the family, including the ones with the smallest footprints.</p></div></div><div className="family-welcome" data-reveal><span aria-hidden="true">❦</span><p>With love and a warm welcome from</p><h2>{invitation.brother}</h2><p>the groom’s brother.</p></div></section>
      <section className="venue section" id="venue"><div className="venue__illustration" aria-hidden="true"><div className="venue__temple">⌂</div><Monogram /></div><div className="venue__panel" data-reveal><p className="eyebrow">Where we gather</p><h2>{invitation.venue.name}</h2><p className="venue__locality">{invitation.venue.locality}</p><p>We look forward to welcoming you at our main wedding venue.</p><a className="button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venue.search)}`} target="_blank" rel="noreferrer">Search venue on Google Maps <span>↗</span></a></div></section>
      <section className="closing section" data-reveal><p className="eyebrow">Until the sacred hour</p><h2>13 December · 4:05 AM</h2><Countdown /><p>Asia/Kolkata · IST</p><div className="closing__landscape" aria-hidden="true"><span /><i /><span /></div></section>
      <footer><Monogram /><p className="telugu">మీ రాక మా ఆనందం</p><h2>Sunil & Pooja</h2><p>Thank you for being part of our beginning.</p><div className="footer__actions"><button className="button button--ivory" onClick={share}>{shareLabel}</button><button className="text-button" onClick={replay}>Replay invitation</button></div><small>11–13 December 2026 · New Khursipar</small></footer>
    </main>
  </>;
}
