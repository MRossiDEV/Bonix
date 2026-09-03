"use client";

// SceneInspector (PRD §41)
// Position / rotation / scale editor for a building slot or asset
// instance. State is local + controlled by the parent; the inspector
// doesn't write to Supabase on its own — the parent decides when to
// persist (debounced or on Save).

export interface SceneTransform {
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

export interface SceneInspectorProps {
  value: SceneTransform;
  onChange: (next: SceneTransform) => void;
}

interface NumberFieldProps {
  label: string;
  value: number;
  step?: number;
  onChange: (next: number) => void;
}

function NumberField({ label, value, step = 0.1, onChange }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
        {label}
    </span>
      <input
        type="number"
        value={Number.isFinite(value) ? Number(value.toFixed(3)) : 0}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="mt-1 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
      />
  </label>
  );
}

export function SceneInspector({ value, onChange }: SceneInspectorProps) {
  const setPosition = (axis: 0 | 1 | 2, next: number) => {
    const position: [number, number, number] = [...value.position] as [
      number,
      number,
      number,
    ];
    position[axis] = next;
    onChange({ ...value, position });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
        Transform
    </p>

      <div className="grid grid-cols-3 gap-2">
        <NumberField
          label="X"
          value={value.position[0]}
          onChange={(next) => setPosition(0, next)}
        />
        <NumberField
          label="Y"
          value={value.position[1]}
          onChange={(next) => setPosition(1, next)}
        />
        <NumberField
          label="Z"
          value={value.position[2]}
          onChange={(next) => setPosition(2, next)}
        />
    </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Rotation Y (rad)"
          value={value.rotationY}
          step={0.05}
          onChange={(next) => onChange({ ...value, rotationY: next })}
        />
        <NumberField
          label="Scale"
          value={value.scale}
          step={0.05}
          onChange={(next) => onChange({ ...value, scale: next })}
        />
    </div>
  </div>
  );
}
