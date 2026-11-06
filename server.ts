import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer memory storage for PDF document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Gemini SDK Client Initialization
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// ==========================================
// In-Memory Data Models & Seed Data
// ==========================================

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  semester: string;
  role: string;
  createdAt: string;
}

interface DocumentItem {
  id: number;
  fileName: string;
  fileType: string;
  semester: string;
  subject: string;
  uploadDate: string;
  uploadedBy: string;
  userId?: number;
}

interface DocumentChunk {
  id: number;
  documentId: number;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  semester: string;
  subject: string;
  documentName: string;
}

interface ChatMessage {
  id: number;
  sessionId: string;
  sender: 'STUDENT' | 'AI';
  message: string;
  sourcesJson?: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

// In-Memory Database Store
const users: User[] = [
  {
    id: 1,
    name: 'Sourin (Student)',
    email: 'student@college.edu',
    password: 'password123',
    semester: '5th Sem',
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
  },
];

const documents: DocumentItem[] = [
  {
    id: 1,
    fileName: 'OS_5th_Sem_Syllabus.pdf',
    fileType: 'application/pdf',
    semester: '5th Sem',
    subject: 'Operating Systems',
    uploadDate: new Date().toISOString(),
    uploadedBy: 'University Faculty (MAKAUT)',
    userId: 1,
  },
];

const documentChunks: DocumentChunk[] = [
  {
    id: 1,
    documentId: 1,
    chunkIndex: 0,
    pageNumber: 1,
    documentName: 'OS_5th_Sem_Syllabus.pdf',
    semester: '5th Sem',
    subject: 'Operating Systems',
    content:
      'WEST BENGAL UNIVERSITY OF TECHNOLOGY / MAKAUT CSE 5TH SEMESTER SYLLABUS.\n' +
      'Subject: Operating Systems (Code: CS501 / PCC-CS502).\n' +
      'Module 1: Introduction to Operating System Concepts, Functions, Architecture (Monolithic, Microkernel, Layered, Virtual Machine).\n' +
      'System Calls & APIs, OS Services, System Programs, Dual-Mode operation (User mode & Kernel mode).',
  },
  {
    id: 2,
    documentId: 1,
    chunkIndex: 1,
    pageNumber: 1,
    documentName: 'OS_5th_Sem_Syllabus.pdf',
    semester: '5th Sem',
    subject: 'Operating Systems',
    content:
      'Module 2: Process Management & CPU Scheduling.\n' +
      'Process States, Process Control Block (PCB), Context Switching, Threads and Concurrency (User vs Kernel Threads).\n' +
      'CPU Scheduling Algorithms: First-Come First-Served (FCFS), Shortest Job First (SJF / SRTF), Priority Scheduling, Round Robin (RR) with Time Quantum, Multilevel Feedback Queue Scheduling.\n' +
      'Evaluation metrics: Turnaround Time, Waiting Time, Response Time, Throughput.',
  },
  {
    id: 3,
    documentId: 1,
    chunkIndex: 2,
    pageNumber: 1,
    documentName: 'OS_5th_Sem_Syllabus.pdf',
    semester: '5th Sem',
    subject: 'Operating Systems',
    content:
      'Module 3: Process Synchronization & Deadlocks.\n' +
      'The Critical Section Problem, Peterson’s Solution, Hardware Synchronization (TestAndSet, Swap).\n' +
      'Semaphores (Counting and Binary), Mutex Locks, Classical Problems of Synchronization: Producer-Consumer, Readers-Writers, Dining Philosophers.\n' +
      'Deadlocks: Necessary conditions for Deadlock (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait).\n' +
      'Resource Allocation Graph (RAG), Deadlock Prevention, Deadlock Avoidance: Banker’s Algorithm for single and multi-instance resources, Safety Algorithm, Resource-Request Algorithm.',
  },
  {
    id: 4,
    documentId: 1,
    chunkIndex: 3,
    pageNumber: 1,
    documentName: 'OS_5th_Sem_Syllabus.pdf',
    semester: '5th Sem',
    subject: 'Operating Systems',
    content:
      'Module 4: Memory Management & Virtual Memory.\n' +
      'Contiguous Memory Allocation (Fixed and Variable partitioning, First-Fit, Best-Fit, Worst-Fit), Fragmentation (Internal and External).\n' +
      'Paging, Page Table, Translation Lookaside Buffer (TLB), Protection and Sharing.\n' +
      'Virtual Memory: Demand Paging, Page Fault Handling, Page Replacement Algorithms: FIFO, Optimal (OPT), Least Recently Used (LRU), Clock algorithm.\n' +
      'Thrashing, Working-Set Model, Page Fault Frequency.',
  },
  {
    id: 5,
    documentId: 1,
    chunkIndex: 4,
    pageNumber: 1,
    documentName: 'OS_5th_Sem_Syllabus.pdf',
    semester: '5th Sem',
    subject: 'Operating Systems',
    content:
      'Module 5: Storage Management, File Systems & Disk Scheduling.\n' +
      'File Concept, Access Methods (Sequential, Direct), Directory Structure (Single-level, Two-level, Tree-structured), Allocation Methods (Contiguous, Linked, Indexed).\n' +
      'Disk Structure and Disk Scheduling Algorithms: FCFS, SSTF, SCAN (Elevator algorithm), C-SCAN, LOOK, C-LOOK.\n' +
      'Recommended Textbooks: 1. Abraham Silberschatz, Peter B. Galvin, Greg Gagne - Operating System Concepts (9th/10th Ed).\n' +
      '2. William Stallings - Operating Systems: Internals and Design Principles.',
  },
];

const sessions: Map<string, ChatSession> = new Map();

// Seed initial session for default student
const initialSessionId = 'welcome-session-user-1';
sessions.set(initialSessionId, {
  id: initialSessionId,
  userId: 1,
  title: 'Welcome to AI College Assistant',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 1,
      sessionId: initialSessionId,
      sender: 'AI',
      message:
        '👋 Welcome! I am your AI College Assistant. Ask me questions about your university syllabus, lecture notes, exam topics, or course modules in **English**, **Bengali**, or **Banglish**!\n\n' +
        'Example prompts:\n' +
        '• *5th sem-এর OS syllabus কী?*\n' +
        '• *Explain CPU Scheduling: FCFS vs Round Robin*\n' +
        '• *Explain Banker\'s Algorithm with Safe State definition*',
      sourcesJson: JSON.stringify([
        { fileName: 'OS_5th_Sem_Syllabus.pdf', pageNumber: 1 },
      ]),
      timestamp: new Date().toISOString(),
    },
  ],
});

// ==========================================
// Authentication Helper (No hardcoded IDs)
// ==========================================

function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    // Token format: token_<userId>_<timestamp>
    const match = token.match(/^token_(\d+)_/);
    if (match) {
      const id = parseInt(match[1], 10);
      const user = users.find(u => u.id === id);
      if (user) return user;
    }
  }
  return null;
}

// ==========================================
// ==========================================
// Intent Classification & Subject Detection Engine
// ==========================================

export type IntentType =
  | 'GREETING'
  | 'GENERAL_CONVERSATION'
  | 'ACADEMIC_QUESTION'
  | 'FOLLOW_UP'
  | 'AMBIGUOUS_QUERY';

export interface IntentClassificationResult {
  intent: IntentType;
  subject: string;
  directResponse?: string;
  topic?: string;
}

