import { LanguageTarget } from '../types/ide';

export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  language: LanguageTarget;
  fileName: string;
  code: string;
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  // 1. C++ Template
  {
    id: 'cpp-interactive-io',
    title: '1. Interactive C++ Program',
    description: 'Real-time interactive console input & calculations with std::cin & std::cout.',
    language: 'cpp',
    fileName: 'main.cpp',
    code: `// ==========================================
// Ocal++ Studio | C++ Interactive Example
// Hotkeys: F5 (Compile & Run), Ctrl+F9 (Compile)
// ==========================================

#include <iostream>
#include <string>
#include <vector>
#include <iomanip>

int main() {
    std::cout << "========================================\\n";
    std::cout << "       WELCOME TO OCAL++ STUDIO!        \\n";
    std::cout << "========================================\\n\\n";

    std::string name;
    int birthYear;

    std::cout << "Enter your programmer handle: ";
    std::cin >> name;

    std::cout << "Enter your year of birth (e.g. 2004): ";
    while (!(std::cin >> birthYear) || birthYear < 1900 || birthYear > 2030) {
        std::cout << "Invalid year. Please enter a 4-digit year: ";
        std::cin.clear();
        std::cin.ignore(10000, '\\n');
    }

    int age = 2026 - birthYear;

    std::cout << "\\nHello, " << name << "! You are approximately " << age << " years old.\\n";
    std::cout << "- Language: C++17 / C++20\\n";
    std::cout << "- Memory Model: Native 64-bit Flat\\n";
    std::cout << "- Mode: Strict Syntax Mastery\\n\\n";

    std::cout << "Program executed successfully.\\n";
    return 0;
}
`,
  },

  // 2. Classic C Template
  {
    id: 'c-classic-io',
    title: '2. Classic C Console Application',
    description: 'Direct C programming with printf, scanf, pointers, and memory buffers.',
    language: 'c',
    fileName: 'main.c',
    code: `/* ==========================================
   Ocal++ Studio | Classic C Program
   Hotkeys: F5 (Compile & Run)
   ========================================== */

#include <stdio.h>
#include <stdlib.h>

int main(void) {
    char name[64];
    int count = 0;
    double sum = 0.0, num;

    printf("========================================\\n");
    printf("        OCAL++ C STUDIO CONSOLE         \\n");
    printf("========================================\\n\\n");

    printf("Enter your name: ");
    if (scanf("%63s", name) != 1) {
        printf("Error reading name.\\n");
        return 1;
    }

    printf("How many numbers would you like to average? ");
    if (scanf("%d", &count) != 1 || count <= 0) {
        printf("Invalid count.\\n");
        return 1;
    }

    for (int i = 1; i <= count; i++) {
        printf("Enter value #%d: ", i);
        if (scanf("%lf", &num) == 1) {
            sum += num;
        }
    }

    printf("\\nHello, %s!\\n", name);
    printf("The average of your %d numbers is: %.2f\\n", count, sum / count);

    return 0;
}
`,
  },

  // 3. Python Template
  {
    id: 'python-interactive',
    title: '3. Interactive Python Script',
    description: 'Python 3 script with live input, lists, dictionaries, and formatted analytics.',
    language: 'python',
    fileName: 'main.py',
    code: `# ==========================================
# Ocal++ Studio | Python 3 Interactive Script
# Hotkey: Press F5 to Run Instantly
# ==========================================

import sys
import time

def main():
    print("========================================")
    print("       OCAL++ PYTHON 3 ENVIRONMENT      ")
    print("========================================\\n")

    name = input("Enter your developer name: ").strip()
    print(f"\\nWelcome to Ocal++, {name}!")

    try:
        n = int(input("Enter number of Fibonacci elements to generate: "))
        if n <= 0:
            print("Please enter a positive integer.")
            return

        fib = [0, 1]
        for _ in range(2, n):
            fib.append(fib[-1] + fib[-2])

        result = fib[:n]
        print(f"\\nFibonacci Sequence ({n} terms):")
        print(" -> ".join(map(str, result)))
        print(f"Sum of sequence: {sum(result)}")

    except ValueError:
        print("Invalid numerical input.")

if __name__ == "__main__":
    main()
`,
  },

  // 4. Java Template
  {
    id: 'java-application',
    title: '4. Java Console Application',
    description: 'Java 11+ application with Scanner, OOP classes, and stream processing.',
    language: 'java',
    fileName: 'Main.java',
    code: `/* ==========================================
   Ocal++ Studio | Java Application
   Hotkeys: F5 (Compile & Run)
   ========================================== */

import java.util.Scanner;
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("========================================");
        System.out.println("          OCAL++ JAVA RUNTIME           ");
        System.out.println("========================================\\n");

        System.out.print("Enter your developer handle: ");
        String name = scanner.nextLine();

        System.out.println("\\nHello, " + name + "! Welcome to Ocal++ Java Studio.");
        System.out.print("Enter numbers separated by spaces (e.g. 42 17 89 5): ");

        String line = scanner.nextLine();
        String[] parts = line.trim().split("\\\\s+");
        ArrayList<Integer> numbers = new ArrayList<>();

        for (String part : parts) {
            try {
                numbers.add(Integer.parseInt(part));
            } catch (NumberFormatException ignored) {}
        }

        if (!numbers.isEmpty()) {
            Collections.sort(numbers);
            System.out.println("\\n[Sorted Numbers]: " + numbers);
            System.out.println("Minimum: " + numbers.get(0));
            System.out.println("Maximum: " + numbers.get(numbers.size() - 1));
        }

        System.out.println("\\nJava execution completed.");
        scanner.close();
    }
}
`,
  },

  // 5. JavaScript / Node.js Template
  {
    id: 'js-node-script',
    title: '5. JavaScript / Node.js Script',
    description: 'Modern ES6+ JavaScript with asynchronous promises, objects, and console I/O.',
    language: 'javascript',
    fileName: 'index.js',
    code: `// ==========================================
// Ocal++ Studio | JavaScript (Node.js)
// Hotkeys: F5 to Run
// ==========================================

import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log('========================================');
console.log('       OCAL++ JAVASCRIPT RUNTIME        ');
console.log('========================================\\n');

function askQuestion(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
    const name = await askQuestion('Enter your developer name: ');
    console.log(\`\\nWelcome to Ocal++ JS Studio, \${name}!\`);

    const users = [
        { id: 1, role: 'Admin', score: 98 },
        { id: 2, role: 'Developer', score: 95 },
        { id: 3, role: 'Engineer', score: 99 },
    ];

    console.log('\\n[Active Team Profiles]:');
    console.table(users);

    const totalScore = users.reduce((acc, u) => acc + u.score, 0);
    console.log(\`Average Team Score: \${(totalScore / users.length).toFixed(1)} / 100\\n\`);

    rl.close();
}

main();
`,
  },

  // 6. TypeScript Template
  {
    id: 'ts-typescript',
    title: '6. TypeScript Strongly-Typed Module',
    description: 'Typed interfaces, generics, async functions, and type safety.',
    language: 'typescript',
    fileName: 'index.ts',
    code: `// ==========================================
// Ocal++ Studio | TypeScript Environment
// Hotkeys: F5 to Run
// ==========================================

interface ProjectConfig {
    name: string;
    version: string;
    strictMode: boolean;
    features: string[];
}

function displayConfig<T extends ProjectConfig>(config: T): void {
    console.log(\`=== Project: \${config.name} (v\${config.version}) ===\`);
    console.log(\`Strict Mode: \${config.strictMode ? 'ACTIVE' : 'INACTIVE'}\`);
    console.log('Enabled Capabilities:');
    config.features.forEach((feat, i) => {
        console.log(\`  [\${i + 1}] \${feat}\`);
    });
}

const currentProject: ProjectConfig = {
    name: 'Ocal++ Multi-Language Studio',
    version: '1.0.0',
    strictMode: true,
    features: [
        'Bundled GCC & G++ Toolchains',
        'Python 3 Interactive Execution',
        'Java 11+ Application Runner',
        'Node.js & TypeScript Support',
        'React & Next.js Components',
    ],
};

displayConfig(currentProject);
console.log('\\nTypeScript compiled and executed cleanly.');
`,
  },

  // 7. React Component Template
  {
    id: 'react-component',
    title: '7. React Functional Component (TSX)',
    description: 'Modern React component with useState hooks, props, Tailwind styling, and reactive UI.',
    language: 'react',
    fileName: 'App.tsx',
    code: `import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  title?: string;
}

export const App: React.FC<CounterProps> = ({ 
  initialCount = 0, 
  title = "Ocal++ React Interactive Studio" 
}) => {
  const [count, setCount] = useState<number>(initialCount);
  const [history, setHistory] = useState<number[]>([]);

  const handleIncrement = () => {
    const next = count + 1;
    setCount(next);
    setHistory((prev) => [...prev.slice(-4), next]);
  };

  const handleDecrement = () => {
    const next = Math.max(0, count - 1);
    setCount(next);
    setHistory((prev) => [...prev.slice(-4), next]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-neutral-900 text-white rounded-xl shadow-2xl max-w-md mx-auto">
      <h1 className="text-xl font-bold text-sky-400 mb-4">{title}</h1>
      
      <div className="text-5xl font-mono font-extrabold my-6 text-emerald-400">
        {count}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDecrement}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold transition-colors"
        >
          - Decrement
        </button>
        <button
          onClick={handleIncrement}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-semibold transition-colors"
        >
          + Increment
        </button>
        <button
          onClick={() => { setCount(0); setHistory([]); }}
          className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-sm font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-6 text-xs text-neutral-400">
          Recent counts: {history.join(' -> ')}
        </div>
      )}
    </div>
  );
};

export default App;
`,
  },

  // 8. Next.js App Router Template
  {
    id: 'nextjs-page',
    title: '8. Next.js Page (App Router)',
    description: 'Next.js 14+ Server Component with metadata, server actions, and responsive layout.',
    language: 'nextjs',
    fileName: 'page.tsx',
    code: `// ==========================================
// Ocal++ Studio | Next.js App Router Page
// ==========================================

import React from 'react';

export const metadata = {
  title: 'Ocal++ Next.js Dashboard',
  description: 'Built with Next.js App Router and Ocal++ Studio',
};

interface MetricCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const metrics: MetricCard[] = [
  { label: 'Active Runtimes', value: '7 Languages', change: '+3 new', isPositive: true },
  { label: 'Build Latency', value: '18 ms', change: '-45%', isPositive: true },
  { label: 'Toolchain Status', value: '100% Ready', change: 'Bundled GCC', isPositive: true },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <header className="mb-8 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Next.js Studio Dashboard</h1>
        <p className="text-sm text-neutral-400 mt-1">High-performance Fullstack C/C++ & Web Tooling</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
            <span className="text-xs text-neutral-400 font-medium uppercase">{m.label}</span>
            <div className="text-2xl font-bold text-white mt-1">{m.value}</div>
            <span className="text-xs text-emerald-400 mt-2 inline-block font-semibold">
              {m.change}
            </span>
          </div>
        ))}
      </section>

      <footer className="text-xs text-neutral-500">
        Rendered via Next.js Server Components inside Ocal++
      </footer>
    </main>
  );
}
`,
  },

  // 9. HTML5 Web Application Template
  {
    id: 'html5-web-app',
    title: '9. Modern HTML5 & CSS3 Web Application',
    description: 'Responsive web application with real-time DOM interaction and live preview.',
    language: 'html',
    fileName: 'index.html',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ocal++ Live Web Studio</title>
  <style>
    :root {
      --primary: #0078d4;
      --bg: #0f172a;
      --card: #1e293b;
      --text: #f8fafc;
      --accent: #38bdf8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: var(--card);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 32px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      text-align: center;
    }
    h1 { color: var(--accent); font-size: 24px; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .counter-display {
      font-size: 48px;
      font-weight: 800;
      color: #34d399;
      margin: 16px 0;
      font-family: monospace;
    }
    .btn-group { display: flex; gap: 10px; justify-content: center; }
    button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s, opacity 0.2s;
    }
    button:hover { opacity: 0.9; transform: translateY(-1px); }
    button:active { transform: translateY(1px); }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Ocal++ Live Web Server</h1>
    <p>Real-time HTML, CSS & JavaScript editing environment with live browser preview.</p>
    
    <div class="counter-display" id="counter">0</div>

    <div class="btn-group">
      <button onclick="decrement()">- Decrement</button>
      <button onclick="increment()">+ Increment</button>
      <button onclick="resetCounter()" style="background:#475569;">Reset</button>
    </div>
  </div>

  <script>
    let count = 0;
    const counterEl = document.getElementById('counter');

    function increment() {
      count++;
      update();
    }
    function decrement() {
      if (count > 0) count--;
      update();
    }
    function resetCounter() {
      count = 0;
      update();
    }
    function update() {
      counterEl.textContent = count;
      counterEl.style.transform = 'scale(1.1)';
      setTimeout(() => counterEl.style.transform = 'scale(1)', 150);
    }
  </script>
</body>
</html>
`,
  },

  // 10. CSS3 Stylesheet Template
  {
    id: 'css3-stylesheet',
    title: '10. Modern CSS3 Stylesheet',
    description: 'Clean responsive CSS utilities, CSS Grid, Flexbox, and Glassmorphism styling.',
    language: 'css',
    fileName: 'style.css',
    code: `/* ==========================================
   Ocal++ Studio | Modern CSS3 Stylesheet
   ========================================== */

:root {
  --primary-hue: 210;
  --primary-color: hsl(var(--primary-hue), 100%, 50%);
  --surface-dark: #121212;
  --surface-card: rgba(255, 255, 255, 0.05);
  --border-glass: rgba(255, 255, 255, 0.12);
  --text-main: #ffffff;
  --text-muted: #a0a0a0;
}

body {
  margin: 0;
  padding: 0;
  background: var(--surface-dark);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.glass-container {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: var(--surface-card);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  padding: 24px;
}
`,
  },
];
