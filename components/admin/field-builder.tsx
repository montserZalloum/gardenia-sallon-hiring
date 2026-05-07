"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  FIELD_TYPES,
  FIELD_TYPE_ORDER,
  supportsOptions,
} from "@/lib/field-types";
import type { Field, FieldType } from "@/lib/types";
import { cn } from "@/lib/utils";

function newField(type: FieldType = "text"): Field {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    label: "",
    required: false,
    placeholder: "",
    helpText: "",
    options: supportsOptions(type) ? ["خيار 1"] : undefined,
  };
}

export const DEFAULT_FIELDS: Field[] = [
  {
    id: "default-name",
    type: "text",
    label: "الاسم الكامل",
    required: true,
    placeholder: "",
    helpText: "",
  },
  {
    id: "default-email",
    type: "email",
    label: "البريد الإلكتروني",
    required: true,
    placeholder: "name@example.com",
    helpText: "",
  },
  {
    id: "default-phone",
    type: "phone",
    label: "رقم الهاتف",
    required: true,
    placeholder: "+962...",
    helpText: "",
  },
];

export function FieldBuilder({
  fields,
  onChange,
}: {
  fields: Field[];
  onChange: (fields: Field[]) => void;
}) {
  function update(idx: number, patch: Partial<Field>) {
    const next = [...fields];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function move(idx: number, direction: -1 | 1) {
    const target = idx + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function remove(idx: number) {
    onChange(fields.filter((_, i) => i !== idx));
  }

  function add() {
    onChange([...fields, newField("text")]);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {fields.map((field, idx) => (
          <FieldRow
            key={field.id}
            field={field}
            index={idx}
            isFirst={idx === 0}
            isLast={idx === fields.length - 1}
            onChange={(patch) => update(idx, patch)}
            onTypeChange={(type) =>
              update(idx, {
                type,
                options: supportsOptions(type)
                  ? field.options ?? ["خيار 1"]
                  : undefined,
              })
            }
            onMoveUp={() => move(idx, -1)}
            onMoveDown={() => move(idx, 1)}
            onRemove={() => remove(idx)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="w-full rounded-2xl h-11 border-dashed"
      >
        <Plus className="size-4" />
        إضافة حقل
      </Button>
    </div>
  );
}

function FieldRow({
  field,
  index,
  isFirst,
  isLast,
  onChange,
  onTypeChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  field: Field;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<Field>) => void;
  onTypeChange: (type: FieldType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const meta = FIELD_TYPES[field.type];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-2">
        <div className="mt-1 flex flex-col items-center text-muted-foreground">
          <GripVertical className="size-4 opacity-50" />
          <span className="mt-1 text-[11px] tabular-nums">{index + 1}</span>
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">اسم الحقل</Label>
              <Input
                value={field.label}
                placeholder="مثال: سنوات الخبرة"
                onChange={(e) => onChange({ label: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">نوع الحقل</Label>
              <Select
                value={field.type}
                onValueChange={(v) => onTypeChange(v as FieldType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPE_ORDER.map((t) => (
                    <SelectItem key={t} value={t}>
                      {FIELD_TYPES[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {meta.supportsPlaceholder && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Placeholder (اختياري)
              </Label>
              <Input
                value={field.placeholder ?? ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              نص مساعد (اختياري)
            </Label>
            <Input
              value={field.helpText ?? ""}
              placeholder="نص يساعد المتقدم على فهم الحقل"
              onChange={(e) => onChange({ helpText: e.target.value })}
            />
          </div>

          {meta.supportsOptions && (
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => onChange({ options })}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(v) => onChange({ required: v === true })}
              />
              <Label
                htmlFor={`required-${field.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                إجباري
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isFirst}
                onClick={onMoveUp}
                title="تحريك لأعلى"
                aria-label="تحريك لأعلى"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isLast}
                onClick={onMoveDown}
                title="تحريك لأسفل"
                aria-label="تحريك لأسفل"
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onRemove}
                title="حذف الحقل"
                aria-label="حذف الحقل"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...options, v]);
    setDraft("");
  }

  function remove(idx: number) {
    onChange(options.filter((_, i) => i !== idx));
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
      <Label className="text-xs text-muted-foreground">الخيارات</Label>
      {options.length === 0 && (
        <p className="text-xs text-muted-foreground">لا توجد خيارات بعد.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <span
            key={`${opt}-${i}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1 text-xs"
            )}
          >
            {opt}
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-full text-muted-foreground hover:text-destructive"
              aria-label={`حذف ${opt}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="اكتبي خيار جديد ثم Enter"
          className="h-9"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          إضافة
        </Button>
      </div>
    </div>
  );
}
