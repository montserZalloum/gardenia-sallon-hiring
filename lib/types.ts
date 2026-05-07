import type { ObjectId } from "mongodb";

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox-group"
  | "checkbox"
  | "file";

export type ApplicationStatus = "new" | "contacted" | "accepted" | "rejected";

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

export interface Job {
  _id: ObjectId;
  title: string;
  description: string;
  expiryDate: Date | null;
  published: boolean;
  fields: Field[];
  createdAt: Date;
  applicationsCount: number;
  unreadCount: number;
}

export interface FileValue {
  _type: "file";
  name: string;
  size: number;
  mime: string;
  storedAs: string;
}

export function isFileValue(value: unknown): value is FileValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { _type?: string })._type === "file"
  );
}

export type FieldValue = string | number | boolean | string[] | FileValue | null;

export interface Application {
  _id: ObjectId;
  jobId: ObjectId;
  data: Record<string, FieldValue>;
  status: ApplicationStatus;
  read: boolean;
  notes: string;
  submittedAt: Date;
}

export type SerializedJob = Omit<Job, "_id" | "expiryDate" | "createdAt"> & {
  id: string;
  expiryDate: string | null;
  createdAt: string;
};

export type SerializedApplication = Omit<
  Application,
  "_id" | "jobId" | "submittedAt"
> & {
  id: string;
  jobId: string;
  submittedAt: string;
};
