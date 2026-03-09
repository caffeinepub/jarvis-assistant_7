import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";

actor {
  // Types
  public type Role = {
    #user;
    #jarvis;
  };

  public type Message = {
    id : Nat;
    role : Role;
    text : Text;
    timestamp : Time.Time;
  };

  public type Reminder = {
    id : Nat;
    title : Text;
    description : Text;
    createdAt : Time.Time;
    done : Bool;
  };

  public type Note = {
    id : Nat;
    content : Text;
    createdAt : Time.Time;
  };

  module Message {
    public func compare(m1 : Message, m2 : Message) : Order.Order {
      Nat.compare(m1.id, m2.id);
    };
  };

  module Reminder {
    public func compare(r1 : Reminder, r2 : Reminder) : Order.Order {
      Nat.compare(r1.id, r2.id);
    };
  };

  module Note {
    public func compare(n1 : Note, n2 : Note) : Order.Order {
      Nat.compare(n1.id, n2.id);
    };
  };

  // Storage
  var messageIdCounter = 0;
  var reminderIdCounter = 0;
  var noteIdCounter = 0;

  let messages = Map.empty<Nat, Message>();
  let reminders = Map.empty<Nat, Reminder>();
  let notes = Map.empty<Nat, Note>();

  // Conversation history
  public shared ({ caller }) func addMessage(role : Role, text : Text) : async Nat {
    let id = messageIdCounter;
    let message : Message = {
      id;
      role;
      text;
      timestamp = Time.now();
    };
    messages.add(id, message);
    messageIdCounter += 1;
    id;
  };

  public query ({ caller }) func getHistory() : async [Message] {
    messages.values().toArray().sort();
  };

  public shared ({ caller }) func clearHistory() : async () {
    messages.clear();
  };

  // Reminders
  public shared ({ caller }) func addReminder(title : Text, description : Text) : async Nat {
    let id = reminderIdCounter;
    let reminder : Reminder = {
      id;
      title;
      description;
      createdAt = Time.now();
      done = false;
    };
    reminders.add(id, reminder);
    reminderIdCounter += 1;
    id;
  };

  public query ({ caller }) func getReminders() : async [Reminder] {
    reminders.values().toArray().sort();
  };

  public shared ({ caller }) func markDone(id : Nat) : async Bool {
    switch (reminders.get(id)) {
      case (null) { Runtime.trap("Reminder not found") };
      case (?reminder) {
        let updatedReminder : Reminder = { reminder with done = true };
        reminders.add(id, updatedReminder);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteReminder(id : Nat) : async Bool {
    if (reminders.containsKey(id)) {
      reminders.remove(id);
      true;
    } else { Runtime.trap("Reminder not found") };
  };

  // Notes
  public shared ({ caller }) func addNote(content : Text) : async Nat {
    let id = noteIdCounter;
    let note : Note = {
      id;
      content;
      createdAt = Time.now();
    };
    notes.add(id, note);
    noteIdCounter += 1;
    id;
  };

  public query ({ caller }) func getNotes() : async [Note] {
    notes.values().toArray().sort();
  };

  public shared ({ caller }) func deleteNote(id : Nat) : async Bool {
    if (notes.containsKey(id)) {
      notes.remove(id);
      true;
    } else { Runtime.trap("Note not found") };
  };
};