const GREETING_PATTERN = /^(hi+|hello+|hey+|heyy+|heya|howdy|sup|hola|namaste|good\s+(morning|afternoon|evening|day))(\s+there|\s+assistant|\s+ai|\s+bot)?$/i;
const THANKS_PATTERN = /^(thank\s*you|thanks|thanks\s+a\s+lot|thank\s+you\s+so\s+much|thx|many\s+thanks|appreciate\s+it)/i;
const HOW_ARE_YOU_PATTERN = /\b(how\s+are\s+you|how\s+are\s+things|how\s+is\s+it\s+going|how\s+do\s+you\s+do|are\s+you\s+doing\s+well|what'?s\s+up)\b/i;
const IDENTITY_PATTERN = /\b(who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|what\s+are\s+your\s+capabilities|help\s+me|tell\s+me\s+about\s+yourself)\b/i;
const TOPIC_SWITCH_PATTERN = /\b(change\s+(the\s+)?(topic|subject)\s+to|switch\s+(the\s+)?(topic|subject)\s+to|switch\s+to|let'?s\s+(talk\s+about|study|switch\s+to))\s+(.+)/i;
const CONTINUATION_PATTERN = /^(tell\s+me\s+more|explain\s+more|give\s+(me\s+)?an?\s+example|continue|elaborate|can\s+you\s+explain\s+further|more\s+details|what\s+about\s+it|how\s+does\s+that\s+work)/i;

export function classifyIntent(
  query: string,
  fallbackSubject?: string,
  sessionMessages?: ChatMessage[]
): IntentClassificationResult {
  const trimmed = query.trim();
  const cleaned = trimmed.replace(/[?!.,]+$/, '').trim();
  const lower = trimmed.toLowerCase();

  // 1. GREETING
  if (GREETING_PATTERN.test(cleaned)) {
    return {
      intent: 'GREETING',
      subject: 'General',
      directResponse: 'Hey! How can I help you with your studies today?',
      topic: 'Greeting'
    };
  }

  // 2. GENERAL_CONVERSATION
  if (HOW_ARE_YOU_PATTERN.test(cleaned)) {
    return {
      intent: 'GENERAL_CONVERSATION',
      subject: 'General',
      directResponse: "I'm doing well, thank you for asking! Ready to help you tackle any university topics, syllabus modules, or exam questions. What are you studying today?",
      topic: 'SmallTalk'
    };
  }

  if (THANKS_PATTERN.test(cleaned)) {
    return {
      intent: 'GENERAL_CONVERSATION',
      subject: 'General',
      directResponse: "You're very welcome! Let me know if you need any more explanations or help with your coursework. Happy studying! 🎓",
      topic: 'Gratitude'
    };
  }

  if (IDENTITY_PATTERN.test(cleaned)) {
    return {
      intent: 'GENERAL_CONVERSATION',
      subject: 'General',
      directResponse: "I am your AI College Assistant! I can help you understand university subjects (such as Operating Systems, DBMS, Java, Data Structures, Physics, and more), summarize uploaded syllabus documents, explain complex concepts with examples, and prepare for your exams.",
      topic: 'Identity'
    };
  }

  // 3. FOLLOW_UP: Explicit Topic Switch
  const switchMatch = trimmed.match(TOPIC_SWITCH_PATTERN);
  if (switchMatch) {
    const target = switchMatch[switchMatch.length - 1].trim();
    const detected = detectSubjectName(target);
    if (detected !== 'General') {
      return {
        intent: 'FOLLOW_UP',
        subject: detected,
        directResponse: `Sure! Let's switch over to **${detected}**. What would you like to explore? We can cover core concepts, syllabus modules, or exam questions!`,
        topic: detected
      };
    }
  }

  // 4. FOLLOW_UP: Continuation Prompt ("tell me more", "explain more", etc.)
  if (CONTINUATION_PATTERN.test(cleaned)) {
    const priorSubject = findPriorSubjectFromSession(sessionMessages);
    if (priorSubject && priorSubject !== 'General') {
      return {
        intent: 'FOLLOW_UP',
        subject: priorSubject,
        topic: priorSubject
        // directResponse is undefined -> calls AI answer generator with continuation context
      };
    } else {
      return {
        intent: 'AMBIGUOUS_QUERY',
        subject: 'General',
        directResponse:
          `### 🤔 Clarification Needed\n\n` +
          `Could you please specify which subject or topic you'd like more details on? (e.g., Operating Systems, DBMS, Java, Data Structures, Physics).`,
        topic: 'Clarification'
      };
    }
  }

  // 5. AMBIGUOUS_QUERY (ultra short, contextless questions)
  if (
    lower === 'why is that?' || lower === 'why is that' || lower === 'why?' ||
    lower === 'why' || lower === 'how?' || lower === 'how' ||
    lower === 'explain this' || lower === 'what is it' || lower === 'what?' ||
    (lower.length < 15 && (lower.startsWith('why ') || lower.startsWith('how ') || lower.startsWith('what is it')))
  ) {
    const priorSubject = findPriorSubjectFromSession(sessionMessages);
    if (priorSubject && priorSubject !== 'General') {
      return {
        intent: 'FOLLOW_UP',
        subject: priorSubject,
        topic: priorSubject
      };
    }
    return {
      intent: 'AMBIGUOUS_QUERY',
      subject: 'General',
      directResponse:
        `### 🤔 Clarification Needed\n\n` +
        `Your question appears ambiguous or incomplete: **"${trimmed}"**.\n\n` +
        `Could you please clarify which academic subject or topic you are asking about? For example:\n` +
        `- **Compiler Design**: Lexical analysis, finite automata, LL(1) parsing, code optimization\n` +
        `- **Operating Systems**: Process scheduling, deadlock, virtual memory\n` +
        `- **DBMS**: Normalization (1NF–BCNF), transactions, SQL, ACID properties\n` +
        `- **Java**: Inheritance, polymorphism, encapsulation, OOP concepts\n` +
        `- **Data Structures**: Binary search, trees, sorting algorithms\n` +
        `- **Physics**: Newton's laws of motion, thermodynamics, forces`,
      topic: 'Clarification'
    };
  }

  // 6. ACADEMIC_QUESTION: Detect Subject
  const detectedSubject = detectSubjectName(trimmed);
  if (detectedSubject !== 'General') {
    return {
      intent: 'ACADEMIC_QUESTION',
      subject: detectedSubject,
      topic: detectedSubject
    };
  }

  if (fallbackSubject && fallbackSubject !== 'Operating Systems' && fallbackSubject !== 'General') {
    return {
      intent: 'ACADEMIC_QUESTION',
      subject: fallbackSubject,
      topic: fallbackSubject
    };
  }

  return {
    intent: 'ACADEMIC_QUESTION',
    subject: 'General Academic',
    topic: 'General Academic'
  };
}

export function detectSubjectName(text: string): string {
  const lower = text.toLowerCase().trim();

  // 1. Compiler Design Patterns
  if (
    lower.includes('compiler') ||
    lower.includes('lexical analysis') ||
    lower.includes('syntax analysis') ||
    lower.includes('finite automaton') ||
    lower.includes('finite automata') ||
    lower.includes('parsing') ||
    lower.includes('parser') ||
    lower.includes('ll(1)') ||
    lower.includes('ll(k)') ||
    lower.includes('lr(0)') ||
    lower.includes('slr') ||
    lower.includes('lalr') ||
    lower.includes('dfa') ||
    lower.includes('nfa') ||
    lower.includes('grammar') ||
    lower.includes('parse tree') ||
    lower.includes('syntax tree') ||
    lower.includes('intermediate code') ||
    lower.includes('three address code') ||
    lower.includes('three-address code') ||
    lower.includes('code optimization') ||
    lower.includes('code generation') ||
    lower.includes('symbol table') ||
    lower.includes('tokenization') ||
    lower.includes('lexeme') ||
    lower.includes('semantic analysis') ||
    lower.includes('first and follow') ||
    lower.includes('predictive parsing') ||
    lower.includes('dead code elimination') ||
    lower.includes('constant folding') ||
    lower.includes('peephole') ||
    lower.includes('cross-compiler') ||
    lower.includes('shift reduce') ||
    /\b(compiler|dfa|nfa|lexer|ast|cfg|tac|quadruple|triple|peephole)\b/i.test(lower)
  ) {
    return 'Compiler Design';
  }

  // 2. Operating Systems Patterns
  if (
    lower.includes('process scheduling') ||
    lower.includes('cpu scheduling') ||
    lower.includes('deadlock') ||
    lower.includes('banker') ||
    lower.includes('demand paging') ||
    lower.includes('page fault') ||
    lower.includes('virtual memory') ||
    lower.includes('semaphore') ||
    lower.includes('mutex') ||
    lower.includes('critical section') ||
    lower.includes('fork()') ||
    lower.includes('kernel') ||
    lower.includes('fcfs') ||
    lower.includes('sjf') ||
    lower.includes('round robin') ||
    lower.includes('c-scan') ||
    lower.includes('disk scheduling') ||
    lower.includes('operating system') ||
    lower.includes(' os ') ||
    lower.startsWith('os ') ||
    lower.endsWith(' os') ||
    lower === 'os' ||
    lower.includes('os-এর')
  ) {
    return 'Operating Systems';
  }

  // 2. Database Management Systems (DBMS) Patterns
  if (
    lower.includes('dbms') ||
    lower.includes('database') ||
    lower.includes('normalization') ||
    lower.includes('1nf') ||
    lower.includes('2nf') ||
    lower.includes('3nf') ||
    lower.includes('bcnf') ||
    lower.includes('acid') ||
    lower.includes('transaction') ||
    lower.includes('relational') ||
    lower.includes('sql') ||
    lower.includes('foreign key') ||
    lower.includes('primary key') ||
    lower.includes('er diagram') ||
    lower.includes('two phase locking') ||
    lower.includes('concurrency control') ||
    lower.includes('indexing in database') ||
    lower.includes('b-tree') ||
    lower.includes('functional dependency')
  ) {
    return 'DBMS';
  }

  // 3. Java / Object-Oriented Programming Patterns
  if (
    lower.includes('java') ||
    lower.includes('inheritance') ||
    lower.includes('polymorphism') ||
    lower.includes('encapsulation') ||
    lower.includes('abstraction') ||
    lower.includes('jvm') ||
    lower.includes('jre') ||
    lower.includes('jdk') ||
    lower.includes('interface in oop') ||
    lower.includes('method overriding') ||
    lower.includes('method overloading') ||
    lower.includes('garbage collection') ||
    lower.includes('exception handling') ||
    lower.includes('spring boot') ||
    lower.includes('extends') ||
    lower.includes('implements') ||
    /\b(oop|class|interface|object oriented)\b/i.test(lower)
  ) {
    return 'Java';
  }

  // 4. Data Structures & Algorithms Patterns
  if (
    lower.includes('binary search') ||
    lower.includes('linear search') ||
    lower.includes('linked list') ||
    lower.includes('stack') ||
    lower.includes('queue') ||
    lower.includes('binary tree') ||
    lower.includes('bst') ||
    lower.includes('sorting algorithm') ||
    lower.includes('quick sort') ||
    lower.includes('merge sort') ||
    lower.includes('bubble sort') ||
    lower.includes('dijkstra') ||
    lower.includes('dynamic programming') ||
    lower.includes('data structure') ||
    lower.includes('time complexity') ||
    lower.includes('big o') ||
    lower.includes('graph traversal') ||
    lower.includes('dfs') ||
    lower.includes('bfs')
  ) {
    return 'Data Structures';
  }

  // 5. Physics Patterns
  if (
    lower.includes('physics') ||
    lower.includes('newton') ||
    lower.includes('force') ||
    lower.includes('gravity') ||
    lower.includes('gravitation') ||
    lower.includes('acceleration') ||
    lower.includes('velocity') ||
    lower.includes('momentum') ||
    lower.includes('kinetic energy') ||
    lower.includes('thermodynamics') ||
    lower.includes('quantum') ||
    lower.includes('coulomb') ||
    lower.includes('electromagnetism') ||
    lower.includes('optics') ||
    lower.includes("ohm's law") ||
    lower.includes('law of motion') ||
    /\b(force|mass|f = ma)\b/i.test(lower)
  ) {
    return 'Physics';
  }

  // 6. Computer Networks Patterns
  if (
    lower.includes('computer network') ||
    lower.includes('osi model') ||
    lower.includes('tcp') ||
    lower.includes('udp') ||
    lower.includes('ip address') ||
    lower.includes('subnet') ||
    lower.includes('dns') ||
    lower.includes('http') ||
    lower.includes('router') ||
    lower.includes('switch')
  ) {
    return 'Computer Networks';
  }

  // 7. Software Engineering Patterns
  if (
    lower.includes('software engineering') ||
    lower.includes('sdlc') ||
    lower.includes('agile') ||
    lower.includes('scrum') ||
    lower.includes('waterfall') ||
    lower.includes('design pattern')
  ) {
    return 'Software Engineering';
  }

  // 8. Mathematics Patterns
  if (
    lower.includes('calculus') ||
    lower.includes('derivative') ||
    lower.includes('integration') ||
    lower.includes('matrix') ||
    lower.includes('eigenvalue') ||
    lower.includes('probability')
  ) {
    return 'Mathematics';
  }

  return 'General';
}

function findPriorSubjectFromSession(sessionMessages?: ChatMessage[]): string | null {
  if (!sessionMessages || sessionMessages.length === 0) return null;
  for (let i = sessionMessages.length - 1; i >= 0; i--) {
    const prevMsg = sessionMessages[i];
    const sub = detectSubjectName(prevMsg.message);
    if (sub !== 'General') {
      return sub;
    }
  }
  return null;
}

// Backward compatibility helper
export function detectSubjectFromQuery(
  query: string,
  fallbackSubject?: string,
  sessionMessages?: ChatMessage[]
): {
  subject: string;
  isAmbiguous: boolean;
  topic?: string;
} {
  const result = classifyIntent(query, fallbackSubject, sessionMessages);
  return {
    subject: result.subject,
    isAmbiguous: result.intent === 'AMBIGUOUS_QUERY',
    topic: result.topic
  };
}

function extractTokens(text: string): Set<string> {
  const cleaned = text.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, ' ');
  const words = cleaned.toLowerCase().split(/\s+/);
  const set = new Set<string>();
  for (const w of words) {
    if (w.length >= 2) set.add(w);
  }
  return set;
}

function retrieveRelevantChunks(query: string, semester?: string, targetSubject?: string, topK = 3) {
  const queryTokens = extractTokens(query);
  const scoredList: { chunk: DocumentChunk; score: number }[] = [];

  for (const chunk of documentChunks) {
    let textScore = 0;
    const contentLower = chunk.content.toLowerCase();
    const contentTokens = extractTokens(contentLower);

    for (const qToken of queryTokens) {
      if (contentLower.includes(qToken)) textScore += 1.5;
      if (contentTokens.has(qToken)) textScore += 2.0;
    }

    // STRICT: If query tokens have ZERO textual overlap with chunk text, discard!
    // Never allow a document chunk to score merely because a default subject was passed.
    if (textScore <= 0) {
      continue;
    }

    // If target subject is defined and differs from chunk subject, filter out
    if (targetSubject && targetSubject !== 'General Academic' && chunk.subject) {
      const chunkSub = chunk.subject.toLowerCase();
      const targetSub = targetSubject.toLowerCase();
      if (!chunkSub.includes(targetSub) && !targetSub.includes(chunkSub)) {
        continue;
      }
    }

    let finalScore = textScore;
    if (semester && chunk.semester && chunk.semester.toLowerCase() === semester.toLowerCase()) {
      finalScore += 0.5;
    }

    scoredList.push({ chunk, score: finalScore });
  }

  scoredList.sort((a, b) => b.score - a.score);
  return scoredList.slice(0, topK);
}

async function generateAiAnswer(
  query: string,
  chunks: { chunk: DocumentChunk; score: number }[],
  semester: string,
  subject: string
): Promise<string> {
  // If Gemini API is available, query official @google/genai SDK
  if (ai) {
    try {
      const contextText = chunks.length > 0
        ? chunks
            .map(
              (sc, i) =>
                `[${i + 1}] Source: ${sc.chunk.documentName} (Page ${sc.chunk.pageNumber})\nContent: ${sc.chunk.content}`
            )
            .join('\n\n')
        : `No specific uploaded PDF notes found for ${subject}. Use your accurate university academic knowledge for ${subject}. Do NOT force or mention Operating Systems unless the question is actually about Operating Systems.`;

      const prompt =
        `You are an intelligent AI College Assistant for university students.\n` +
        `Answer the student's question clearly, accurately, and professionally for the subject: ${subject}.\n` +
        `IMPORTANT: Do NOT assume or force Operating Systems unless the student question is specifically about Operating Systems.\n` +
        `You MUST support queries in Bengali, English, or Banglish (e.g. '5th sem-এর OS syllabus কী?').\n` +
        `If college PDF excerpts are provided in context, extract and cite the exact topics, modules, and page numbers.\n` +
        `If no context document is provided, provide a comprehensive, textbook-grade answer covering definitions, core concepts, formulas, code snippets, or diagrams appropriate for ${subject}.\n\n` +
        `Academic Subject Scope: ${subject}\nSemester: ${semester}\n\n` +
        `Context Documents:\n${contextText}\n\n` +
        `Student Question: ${query}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API request error, using grounded local synthesis fallback:', err);
    }
  }

  // High-Fidelity Multi-Subject Knowledge Engine (Fallback when API key is not configured or offline)
  const lowerQ = query.toLowerCase();

  // If we have verified text chunks matching the question, ground in the document
  if (chunks.length > 0) {
    let result = `### 📚 Grounded College Notes Answer (${subject})\n\n`;
    result += `Based on your indexed university document (**${chunks[0].chunk.documentName}**):\n\n`;

    for (const sc of chunks) {
      result += `#### 📄 ${sc.chunk.documentName} — Page ${sc.chunk.pageNumber}\n`;
      const formatted = sc.chunk.content.split('\n').map(line => `> ${line}`).join('\n');
      result += `${formatted}\n\n`;
    }

    if (lowerQ.includes('syllabus') || lowerQ.includes('module')) {
      result += `**Curriculum Module Breakdown:**\n` +
        `- **Module 1**: Introduction, Kernel Structure & System Calls\n` +
        `- **Module 2**: Process Management & CPU Scheduling (FCFS, SJF, Round Robin)\n` +
        `- **Module 3**: Concurrency, Semaphores & Banker's Deadlock Algorithm\n` +
        `- **Module 4**: Memory Paging, Segmentation & Demand Paging\n` +
        `- **Module 5**: Disk Scheduling & File System Management\n\n`;
    }

    result += `💡 *Provide your \`GEMINI_API_KEY\` in .env for advanced generative syntheses.*`;
    return result;
  }

  // Subject-Specific Academic Knowledge Engine:

  // 1. Compiler Design
  if (
    subject === 'Compiler Design' ||
    lowerQ.includes('compiler') ||
    lowerQ.includes('lexical analysis') ||
    lowerQ.includes('finite automaton') ||
    lowerQ.includes('finite automata') ||
    lowerQ.includes('parsing') ||
    lowerQ.includes('ll(1)') ||
    lowerQ.includes('intermediate code') ||
    lowerQ.includes('code optimization') ||
    lowerQ.includes('dfa') ||
    lowerQ.includes('nfa')
  ) {
    // Case A: What is a compiler / Overview of phases
    if (
      lowerQ.includes('what is a compiler') ||
      lowerQ.includes('compiler?') ||
      lowerQ.includes('phases of compiler') ||
      lowerQ.includes('overview of compiler')
    ) {
      return (
        `### 🛠️ Compiler Design: Definition & Architecture\n\n` +
        `A **Compiler** is a specialized system software that translates a high-level source program (e.g., C, C++, Java) into an equivalent low-level target machine code or assembly language, reporting errors encountered during the translation process.\n\n` +
        `#### 1. The Two Major Compiler Parts:\n` +
        `- **Analysis Phase (Front-End)**: Machine-independent. Analyzes source code for lexical, syntactic, and semantic correctness and creates an Intermediate Representation (IR).\n` +
        `- **Synthesis Phase (Back-End)**: Machine-dependent. Optimizes the intermediate code and generates target assembly/machine code for the host CPU architecture.\n\n` +
        `#### 2. The 6 Core Phases of a Compiler:\n` +
        `1. **Lexical Analysis (Scanner)**: Converts raw character stream into a stream of meaningful tokens.\n` +
        `2. **Syntax Analysis (Parser)**: Validates grammatical structure according to Context-Free Grammar (CFG) and builds a Parse/Syntax Tree.\n` +
        `3. **Semantic Analysis (Type Checker)**: Verifies semantic consistency, scope resolution, and static type compatibility.\n` +
        `4. **Intermediate Code Generation (IR)**: Generates a machine-independent intermediate representation (e.g., Three-Address Code).\n` +
        `5. **Code Optimization**: Transforms the IR to make the resulting program run faster, consume less memory, or use fewer CPU cycles without changing output.\n` +
        `6. **Target Code Generation**: Maps optimized IR into relocatable machine instructions or assembly code with register allocation.\n\n` +
        `#### 3. Cross-Cutting Utilities:\n` +
        `- **Symbol Table**: Central data structure recording variable names, types, addresses, scopes, and function signatures.\n` +
        `- **Error Handler**: Detects, isolates, and reports syntax and semantic diagnostics at each phase.`
      );
    }

    // Case B: Lexical Analysis
    if (lowerQ.includes('lexical analysis') || lowerQ.includes('tokenization') || lowerQ.includes('lexeme')) {
      return (
        `### 🔍 Compiler Design: Lexical Analysis (Scanner)\n\n` +
        `**Lexical Analysis** is the first phase of a compiler. It reads the raw source code character-by-character and groups them into logical, atomic units called **Tokens** while discarding comments and whitespace.\n\n` +
        `#### 1. Core Terminology:\n` +
        `- **Token**: An abstract category representing a lexical unit passed to the parser (e.g., \`<KEYWORD>\`, \`<ID>\`, \`<NUM>\`, \`<ASSIGN_OP>\`).\n` +
        `- **Lexeme**: The actual sequence of characters in the source program that matches a token pattern (e.g., \`int\`, \`totalSum\`, \`42\`, \`=\`).\n` +
        `- **Pattern**: The formal grammar rule (expressed via Regular Expressions) defining valid lexemes for a token.\n\n` +
        `#### 2. Practical Walkthrough:\n` +
        `Consider the statement: \`float total = price * 1.18;\`\n\n` +
        `The Lexical Analyzer generates the following token stream:\n` +
        `1. \`<KEYWORD, "float">\`\n` +
        `2. \`<IDENTIFIER, pointer to symbol table for "total">\`\n` +
        `3. \`<ASSIGNMENT_OPERATOR, "=">\`\n` +
        `4. \`<IDENTIFIER, pointer to symbol table for "price">\`\n` +
        `5. \`<MULTIPLICATION_OPERATOR, "*">\`\n` +
        `6. \`<CONSTANT_FLOAT, 1.18>\`\n` +
        `7. \`<SEMICOLON, ";">\`\n\n` +
        `#### 3. Auxiliary Functions:\n` +
        `- **Input Buffering**: Uses dual-buffer schemes with sentinel pointers (\`lexeme_begin\` and \`forward\`) to handle long lookaheads.\n` +
        `- **Lexical Errors**: Detects unrecognized characters (e.g., stray \`@\` or unterminated string literals).`
      );
    }

    // Case C: Finite Automaton
    if (
      lowerQ.includes('finite automaton') ||
      lowerQ.includes('finite automata') ||
      lowerQ.includes('dfa') ||
      lowerQ.includes('nfa')
    ) {
      return (
        `### ⚙️ Compiler Design: Finite Automata (DFA vs NFA)\n\n` +
        `A **Finite Automaton (FA)** is an abstract mathematical machine model used in compiler design to recognize Regular Expressions and implement lexical analyzers.\n\n` +
        `#### 1. Formal 5-Tuple Definition:\n` +
        `$$M = (Q, \\Sigma, \\delta, q_0, F)$$\n` +
        `Where:\n` +
        `- **$Q$**: Finite non-empty set of internal states.\n` +
        `- **$\\Sigma$**: Finite set of input symbols (the alphabet).\n` +
        `- **$\\delta$**: State transition function.\n` +
        `- **$q_0 \\in Q$**: Initial start state.\n` +
        `- **$F \\subseteq Q$**: Set of accepting / final states.\n\n` +
        `#### 2. DFA vs NFA Comparison:\n\n` +
        `| Characteristic | Deterministic Finite Automaton (DFA) | Non-Deterministic Finite Automaton (NFA) |\n` +
        `|---|---|---|\n` +
        `| **Transition Rule** | Exactly one deterministic transition per symbol $\\delta: Q \\times \\Sigma \\rightarrow Q$ | Zero, one, or multiple transitions per symbol $\\delta: Q \\times (\\Sigma \\cup \\{\\epsilon\\}) \\rightarrow 2^Q$ |\n` +
        `| **$\\epsilon$ (Empty) Transitions** | Not permitted | Allowed without consuming input |\n` +
        `| **Execution Speed** | Ultra fast: $O(n)$ time complexity for string of length $n$ | Slower due to backtracking or tracking parallel states |\n` +
        `| **Space Complexity** | May require up to $2^{|Q|}$ states in worst case | Compact: direct proportional to regex length |\n\n` +
        `#### 3. Conversion Pipeline:\n` +
        `$$\\text{Regular Expression} \\xrightarrow{\\text{Thompson's Construction}} \\text{NFA} \\xrightarrow{\\text{Subset Construction Algorithm}} \\text{DFA} \\xrightarrow{\\text{Hopcroft's Minimization}} \\text{Minimal DFA}$$`
      );
    }

    // Case D: LL(1) Parsing
    if (lowerQ.includes('ll(1)') || lowerQ.includes('parsing') || lowerQ.includes('parser')) {
      return (
        `### 🌲 Compiler Design: LL(1) Parsing Explained\n\n` +
        `**LL(1) Parsing** is a deterministic top-down parsing technique that constructs a leftmost derivation for an input string without backtracking using a single lookahead token.\n\n` +
        `#### 1. Significance of the Name **LL(1)**:\n` +
        `- **First L**: Scans input from **L**eft to right.\n` +
        `- **Second L**: Builds **L**eftmost derivation.\n` +
        `- **(1)**: Uses **1** token of lookahead to determine which production rule to apply.\n\n` +
        `#### 2. Key Mathematical Sets:\n` +
        `1. **$\\text{FIRST}(\\alpha)$**:\n` +
        `   - Set of all terminal symbols that can appear as the first symbol of a string derived from $\\alpha$.\n` +
        `   - If $\\alpha \\Rightarrow^* \\epsilon$, then $\\epsilon \\in \\text{FIRST}(\\alpha)$.\n` +
        `2. **$\\text{FOLLOW}(A)$**:\n` +
        `   - Set of all terminals that can appear immediately to the right of non-terminal $A$ in some sentential form.\n` +
        `   - For the start symbol $S$, the input endmarker $\\$$ is always placed in $\\text{FOLLOW}(S)$.\n\n` +
        `#### 3. LL(1) Parsing Table Construction Rule $M[A, a]$:\n` +
        `- For each production $A \\rightarrow \\alpha$ in grammar $G$:\n` +
        `  1. For every terminal $a \\in \\text{FIRST}(\\alpha)$, insert $A \\rightarrow \\alpha$ into $M[A, a]$.\n` +
        `  2. If $\\epsilon \\in \\text{FIRST}(\\alpha)$, insert $A \\rightarrow \\alpha$ into $M[A, b]$ for every terminal $b \\in \\text{FOLLOW}(A)$.\n\n` +
        `#### 4. Necessary Conditions for a Grammar to be LL(1):\n` +
        `- A grammar is **LL(1)** if and only if its parsing table contains **no duplicate entries** (no conflicts).\n` +
        `- **Pre-requisites**: Must eliminate **Left Recursion** ($A \\rightarrow A\\alpha$) and perform **Left Factoring** on common prefixes ($A \\rightarrow \\alpha\\beta_1 \\mid \\alpha\\beta_2$).`
      );
    }

    // Case E: Intermediate Code Generation
    if (
      lowerQ.includes('intermediate code') ||
      lowerQ.includes('three address code') ||
      lowerQ.includes('three-address code') ||
      lowerQ.includes('tac')
    ) {
      return (
        `### 🔀 Compiler Design: Intermediate Code Generation (ICG)\n\n` +
        `**Intermediate Code Generation** is the fourth phase of a compiler. It translates the validated syntax/parse tree into a machine-independent intermediate representation (IR).\n\n` +
        `#### 1. Why Intermediate Code is Essential:\n` +
        `- **Portability & Retargetability**: If a compiler supports $M$ source languages and $N$ CPU targets, generating IR reduces compiler components from $M \\times N$ to $M + N$.\n` +
        `- **Machine-Independent Optimization**: Optimizations (e.g. dead code elimination, constant folding) can be executed once on the IR rather than repeatedly for every target architecture.\n\n` +
        `#### 2. Three-Address Code (TAC):\n` +
        `In **Three-Address Code**, every instruction has at most one operator on the right-hand side and at most three address references:\n` +
        `$$x = y \\text{ op } z$$\n\n` +
        `**Example Translation**:\n` +
        `Source: \`a = b * -c + b * -c;\`\n` +
        `\`\`\`text\n` +
        `t1 = -c\n` +
        `t2 = b * t1\n` +
        `t3 = -c\n` +
        `t4 = b * t3\n` +
        `t5 = t2 + t4\n` +
        `a  = t5\n` +
        `\`\`\`\n\n` +
        `#### 3. Common Data Structures for TAC:\n` +
        `- **Quadruples**: Explicit records with 4 fields \`(op, arg1, arg2, result)\`.\n` +
        `- **Triples**: References intermediate results by table row index \`(op, arg1, arg2)\` to save memory.\n` +
        `- **Indirect Triples**: Array of pointers to triples, allowing easy instruction reordering during optimization.`
      );
    }

    // Case F: Code Optimization
    if (lowerQ.includes('code optimization') || lowerQ.includes('optimization')) {
      return (
        `### ⚡ Compiler Design: Code Optimization Techniques\n\n` +
        `**Code Optimization** is the phase where the compiler attempts to produce more efficient target code—reducing execution time, memory footprint, and CPU energy consumption—while strictly preserving the program's observable output.\n\n` +
        `#### 1. Core Optimization Strategies:\n\n` +
        `1. **Common Subexpression Elimination (CSE)**:\n` +
        `   - Identifies identical expressions evaluated multiple times where operands have not changed.\n` +
        `   - *Before*: \`t1 = x + y; t2 = z + (x + y);\` $\\rightarrow$ *After*: \`t1 = x + y; t2 = z + t1;\`\n\n` +
        `2. **Constant Folding & Constant Propagation**:\n` +
        `   - **Folding**: Evaluates constant operations at compile time (e.g., \`x = 3.14 * 2\` $\\rightarrow$ \`x = 6.28\`).\n` +
        `   - **Propagation**: If \`x = 10\`, subsequent uses like \`y = x + 5\` are transformed into \`y = 10 + 5\` $\\rightarrow$ \`y = 15\`.\n\n` +
        `3. **Dead Code Elimination**:\n` +
        `   - Removes code whose computed values are never used or instructions enclosed in unconditionally unreachable branches (\`if (false) { ... }\`).\n\n` +
        `4. **Loop Invariant Code Motion (Hoisting)**:\n` +
        `   - Moves computations inside a loop whose operands remain invariant (constant) across iterations out to the loop header.\n\n` +
        `5. **Strength Reduction**:\n` +
        `   - Replaces computationally expensive operations with mathematically equivalent faster instructions (e.g., replacing multiplication \`x * 2\` with bitwise shift \`x << 1\`).\n\n` +
        `6. **Peephole Optimization**:\n` +
        `   - Examines a small sliding window ("peephole") of target assembly instructions to eliminate redundant load/store pairs and jump-to-jump sequences.`
      );
    }

    // Generic Compiler Design fallback
    return (
      `### 🛠️ Compiler Design: Core Concepts & Principles\n\n` +
      `Here is a conceptual overview of **"${query}"** in **Compiler Design**:\n\n` +
      `- **Role in Compilation**: Acts as part of the structured pipeline translating source grammar into optimized machine code.\n` +
      `- **Theoretical Foundation**: Utilizes formal language theory, Automata (DFA/NFA), Context-Free Grammars (CFG), and syntax-directed translation.\n\n` +
      `💡 *Tip: Upload your college Compiler Design syllabus PDF via the top bar to get exact answers grounded in your specific university curriculum!*`
    );
  }

  // 2. Database Management Systems (DBMS)
  if (
    subject === 'DBMS' ||
    lowerQ.includes('normalization') ||
    lowerQ.includes('1nf') ||
    lowerQ.includes('2nf') ||
    lowerQ.includes('3nf') ||
    lowerQ.includes('bcnf') ||
    lowerQ.includes('acid') ||
    lowerQ.includes('dbms')
  ) {
    return (
      `### 🗄️ Database Management Systems (DBMS): Normalization\n\n` +
      `**Normalization** is a formal database design technique used to organize relations (tables) to minimize **data redundancy** and avoid **insertion, update, and deletion anomalies**.\n\n` +
      `#### Normal Forms Breakdown:\n\n` +
      `1. **First Normal Form (1NF)**:\n` +
      `   - Every column must contain **atomic (indivisible) values**.\n` +
      `   - No repeating groups or multi-valued attributes allowed.\n` +
      `   - *Example*: A \`Phone_Numbers\` column cannot hold comma-separated numbers like \`"98765, 43210"\`.\n\n` +
      `2. **Second Normal Form (2NF)**:\n` +
      `   - Relation must be in **1NF**.\n` +
      `   - Must eliminate **Partial Dependency**: No non-prime attribute should be functionally dependent on a proper subset of any candidate key.\n` +
      `   - Applies when the primary key is composite.\n\n` +
      `3. **Third Normal Form (3NF)**:\n` +
      `   - Relation must be in **2NF**.\n` +
      `   - Must eliminate **Transitive Dependency**: Non-prime attributes must not depend on other non-prime attributes ($X \\rightarrow Y$ and $Y \\rightarrow Z$).\n` +
      `   - *Condition*: For every functional dependency $X \\rightarrow Y$, either $X$ is a Super Key or $Y$ is a Prime Attribute.\n\n` +
      `4. **Boyce-Codd Normal Form (BCNF)**:\n` +
      `   - Stricter version of 3NF.\n` +
      `   - For **every** non-trivial functional dependency $X \\rightarrow Y$, **$X$ MUST be a Super Key**.\n\n` +
      `**Key University Exam Summary:**\n` +
      `- Reduces duplicate data across tables.\n` +
      `- Enforces referential integrity through foreign keys.\n` +
      `- Guarantees lossless join decomposition.`
    );
  }

  // 2. Java / Object-Oriented Programming
  if (
    subject === 'Java' ||
    lowerQ.includes('inheritance') ||
    lowerQ.includes('polymorphism') ||
    lowerQ.includes('encapsulation') ||
    lowerQ.includes('java')
  ) {
    return (
      `### ☕ Java & Object-Oriented Programming: Inheritance\n\n` +
      `**Inheritance** is a fundamental OOP principle in Java where a new class (known as a **subclass** or **child class**) derives properties, state, and behaviors from an existing class (known as a **superclass** or **parent class**) using the \`extends\` keyword.\n\n` +
      `#### Key Principles & Syntax:\n` +
      `\`\`\`java\n` +
      `// Superclass (Parent)\n` +
      `class Vehicle {\n` +
      `    protected String brand = "Generic Vehicle";\n` +
      `    public void honk() {\n` +
      `        System.out.println("Beep, beep!");\n` +
      `    }\n` +
      `}\n\n` +
      `// Subclass (Child)\n` +
      `class Car extends Vehicle {\n` +
      `    private int doors = 4;\n` +
      `    @Override\n` +
      `    public void honk() {\n` +
      `        super.honk(); // Call parent implementation\n` +
      `        System.out.println("Car horn sounds!");\n` +
      `    }\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `#### Types of Inheritance in Java:\n` +
      `1. **Single Inheritance**: Class $B$ extends Class $A$.\n` +
      `2. **Multilevel Inheritance**: Class $C$ extends Class $B$, and $B$ extends $A$.\n` +
      `3. **Hierarchical Inheritance**: Multiple classes ($B, C, D$) extend the same Class $A$.\n` +
      `4. **Multiple Inheritance with Classes is NOT allowed** in Java (to avoid the Diamond Problem / ambiguity). Instead, Java achieves multiple inheritance using **Interfaces** (\`implements InterfaceA, InterfaceB\`).\n\n` +
      `**Core Keywords:**\n` +
      `- \`extends\`: Declares inheritance relationship.\n` +
      `- \`super\`: References immediate parent class constructor or methods.\n` +
      `- \`final\` on class: Prevents the class from being inherited (e.g. \`java.lang.String\`).`
    );
  }

  // 3. Data Structures & Algorithms
  if (
    subject === 'Data Structures' ||
    lowerQ.includes('binary search') ||
    lowerQ.includes('linear search') ||
    lowerQ.includes('sorting') ||
    lowerQ.includes('tree')
  ) {
    return (
      `### ⚡ Data Structures & Algorithms: Binary Search\n\n` +
      `**Binary Search** is an efficient search algorithm that finds the position of a target value within a **sorted array** using the **Divide and Conquer** strategy.\n\n` +
      `#### Algorithm Workflow:\n` +
      `1. Initialize \`low = 0\` and \`high = n - 1\`.\n` +
      `2. Calculate the middle index: \`mid = low + (high - low) / 2\` (prevents integer overflow).\n` +
      `3. Compare target with \`arr[mid]\`:\n` +
      `   - If \`arr[mid] == target\`: Element found! Return \`mid\`.\n` +
      `   - If \`arr[mid] < target\`: Target lies in the right half $\\rightarrow$ set \`low = mid + 1\`.\n` +
      `   - If \`arr[mid] > target\`: Target lies in the left half $\\rightarrow$ set \`high = mid - 1\`.\n` +
      `4. Repeat until \`low > high\`. If not found, return \`-1\`.\n\n` +
      `#### Complexity Analysis:\n` +
      `- **Best Case Time Complexity**: $O(1)$ (target is at the middle element).\n` +
      `- **Average & Worst Case**: $O(\\log_2 n)$ (search space is halved in every iteration).\n` +
      `- **Auxiliary Space Complexity**: $O(1)$ for iterative; $O(\\log n)$ for recursive call stack.\n\n` +
      `**Comparison with Linear Search:**\n` +
      `- Linear Search: $O(n)$ time, works on unsorted arrays.\n` +
      `- Binary Search: $O(\\log n)$ time, strictly requires a **sorted** collection.`
    );
  }

  // 4. Physics
  if (
    subject === 'Physics' ||
    lowerQ.includes('newton') ||
    lowerQ.includes('gravity') ||
    lowerQ.includes('momentum') ||
    lowerQ.includes('force')
  ) {
    if (lowerQ.includes('tell me more') || lowerQ.includes('explain more') || lowerQ.includes('example') || lowerQ.includes('further')) {
      return (
        `### ⚛️ Engineering Physics: Newton's Second Law — Advanced Applications & Impulse\n\n` +
        `Here is a deeper exploration of **Newton's Second Law** with real-world engineering examples and calculations:\n\n` +
        `#### 1. The Impulse-Momentum Theorem:\n` +
        `Impulse ($\\vec{J}$) is defined as the integral of force over the time interval $\\Delta t$:\n` +
        `$$\\vec{J} = \\int_{t_1}^{t_2} \\vec{F}\\,dt = \\Delta \\vec{p} = m(\\vec{v}_f - \\vec{v}_i)$$\n\n` +
        `#### 2. Engineering Case Studies:\n` +
        `1. **Automobile Crumple Zones & Airbags**:\n` +
        `   - In a crash, $\\Delta p$ is fixed by the car's initial momentum.\n` +
        `   - Airbags and crumple zones increase deceleration time $\\Delta t$ by a factor of 10x.\n` +
        `   - Since $F_{\\text{avg}} = \\frac{\\Delta p}{\\Delta t}$, increasing $\\Delta t$ reduces the peak impact force on passengers by 90%.\n\n` +
        `2. **Variable Mass Systems (Rocket Propulsion)**:\n` +
        `   - Because mass decreases as fuel burns, Newton's 2nd law generalizes to Tsiolkovsky's Rocket Equation:\n` +
        `   $$m \\frac{dv}{dt} = v_{\\text{exhaust}} \\left(-\\frac{dm}{dt}\\right)$$\n\n` +
        `#### 3. Sample Numerical Problem:\n` +
        `- **Problem**: A $1200\\,\\text{kg}$ electric vehicle accelerates from $0$ to $27.8\\,\\text{m/s}$ ($100\\,\\text{km/h}$) in $4.0\\,\\text{s}$. Calculate the required net forward force.\n` +
        `- **Solution**:\n` +
        `  $$a = \\frac{v_f - v_i}{t} = \\frac{27.8 - 0}{4.0} = 6.95\\,\\text{m/s}^2$$\n` +
        `  $$F = m \\cdot a = 1200 \\cdot 6.95 = 8340\\,\\text{N}$$`
      );
    }

    return (
      `### ⚛️ Engineering Physics: Newton's Second Law of Motion\n\n` +
      `**Newton's Second Law of Motion** states that the **time rate of change of linear momentum** of a body is directly proportional to the applied external force and takes place in the direction of the force.\n\n` +
      `#### Mathematical Derivation:\n` +
      `Linear momentum $\\vec{p}$ is defined as:\n` +
      `$$\\vec{p} = m \\vec{v}$$\n\n` +
      `According to the second law:\n` +
      `$$\\vec{F} \\propto \\frac{d\\vec{p}}{dt} = \\frac{d(m\\vec{v})}{dt}$$\n\n` +
      `For an object of constant mass ($m$):\n` +
      `$$\\vec{F} = m \\frac{d\\vec{v}}{dt} = m \\vec{a}$$\n\n` +
      `$$\\mathbf{F = ma}$$\n\n` +
      `#### Units & Parameters:\n` +
      `- **$F$ (Force)**: Measured in **Newtons (N)** or $\\text{kg}\\cdot\\text{m}/\\text{s}^2$.\n` +
      `- **$m$ (Mass)**: Scalar quantity measured in **kilograms (kg)**.\n` +
      `- **$a$ (Acceleration)**: Vector quantity measured in $\\text{m}/\\text{s}^2$.\n\n` +
      `#### Real-World Applications & Exam Examples:\n` +
      `1. **Cricket Catching**: A fielder pulls their hands backward while catching a fast cricket ball. This increases the contact time $\\Delta t$, reducing the impact force ($F = \\Delta p / \\Delta t$) on their hands.\n` +
      `2. **Automobile Seatbelts & Airbags**: Increase the time taken for passengers' momentum to reach zero during a collision, dramatically decreasing the net deceleration force.`
    );
  }

  // 5. Operating Systems (when explicitly requested)
  if (
    subject === 'Operating Systems' ||
    lowerQ.includes('process scheduling') ||
    lowerQ.includes('cpu scheduling') ||
    lowerQ.includes('banker') ||
    lowerQ.includes('deadlock')
  ) {
    return (
      `### 🖥️ Operating Systems: Process & CPU Scheduling\n\n` +
      `**Process Scheduling** is an essential Operating System component that decides which process in the ready queue is assigned the CPU for execution, balancing responsiveness, fairness, and throughput.\n\n` +
      `#### Types of Schedulers:\n` +
      `1. **Long-Term Scheduler (Job Scheduler)**: Controls the degree of multiprogramming by selecting jobs from secondary storage into the ready queue.\n` +
      `2. **Short-Term Scheduler (CPU Scheduler)**: Selects from ready processes in memory and allocates CPU.\n` +
      `3. **Medium-Term Scheduler (Swapper)**: Temporarily removes processes from memory to balance system load.\n\n` +
      `#### Key CPU Scheduling Algorithms:\n` +
      `- **First-Come, First-Served (FCFS)**: Non-preemptive. Simple FIFO queue, but suffers from the **Convoy Effect** (short processes wait behind long CPU bursts).\n` +
      `- **Shortest Job First (SJF / SRTF)**: Optimal algorithm for minimizing average waiting time. Preemptive version is Shortest Remaining Time First (SRTF).\n` +
      `- **Round Robin (RR)**: Preemptive algorithm using a fixed **Time Quantum ($q$)**. Guarantees responsiveness for interactive/time-sharing systems.\n` +
      `- **Priority Scheduling**: Allocates CPU based on priority; prevents starvation using **Aging**.\n\n` +
      `**Scheduling Performance Metrics:**\n` +
      `- **Turnaround Time**: $\\text{Completion Time} - \\text{Arrival Time}$\n` +
      `- **Waiting Time**: $\\text{Turnaround Time} - \\text{Burst Time}$`
    );
  }

  // General Academic Response
  return (
    `### 🎓 AI College Assistant Response (${subject})\n\n` +
    `Here is the conceptual overview for **"${query}"** in **${subject}**:\n\n` +
    `- **Core Foundation**: Review the formal definitions, governing equations, and boundary conditions.\n` +
    `- **Exam Practice**: State assumptions clearly, write step-by-step mathematical derivations or clean code snippets, and provide practical examples.\n\n` +
    `💡 *Tip: Upload your college syllabus PDF or lecture notes using the top bar to get exact answers grounded in your university curriculum!*`
  );
}

// ==========================================
// REST API Routes (Contract-Identical with Spring Boot)
// ==========================================

// Auth Endpoints
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, semester } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: 'Name and email are required!' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists!' });
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    password: password || 'default123',
    semester: semester || '5th Sem',
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);

  return res.json({
    token: `token_${newUser.id}_${Date.now()}`,
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    semester: newUser.semester,
    role: newUser.role,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required!' });
  }

  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: users.length + 1,
      name: email.split('@')[0],
      email,
      semester: '5th Sem',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  }

  return res.json({
    token: `token_${user.id}_${Date.now()}`,
    id: user.id,
    name: user.name,
    email: user.email,
    semester: user.semester,
    role: user.role,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    semester: user.semester,
    role: user.role,
  });
});

