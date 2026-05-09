"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { Field } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DynamicFieldProps<T extends FieldValues = FieldValues> {
  field: Field;
  control: Control<T>;
  error?: string;
}

export function DynamicField<T extends FieldValues = FieldValues>({
  field,
  control,
  error,
}: DynamicFieldProps<T>) {
  const fieldId = `field-${field.id}`;
  const name = field.id as FieldPath<T>;

  return (
    <div className="space-y-2">
      {field.type !== "checkbox" && (
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="ms-1 text-primary">*</span>}
        </Label>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field: rhf }) => {
          const value = rhf.value;
          const onChange = rhf.onChange;

          switch (field.type) {
            case "text":
              return (
                <Input
                  id={fieldId}
                  type="text"
                  placeholder={field.placeholder}
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case "textarea":
              return (
                <Textarea
                  id={fieldId}
                  placeholder={field.placeholder}
                  rows={4}
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case "email":
              return (
                <Input
                  id={fieldId}
                  type="email"
                  inputMode="email"
                  dir="ltr"
                  placeholder={field.placeholder}
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case "phone":
              return (
                <Input
                  id={fieldId}
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  placeholder={field.placeholder}
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case "url":
              return (
                <Input
                  id={fieldId}
                  type="url"
                  inputMode="url"
                  dir="ltr"
                  placeholder={field.placeholder ?? "https://"}
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case "number":
              return (
                <Input
                  id={fieldId}
                  type="number"
                  inputMode="numeric"
                  placeholder={field.placeholder}
                  value={(value as string | number) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case "date":
              return (
                <Input
                  id={fieldId}
                  type="date"
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case "select":
              return (
                <Select
                  value={(value as string) ?? ""}
                  onValueChange={onChange}
                >
                  <SelectTrigger
                    id={fieldId}
                    aria-invalid={Boolean(error)}
                    className="w-full"
                  >
                    <SelectValue placeholder={field.placeholder ?? "اختاري..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            case "radio":
              return (
                <RadioGroup
                  value={(value as string) ?? ""}
                  onValueChange={onChange}
                  className="gap-3"
                >
                  {field.options?.map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={opt}
                        id={`${fieldId}-${opt}`}
                      />
                      <Label
                        htmlFor={`${fieldId}-${opt}`}
                        className="cursor-pointer font-normal"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              );
            case "checkbox-group": {
              const arr = Array.isArray(value) ? (value as string[]) : [];
              const toggle = (opt: string, checked: boolean) => {
                const next = checked
                  ? [...arr, opt]
                  : arr.filter((v) => v !== opt);
                onChange(next);
              };
              return (
                <div className="grid gap-2">
                  {field.options?.map((opt) => {
                    const checked = arr.includes(opt);
                    return (
                      <div key={opt} className="flex items-center gap-2">
                        <Checkbox
                          id={`${fieldId}-${opt}`}
                          checked={checked}
                          onCheckedChange={(v) => toggle(opt, v === true)}
                        />
                        <Label
                          htmlFor={`${fieldId}-${opt}`}
                          className="cursor-pointer font-normal"
                        >
                          {opt}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              );
            }
            case "checkbox":
              return (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id={fieldId}
                    checked={Boolean(value)}
                    onCheckedChange={(v) => onChange(v === true)}
                  />
                  <Label
                    htmlFor={fieldId}
                    className="cursor-pointer font-normal leading-relaxed"
                  >
                    {field.label}
                    {field.required && (
                      <span className="ms-1 text-primary">*</span>
                    )}
                  </Label>
                </div>
              );
            case "file":
              return (
                <Input
                  id={fieldId}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                  onBlur={rhf.onBlur}
                  aria-invalid={Boolean(error)}
                  className="cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
                />
              );
            default:
              return <span />;
          }
        }}
      />

      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && (
        <p
          className={cn(
            "text-xs text-destructive",
            field.type === "checkbox" && "ms-7"
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}
