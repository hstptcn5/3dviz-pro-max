// "How one sentence becomes a scene": the prompt, the three deciding steps, the routing chips
// beside the host probe, the dashed build/look/refine loop and the reporting row. The copy is the
// design's, in loop-copy.ts; the slight rotations are the design's too.
import {
  DECIDE_KICKER,
  DECIDE_TILES,
  LOOP_BADGE,
  LOOP_CARDS,
  LOOP_HEADING,
  LOOP_LEDE,
  PROBE_KICKER,
  PROBE_NOTE,
  PROBE_ROWS,
  PROMPT,
  REPORT_CHIPS,
  REPORT_KICKER,
  REPORT_LEDE,
  ROUTE_CHIPS,
  ROUTE_KICKER,
  ROUTE_LEDE,
} from './loop-copy';

const KICKER = 'font-mono text-[10.5px] tracking-[1.4px] text-mono-dim';
const CARD =
  'rounded-[32px] border border-line bg-white px-6 py-[22px] shadow-[0_8px_22px_#1c2a230a]';
const CHIP = 'rounded-full px-[13px] py-2 text-[13.5px] font-semibold';

const TONES: Record<string, string> = {
  mint: 'bg-mint text-green',
  leaf: 'bg-leaf text-leaf-ink',
  sky: 'bg-sky text-sky-ink',
  sand: 'bg-sand text-sand-ink',
  rose: 'bg-rose text-rose-ink',
};

/** Only the route chips are outlined; the report chips are flat fills. */
const OUTLINES: Record<string, string> = {
  mint: 'border border-mint-line',
  leaf: 'border border-leaf-line',
  sky: 'border border-sky-line',
  sand: 'border border-sand-line',
};

/** The dashed rule that ties one step of the loop to the next. */
function Connector() {
  return (
    <div
      aria-hidden="true"
      className="ml-[54px] h-[34px] w-0.5 bg-[repeating-linear-gradient(var(--color-dash)_0_6px,transparent_6px_12px)]"
    />
  );
}

export default function LoopSection() {
  return (
    <section id="loop" className="relative mx-auto max-w-[1240px] px-6 pt-5 pb-[62px]">
      <div className="mb-[34px] max-w-[660px]">
        <h2 className="m-0 mb-2.5 text-[clamp(28px,3.6vw,44px)] leading-[1.12] font-extrabold tracking-[-0.012em] text-ink">
          {LOOP_HEADING}
        </h2>
        <p className="m-0 text-[16px] leading-[1.6] text-pretty text-mute">{LOOP_LEDE}</p>
      </div>

      <div className="flex flex-col items-stretch">
        <p className="m-0 self-start rotate-[-0.7deg] rounded-full bg-ink px-6 py-[13px] text-[15px] font-semibold text-white shadow-[0_12px_28px_#1c2a2321]">
          {PROMPT}
        </p>
        <Connector />

        <div className={`${CARD} rotate-[0.35deg]`}>
          <p className={`${KICKER} m-0 mb-3.5`}>{DECIDE_KICKER}</p>
          <div className="flex flex-wrap gap-3">
            {DECIDE_TILES.map((tile) => (
              <div key={tile.title} className="flex-[1_1_200px] rounded-[22px] bg-tile px-[18px] py-[15px]">
                <h3 className="m-0 mb-[3px] text-[16px] font-bold text-ink">{tile.title}</h3>
                <p className="m-0 text-[14px] leading-[1.5] text-mute">{tile.text}</p>
              </div>
            ))}
          </div>
        </div>
        <Connector />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[18px]">
          <div className={`${CARD} rotate-[-0.4deg]`}>
            <p className={`${KICKER} m-0 mb-1.5`}>{ROUTE_KICKER}</p>
            <p className="m-0 mb-3.5 text-[15px] leading-[1.55] text-mute">{ROUTE_LEDE}</p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {ROUTE_CHIPS.map((chip) => (
                <li key={chip.label} className={`${CHIP} ${TONES[chip.tone]} ${OUTLINES[chip.tone]}`}>
                  {chip.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="rotate-[0.5deg] rounded-[32px] bg-dark px-6 py-[22px] text-white shadow-[0_14px_34px_#1c2a2321]">
            <p className="m-0 mb-3 font-mono text-[10.5px] tracking-[1.4px] text-dark-dim">{PROBE_KICKER}</p>
            <dl className="m-0 flex flex-col gap-[9px] font-mono text-[12.5px]">
              {PROBE_ROWS.map((row) => (
                <div key={row.host} className="flex justify-between gap-3.5">
                  <dt className="text-dark-mute">{row.host}</dt>
                  <dd className="m-0 text-right text-dark-mint">{row.result}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 mt-3.5 text-[13.5px] leading-[1.55] text-dark-mute">{PROBE_NOTE}</p>
          </div>
        </div>
        <Connector />

        <div className="relative rounded-[38px] border-2 border-dashed border-dash-line px-[22px] pt-7 pb-6">
          <p className="absolute -top-[15px] right-[22px] m-0 rounded-full bg-lime px-4 py-[7px] font-mono text-[11px] tracking-[1px] text-lime-ink">
            {LOOP_BADGE}
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
            {LOOP_CARDS.map((card) => (
              <div
                key={card.kicker}
                className="rounded-[28px] border border-line bg-white px-[22px] py-5 shadow-[0_8px_22px_#1c2a230a]"
              >
                <p className={`${KICKER} m-0 mb-2`}>{card.kicker}</p>
                {'command' in card ? (
                  <pre className="m-0 mb-2.5 overflow-x-auto rounded-[14px] bg-tile px-3 py-2.5 font-mono text-[12px] whitespace-nowrap text-green">
                    <code>{card.command}</code>
                  </pre>
                ) : null}
                <p className="m-0 text-[15px] leading-[1.55] text-body">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
        <Connector />

        <div className={`${CARD} flex flex-wrap items-center justify-between gap-4 rotate-[-0.3deg]`}>
          <div>
            <p className={`${KICKER} m-0 mb-1.5`}>{REPORT_KICKER}</p>
            <p className="m-0 text-[16px] font-semibold text-ink">{REPORT_LEDE}</p>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-[9px] p-0">
            {REPORT_CHIPS.map((chip) => (
              <li key={chip.label} className={`${CHIP} ${TONES[chip.tone]}`}>
                {chip.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
