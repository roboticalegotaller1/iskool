"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  SchoolDigitalBook, 
  BookChapter, 
  BookCitation, 
  VerifiedCompendium 
} from '@/types/schoolBooks';
import { INITIAL_SCHOOL_BOOKS_SEED } from './seeds/schoolBooksSeed';
import { 
  findBestChapterForTopic, 
  generateSuperUserCompendium 
} from '@/lib/schoolBookMapper';

interface SchoolBooksState {
  books: SchoolDigitalBook[];
  compendiums: VerifiedCompendium[];
  activeBookId: string | null;
  isProcessing: boolean;

  // Consultas con Aislamiento Estricto por Colegio
  getBooksBySchool: (schoolId: string) => SchoolDigitalBook[];
  getAllBooksForSuperUser: () => SchoolDigitalBook[];
  getBookById: (bookId: string) => SchoolDigitalBook | undefined;
  
  // Consulta de sustento para planeación docente
  findBookCitationForPlanning: (
    schoolId: string, 
    level: string, 
    subject: string, 
    topicQuery: string
  ) => { book: SchoolDigitalBook; chapter: BookChapter; citation: BookCitation } | null;

  // Acciones de Gestión de Libros
  uploadBook: (newBook: Omit<SchoolDigitalBook, 'id' | 'fechaCarga' | 'estadoMapeo'>) => SchoolDigitalBook;
  deleteBook: (bookId: string) => void;
  setActiveBookId: (bookId: string | null) => void;

  // Acciones de Super Usuario (Compendios)
  createSuperUserCompendium: (
    title: string, 
    description: string, 
    selectedBookIds: string[]
  ) => VerifiedCompendium;
  deleteCompendium: (compendiumId: string) => void;

  // Preservación y Reasignación Curricular
  preserveAndReassignSchoolBooks: (schoolId: string, masterTeacherName?: string) => number;

  // Utilidades
  resetToDefaults: () => void;
}

export const useSchoolBooksStore = create<SchoolBooksState>()(
  persist(
    (set, get) => ({
      books: INITIAL_SCHOOL_BOOKS_SEED,
      compendiums: [],
      activeBookId: null,
      isProcessing: false,

      /**
       * AISLAMIENTO ESTRICTO MULTI-COLEGIO:
       * Garantiza que ningún colegio ajeno pueda ver los libros de otra institución.
       */
      getBooksBySchool: (schoolId: string) => {
        const { books } = get();
        if (!schoolId) return [];
        // Mapeo seguro si viene sch-jjr
        const targetId = schoolId === 'sch-jjr' ? 'sch-jjrosseau' : schoolId;
        return books.filter(b => b.schoolId === targetId || (targetId === 'sch-jjrosseau' && b.schoolId === 'sch-jjr'));
      },

      /**
       * EXCLUSIVO SUPER USUARIO:
       * Permite al Super Usuario tener visión global de todos los libros para crear compendios.
       */
      getAllBooksForSuperUser: () => {
        return get().books;
      },

      getBookById: (bookId: string) => {
        return get().books.find(b => b.id === bookId);
      },

      findBookCitationForPlanning: (schoolId: string, level: string, subject: string, topicQuery: string) => {
        const schoolBooks = get().getBooksBySchool(schoolId);
        if (schoolBooks.length === 0) return null;
        return findBestChapterForTopic(schoolBooks, subject, '', topicQuery);
      },

      uploadBook: (bookData) => {
        const newBook: SchoolDigitalBook = {
          ...bookData,
          id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fechaCarga: new Date().toISOString(),
          estadoMapeo: 'completo'
        };

        set(state => ({
          books: [newBook, ...state.books]
        }));

        return newBook;
      },

      deleteBook: (bookId: string) => {
        set(state => ({
          books: state.books.filter(b => b.id !== bookId),
          activeBookId: state.activeBookId === bookId ? null : state.activeBookId
        }));
      },

      setActiveBookId: (bookId) => {
        set({ activeBookId: bookId });
      },

      createSuperUserCompendium: (title, description, selectedBookIds) => {
        const { books, compendiums } = get();
        const selectedBooks = books.filter(b => selectedBookIds.includes(b.id));
        const newComp = generateSuperUserCompendium(selectedBooks, title, description);

        set({
          compendiums: [newComp, ...compendiums]
        });

        return newComp;
      },

      deleteCompendium: (compendiumId) => {
        set(state => ({
          compendiums: state.compendiums.filter(c => c.id !== compendiumId)
        }));
      },

      preserveAndReassignSchoolBooks: (schoolId: string, masterTeacherName: string = 'Prof. Israel López Ángeles') => {
        let count = 0;
        set(state => {
          const targetId = schoolId === 'sch-jjr' ? 'sch-jjrosseau' : schoolId;
          const updated = state.books.map(b => {
            if (b.schoolId === targetId || (targetId === 'sch-jjrosseau' && b.schoolId === 'sch-jjr')) {
              count++;
              return {
                ...b,
                schoolId: 'sch-jjrosseau', // Reasignado a la bóveda curricular maestra protegida
                subidoPor: `${masterTeacherName} (Resguardo Bóveda Curricular)`
              };
            }
            return b;
          });
          return { books: updated };
        });
        return count;
      },

      resetToDefaults: () => {
        set({
          books: INITIAL_SCHOOL_BOOKS_SEED,
          compendiums: [],
          activeBookId: null
        });
      }
    }),
    {
      name: 'iskool_school_digital_books_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        books: state.books,
        compendiums: state.compendiums
      })
    }
  )
);
