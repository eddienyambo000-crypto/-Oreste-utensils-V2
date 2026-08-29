import type { Locale } from "../config";
import { en } from "./en";
import { rw } from "./rw";
import { fr } from "./fr";

/** The translation shape — English is the source of truth. */
export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = { en, rw, fr };
