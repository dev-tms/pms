// src/components/BirthdayBanner/BirthdayBanner.js
import React, { useEffect, useState } from "react";
import { listUsers } from "../../controller/auth/loginApis";
import { connect } from "react-redux";

const MESSAGE_VARIANTS = [
  "The whole team wishes you a fantastic year ahead — thank you for everything you bring to us!",
  "May your day be filled with laughter, cake, and everything that makes you happy. Happy Birthday!",
  "Here's to another trip around the sun — enjoy every moment of your special day!",
  "The team's a little louder and a lot happier with you in it. Happy Birthday!",
  "Wishing you a year ahead as bright and wonderful as you are.",
  "Cheers to you today — thank you for all you bring to this team, every single day.",
];

const HEADLINE_EMOJIS = ["🎉", "🎂", "🥳", "🎈", "🎊"];

const getRandomMessage = () =>
  MESSAGE_VARIANTS[Math.floor(Math.random() * MESSAGE_VARIANTS.length)];

const getRandomEmoji = () =>
  HEADLINE_EMOJIS[Math.floor(Math.random() * HEADLINE_EMOJIS.length)];

const parseBirthDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTodaysBirthdays = (employees) => {
  const today = new Date();
  return employees.filter((employee) => {
    const birthDate = parseBirthDate(employee.birthDate);
    return (
      birthDate &&
      birthDate.getMonth() === today.getMonth() &&
      birthDate.getDate() === today.getDate()
    );
  });
};

const joinNames = (names) => {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
};

const buildHeadline = (birthdayPeople) => {
  const names = birthdayPeople.map((p) => p.name);
  const isPlural = names.length > 1;
  return { names: joinNames(names), suffix: isPlural ? "s" : "" };
};

const buildMessage = (birthdayPeople, baseMessage) => {
  if (birthdayPeople.length > 1) {
    return baseMessage.replace(/\byou\b/i, "you all");
  }
  return baseMessage;
};

const Balloon = ({ color, delay, style, size = 20 }) => (
  <svg
    viewBox="0 0 24 34"
    width={size}
    height={size * 1.4}
    className="absolute opacity-70"
    style={{
      ...style,
      animation: `balloon-float 5s ease-in-out infinite`,
      animationDelay: delay,
    }}
  >
    <ellipse cx="12" cy="13" rx="10" ry="12" fill={color} />
    <line x1="12" y1="22" x2="12" y2="32" stroke={color} strokeWidth="1" opacity="0.6" />
  </svg>
);

const ConfettiDot = ({ color, left, delay, duration }) => (
  <span
    className="absolute top-0 rounded-full"
    style={{
      left,
      width: 5,
      height: 5,
      backgroundColor: color,
      opacity: 0.7,
      animation: `confetti-drift ${duration} linear infinite`,
      animationDelay: delay,
    }}
  />
);

const Sparkle = ({ delay, style }) => (
  <svg
    viewBox="0 0 24 24"
    width="7"
    height="7"
    className="absolute"
    style={{ ...style, animation: `sparkle-pop 2.4s ease-in-out infinite`, animationDelay: delay }}
  >
    <path d="M12 0l1.8 8.2L22 10l-8.2 1.8L12 20l-1.8-8.2L2 10l8.2-1.8L12 0Z" fill="#f59e0b" />
  </svg>
);

