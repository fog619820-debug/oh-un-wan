"use client";

import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Dumbbell, 
  CheckCircle2, 
  Circle, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Calendar as CalendarIcon, 
  Trophy,
  Trash2,
  Pencil
} from "lucide-react";

type WorkoutSet = {
  id: number;
  weight: number;
  reps: number;
  completed: boolean;
};

type Exercise = {
  id: number;
  name: string;
  restSeconds: number;
  sets: WorkoutSet[];
};

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function VibeFitPage() {
  const [activeTab, setActiveTab] = useState<"routine" | "calendar">("routine");
  const [selectedDay, setSelectedDay] = useState("월");

  const [routines, setRoutines] = useState<Record<string, Exercise[]>>({
    월: [
      {
        id: 1,
        name: "벤치프레스",
        restSeconds: 90,
        sets: [
          { id: 1, weight: 60, reps: 10, completed: false },
          { id: 2, weight: 60, reps: 10, completed: false },
          { id: 3, weight: 65, reps: 8, completed: false },
        ],
      },
      {
        id: 2,
        name: "인클라인 덤벨 프레스",
        restSeconds: 60,
        sets: [
          { id: 1, weight: 20, reps: 12, completed: false },
          { id: 2, weight: 20, reps: 12, completed: false },
        ],
      },
    ],
    화: [
      {
        id: 3,
        name: "데드리프트",
        restSeconds: 120,
        sets: [
          { id: 1, weight: 100, reps: 5, completed: false },
          { id: 2, weight: 110, reps: 5, completed: false },
        ],
      },
    ],
    수: [], 목: [], 금: [], 토: [], 일: [],
  });

  const [restTime, setRestTime] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [stamps, setStamps] = useState<string[]>(["2026-09-28"]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseWeight, setNewExerciseWeight] = useState("20");
  const [newExerciseReps, setNewExerciseReps] = useState("10");
  const [newExerciseSetCount, setNewExerciseSetCount] = useState("1");
  const [newExerciseRestSeconds, setNewExerciseRestSeconds] = useState("60");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && restTime > 0) {
      interval = setInterval(() => setRestTime((prev) => prev - 1), 1000);
    } else if (restTime === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, restTime]);

  const toggleSetComplete = (day: string, exerciseId: number, setId: number) => {
    setRoutines((prev) => {
      const dayExercises = prev[day] || [];
      const updated = dayExercises.map((ex) => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.map((s) => {
            if (s.id === setId) {
              const nextState = !s.completed;
              if (nextState) {
                setRestTime(ex.restSeconds);
                setTimerActive(true);
              }
              return { ...s, completed: nextState };
            }
            return s;
          });
          return { ...ex, sets: updatedSets };
        }
        return ex;
      });
      return { ...prev, [day]: updated };
    });
  };

  const addExercise = () => {
    const weight = Number(newExerciseWeight);
    const reps = Number(newExerciseReps);
    const setCount = Number(newExerciseSetCount);
    const restSeconds = Number(newExerciseRestSeconds);
    if (!newExerciseName.trim() || !Number.isFinite(weight) || !Number.isFinite(reps) || !Number.isInteger(setCount) || !Number.isFinite(restSeconds) || reps <= 0 || setCount <= 0 || restSeconds < 0) return;
    const newEx: Exercise = {
      id: Date.now(),
      name: newExerciseName.trim(),
      restSeconds,
      sets: Array.from({ length: setCount }, (_, index) => ({
        id: index + 1,
        weight,
        reps,
        completed: false,
      })),
    };
    setRoutines((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newEx],
    }));
    setNewExerciseName("");
    setNewExerciseWeight("20");
    setNewExerciseReps("10");
    setNewExerciseSetCount("1");
    setNewExerciseRestSeconds("60");
    setIsAddingExercise(false);
  };

  const removeExercise = (day: string, exerciseId: number) => {
    setRoutines((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((exercise) => exercise.id !== exerciseId),
    }));
  };

  const startEditingExercise = (exercise: Exercise) => {
    const firstSet = exercise.sets[0];
    setNewExerciseName(exercise.name);
    setNewExerciseWeight(String(firstSet?.weight ?? 0));
    setNewExerciseReps(String(firstSet?.reps ?? 1));
    setNewExerciseSetCount(String(exercise.sets.length));
    setNewExerciseRestSeconds(String(exercise.restSeconds));
    setEditingExerciseId(exercise.id);
    setIsAddingExercise(false);
  };

  const saveExerciseEdit = () => {
    if (editingExerciseId === null) return;
    const weight = Number(newExerciseWeight);
    const reps = Number(newExerciseReps);
    const setCount = Number(newExerciseSetCount);
    const restSeconds = Number(newExerciseRestSeconds);
    if (!newExerciseName.trim() || !Number.isFinite(weight) || !Number.isFinite(reps) || !Number.isInteger(setCount) || !Number.isFinite(restSeconds) || reps <= 0 || setCount <= 0 || restSeconds < 0) return;

    setRoutines((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).map((exercise) => exercise.id === editingExerciseId
        ? {
            ...exercise,
            name: newExerciseName.trim(),
            restSeconds,
            sets: Array.from({ length: setCount }, (_, index) => ({
              id: index + 1,
              weight,
              reps,
              completed: exercise.sets[index]?.completed ?? false,
            })),
          }
        : exercise),
    }));
    setEditingExerciseId(null);
    setNewExerciseName("");
    setNewExerciseWeight("20");
    setNewExerciseReps("10");
    setNewExerciseSetCount("1");
    setNewExerciseRestSeconds("60");
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const completeTodayWorkout = () => {
    const todayStr = getTodayString();
    if (!stamps.includes(todayStr)) {
      setStamps((prev) => [...prev, todayStr]);
      alert("🎉 축하합니다! 오늘 오운완 스탬프가 찍혔습니다! 🔥");
    } else {
      alert("이미 오늘 오운완 스탬프를 받으셨습니다! 💪");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto pb-24 border-x border-slate-800">
      <header className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black tracking-wider text-orange-500 flex items-center gap-2">
            VIBE FIT <Dumbbell className="w-5 h-5" />
          </h1>
          <p className="text-xs text-slate-400 font-medium">오늘의 운동 루틴 & 오운완 기록</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("routine")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "routine" ? "bg-orange-500 text-white" : "text-slate-400"
            }`}
          >
            루틴
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "calendar" ? "bg-orange-500 text-white" : "text-slate-400"
            }`}
          >
            달력
          </button>
        </div>
      </header>

      {activeTab === "routine" && (
        <main className="p-4 flex-1 space-y-6">
          <div className="flex justify-between bg-slate-900 p-2 rounded-2xl border border-slate-800">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition flex flex-col items-center justify-center ${
                  selectedDay === day
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-200">{selectedDay}요일 운동 목록</h2>
              <span className="text-xs text-slate-400">
                {(routines[selectedDay] || []).length}개 종목
              </span>
            </div>

            {(routines[selectedDay] || []).length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                <p className="text-sm text-slate-500">등록된 운동이 없습니다.</p>
                <p className="text-xs text-slate-600 mt-1">아래에서 새 운동을 추가해 보세요!</p>
              </div>
            ) : (
              routines[selectedDay].map((exercise) => (
                <div key={exercise.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-100 flex items-center justify-between gap-3">
                    <span>{exercise.name}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label={`${exercise.name} 수정`}
                        onClick={() => startEditingExercise(exercise)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-500/10 hover:text-orange-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`${exercise.name} 삭제`}
                        onClick={() => removeExercise(selectedDay, exercise.id)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {exercise.sets.map((set, idx) => (
                      <div
                        key={set.id}
                        onClick={() => toggleSetComplete(selectedDay, exercise.id, set.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          set.completed
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                            : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {set.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600" />
                          )}
                          <span className="text-xs font-bold">{idx + 1}세트</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          {set.weight} kg  ×  {set.reps} 회
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {!isAddingExercise && editingExerciseId === null ? (
              <button
                type="button"
                onClick={() => setIsAddingExercise(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> 추가
              </button>
            ) : (
              <div className="bg-slate-900 border border-orange-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100">{editingExerciseId === null ? "새 운동 설정" : "운동 수정"}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingExercise(false);
                      setEditingExerciseId(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-300"
                  >
                    취소
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="운동명 (예: 스쿼트)"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-slate-100"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <label className="text-xs font-bold text-slate-400">
                    무게(kg)
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      inputMode="decimal"
                      value={newExerciseWeight}
                      onChange={(e) => setNewExerciseWeight(e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-400">
                    세트 수
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={newExerciseSetCount}
                      onChange={(e) => setNewExerciseSetCount(e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-400">
                    개수(회)
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={newExerciseReps}
                      onChange={(e) => setNewExerciseReps(e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-400">
                    시간(초)
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={newExerciseRestSeconds}
                      onChange={(e) => setNewExerciseRestSeconds(e.target.value)}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={editingExerciseId === null ? addExercise : saveExerciseEdit}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition"
                >
                  {editingExerciseId === null ? "운동 추가하기" : "수정 저장"}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={completeTodayWorkout}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-base tracking-wide transition active:scale-95 mt-8"
          >
            <Flame className="w-5 h-5 fill-current" /> 오늘 운동 완료! (스탬프 받기)
          </button>
        </main>
      )}

      {activeTab === "calendar" && (
        <main className="p-4 flex-1 space-y-6">
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-200">
                <CalendarIcon className="w-4 h-4 text-orange-500" /> 2026년 9월
              </h2>
              <div className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                <Trophy className="w-3.5 h-3.5" /> 연속 {stamps.length}일째
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center pt-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <span key={d} className="text-xs font-bold text-slate-500 py-1">
                  {d}
                </span>
              ))}
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-09-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                const hasStamp = stamps.includes(dateStr);

                return (
                  <div
                    key={dateStr}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs relative border transition ${
                      hasStamp
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-300 font-bold"
                        : "bg-slate-950 border-slate-800/50 text-slate-400"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasStamp && (
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {timerActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-slate-900 border border-orange-500/40 p-4 rounded-2xl shadow-2xl shadow-orange-500/10 flex items-center justify-between z-50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-black text-orange-400 text-lg">
              {restTime}s
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">자동 휴식 타이머</p>
              <p className="text-[10px] text-slate-400">세트 체크 시 자동으로 작동합니다</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition"
            >
              {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setRestTime(60);
                setTimerActive(true);
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}