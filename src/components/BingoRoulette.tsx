import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface BingoRouletteProps {
  maxNumber?: number;
}

const BingoRoulette = ({ maxNumber: initialMax = 75 }: BingoRouletteProps) => {
  const [maxNumber, setMaxNumber] = useState(initialMax);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [displayNum, setDisplayNum] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const remaining = maxNumber - drawn.length;
  const allDone = remaining === 0;

  const draw = () => {
    if (spinning || allDone) return;
    setSpinning(true);

    const pool: number[] = [];
    for (let i = 1; i <= maxNumber; i++) {
      if (!drawn.includes(i)) pool.push(i);
    }

    // Spin animation: rapidly cycle through random numbers
    intervalRef.current = window.setInterval(() => {
      const rnd = pool[Math.floor(Math.random() * pool.length)];
      setDisplayNum(rnd);
    }, 60);

    // Stop after 2.5s and pick the final
    window.setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const final = pool[Math.floor(Math.random() * pool.length)];
      setDisplayNum(final);
      setCurrent(final);
      setDrawn((d) => [...d, final]);
      setSpinning(false);
      toast.success(`🎉 ${final} が出ました！`, {
        style: {
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--gold))",
          color: "hsl(var(--gold))",
        },
      });
    }, 2500);
  };

  const reset = () => {
    if (spinning) return;
    setDrawn([]);
    setCurrent(null);
    setDisplayNum(null);
    toast("リセットしました", {
      style: {
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      },
    });
  };

  const changeMax = (n: number) => {
    if (spinning) return;
    setMaxNumber(n);
    setDrawn([]);
    setCurrent(null);
    setDisplayNum(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      {/* Header */}
      <header className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-gold animate-pulse" />
          <span className="text-gold/80 tracking-[0.4em] text-xs md:text-sm font-semibold uppercase">
            Lucky Draw Machine
          </span>
          <Sparkles className="w-6 h-6 text-gold animate-pulse" />
        </div>
        <h1 className="font-display text-5xl md:text-7xl text-gold text-shadow-gold">
          ビンゴ抽選会
        </h1>
        <div className="flex justify-center gap-1 mt-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gold/60" />
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr,380px] gap-8">
        {/* Main stage */}
        <section className="flex flex-col items-center">
          {/* Range selector */}
          <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-card/60 border border-border backdrop-blur">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">範囲:</span>
            {[30, 50, 75, 99].map((n) => (
              <button
                key={n}
                onClick={() => changeMax(n)}
                disabled={spinning}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                  maxNumber === n
                    ? "bg-gold text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1-{n}
              </button>
            ))}
          </div>

          {/* The big ball */}
          <div className="relative mb-8">
            {/* Outer ring */}
            <div
              className={`relative w-[22rem] h-[22rem] md:w-[34rem] md:h-[34rem] rounded-full p-4 ${
                spinning ? "animate-spin-slow" : ""
              }`}
              style={{
                background:
                  "conic-gradient(from 0deg, hsl(var(--gold)), hsl(var(--crimson)), hsl(var(--accent)), hsl(var(--gold)))",
              }}
            >
              {/* Inner ball */}
              <div
                className={`w-full h-full rounded-full ball-3d flex items-center justify-center ${
                  !spinning && current !== null ? "animate-pulse-glow" : ""
                }`}
              >
                <div className="w-[88%] h-[88%] rounded-full bg-background/20 backdrop-blur-sm border-4 border-gold/40 flex flex-col items-center justify-center">
                  {displayNum === null ? (
                    <span className="font-display text-5xl md:text-7xl text-gold/70">
                      READY
                    </span>
                  ) : (
                    <>
                      <span className="text-sm md:text-base tracking-widest text-gold/80 font-bold uppercase mb-2">
                        Number
                      </span>
                      <span
                        key={displayNum + (spinning ? "-s" : "-f")}
                        className={`font-display text-[9rem] md:text-[15rem] leading-none text-rainbow ${
                          spinning ? "animate-number-flip" : "animate-ball-pop"
                        }`}
                      >
                        {displayNum.toString().padStart(2, "0")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold glow-gold" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-crimson" />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={draw}
              disabled={spinning || allDone}
              size="lg"
              className="h-16 px-12 text-xl font-display tracking-wider bg-gradient-to-b from-gold to-gold/70 hover:from-gold-glow hover:to-gold text-primary-foreground border-2 border-gold-glow shadow-[0_8px_30px_hsl(var(--gold)/0.5)] hover:shadow-[0_12px_40px_hsl(var(--gold)/0.7)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {spinning ? "抽選中..." : allDone ? "完了" : "DRAW"}
            </Button>
            <Button
              onClick={reset}
              disabled={spinning || drawn.length === 0}
              variant="outline"
              size="lg"
              className="h-16 px-8 text-base border-2 border-crimson/60 text-crimson hover:bg-crimson hover:text-secondary-foreground"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              リセット
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-6 text-center">
            <div>
              <div className="font-display text-3xl text-gold">{drawn.length}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">出た</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="font-display text-3xl text-foreground">{remaining}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">残り</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="font-display text-3xl text-muted-foreground">{maxNumber}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">合計</div>
            </div>
          </div>
        </section>

        {/* History panel */}
        <aside
          className="rounded-2xl border border-border p-6 shadow-[var(--shadow-deep)]"
          style={{ background: "var(--gradient-history)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-gold tracking-wider">履歴</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {drawn.length} / {maxNumber}
            </span>
          </div>

          {drawn.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">まだ数字が出ていません</p>
            </div>
          ) : (
            <>
              {/* Latest */}
              <div className="mb-6 p-4 rounded-xl bg-gold/10 border border-gold/30">
                <div className="text-xs uppercase tracking-wider text-gold/80 mb-1">
                  最新
                </div>
                <div className="font-display text-5xl text-rainbow">
                  {current?.toString().padStart(2, "0")}
                </div>
              </div>

              {/* All numbers grid */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  順番
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {drawn.map((n, i) => (
                    <div
                      key={i}
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-display text-lg border-2 ${
                        n === current
                          ? "bg-gold text-primary-foreground border-gold-glow scale-110"
                          : "bg-muted text-foreground border-border"
                      } transition-all`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sorted board */}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  ボード
                </div>
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${maxNumber > 50 ? 10 : 8}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: maxNumber }, (_, i) => i + 1).map((n) => {
                    const isDrawn = drawn.includes(n);
                    const isCurrent = n === current;
                    return (
                      <div
                        key={n}
                        className={`aspect-square rounded text-[10px] md:text-xs flex items-center justify-center font-bold transition-all ${
                          isCurrent
                            ? "bg-gold text-primary-foreground ring-2 ring-gold-glow"
                            : isDrawn
                            ? "bg-crimson/70 text-secondary-foreground"
                            : "bg-muted/50 text-muted-foreground/60"
                        }`}
                      >
                        {n}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <footer className="text-center mt-12 text-xs text-muted-foreground/60 tracking-wider">
        ✦ LUCKY DRAW · {new Date().getFullYear()} ✦
      </footer>
    </div>
  );
};

export default BingoRoulette;