const CakeWithCandle = ({ isLight }) => (
  <div
    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${
      isLight
        ? "bg-pink-500/10 border-pink-500/30 text-pink-600"
        : "bg-pink-500/15 border-pink-500/25 text-pink-300"
    }`}
    style={{ animation: "cake-glow 2.6s ease-in-out infinite" }}
  >
    <Sparkle delay="0s" style={{ top: -4, left: -2 }} />
    <Sparkle delay="0.8s" style={{ top: -2, right: -4 }} />
    <Sparkle delay="1.5s" style={{ top: 4, left: -6 }} />

    <svg
      viewBox="0 0 12 16"
      width="8"
      height="11"
      className="absolute -top-1.5 left-1/2 -translate-x-1/2"
      style={{ animation: "flicker 1.1s ease-in-out infinite" }}
    >
      <path d="M6 0C6 4 2 5 2 9a4 4 0 0 0 8 0c0-2-1-3-1-5-1 1-2 1-2 3C7 4 6 3 6 0Z" fill="#f59e0b" />
    </svg>
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <line x1="12" y1="6" x2="12" y2="9" stroke="currentColor" />
      <path d="M4 20v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6H4Z" />
      <path d="M4 20h16" />
      <path d="M4 15c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" />
    </svg>
  </div>
);

const BirthdayBanner = ({ profile, theme }) => {
  const [birthdayPeople, setBirthdayPeople] = useState([]);
  const [messageLine] = useState(() => getRandomMessage());
  const [headlineEmoji] = useState(() => getRandomEmoji());

  useEffect(() => {
    const fetchAndCheck = async () => {
      if (!profile) return;
      try {
        const employeeList = await listUsers(profile);
        const activeEmployees = (employeeList?.data || [])
          .filter((e) => e.status === "Active")
          .map((e) => ({
            id: e.id,
            name: `${e.firstName || ""} ${e.lastName || ""}`.trim(),
            birthDate: e.birthDate || "",
          }));
        setBirthdayPeople(getTodaysBirthdays(activeEmployees));
      } catch (error) {
        console.error("Error fetching employees for birthday banner:", error);
      }
    };
    fetchAndCheck();
  }, [profile]);

  if (birthdayPeople.length === 0) return null;

  const isLight = theme === "light";
  const headline = buildHeadline(birthdayPeople);

  const balloonColors = isLight
    ? ["#db2777", "#0284c7", "#d97706", "#7c3aed", "#e11d48", "#059669"]
    : ["#f472b6", "#38bdf8", "#facc15", "#a78bfa", "#fb7185", "#34d399"];
  const confettiColors = isLight
    ? ["#db2777", "#d97706", "#0284c7", "#7c3aed"]
    : ["#f472b6", "#facc15", "#38bdf8", "#a78bfa"];

  const balloonPositions = [
    { bottom: 4, right: "4%" },
    { top: 2, right: "12%" },
    { bottom: 8, right: "22%" },
    { top: 6, right: "32%" },
    { bottom: 2, right: "42%" },
    { top: 4, right: "52%" },
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border px-5 py-4 mb-5 ${
        isLight
          ? "border-pink-300 bg-gradient-to-r from-pink-100 via-purple-50 to-sky-100"
          : "border-pink-500/20 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10"
      }`}
      style={{ animation: "banner-entrance 0.45s ease-out" }}
    >
      {/* shimmer sweep */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: isLight
            ? "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)"
            : "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.08) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
          animation: "shimmer-sweep 5s ease-in-out infinite",
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <ConfettiDot
            key={i}
            color={confettiColors[i % confettiColors.length]}
            left={`${40 + ((i * 5) % 58)}%`}
            delay={`${(i % 7) * 0.6}s`}
            duration={`${3 + (i % 4)}s`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {balloonColors.map((color, i) => (
          <Balloon
            key={i}
            color={color}
            delay={`${i * 0.7}s`}
            style={balloonPositions[i]}
            size={16 + (i % 3) * 5}
          />
        ))}
      </div>

      <div className="relative flex z-10 items-center gap-4">
        <CakeWithCandle isLight={isLight} />
        <div>
          <h3 className={`text-lg md:text-xl font-bold leading-tight ${isLight ? "text-slate-800" : "text-pink-200"}`}>
            {headlineEmoji} It's{" "}
            <span
              className="bg-clip-text text-transparent font-extrabold"
              style={{
                backgroundImage: isLight
                  ? "linear-gradient(90deg, #db2777, #d97706, #db2777)"
                  : "linear-gradient(90deg, #f472b6, #facc15, #f472b6)",
                backgroundSize: "200% auto",
                animation: "name-gradient 4s linear infinite",
              }}
            >
              {headline.names}
            </span>
            's Birthday{headline.suffix}!
          </h3>
          <p className={`mt-1 text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            {buildMessage(birthdayPeople, messageLine)}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes banner-entrance {
          0%   { opacity: 0; transform: translateY(-14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes balloon-float {
          0%   { transform: translateY(0) rotate(-3deg); }
          50%  { transform: translateY(-14px) rotate(3deg); }
          100% { transform: translateY(0) rotate(-3deg); }
        }
        @keyframes flicker {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          25%      { transform: translateX(-50%) scale(0.9) rotate(-4deg); opacity: 0.85; }
          50%      { transform: translateX(-50%) scale(1.1) rotate(3deg); opacity: 1; }
          75%      { transform: translateX(-50%) scale(0.95) rotate(-2deg); opacity: 0.9; }
        }
        @keyframes shimmer-sweep {
          0%   { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes confetti-drift {
          0%   { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(90px) translateX(12px) rotate(180deg); opacity: 0; }
        }
        @keyframes name-gradient {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes sparkle-pop {
          0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50%      { opacity: 1; transform: scale(1) rotate(25deg); }
        }
        @keyframes cake-glow {
          0%, 100% { box-shadow: 0 0 0 rgba(244, 114, 182, 0); }
          50%      { box-shadow: 0 0 14px rgba(244, 114, 182, 0.45); }
        }
      `}</style>
    </div>
  );
};

const mapStateToProps = (state) => ({
  profile: state.session.user?.user,
});

export default connect(mapStateToProps)(BirthdayBanner);