import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Note {
    id: bigint;
    content: string;
    createdAt: Time;
}
export interface Message {
    id: bigint;
    role: Role;
    text: string;
    timestamp: Time;
}
export type Time = bigint;
export interface Reminder {
    id: bigint;
    title: string;
    done: boolean;
    createdAt: Time;
    description: string;
}
export enum Role {
    user = "user",
    jarvis = "jarvis"
}
export interface backendInterface {
    addMessage(role: Role, text: string): Promise<bigint>;
    addNote(content: string): Promise<bigint>;
    addReminder(title: string, description: string): Promise<bigint>;
    clearHistory(): Promise<void>;
    deleteNote(id: bigint): Promise<boolean>;
    deleteReminder(id: bigint): Promise<boolean>;
    getHistory(): Promise<Array<Message>>;
    getNotes(): Promise<Array<Note>>;
    getReminders(): Promise<Array<Reminder>>;
    markDone(id: bigint): Promise<boolean>;
}
