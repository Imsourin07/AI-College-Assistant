package com.college.assistant.service;

import com.college.assistant.dto.IntentType;
import com.college.assistant.entity.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class IntentClassifierService {

    public static class ClassificationResult {
        private final IntentType intent;
        private final String subject;
        private final String directResponse; // non-null for GREETING, GENERAL_CONVERSATION, or AMBIGUOUS_QUERY
        private final String topic;

        public ClassificationResult(IntentType intent, String subject, String directResponse, String topic) {
            this.intent = intent;
            this.subject = subject;
            this.directResponse = directResponse;
            this.topic = topic;
        }

        public IntentType getIntent() { return intent; }
        public String getSubject() { return subject; }
        public String getDirectResponse() { return directResponse; }
        public String getTopic() { return topic; }
    }

    private static final Pattern GREETING_PATTERN = Pattern.compile(
            "^(hi+|hello+|hey+|heyy+|heya|howdy|sup|hola|namaste|good\\s+(morning|afternoon|evening|day))(\\s+there|\\s+assistant|\\s+ai|\\s+bot)?$",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern THANKS_PATTERN = Pattern.compile(
            "^(thank\\s*you|thanks|thanks\\s+a\\s+lot|thank\\s+you\\s+so\\s+much|thx|many\\s+thanks|appreciate\\s+it).*$",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern HOW_ARE_YOU_PATTERN = Pattern.compile(
            ".*\\b(how\\s+are\\s+you|how\\s+are\\s+things|how\\s+is\\s+it\\s+going|how\\s+do\\s+you\\s+do|are\\s+you\\s+doing\\s+well|what\\'s\\s+up)\\b.*",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern IDENTITY_PATTERN = Pattern.compile(
            ".*\\b(who\\s+are\\s+you|what\\s+is\\s+your\\s+name|what\\s+can\\s+you\\s+do|what\\s+are\\s+your\\s+capabilities|help\\s+me|tell\\s+me\\s+about\\s+yourself)\\b.*",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern TOPIC_SWITCH_PATTERN = Pattern.compile(
            ".*\\b(change\\s+(the\\s+)?(topic|subject)\\s+to|switch\\s+(the\\s+)?(topic|subject)\\s+to|switch\\s+to|let\\'s\\s+(talk\\s+about|study|switch\\s+to))\\s+(.+)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CONTINUATION_PATTERN = Pattern.compile(
            "^(tell\\s+me\\s+more|explain\\s+more|give\\s+(me\\s+)?an?\\s+example|continue|elaborate|can\\s+you\\s+explain\\s+further|more\\s+details|what\\s+about\\s+it|how\\s+does\\s+that\\s+work).*$",
            Pattern.CASE_INSENSITIVE
    );

    public ClassificationResult classify(String message, String requestedSubject, List<ChatMessage> history) {
        if (message == null || message.trim().isEmpty()) {
            return new ClassificationResult(
                    IntentType.AMBIGUOUS_QUERY,
                    "General",
                    "Could you please ask a question or specify a topic you'd like help with?",
                    "None"
            );
        }

        String trimmed = message.trim();
        String cleaned = trimmed.replaceAll("[?!.,]+$", "").trim();

        // 1. Check GREETING
        if (GREETING_PATTERN.matcher(cleaned).matches()) {
            return new ClassificationResult(
                    IntentType.GREETING,
                    "General",
                    "Hey! How can I help you with your studies today?",
                    "Greeting"
            );
        }

        // 2. Check GENERAL_CONVERSATION
        if (HOW_ARE_YOU_PATTERN.matcher(cleaned).matches()) {
            return new ClassificationResult(
                    IntentType.GENERAL_CONVERSATION,
                    "General",
                    "I'm doing well, thank you for asking! Ready to help you tackle any university topics, syllabus modules, or exam questions. What are you studying today?",
                    "SmallTalk"
            );
        }

        if (THANKS_PATTERN.matcher(cleaned).matches()) {
            return new ClassificationResult(
                    IntentType.GENERAL_CONVERSATION,
                    "General",
                    "You're very welcome! Let me know if you need any more explanations or help with your coursework. Happy studying! 🎓",
                    "Gratitude"
            );
        }

        if (IDENTITY_PATTERN.matcher(cleaned).matches()) {
            return new ClassificationResult(
                    IntentType.GENERAL_CONVERSATION,
                    "General",
                    "I am your AI College Assistant! I can help you understand university subjects (such as Operating Systems, DBMS, Java, Data Structures, Physics, and more), summarize uploaded syllabus documents, explain complex concepts with examples, and prepare for your exams.",
                    "Identity"
            );
        }

        // 3. Check FOLLOW_UP: Topic switch
        var switchMatcher = TOPIC_SWITCH_PATTERN.matcher(trimmed);
        if (switchMatcher.find()) {
            String target = switchMatcher.group(switchMatcher.groupCount()).trim();
            String detectedTarget = detectSubject(target);
            if (!"General".equals(detectedTarget)) {
                return new ClassificationResult(
                        IntentType.FOLLOW_UP,
                        detectedTarget,
                        "Sure! Let's switch over to **" + detectedTarget + "**. What would you like to explore? We can cover core concepts, syllabus modules, or exam questions!",
                        detectedTarget
                );
            }
        }

        // 4. Check FOLLOW_UP: Continuation prompt
        if (CONTINUATION_PATTERN.matcher(cleaned).matches()) {
            // Look back in session history for previous academic topic
            String priorSubject = findPriorSubjectFromHistory(history);
            if (priorSubject != null && !priorSubject.equals("General")) {
                return new ClassificationResult(
                        IntentType.FOLLOW_UP,
                        priorSubject,
                        null, // Trigger academic response engine with continuation prompt
                        priorSubject
                );
            } else {
                return new ClassificationResult(
                        IntentType.AMBIGUOUS_QUERY,
                        "General",
                        "### 🤔 Clarification Needed\n\nCould you please specify which subject or topic you'd like more details on? (e.g., Operating Systems, DBMS, Java, Data Structures, Physics).",
                        "Clarification"
                );
            }
        }

        // 5. Check AMBIGUOUS_QUERY (ultra short, contextless questions)
        String lower = trimmed.toLowerCase();
        if (lower.equals("why is that?") || lower.equals("why is that") || lower.equals("why?") ||
            lower.equals("why") || lower.equals("how?") || lower.equals("how") ||
            lower.equals("explain this") || lower.equals("what is it") || lower.equals("what?")) {
            String priorSubject = findPriorSubjectFromHistory(history);
            if (priorSubject != null && !priorSubject.equals("General")) {
                return new ClassificationResult(
                        IntentType.FOLLOW_UP,
                        priorSubject,
                        null,
                        priorSubject
                );
            }
            return new ClassificationResult(
                    IntentType.AMBIGUOUS_QUERY,
                    "General",
                    "### 🤔 Clarification Needed\n\nYour question **\"" + trimmed + "\"** is a bit too brief or ambiguous.\n\nCould you please specify which academic subject or topic you are asking about? For example:\n- 🛠️ **Compiler Design**\n- 🖥️ **Operating Systems**\n- 🗄️ **DBMS**\n- ☕ **Java**\n- 🌲 **Data Structures & Algorithms**\n- ⚛️ **Physics**",
                    "Clarification"
            );
        }

        // 6. ACADEMIC_QUESTION
        String detected = detectSubject(trimmed);
        if (!"General".equals(detected)) {
            return new ClassificationResult(IntentType.ACADEMIC_QUESTION, detected, null, detected);
        }

        if (requestedSubject != null && !requestedSubject.trim().isEmpty() &&
            !"Operating Systems".equalsIgnoreCase(requestedSubject) &&
            !"General".equalsIgnoreCase(requestedSubject)) {
            return new ClassificationResult(IntentType.ACADEMIC_QUESTION, requestedSubject, null, requestedSubject);
        }

        return new ClassificationResult(IntentType.ACADEMIC_QUESTION, "General Academic", null, "General Academic");
    }

    public String detectSubject(String text) {
        if (text == null) return "General";
        String lower = text.toLowerCase().trim();

        // 1. Compiler Design Patterns
        if (lower.contains("compiler") || lower.contains("lexical analysis") ||
            lower.contains("syntax analysis") || lower.contains("finite automaton") ||
            lower.contains("finite automata") || lower.contains("parsing") ||
            lower.contains("parser") || lower.contains("ll(1)") || lower.contains("ll(k)") ||
            lower.contains("lr(0)") || lower.contains("slr") || lower.contains("lalr") ||
            lower.contains("dfa") || lower.contains("nfa") || lower.contains("grammar") ||
            lower.contains("parse tree") || lower.contains("syntax tree") ||
            lower.contains("intermediate code") || lower.contains("three address code") ||
            lower.contains("three-address code") || lower.contains("code optimization") ||
            lower.contains("code generation") || lower.contains("symbol table") ||
            lower.contains("tokenization") || lower.contains("lexeme") ||
            lower.contains("semantic analysis") || lower.contains("first and follow") ||
            lower.contains("predictive parsing") || lower.contains("dead code elimination") ||
            lower.contains("constant folding") || lower.contains("peephole") ||
            lower.contains("cross-compiler") || lower.contains("shift reduce") ||
            lower.matches(".*\\b(compiler|dfa|nfa|lexer|ast|cfg|tac|quadruple|triple|peephole)\\b.*")) {
            return "Compiler Design";
        }

        // 2. Operating Systems
        if (lower.contains("process scheduling") || lower.contains("cpu scheduling") ||
            lower.contains("operating system") || lower.contains("deadlock") ||
            lower.contains("paging") || lower.contains("virtual memory") ||
            lower.contains("round robin") || lower.contains("fcfs") || lower.contains("sjf") ||
            lower.contains("semaphore") || lower.contains("mutex") || lower.contains("pcb") ||
            lower.contains("kernel") || lower.contains("system call") || lower.contains("banker's") ||
            lower.matches(".*\\b(os|scheduling|page replacement)\\b.*")) {
            return "Operating Systems";
        }

        // 3. DBMS
        if (lower.contains("dbms") || lower.contains("database") || lower.contains("normalization") ||
            lower.contains("1nf") || lower.contains("2nf") || lower.contains("3nf") || lower.contains("bcnf") ||
            lower.contains("sql") || lower.contains("relational") || lower.contains("acid") ||
            lower.contains("foreign key") || lower.contains("primary key") || lower.contains("transaction") ||
            lower.contains("er diagram") || lower.contains("functional dependency")) {
            return "DBMS";
        }

        // 3. Java
        if (lower.contains("java") || lower.contains("inheritance") || lower.contains("polymorphism") ||
            lower.contains("encapsulation") || lower.contains("jvm") || lower.contains("jre") || lower.contains("jdk") ||
            lower.contains("spring boot") || lower.contains("garbage collection") || lower.contains("bytecode") ||
            lower.contains("extends") || lower.contains("implements") || lower.contains("multithreading") ||
            lower.matches(".*\\b(oop|class|interface|object oriented)\\b.*")) {
            return "Java";
        }

        // 4. Data Structures & Algorithms
        if (lower.contains("binary search") || lower.contains("data structure") || lower.contains("dsa") ||
            lower.contains("linked list") || lower.contains("binary tree") || lower.contains("tree") ||
            lower.contains("graph") || lower.contains("quicksort") || lower.contains("mergesort") ||
            lower.contains("stack") || lower.contains("queue") || lower.contains("time complexity") ||
            lower.contains("big o") || lower.contains("bubble sort") || lower.contains("heap") ||
            lower.contains("hash table") || lower.contains("dynamic programming")) {
            return "Data Structures";
        }

        // 5. Physics
        if (lower.contains("physics") || lower.contains("newton") || lower.contains("second law") ||
            lower.contains("law of motion") || lower.contains("gravity") || lower.contains("kinematics") ||
            lower.contains("thermodynamics") || lower.contains("optics") || lower.contains("electromagnetism") ||
            lower.contains("velocity") || lower.contains("acceleration") || lower.contains("quantum") ||
            lower.matches(".*\\b(force|mass|f = ma)\\b.*")) {
            return "Physics";
        }

        // 6. Computer Networks
        if (lower.contains("computer network") || lower.contains("networking") || lower.contains("tcp") ||
            lower.contains("udp") || lower.contains("ip address") || lower.contains("osi model") ||
            lower.contains("router") || lower.contains("dns") || lower.contains("http") || lower.contains("socket")) {
            return "Computer Networks";
        }

        // 7. Software Engineering
        if (lower.contains("software engineering") || lower.contains("agile") || lower.contains("scrum") ||
            lower.contains("waterfall") || lower.contains("sdlc") || lower.contains("srs") || lower.contains("uml")) {
            return "Software Engineering";
        }

        // 8. Mathematics
        if (lower.contains("calculus") || lower.contains("derivative") || lower.contains("integral") ||
            lower.contains("matrix") || lower.contains("eigenvalue") || lower.contains("linear algebra") ||
            lower.contains("probability") || lower.contains("differential equation")) {
            return "Mathematics";
        }

        return "General";
    }

    private String findPriorSubjectFromHistory(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) return null;
        for (int i = history.size() - 1; i >= 0; i--) {
            ChatMessage msg = history.get(i);
            String sub = detectSubject(msg.getMessage());
            if (!"General".equals(sub)) {
                return sub;
            }
        }
        return null;
    }
}