// Document Endpoints
app.post('/api/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Please upload a valid PDF file!' });
    }

    const authUser = getAuthenticatedUser(req);
    const semester = (req.body.semester as string) || '5th Sem';
    const subject = (req.body.subject as string) || 'Operating Systems';
    const uploadedBy = authUser ? authUser.name : ((req.body.uploadedBy as string) || 'Student / Faculty');

    let textContent = '';
    try {
      const parsed = await pdfParse(file.buffer);
      textContent = parsed.text || '';
    } catch (parseErr) {
      console.warn('PDF parse error, fallback to string parsing:', parseErr);
      textContent = file.buffer.toString('utf-8');
    }

    const docId = documents.length + 1;
    const newDoc: DocumentItem = {
      id: docId,
      fileName: file.originalname,
      fileType: file.mimetype || 'application/pdf',
      semester,
      subject,
      uploadDate: new Date().toISOString(),
      uploadedBy,
      userId: authUser ? authUser.id : undefined,
    };
    documents.push(newDoc);

    // Split text into chunks (~800 characters)
    const paragraphs = textContent.split(/\n\s*\n/);
    let chunkBuffer = '';
    let chunkIndex = 0;
    let pageNumber = 1;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      chunkBuffer += (chunkBuffer ? '\n' : '') + trimmed;
      if (chunkBuffer.length >= 750) {
        documentChunks.push({
          id: documentChunks.length + 1,
          documentId: docId,
          chunkIndex: chunkIndex++,
          pageNumber,
          content: chunkBuffer,
          semester,
          subject,
          documentName: newDoc.fileName,
        });
        chunkBuffer = '';
        if (chunkIndex % 3 === 0) pageNumber++;
      }
    }

    if (chunkBuffer.length > 0) {
      documentChunks.push({
        id: documentChunks.length + 1,
        documentId: docId,
        chunkIndex: chunkIndex++,
        pageNumber,
        content: chunkBuffer,
        semester,
        subject,
        documentName: newDoc.fileName,
      });
    }

    return res.json({
      message: 'PDF Document uploaded and RAG indexed successfully!',
      documentId: docId,
      fileName: newDoc.fileName,
      chunksIndexed: chunkIndex,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error processing PDF: ' + (err.message || 'Unknown error') });
  }
});

