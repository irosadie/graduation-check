"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

type Student = {
  id: string;
  nisn: string;
  fullname: string;
  status: "PASSED" | "UNPASSED";
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  );
}

function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#059669", "#10b981", "#34d399", "#6ee7b7"] });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#059669", "#10b981", "#34d399", "#6ee7b7"] });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Student | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const openAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confettiFired = useRef(false);

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    setReveal(false);
    setError(null);
    setResult(null);
    confettiFired.current = false;

    try {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const pass = params.get("pass");
      let url = `/api/students?q=${encodeURIComponent(query.trim())}`;
      if (mode && pass) url += `&mode=${encodeURIComponent(mode)}&pass=${encodeURIComponent(pass)}`;
      const res = await fetch(url);
      if (!res.ok) {
        setError("Terjadi kesalahan pada server. Silakan coba lagi.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.closed) {
        if (!openAtRef.current) {
          openAtRef.current = new Date(data.openAt).getTime();
          tick();
          intervalRef.current = setInterval(tick, 1000);
        }
        setError("Pengumuman belum dibuka. Silakan tunggu hingga waktu yang ditentukan.");
        setLoading(false);
        setSearched(true);
        return;
      }
      setResult(data.result);
      setLoading(false);
      setSearched(true);

      fetch("/api/traffic", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn: query.trim(), action: data.result ? "found" : "not_found" }),
      }).catch(() => {});

      if (data.result) {
        await new Promise((r) => setTimeout(r, 5000));
        setReveal(true);
      }
    } catch {
      setError("Gagal terhubung ke server. Pastikan server berjalan.");
      setLoading(false);
      setSearched(true);
    }
  }

  function tick() {
    if (!openAtRef.current) return;
    const diff = openAtRef.current - Date.now();
    if (diff <= 0) {
      stopCountdown();
      return;
    }
    setCountdown(formatTime(diff));
  }

  useEffect(() => {
    fetch("/api/traffic", { method: "POST", keepalive: true }).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const pass = params.get("pass");
    let url = "/api/students";
    if (mode && pass) url += `?mode=${encodeURIComponent(mode)}&pass=${encodeURIComponent(pass)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.closed) {
          openAtRef.current = new Date(data.openAt).getTime();
          tick();
          intervalRef.current = setInterval(tick, 1000);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (reveal && result?.status === "PASSED" && !confettiFired.current) {
      confettiFired.current = true;
      fireConfetti();
    }
  }, [reveal, result]);

  useEffect(() => {
    return () => stopCountdown();
  }, [stopCountdown]);

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <img src="/logo.png" alt="Logo" className="size-12 rounded-xl object-contain sm:size-14" />
          <div>
            <h1 className="text-sm font-bold leading-tight text-emerald-700 sm:text-base">SMP NEGERI 1 RANGSANG BARAT</h1>
            <p className="text-xs text-gray-500">Pengumuman Kelulusan</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Cek Kelulusan Siswa
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Masukkan NISN siswa untuk melihat hasil kelulusan
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Masukkan NISN..."
                className="flex-1 rounded-xl border border-gray-400 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
              >
                {loading ? "Mencari..." : <><SearchIcon /> Cari</>}
              </button>
            </div>
          </form>

          {countdown && !error && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center shadow-sm sm:p-8">
              <div className="mb-2 text-sm font-semibold text-blue-800">Pengumuman akan dibuka dalam:</div>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {[
                  { label: "Hari", value: countdown.d },
                  { label: "Jam", value: countdown.h },
                  { label: "Menit", value: countdown.m },
                  { label: "Detik", value: countdown.s },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-white text-2xl font-bold text-blue-700 shadow-sm sm:size-16 sm:text-3xl">
                      {String(value).padStart(2, "0")}
                    </div>
                    <span className="mt-1 text-xs text-blue-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Refresh
              </button>
            </div>
          )}

          {searched && !error && !countdown && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              {result ? (
                <div className="flex flex-col items-center gap-5 text-center sm:gap-6">
                  {reveal ? (
                    <div
                      className={`flex size-20 animate-[fadeIn_0.3s_ease] items-center justify-center rounded-full sm:size-24 ${
                        result.status === "PASSED"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {result.status === "PASSED" ? <CheckIcon /> : <XIcon />}
                    </div>
                  ) : (
                    <div className="flex size-20 animate-pulse items-center justify-center rounded-full bg-gray-200 sm:size-24" />
                  )}

                  {reveal ? (
                    <div className="animate-[fadeIn_0.3s_ease]">
                      <p
                        className={`text-lg font-bold sm:text-2xl ${
                          result.status === "PASSED" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {result.status === "PASSED" ? "SELAMAT! ANDA LULUS" : "MOHON MAAF"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                        {result.status === "PASSED"
                          ? "Anda dinyatakan LULUS dari SMP Negeri 1 Rangsang Barat"
                          : "Anda dinyatakan TIDAK LULUS tahun ajaran ini"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex animate-pulse flex-col items-center gap-2">
                      <div className="h-7 w-56 rounded bg-gray-200 sm:h-8" />
                      <div className="h-4 w-72 rounded bg-gray-200" />
                    </div>
                  )}

                  <div className="w-full divide-y divide-gray-100 rounded-xl bg-gray-50 text-left text-sm sm:text-base">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-gray-500">NISN</span>
                      <span className={`font-bold ${result.status === "PASSED" ? "text-emerald-600" : "text-red-500"}`}>{result.nisn}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-gray-500">Nama Lengkap</span>
                      <span className={`font-bold ${result.status === "PASSED" ? "text-emerald-600" : "text-red-500"}`}>{result.fullname}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-gray-500">Status</span>
                      {reveal ? (
                        <span
                          className={`rounded-full px-3 py-0.5 text-xs font-semibold sm:text-sm ${
                            result.status === "PASSED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {result.status === "PASSED" ? "LULUS" : "TIDAK LULUS"}
                        </span>
                      ) : (
                        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-500 sm:size-20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  </div>
                  <p className="font-semibold text-gray-700">Data Tidak Ditemukan</p>
                  <p className="text-sm text-gray-500">
                    NISN yang Anda masukkan tidak terdaftar. Silakan coba lagi.
                  </p>
                </div>
              )}
            </div>
          )}

          {!searched && !countdown && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                <SearchIcon />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Masukkan NISN siswa di atas untuk mengecek hasil kelulusan
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400 sm:text-sm">
        &copy; {new Date().getFullYear()} SMP Negeri 1 Rangsang Barat. All rights reserved<br />created by <a href="https://www.binarydev.co.id" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-600 underline underline-offset-2 hover:text-blue-600">BinaryDev</a> | 085265279959
      </footer>
    </div>
  );
}
