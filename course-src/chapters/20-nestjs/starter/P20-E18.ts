// P20-E18: NotesService מקבל repository דרך token בשם NOTES_REPOSITORY
import { Body, Controller, Get, Inject, Injectable, Module, Post } from "@nestjs/common";
import { IsString, Length } from "class-validator";

export interface Note {
  id: number;
  text: string;
}

export interface NotesRepository {
  list(): Promise<Note[]>;
  add(text: string): Promise<Note>;
}

export const NOTES_REPOSITORY = "NOTES_REPOSITORY";

// כתוב כאן InMemoryNotesRepository, CreateNoteDto, NotesService ו־NotesController

@Module({ controllers: [], providers: [] })
export class NotesModule {}