app.get('/api/documents/list', (req: Request, res: Response) => {
  const { semester, subject } = req.query;
  let filtered = [...documents];

  if (semester) {
    filtered = filtered.filter(d => d.semester.toLowerCase() === String(semester).toLowerCase());
  }
  if (subject) {
    filtered = filtered.filter(d => d.subject.toLowerCase() === String(subject).toLowerCase());
  }

  const dtos = filtered.map(doc => ({
    id: doc.id,
    fileName: doc.fileName,
    fileType: doc.fileType,
    semester: doc.semester,
    subject: doc.subject,
    uploadDate: doc.uploadDate,
    uploadedBy: doc.uploadedBy,
    chunkCount: documentChunks.filter(c => c.documentId === doc.id).length,
  }));

  return res.json(dtos);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const docId = parseInt(req.params.id, 10);
  if (docId === 1) {
    return res.json({ message: 'Default curriculum document is protected and retained for student queries.' });
  }
  const docIndex = documents.findIndex(d => d.id === docId);

  if (docIndex !== -1) {
    documents.splice(docIndex, 1);
    for (let i = documentChunks.length - 1; i >= 0; i--) {
      if (documentChunks[i].documentId === docId) {
        documentChunks.splice(i, 1);
      }
    }
    return res.json({ message: 'Document and RAG indices deleted successfully!' });
  }

  return res.status(404).json({ message: 'Document not found' });
});

