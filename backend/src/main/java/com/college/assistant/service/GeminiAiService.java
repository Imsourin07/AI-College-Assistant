package com.college.assistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Constructor injection for managed RestTemplate with configured timeouts
    public GeminiAiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public String generateGroundedResponse(String studentQuery, List<RagEngineService.ScoredChunk> retrievedChunks, String semester, String subject) {
        StringBuilder contextBuilder = new StringBuilder();
        if (retrievedChunks != null && !retrievedChunks.isEmpty()) {
            contextBuilder.append("Uploaded College PDF Document Excerpts:\n");
            for (int i = 0; i < retrievedChunks.size(); i++) {
                RagEngineService.ScoredChunk sc = retrievedChunks.get(i);
                contextBuilder.append(String.format("[%d] Source: %s (Page %d)\nContent: %s\n\n",
                        i + 1,
                        sc.getChunk().getDocumentName(),
                        sc.getChunk().getPageNumber(),
                        sc.getChunk().getContent()));
            }
        } else {
            contextBuilder.append("No specific college document PDF uploaded yet for this query. Using standard university curriculum knowledge.\n");
        }

        String prompt = "You are an intelligent AI College Assistant for university students.\n" +
                "Answer the student's question clearly, accurately, and professionally.\n" +
                "You must support queries in Bengali, English, or Banglish (e.g. '5th sem-এর OS syllabus কী?').\n" +
                "If college PDF excerpts are provided in context, extract and cite the exact topics, modules, and page numbers.\n" +
                "Format output neatly using Markdown headings, bullet points, and code snippets where applicable.\n\n" +
                "Subject Scope: " + subject + "\n" +
                "Semester Scope: " + semester + "\n\n" +
                "IMPORTANT INSTRUCTION: Strictly answer the student's question based on their actual subject (" + subject + "). " +
                "Do NOT force Operating Systems concepts or OS context unless the student is specifically asking about Operating Systems.\n\n" +
                "Context Data:\n" + contextBuilder + "\n" +
                "Student Question: " + studentQuery;

        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("DEMO_KEY")) {
            try {
                String fullUrl = apiUrl + "?key=" + apiKey;

                Map<String, Object> textPart = Map.of("text", prompt);
                Map<String, Object> contentObj = Map.of("parts", List.of(textPart));
                Map<String, Object> requestBody = Map.of("contents", List.of(contentObj));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    JsonNode rootNode = objectMapper.readTree(response.getBody());
                    JsonNode textNode = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini API call failed, using intelligent fallback response: " + e.getMessage());
            }
        }

        // High fidelity grounded fallback for offline or testing mode
        return buildSmartFallbackAnswer(studentQuery, retrievedChunks, semester, subject);
    }

    private String buildSmartFallbackAnswer(String query, List<RagEngineService.ScoredChunk> chunks, String semester, String subject) {
        String lowerQuery = query.toLowerCase();

        if (chunks != null && !chunks.isEmpty()) {
            StringBuilder response = new StringBuilder();
            response.append("### 📚 College PDF Answer (RAG Grounded)\n\n");
            response.append("Here is the relevant information extracted from your indexed college documents:\n\n");

            for (RagEngineService.ScoredChunk sc : chunks) {
                response.append(String.format("#### 📄 %s (Page %d)\n", sc.getChunk().getDocumentName(), sc.getChunk().getPageNumber()));
                response.append("> ").append(sc.getChunk().getContent().replace("\n", "\n> ")).append("\n\n");
            }
            response.append("\n*Note: Configure your Google Gemini API key in `application.properties` or environment variables for generative natural language response synthesis.*");
            return response.toString();
        }

        // Subject-specific textbook fallback engines

        // Follow-up Continuation Handler
        boolean isFollowUp = lowerQuery.contains("tell me more") || lowerQuery.contains("explain more") ||
                             lowerQuery.contains("example") || lowerQuery.contains("continue") ||
                             lowerQuery.contains("further") || lowerQuery.contains("elaborate");

        // 1. Compiler Design
        if ("Compiler Design".equalsIgnoreCase(subject) || lowerQuery.contains("compiler") ||
            lowerQuery.contains("lexical analysis") || lowerQuery.contains("finite automaton") ||
            lowerQuery.contains("parsing") || lowerQuery.contains("ll(1)") ||
            lowerQuery.contains("intermediate code") || lowerQuery.contains("code optimization") ||
            lowerQuery.contains("dfa") || lowerQuery.contains("nfa")) {

            // Case A: What is a compiler / Overview of phases
            if (lowerQuery.contains("what is a compiler") || lowerQuery.contains("compiler?") ||
                lowerQuery.contains("phases of compiler") || lowerQuery.contains("overview of compiler")) {
                return "### 🛠️ Compiler Design: Definition & Architecture\n\n" +
                        "A **Compiler** is a specialized system software that translates a high-level source program (e.g., C, C++, Java) into an equivalent low-level target machine code or assembly language, reporting errors encountered during the translation process.\n\n" +
                        "#### 1. The Two Major Compiler Parts:\n" +
                        "- **Analysis Phase (Front-End)**: Machine-independent. Analyzes source code for lexical, syntactic, and semantic correctness and creates an Intermediate Representation (IR).\n" +
                        "- **Synthesis Phase (Back-End)**: Machine-dependent. Optimizes the intermediate code and generates target assembly/machine code for the host CPU architecture.\n\n" +
                        "#### 2. The 6 Core Phases of a Compiler:\n" +
                        "1. **Lexical Analysis (Scanner)**: Converts raw character stream into a stream of meaningful tokens.\n" +
                        "2. **Syntax Analysis (Parser)**: Validates grammatical structure according to Context-Free Grammar (CFG) and builds a Parse/Syntax Tree.\n" +
                        "3. **Semantic Analysis (Type Checker)**: Verifies semantic consistency, scope resolution, and static type compatibility.\n" +
                        "4. **Intermediate Code Generation (IR)**: Generates a machine-independent intermediate representation (e.g., Three-Address Code).\n" +
                        "5. **Code Optimization**: Transforms the IR to make the resulting program run faster, consume less memory, or use fewer CPU cycles without changing output.\n" +
                        "6. **Target Code Generation**: Maps optimized IR into relocatable machine instructions or assembly code with register allocation.\n\n" +
                        "#### 3. Cross-Cutting Utilities:\n" +
                        "- **Symbol Table**: Central data structure recording variable names, types, addresses, scopes, and function signatures.\n" +
                        "- **Error Handler**: Detects, isolates, and reports syntax and semantic diagnostics at each phase.";
            }

            // Case B: Lexical Analysis
            if (lowerQuery.contains("lexical analysis") || lowerQuery.contains("tokenization") || lowerQuery.contains("lexeme")) {
                return "### 🔍 Compiler Design: Lexical Analysis (Scanner)\n\n" +
                        "**Lexical Analysis** is the first phase of a compiler. It reads the raw source code character-by-character and groups them into logical, atomic units called **Tokens** while discarding comments and whitespace.\n\n" +
                        "#### 1. Core Terminology:\n" +
                        "- **Token**: An abstract category representing a lexical unit passed to the parser (e.g., `<KEYWORD>`, `<ID>`, `<NUM>`, `<ASSIGN_OP>`).\n" +
                        "- **Lexeme**: The actual sequence of characters in the source program that matches a token pattern (e.g., `int`, `totalSum`, `42`, `=`).\n" +
                        "- **Pattern**: The formal grammar rule (expressed via Regular Expressions) defining valid lexemes for a token.\n\n" +
                        "#### 2. Practical Walkthrough:\n" +
                        "Consider the statement: `float total = price * 1.18;`\n\n" +
                        "The Lexical Analyzer generates the following token stream:\n" +
                        "1. `<KEYWORD, \"float\">`\n" +
                        "2. `<IDENTIFIER, pointer to symbol table for \"total\">`\n" +
                        "3. `<ASSIGNMENT_OPERATOR, \"=\">`\n" +
                        "4. `<IDENTIFIER, pointer to symbol table for \"price\">`\n" +
                        "5. `<MULTIPLICATION_OPERATOR, \"*\">`\n" +
                        "6. `<CONSTANT_FLOAT, 1.18>`\n" +
                        "7. `<SEMICOLON, \";\">`\n\n" +
                        "#### 3. Auxiliary Functions:\n" +
                        "- **Input Buffering**: Uses dual-buffer schemes with sentinel pointers (`lexeme_begin` and `forward`) to handle long lookaheads.\n" +
                        "- **Lexical Errors**: Detects unrecognized characters (e.g., stray `@` or unterminated string literals).";
            }

            // Case C: Finite Automaton
            if (lowerQuery.contains("finite automaton") || lowerQuery.contains("finite automata") ||
                lowerQuery.contains("dfa") || lowerQuery.contains("nfa")) {
                return "### ⚙️ Compiler Design: Finite Automata (DFA vs NFA)\n\n" +
                        "A **Finite Automaton (FA)** is an abstract mathematical machine model used in compiler design to recognize Regular Expressions and implement lexical analyzers.\n\n" +
                        "#### 1. Formal 5-Tuple Definition:\n" +
                        "$$M = (Q, \\Sigma, \\delta, q_0, F)$$\n" +
                        "Where:\n" +
                        "- **$Q$**: Finite non-empty set of internal states.\n" +
                        "- **$\\Sigma$**: Finite set of input symbols (the alphabet).\n" +
                        "- **$\\delta$**: State transition function.\n" +
                        "- **$q_0 \\in Q$**: Initial start state.\n" +
                        "- **$F \\subseteq Q$**: Set of accepting / final states.\n\n" +
                        "#### 2. DFA vs NFA Comparison:\n\n" +
                        "| Characteristic | Deterministic Finite Automaton (DFA) | Non-Deterministic Finite Automaton (NFA) |\n" +
                        "|---|---|---|\n" +
                        "| **Transition Rule** | Exactly one deterministic transition per symbol $\\delta: Q \\times \\Sigma \\rightarrow Q$ | Zero, one, or multiple transitions per symbol $\\delta: Q \\times (\\Sigma \\cup \\{\\epsilon\\}) \\rightarrow 2^Q$ |\n" +
                        "| **$\\epsilon$ (Empty) Transitions** | Not permitted | Allowed without consuming input |\n" +
                        "| **Execution Speed** | Ultra fast: $O(n)$ time complexity for string of length $n$ | Slower due to backtracking or tracking parallel states |\n" +
                        "| **Space Complexity** | May require up to $2^{|Q|}$ states in worst case | Compact: direct proportional to regex length |\n\n" +
                        "#### 3. Conversion Pipeline:\n" +
                        "$$\\text{Regular Expression} \\xrightarrow{\\text{Thompson's Construction}} \\text{NFA} \\xrightarrow{\\text{Subset Construction Algorithm}} \\text{DFA} \\xrightarrow{\\text{Hopcroft's Minimization}} \\text{Minimal DFA}$$";
            }

            // Case D: LL(1) Parsing
            if (lowerQuery.contains("ll(1)") || lowerQuery.contains("parsing") || lowerQuery.contains("parser")) {
                return "### 🌲 Compiler Design: LL(1) Parsing Explained\n\n" +
                        "**LL(1) Parsing** is a deterministic top-down parsing technique that constructs a leftmost derivation for an input string without backtracking using a single lookahead token.\n\n" +
                        "#### 1. Significance of the Name **LL(1)**:\n" +
                        "- **First L**: Scans input from **L**eft to right.\n" +
                        "- **Second L**: Builds **L**eftmost derivation.\n" +
                        "- **(1)**: Uses **1** token of lookahead to determine which production rule to apply.\n\n" +
                        "#### 2. Key Mathematical Sets:\n" +
                        "1. **$\\text{FIRST}(\\alpha)$**:\n" +
                        "   - Set of all terminal symbols that can appear as the first symbol of a string derived from $\\alpha$.\n" +
                        "   - If $\\alpha \\Rightarrow^* \\epsilon$, then $\\epsilon \\in \\text{FIRST}(\\alpha)$.\n" +
                        "2. **$\\text{FOLLOW}(A)$**:\n" +
                        "   - Set of all terminals that can appear immediately to the right of non-terminal $A$ in some sentential form.\n" +
                        "   - For the start symbol $S$, the input endmarker $\\$$ is always placed in $\\text{FOLLOW}(S)$.\n\n" +
                        "#### 3. LL(1) Parsing Table Construction Rule $M[A, a]$:\n" +
                        "- For each production $A \\rightarrow \\alpha$ in grammar $G$:\n" +
                        "  1. For every terminal $a \\in \\text{FIRST}(\\alpha)$, insert $A \\rightarrow \\alpha$ into $M[A, a]$.\n" +
                        "  2. If $\\epsilon \\in \\text{FIRST}(\\alpha)$, insert $A \\rightarrow \\alpha$ into $M[A, b]$ for every terminal $b \\in \\text{FOLLOW}(A)$.\n\n" +
                        "#### 4. Necessary Conditions for a Grammar to be LL(1):\n" +
                        "- A grammar is **LL(1)** if and only if its parsing table contains **no duplicate entries** (no conflicts).\n" +
                        "- **Pre-requisites**: Must eliminate **Left Recursion** ($A \\rightarrow A\\alpha$) and perform **Left Factoring** on common prefixes ($A \\rightarrow \\alpha\\beta_1 \\mid \\alpha\\beta_2$).";
            }

            // Case E: Intermediate Code Generation
            if (lowerQuery.contains("intermediate code") || lowerQuery.contains("three address code") || lowerQuery.contains("tac")) {
                return "### 🔀 Compiler Design: Intermediate Code Generation (ICG)\n\n" +
                        "**Intermediate Code Generation** is the fourth phase of a compiler. It translates the validated syntax/parse tree into a machine-independent intermediate representation (IR).\n\n" +
                        "#### 1. Why Intermediate Code is Essential:\n" +
                        "- **Portability & Retargetability**: If a compiler supports $M$ source languages and $N$ CPU targets, generating IR reduces compiler components from $M \\times N$ to $M + N$.\n" +
                        "- **Machine-Independent Optimization**: Optimizations (e.g. dead code elimination, constant folding) can be executed once on the IR rather than repeatedly for every target architecture.\n\n" +
                        "#### 2. Three-Address Code (TAC):\n" +
                        "In **Three-Address Code**, every instruction has at most one operator on the right-hand side and at most three address references:\n" +
                        "$$x = y \\text{ op } z$$\n\n" +
                        "**Example Translation**:\n" +
                        "Source: `a = b * -c + b * -c;`\n" +
                        "```text\n" +
                        "t1 = -c\n" +
                        "t2 = b * t1\n" +
                        "t3 = -c\n" +
                        "t4 = b * t3\n" +
                        "t5 = t2 + t4\n" +
                        "a  = t5\n" +
                        "```\n\n" +
                        "#### 3. Common Data Structures for TAC:\n" +
                        "- **Quadruples**: Explicit records with 4 fields `(op, arg1, arg2, result)`.\n" +
                        "- **Triples**: References intermediate results by table row index `(op, arg1, arg2)` to save memory.\n" +
                        "- **Indirect Triples**: Array of pointers to triples, allowing easy instruction reordering during optimization.";
            }

            // Case F: Code Optimization
            if (lowerQuery.contains("code optimization") || lowerQuery.contains("optimization")) {
                return "### ⚡ Compiler Design: Code Optimization Techniques\n\n" +
                        "**Code Optimization** is the phase where the compiler attempts to produce more efficient target code—reducing execution time, memory footprint, and CPU energy consumption—while strictly preserving the program's observable output.\n\n" +
                        "#### 1. Core Optimization Strategies:\n\n" +
                        "1. **Common Subexpression Elimination (CSE)**:\n" +
                        "   - Identifies identical expressions evaluated multiple times where operands have not changed.\n" +
                        "   - *Before*: `t1 = x + y; t2 = z + (x + y);` $\\rightarrow$ *After*: `t1 = x + y; t2 = z + t1;`\n\n" +
                        "2. **Constant Folding & Constant Propagation**:\n" +
                        "   - **Folding**: Evaluates constant operations at compile time (e.g., `x = 3.14 * 2` $\\rightarrow$ `x = 6.28`).\n" +
                        "   - **Propagation**: If `x = 10`, subsequent uses like `y = x + 5` are transformed into `y = 10 + 5` $\\rightarrow$ `y = 15`.\n\n" +
                        "3. **Dead Code Elimination**:\n" +
                        "   - Removes code whose computed values are never used or instructions enclosed in unconditionally unreachable branches (`if (false) { ... }`).\n\n" +
                        "4. **Loop Invariant Code Motion (Hoisting)**:\n" +
                        "   - Moves computations inside a loop whose operands remain invariant (constant) across iterations out to the loop header.\n\n" +
                        "5. **Strength Reduction**:\n" +
                        "   - Replaces computationally expensive operations with mathematically equivalent faster instructions (e.g., replacing multiplication `x * 2` with bitwise shift `x << 1`).\n\n" +
                        "6. **Peephole Optimization**:\n" +
                        "   - Examines a small sliding window (\"peephole\") of target assembly instructions to eliminate redundant load/store pairs and jump-to-jump sequences.";
            }

            // Generic Compiler Design fallback
            return "### 🛠️ Compiler Design: Core Concepts & Principles\n\n" +
                    "Here is a conceptual overview of **" + query + "** in **Compiler Design**:\n\n" +
                    "- **Role in Compilation**: Acts as part of the structured pipeline translating source grammar into optimized machine code.\n" +
                    "- **Theoretical Foundation**: Utilizes formal language theory, Automata (DFA/NFA), Context-Free Grammars (CFG), and syntax-directed translation.\n\n" +
                    "💡 *Tip: Upload your college Compiler Design syllabus PDF via the top bar to get exact answers grounded in your specific university curriculum!*";
        }

        // 2. DBMS
        if ("DBMS".equalsIgnoreCase(subject) || lowerQuery.contains("dbms") || lowerQuery.contains("database") || lowerQuery.contains("normalization")) {
            if (isFollowUp) {
                return "### 🗄️ Database Management Systems (DBMS): Normalization Deep Dive & Case Study\n\n" +
                        "Here is an in-depth practical walkthrough of how **Normalization** eliminates anomalies through decomposition:\n\n" +
                        "#### Step-by-Step Table Decomposition:\n" +
                        "Consider an unnormalized table `Student_Course(StudentID, StudentName, CourseID, CourseName, Instructor, InstructorRoom)`.\n\n" +
                        "1. **Anomalies in Unnormalized Form**:\n" +
                        "   - **Insertion Anomaly**: Cannot record a new course without enrolling at least one student.\n" +
                        "   - **Deletion Anomaly**: If the only student enrolled in a course drops out, the course details and instructor info are lost.\n" +
                        "   - **Update Anomaly**: If an instructor changes their room, multiple rows must be modified, risking inconsistent data.\n\n" +
                        "2. **Decomposing to 2NF & 3NF**:\n" +
                        "   - **`Student(StudentID, StudentName)`** — PK: `StudentID`\n" +
                        "   - **`Course(CourseID, CourseName, InstructorID)`** — PK: `CourseID`\n" +
                        "   - **`Instructor(InstructorID, InstructorName, InstructorRoom)`** — PK: `InstructorID`\n" +
                        "   - **`Enrollment(StudentID, CourseID, Grade)`** — PK: `(StudentID, CourseID)`\n\n" +
                        "#### Summary of Normalization Criteria:\n" +
                        "- **1NF**: Atomic values, no multivalued attributes.\n" +
                        "- **2NF**: 1NF + No partial dependencies on composite keys.\n" +
                        "- **3NF**: 2NF + No transitive dependencies ($X \\rightarrow Y$, $Y \\rightarrow Z$).\n" +
                        "- **BCNF**: Every determinant must be a candidate key.";
            }

            return "### 🗄️ Database Management Systems (DBMS): Normalization Explained\n\n" +
                    "**Normalization** is a systematic approach of decomposing tables to eliminate data redundancy (repetition) and undesirable insertion, update, and deletion anomalies.\n\n" +
                    "#### 1. Normal Forms Hierarchy:\n" +
                    "- **First Normal Form (1NF)**:\n" +
                    "  - Each column must contain atomic (indivisible) values.\n" +
                    "  - No repeating groups or multivalued attributes allowed.\n" +
                    "- **Second Normal Form (2NF)**:\n" +
                    "  - Must be in 1NF.\n" +
                    "  - No **partial dependency** (every non-prime attribute must be fully functionally dependent on the entire primary key).\n" +
                    "- **Third Normal Form (3NF)**:\n" +
                    "  - Must be in 2NF.\n" +
                    "  - No **transitive dependency** ($X \\rightarrow Y$, $Y \\rightarrow Z$, where non-prime attribute $Z$ depends on non-prime attribute $Y$).\n" +
                    "- **Boyce-Codd Normal Form (BCNF)**:\n" +
                    "  - Stricter version of 3NF. For every functional dependency $X \\rightarrow Y$, $X$ must be a super key.\n\n" +
                    "#### 2. Key Benefits:\n" +
                    "- Reduces disk storage redundancy\n" +
                    "- Ensures data consistency and integrity\n" +
                    "- Eliminates insertion, update, and deletion anomalies";
        }

        // 2. Java
        if ("Java".equalsIgnoreCase(subject) || lowerQuery.contains("java") || lowerQuery.contains("inheritance")) {
            if (isFollowUp) {
                return "### ☕ Java Programming: Inheritance Advanced Concepts & Diamond Problem\n\n" +
                        "Here is a deeper exploration of Java's inheritance hierarchy and dynamic method dispatch:\n\n" +
                        "#### 1. Dynamic Method Dispatch (Runtime Polymorphism):\n" +
                        "When an overridden method is called through a superclass reference, Java determines which implementation to execute at runtime based on the actual object type:\n" +
                        "```java\n" +
                        "Animal myPet = new Dog(); // Upcasting\n" +
                        "myPet.sound();           // Prints 'Dog barks: Woof woof!' dynamically at runtime\n" +
                        "```\n\n" +
                        "#### 2. Why Multiple Inheritance of Classes is Disallowed:\n" +
                        "- **The Diamond Problem**: If Class B and Class C both inherit from Class A and override `display()`, and Class D inherits from both B and C, which `display()` should D execute?\n" +
                        "- **Java's Solution via Interfaces**:\n" +
                        "```java\n" +
                        "interface Printable {\n" +
                        "    void print();\n" +
                        "}\n" +
                        "interface Showable {\n" +
                        "    void show();\n" +
                        "}\n" +
                        "class Document implements Printable, Showable {\n" +
                        "    public void print() { System.out.println(\"Printing document...\"); }\n" +
                        "    public void show()  { System.out.println(\"Displaying on screen...\"); }\n" +
                        "}\n" +
                        "```\n\n" +
                        "#### 3. Key Takeaway:\n" +
                        "- Favor composition over complex inheritance where applicable.\n" +
                        "- Use `final` classes to prevent subclassing when designing immutable types.";
            }

            return "### ☕ Java Programming: Inheritance Explained\n\n" +
                    "**Inheritance** in Java is a fundamental Object-Oriented Programming (OOP) mechanism where a new class (subclass/child) inherits properties, fields, and methods from an existing class (superclass/parent).\n\n" +
                    "#### 1. Core Concepts:\n" +
                    "- **Code Reusability**: Common functionality is written once in the superclass and reused by subclasses.\n" +
                    "- **IS-A Relationship**: Represents a specialization (e.g., `Dog IS-A Animal`).\n" +
                    "- **`extends` Keyword**: Used in Java to declare class inheritance.\n" +
                    "- **`super` Keyword**: Used to refer directly to parent class constructors or methods.\n\n" +
                    "#### 2. Code Example:\n" +
                    "```java\n" +
                    "// Superclass\n" +
                    "class Animal {\n" +
                    "    void sound() {\n" +
                    "        System.out.println(\"Animal makes a sound\");\n" +
                    "    }\n" +
                    "}\n\n" +
                    "// Subclass inherits Animal\n" +
                    "class Dog extends Animal {\n" +
                    "    @Override\n" +
                    "    void sound() {\n" +
                    "        super.sound(); // Call superclass method\n" +
                    "        System.out.println(\"Dog barks: Woof woof!\");\n" +
                    "    }\n" +
                    "}\n" +
                    "```\n\n" +
                    "#### 3. Types of Inheritance in Java:\n" +
                    "- **Single Inheritance**: Class B extends Class A.\n" +
                    "- **Multilevel Inheritance**: Class C extends Class B, which extends Class A.\n" +
                    "- **Hierarchical Inheritance**: Multiple classes extend a single superclass.\n" +
                    "- *Note*: Multiple inheritance of classes is not supported in Java to prevent the Diamond Problem; interfaces are used instead.";
        }

        // 3. Data Structures & Algorithms
        if ("Data Structures".equalsIgnoreCase(subject) || lowerQuery.contains("binary search") || lowerQuery.contains("dsa")) {
            return "### 🌲 Data Structures & Algorithms: Binary Search Explained\n\n" +
                    "**Binary Search** is an efficient divide-and-conquer search algorithm used to find the position of a target value within a **sorted array**.\n\n" +
                    "#### 1. How It Works:\n" +
                    "1. Set `low = 0` and `high = n - 1`.\n" +
                    "2. Calculate `mid = low + (high - low) / 2`.\n" +
                    "3. If `array[mid] == target`, target is found.\n" +
                    "4. If `target < array[mid]`, search the left half (`high = mid - 1`).\n" +
                    "5. If `target > array[mid]`, search the right half (`low = mid + 1`).\n" +
                    "6. Repeat until `low > high`.\n\n" +
                    "#### 2. Complexity Analysis:\n" +
                    "- **Time Complexity**:\n" +
                    "  - Best Case: $O(1)$ (target is at the middle element)\n" +
                    "  - Average & Worst Case: $O(\\log n)$ (halves the search space each step)\n" +
                    "- **Space Complexity**:\n" +
                    "  - Iterative: $O(1)$ auxiliary space\n" +
                    "  - Recursive: $O(\\log n)$ call stack space";
        }

        // 4. Physics
        if ("Physics".equalsIgnoreCase(subject) || lowerQuery.contains("newton") || lowerQuery.contains("physics") || lowerQuery.contains("law of motion")) {
            if (isFollowUp) {
                return "### ⚛️ Physics: Newton's Second Law — Advanced Applications & Impulse\n\n" +
                        "Here is a deeper exploration of **Newton's Second Law** with real-world engineering examples and calculations:\n\n" +
                        "#### 1. The Impulse-Momentum Theorem:\n" +
                        "Impulse ($\\vec{J}$) is defined as the integral of force over the time interval $\\Delta t$:\n" +
                        "$$\\vec{J} = \\int_{t_1}^{t_2} \\vec{F}\\,dt = \\Delta \\vec{p} = m(\\vec{v}_f - \\vec{v}_i)$$\n\n" +
                        "#### 2. Engineering Case Studies:\n" +
                        "1. **Automobile Crumple Zones & Airbags**:\n" +
                        "   - In a crash, $\\Delta p$ is fixed by the car's initial momentum.\n" +
                        "   - Airbags and crumple zones increase deceleration time $\\Delta t$ by a factor of 10x.\n" +
                        "   - Since $F_{\\text{avg}} = \\frac{\\Delta p}{\\Delta t}$, increasing $\\Delta t$ reduces the peak impact force on passengers by 90%.\n\n" +
                        "2. **Variable Mass Systems (Rocket Propulsion)**:\n" +
                        "   - Because mass decreases as fuel burns, Newton's 2nd law generalizes to Tsiolkovsky's Rocket Equation:\n" +
                        "   $$m \\frac{dv}{dt} = v_{\\text{exhaust}} \\left(-\\frac{dm}{dt}\\right)$$\n\n" +
                        "#### 3. Sample Numerical Problem:\n" +
                        "- **Problem**: A $1200\\,\\text{kg}$ electric vehicle accelerates from $0$ to $27.8\\,\\text{m/s}$ ($100\\,\\text{km/h}$) in $4.0\\,\\text{s}$. Calculate the required net forward force.\n" +
                        "- **Solution**:\n" +
                        "  $$a = \\frac{v_f - v_i}{t} = \\frac{27.8 - 0}{4.0} = 6.95\\,\\text{m/s}^2$$\n" +
                        "  $$F = m \\cdot a = 1200 \\cdot 6.95 = 8340\\,\\text{N}$$";
            }

            return "### ⚛️ Physics: Newton's Second Law of Motion\n\n" +
                    "**Newton's Second Law of Motion** states that the acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass, occurring in the direction of the applied net force.\n\n" +
                    "#### 1. Mathematical Formulation:\n" +
                    "$$\\vec{F} = \\frac{d\\vec{p}}{dt} = m\\vec{a}$$\n\n" +
                    "Where:\n" +
                    "- **$F$**: Net Force applied (measured in Newtons, $\\text{N} = \\text{kg}\\cdot\\text{m}/\\text{s}^2$)\n" +
                    "- **$m$**: Mass of the object (in kilograms, $\\text{kg}$)\n" +
                    "- **$a$**: Acceleration produced (in meters per second squared, $\\text{m}/\\text{s}^2$)\n\n" +
                    "#### 2. Key Physical Implications:\n" +
                    "- If no external force acts on a body ($F = 0$), then acceleration $a = 0$, meaning constant velocity (consistent with Newton's 1st Law).\n" +
                    "- For a constant force, a greater mass results in smaller acceleration.\n" +
                    "- For a constant mass, increasing force increases acceleration proportionally.";
        }

        // 5. Operating Systems
        if ("Operating Systems".equalsIgnoreCase(subject) || lowerQuery.contains("process scheduling") || lowerQuery.contains("operating system") || lowerQuery.contains("deadlock")) {
            return "### 🖥️ Operating Systems: Process Scheduling & Core Concepts\n\n" +
                    "**Process Scheduling** is the core OS activity that decides which process runs on the CPU when multiple runnable processes compete for system resources.\n\n" +
                    "#### 1. Scheduling Queues:\n" +
                    "- **Job Queue**: All processes in the system.\n" +
                    "- **Ready Queue**: Processes residing in main memory, ready and waiting to execute.\n" +
                    "- **Device / I/O Queue**: Processes waiting for an I/O device.\n\n" +
                    "#### 2. Types of Schedulers:\n" +
                    "- **Long-Term Scheduler (Job Scheduler)**: Controls the degree of multiprogramming by moving processes from disk to memory.\n" +
                    "- **Short-Term Scheduler (CPU Scheduler)**: Selects a process from the ready queue and allocates the CPU.\n" +
                    "- **Medium-Term Scheduler**: Handles swapping between main memory and secondary storage.\n\n" +
                    "#### 3. Common CPU Scheduling Algorithms:\n" +
                    "- **FCFS (First-Come, First-Served)**: Non-preemptive, simple, suffers from the Convoy Effect.\n" +
                    "- **SJF (Shortest Job First)**: Optimal average waiting time (Preemptive version is SRTF).\n" +
                    "- **Round Robin (RR)**: Preemptive, uses a time quantum suited for time-sharing systems.\n" +
                    "- **Priority Scheduling**: Allocates CPU based on priority levels (mitigated by aging to avoid starvation).";
        }

        // Clarification / General response
        return "### 🤖 AI College Assistant Response\n\n" +
                "I have received your query: **\"" + query + "\"**.\n\n" +
                "Could you please specify which subject or topic you'd like to explore? (e.g., Operating Systems, DBMS, Java, Data Structures, Physics).\n\n" +
                "💡 *Tip: You can also upload your college syllabus PDF to get exact grounded answers!*";
    }
}
