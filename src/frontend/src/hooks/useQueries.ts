import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message, Note, Reminder, Role } from "../backend.d";
import { useActor } from "./useActor";

export function useGetHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetReminders() {
  const { actor, isFetching } = useActor();
  return useQuery<Reminder[]>({
    queryKey: ["reminders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReminders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNotes() {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, text }: { role: Role; text: string }) => {
      if (!actor) return Promise.resolve(BigInt(0));
      return actor.addMessage(role, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useAddReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      description,
    }: { title: string; description: string }) => {
      if (!actor) return Promise.resolve(BigInt(0));
      return actor.addReminder(title, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useMarkDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) return Promise.resolve(false);
      return actor.markDone(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) return Promise.resolve(false);
      return actor.deleteReminder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useAddNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => {
      if (!actor) return Promise.resolve(BigInt(0));
      return actor.addNote(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) return Promise.resolve(false);
      return actor.deleteNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!actor) return Promise.resolve();
      return actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