// Chat Endpoints
app.post('/api/chat/send', async (req: Request, res: Response) => {
  try {
    const { sessionId, message, semester, subject } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Question message cannot be empty!' });
    }

    // Determine authenticated user or fallback guest user
    const authUser = getAuthenticatedUser(req);
    const userId = authUser ? authUser.id : 1;

    // Check conversation history in existing session to maintain thread context
    const existingSession = sessionId && sessions.has(sessionId) ? sessions.get(sessionId) : undefined;
    const sessionHistory = existingSession ? existingSession.messages : [];

    // 1. Dedicated Intent Classification Layer
    const classification = classifyIntent(message, subject, sessionHistory);
    const sem = semester || (authUser ? authUser.semester : '5th Sem');

    // Session handling linked to user ID
    let currentSessionId = sessionId;
    if (!currentSessionId || !sessions.has(currentSessionId)) {
      currentSessionId = `sess_${userId}_${Date.now()}`;
      const shortTitle = message.length > 32 ? message.substring(0, 32) + '...' : message;
      sessions.set(currentSessionId, {
        id: currentSessionId,
        userId,
        title: shortTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      });
    }

    const session = sessions.get(currentSessionId)!;
    session.updatedAt = new Date().toISOString();

    // Push student message
    session.messages.push({
      id: session.messages.length + 1,
      sessionId: currentSessionId,
      sender: 'STUDENT',
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    // 2. Direct Conversational, Clarification, or Greeting Response (No RAG, no academic boilerplate)
    if (classification.directResponse) {
      session.messages.push({
        id: session.messages.length + 1,
        sessionId: currentSessionId,
        sender: 'AI',
        message: classification.directResponse,
        sourcesJson: JSON.stringify([]),
        timestamp: new Date().toISOString(),
      });

      return res.json({
        sessionId: currentSessionId,
        answer: classification.directResponse,
        sources: [],
        timestamp: new Date().toISOString(),
        detectedSubject: classification.subject,
        detectedIntent: classification.intent,
      });
    }

    // 3. ACADEMIC_QUESTION or continuation FOLLOW_UP: Use RAG and AI Pipeline
    const effectiveSubject = classification.subject;
    const scoredChunks = retrieveRelevantChunks(message, sem, effectiveSubject, 3);
    const answer = await generateAiAnswer(message, scoredChunks, sem, effectiveSubject);

    const sources = scoredChunks.map(sc => ({
      fileName: sc.chunk.documentName,
      pageNumber: sc.chunk.pageNumber,
      score: sc.score,
    }));

    // Push AI message
    session.messages.push({
      id: session.messages.length + 1,
      sessionId: currentSessionId,
      sender: 'AI',
      message: answer,
      sourcesJson: JSON.stringify(sources),
      timestamp: new Date().toISOString(),
    });

    return res.json({
      sessionId: currentSessionId,
      answer,
      sources,
      timestamp: new Date().toISOString(),
      detectedSubject: effectiveSubject,
      detectedIntent: classification.intent,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Chat processing error: ' + (err.message || 'Unknown error') });
  }
});

app.get('/api/chat/sessions', (req: Request, res: Response) => {
  const authUser = getAuthenticatedUser(req);
  // Support userId query param if passed, otherwise default to authenticated user or user 1
  let targetUserId = authUser ? authUser.id : 1;
  if (req.query.userId) {
    targetUserId = parseInt(String(req.query.userId), 10);
  }

  const sessionList = Array.from(sessions.values())
    .filter(s => s.userId === targetUserId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return res.json(sessionList);
});

app.get('/api/chat/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  if (!session) return res.json([]);
  return res.json(session.messages);
});

app.delete('/api/chat/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  return res.json({ message: 'Chat session deleted successfully!' });
});

// ==========================================
// Vite Integration (Dev) / Static Serving (Prod)
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🤖 AI College Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
