import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface DiagnosticItem {
  id: string;
  fileName?: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
}

export interface ToolchainInfo {
  name: string;
  path: string;
  version: string;
  detected: boolean;
  isDefault: boolean;
}

export interface BuildResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  outputPath?: string;
  durationMs: number;
  diagnostics: DiagnosticItem[];
}

export interface CompileOptions {
  sourcePath?: string;
  sourceCode: string;
  fileName: string;
  language: 'c' | 'cpp' | 'python' | 'java' | 'javascript' | 'typescript' | 'react' | 'nextjs';
  compilerPath?: string;
  standard?: string;
  optimization?: string;
  warnings?: string[];
  customFlags?: string;
}

export class CompilerManager {
  private activeRunningProcess: ChildProcess | null = null;
  private tempDir: string;
  private compatDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'turbo_plus_plus_builds');
    this.compatDir = path.join(this.tempDir, 'turbo_compat');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    if (!fs.existsSync(this.compatDir)) {
      fs.mkdirSync(this.compatDir, { recursive: true });
    }
    this.ensureCompatibilityHeaders();
  }

  /**
   * Generates a complete Turbo C++ / Borland / Classic C/C++ compatibility layer
   * so educational, textbook, and vintage codebases compile and run seamlessly
   * on modern GCC / Clang / MSYS2 toolchains without namespace collisions or errors.
   */
  private ensureCompatibilityHeaders() {
    const headers: Record<string, string> = {
      // 1. Classic iostream.h
      'iostream.h': `#ifndef _TURBO_COMPAT_IOSTREAM_H_
#define _TURBO_COMPAT_IOSTREAM_H_
#include <iostream>
#include <iomanip>
#include <fstream>
#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <cstring>
#include <ctime>
#include <climits>
#include <cfloat>
using namespace std;

// Automatic unbuffered stdout/stdin for instantaneous interactive terminal responses
struct _TurboStreamFlusher {
  _TurboStreamFlusher() {
    std::setvbuf(stdout, NULL, _IONBF, 0);
    std::setvbuf(stdin, NULL, _IONBF, 0);
    std::ios_base::sync_with_stdio(true);
    std::cin.tie(&std::cout);
  }
};
static _TurboStreamFlusher _turbo_stream_flusher_inst;
#endif
`,

      // 2. Classic conio.h (Full Borland Console I/O, Colors, gotoxy, clrscr)
      'conio.h': `#ifndef _TURBO_COMPAT_CONIO_H_
#define _TURBO_COMPAT_CONIO_H_
#include <cstdio>
#include <cstdlib>

#if defined(__has_include_next) && __has_include_next(<conio.h>)
  #include_next <conio.h>
#elif defined(_WIN32)
  #ifdef __cplusplus
  extern "C" {
  #endif
    int __cdecl _getch(void);
    int __cdecl _getche(void);
    int __cdecl _kbhit(void);
    int __cdecl getch(void);
    int __cdecl getche(void);
    int __cdecl kbhit(void);
  #ifdef __cplusplus
  }
  #endif
#else
  #include <termios.h>
  #include <unistd.h>
  static inline int getch(void) {
    struct termios oldt, newt;
    int ch;
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);
    ch = getchar();
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    return ch;
  }
  static inline int getche(void) {
    int ch = getch();
    putchar(ch);
    return ch;
  }
  static inline int kbhit(void) { return 0; }
#endif

// Borland Color Constants
enum _BORLAND_COLORS {
  BLACK = 0, BLUE = 1, GREEN = 2, CYAN = 3,
  RED = 4, MAGENTA = 5, BROWN = 6, LIGHTGRAY = 7,
  DARKGRAY = 8, LIGHTBLUE = 9, LIGHTGREEN = 10, LIGHTCYAN = 11,
  LIGHTRED = 12, LIGHTMAGENTA = 13, YELLOW = 14, WHITE = 15,
  BLINK = 128
};

static inline void clrscr(void) {
  std::printf("\\033[2J\\033[H");
  std::fflush(stdout);
}

static inline void gotoxy(int x, int y) {
  std::printf("\\033[%d;%dH", y, x);
  std::fflush(stdout);
}

static inline int wherex(void) { return 1; }
static inline int wherey(void) { return 1; }

static inline void textcolor(int color) {
  int ansi = 30 + (color % 8);
  if (color >= 8 && color < 16) ansi += 60;
  std::printf("\\033[%dm", ansi);
  std::fflush(stdout);
}

static inline void textbackground(int color) {
  int ansi = 40 + (color % 8);
  if (color >= 8 && color < 16) ansi += 60;
  std::printf("\\033[%dm", ansi);
  std::fflush(stdout);
}

static inline void textattr(int attr) {
  textcolor(attr & 0x0F);
  textbackground((attr >> 4) & 0x0F);
}

static inline void highvideo(void) { std::printf("\\033[1m"); std::fflush(stdout); }
static inline void lowvideo(void) { std::printf("\\033[2m"); std::fflush(stdout); }
static inline void normvideo(void) { std::printf("\\033[0m"); std::fflush(stdout); }
static inline void clreol(void) { std::printf("\\033[K"); std::fflush(stdout); }
static inline void delline(void) { std::printf("\\033[M"); std::fflush(stdout); }
static inline void insline(void) { std::printf("\\033[L"); std::fflush(stdout); }

static inline int putch(int c) {
  int r = std::putchar(c);
  std::fflush(stdout);
  return r;
}

static inline int cputs(const char* str) {
  int r = std::fputs(str, stdout);
  std::fflush(stdout);
  return r;
}

#endif
`,

      // 3. Borland graphics.h (BGI Graphics Suite)
      'graphics.h': `#ifndef _TURBO_COMPAT_GRAPHICS_H_
#define _TURBO_COMPAT_GRAPHICS_H_
#include <cstdio>
#include <cstdlib>
#include <cmath>

// Graphics Drivers & Modes
#define DETECT 0
#define CGA 1
#define MCGA 2
#define EGA 3
#define EGA64 4
#define EGAMONO 5
#define IBM8514 6
#define HERCMONO 7
#define ATT400 8
#define VGA 9
#define PC3270 10
#define USER 0

#define CGAC0 0
#define CGAC1 1
#define CGAC2 2
#define CGAC3 3
#define CGAHI 4
#define EGALO 0
#define EGAHI 1
#define VGAHI 2
#define VGAMED 1
#define VGALO 0

// Line Styles
#define SOLID_LINE 0
#define DOTTED_LINE 1
#define CENTER_LINE 2
#define DASHED_LINE 3
#define USERBIT_LINE 4
#define NORM_WIDTH 1
#define THICK_WIDTH 3

// Fill Styles
#define EMPTY_FILL 0
#define SOLID_FILL 1
#define LINE_FILL 2
#define LTSLASH_FILL 3
#define SLASH_FILL 4
#define BKSLASH_FILL 5
#define LTBKSLASH_FILL 6
#define HATCH_FILL 7
#define XHATCH_FILL 8
#define INTERLEAVE_FILL 9
#define WIDE_DOT_FILL 10
#define CLOSE_DOT_FILL 11
#define USER_FILL 12

// Font Constants
#define DEFAULT_FONT 0
#define TRIPLEX_FONT 1
#define SMALL_FONT 2
#define SANS_SERIF_FONT 3
#define GOTHIC_FONT 4
#define HORIZ_DIR 0
#define VERT_DIR 1

// Text Justification
#define LEFT_TEXT 0
#define CENTER_TEXT 1
#define RIGHT_TEXT 2
#define BOTTOM_TEXT 0
#define TOP_TEXT 2

// Error Codes
#define grOk 0
#define grNoInitGraph -1
#define grNotDetected -2
#define grFileNotFound -3
#define grInvalidDriver -4

#ifndef _BORLAND_COLORS_DEFINED
#define _BORLAND_COLORS_DEFINED
enum {
  BLACK = 0, BLUE = 1, GREEN = 2, CYAN = 3,
  RED = 4, MAGENTA = 5, BROWN = 6, LIGHTGRAY = 7,
  DARKGRAY = 8, LIGHTBLUE = 9, LIGHTGREEN = 10, LIGHTCYAN = 11,
  LIGHTRED = 12, LIGHTMAGENTA = 13, YELLOW = 14, WHITE = 15
};
#endif

// Safe Standard BGI Graphics functions
static inline void initgraph(int* gd, int* gm, const char* pathtodriver) {
  (void)gd; (void)gm; (void)pathtodriver;
  std::printf("\\033[2J\\033[H");
  std::printf("[Graphics Mode Initialized (640x480)]\\n");
  std::fflush(stdout);
}

static inline void closegraph(void) {
  std::printf("\\n[Graphics Mode Closed]\\n");
  std::fflush(stdout);
}

static inline void cleardevice(void) {
  std::printf("\\033[2J\\033[H");
  std::fflush(stdout);
}

static inline int getmaxx(void) { return 639; }
static inline int getmaxy(void) { return 479; }
static inline int getx(void) { return 0; }
static inline int gety(void) { return 0; }
static inline int getcolor(void) { return WHITE; }
static inline int getbkcolor(void) { return BLACK; }

static inline void setcolor(int c) {
  int ansi = 30 + (c % 8);
  if (c >= 8 && c < 16) ansi += 60;
  std::printf("\\033[%dm", ansi);
  std::fflush(stdout);
}

static inline void setbkcolor(int c) {
  int ansi = 40 + (c % 8);
  if (c >= 8 && c < 16) ansi += 60;
  std::printf("\\033[%dm", ansi);
  std::fflush(stdout);
}

static inline void setfillstyle(int pattern, int color) { (void)pattern; (void)color; }
static inline void setlinestyle(int style, unsigned int upattern, int thickness) { (void)style; (void)upattern; (void)thickness; }
static inline void settextstyle(int font, int direction, int charsize) { (void)font; (void)direction; (void)charsize; }
static inline void settextjustify(int horiz, int vert) { (void)horiz; (void)vert; }

static inline void line(int x1, int y1, int x2, int y2) { (void)x1; (void)y1; (void)x2; (void)y2; }
static inline void lineto(int x, int y) { (void)x; (void)y; }
static inline void linerel(int dx, int dy) { (void)dx; (void)dy; }
static inline void moveto(int x, int y) { (void)x; (void)y; }
static inline void moverel(int dx, int dy) { (void)dx; (void)dy; }

static inline void circle(int x, int y, int radius) { (void)x; (void)y; (void)radius; }
static inline void arc(int x, int y, int stangle, int endangle, int radius) { (void)x; (void)y; (void)stangle; (void)endangle; (void)radius; }
static inline void ellipse(int x, int y, int stangle, int endangle, int xradius, int yradius) { (void)x; (void)y; (void)stangle; (void)endangle; (void)xradius; (void)yradius; }
static inline void fillellipse(int x, int y, int xradius, int yradius) { (void)x; (void)y; (void)xradius; (void)yradius; }
static inline void rectangle(int left, int top, int right, int bottom) { (void)left; (void)top; (void)right; (void)bottom; }
static inline void bar(int left, int top, int right, int bottom) { (void)left; (void)top; (void)right; (void)bottom; }
static inline void bar3d(int left, int top, int right, int bottom, int depth, int topflag) { (void)left; (void)top; (void)right; (void)bottom; (void)depth; (void)topflag; }
static inline void pieslice(int x, int y, int stangle, int endangle, int radius) { (void)x; (void)y; (void)stangle; (void)endangle; (void)radius; }
static inline void sector(int x, int y, int stangle, int endangle, int xradius, int yradius) { (void)x; (void)y; (void)stangle; (void)endangle; (void)xradius; (void)yradius; }

static inline void drawpoly(int numpoints, int* polypoints) { (void)numpoints; (void)polypoints; }
static inline void fillpoly(int numpoints, int* polypoints) { (void)numpoints; (void)polypoints; }
static inline void floodfill(int x, int y, int border) { (void)x; (void)y; (void)border; }
static inline void putpixel(int x, int y, int color) { (void)x; (void)y; (void)color; }
static inline unsigned int getpixel(int x, int y) { (void)x; (void)y; return 0; }

static inline void outtext(const char* textstring) {
  std::printf("%s", textstring);
  std::fflush(stdout);
}

static inline void outtextxy(int x, int y, const char* textstring) {
  (void)x; (void)y;
  std::printf("%s", textstring);
  std::fflush(stdout);
}

static inline int graphresult(void) { return grOk; }
static inline const char* grapherrormsg(int errorcode) { (void)errorcode; return "No error"; }
static inline void detectgraph(int* gd, int* gm) { *gd = VGA; *gm = VGAHI; }

#endif
`,

      // 4. dos.h (delay, sound, nosound, sleep, dates, ports)
      'dos.h': `#ifndef _TURBO_COMPAT_DOS_H_
#define _TURBO_COMPAT_DOS_H_
#include <chrono>
#include <thread>
#include <ctime>

struct date {
  int da_year;
  char da_day;
  char da_mon;
};

struct time {
  unsigned char ti_min;
  unsigned char ti_hour;
  unsigned char ti_hund;
  unsigned char ti_sec;
};

static inline void delay(unsigned int ms) {
  std::this_thread::sleep_for(std::chrono::milliseconds(ms));
}
static inline void sleep(unsigned int s) {
  std::this_thread::sleep_for(std::seconds(s));
}
static inline void sound(unsigned int freq) { (void)freq; }
static inline void nosound(void) {}

static inline void getdate(struct date* d) {
  time_t t = std::time(NULL);
  struct tm* now = std::localtime(&t);
  if (d && now) {
    d->da_year = now->tm_year + 1900;
    d->da_mon = now->tm_mon + 1;
    d->da_day = now->tm_mday;
  }
}

static inline void gettime(struct time* t) {
  time_t tm_val = std::time(NULL);
  struct tm* now = std::localtime(&tm_val);
  if (t && now) {
    t->ti_hour = now->tm_hour;
    t->ti_min = now->tm_min;
    t->ti_sec = now->tm_sec;
    t->ti_hund = 0;
  }
}

static inline void setdate(struct date* d) { (void)d; }
static inline void settime(struct time* t) { (void)t; }
static inline unsigned char inportb(int port) { (void)port; return 0; }
static inline void outportb(int port, unsigned char val) { (void)port; (void)val; }
static inline unsigned short inport(int port) { (void)port; return 0; }
static inline void outport(int port, unsigned short val) { (void)port; (void)val; }
static inline void geninterrupt(int intr_num) { (void)intr_num; }
static inline void enable(void) {}
static inline void disable(void) {}
#endif
`,

      // 5. dir.h & direct.h
      'dir.h': `#ifndef _TURBO_COMPAT_DIR_H_
#define _TURBO_COMPAT_DIR_H_
#include <cstdio>
#include <cstdlib>
#include <cstring>
#if defined(_WIN32)
  #include <direct.h>
  #include <io.h>
#else
  #include <unistd.h>
  #include <sys/stat.h>
#endif

struct ffblk {
  long ff_reserved;
  long ff_fsize;
  unsigned long ff_attrib;
  unsigned short ff_ftime;
  unsigned short ff_fdate;
  char ff_name[260];
};

#define FA_RDONLY 0x01
#define FA_HIDDEN 0x02
#define FA_SYSTEM 0x04
#define FA_LABEL  0x08
#define FA_DIREC  0x10
#define FA_ARCH   0x20

static inline int findfirst(const char* pathname, struct ffblk* ffblk, int attrib) {
  (void)pathname; (void)ffblk; (void)attrib; return -1;
}
static inline int findnext(struct ffblk* ffblk) { (void)ffblk; return -1; }
static inline int getcurdir(int drive, char* directory) { (void)drive; (void)directory; return 0; }
static inline char* searchpath(const char* file) { (void)file; return NULL; }
#endif
`,

      // 6. bios.h
      'bios.h': `#ifndef _TURBO_COMPAT_BIOS_H_
#define _TURBO_COMPAT_BIOS_H_
static inline int bioskey(int cmd) { (void)cmd; return 0; }
static inline long biostime(int cmd, long newtime) { (void)cmd; (void)newtime; return 0; }
static inline int bioscom(int cmd, char byte, int port) { (void)cmd; (void)byte; (void)port; return 0; }
static inline int biosdisk(int cmd, int drive, int head, int track, int sector, int nsects, void* buffer) {
  (void)cmd; (void)drive; (void)head; (void)track; (void)sector; (void)nsects; (void)buffer; return 0;
}
static inline int biosprint(int cmd, int byte, int port) { (void)cmd; (void)byte; (void)port; return 0; }
#endif
`,

      // 7. values.h
      'values.h': `#ifndef _TURBO_COMPAT_VALUES_H_
#define _TURBO_COMPAT_VALUES_H_
#include <climits>
#include <cfloat>
#define MAXINT INT_MAX
#define MININT INT_MIN
#define MAXLONG LONG_MAX
#define MINLONG LONG_MIN
#define MAXSHORT SHRT_MAX
#define MINSHORT SHRT_MIN
#define MAXFLOAT FLT_MAX
#define MINFLOAT FLT_MIN
#define MAXDOUBLE DBL_MAX
#define MINDOUBLE DBL_MIN
#endif
`,

      // 8. alloc.h & mem.h & process.h
      'alloc.h': `#ifndef _TURBO_COMPAT_ALLOC_H_
#define _TURBO_COMPAT_ALLOC_H_
#include <cstdlib>
#include <malloc.h>
static inline unsigned long coreleft(void) { return 655360UL; }
static inline unsigned long farcoreleft(void) { return 655360UL; }
#endif
`,

      'mem.h': `#ifndef _TURBO_COMPAT_MEM_H_
#define _TURBO_COMPAT_MEM_H_
#include <cstring>
#include <cstdlib>
static inline void movmem(const void* src, void* dest, unsigned length) { std::memmove(dest, src, length); }
static inline void setmem(void* dest, unsigned length, char value) { std::memset(dest, value, length); }
#endif
`,

      'process.h': `#ifndef _TURBO_COMPAT_PROCESS_H_
#define _TURBO_COMPAT_PROCESS_H_
#include <cstdlib>
#if defined(_WIN32)
  #include_next <process.h>
#else
  #include <unistd.h>
  #include <sys/types.h>
  #include <sys/wait.h>
#endif
#endif
`,

      // 9. Standard C++ Classic Streams (fstream.h, iomanip.h, strstream.h)
      'fstream.h': `#ifndef _TURBO_COMPAT_FSTREAM_H_
#define _TURBO_COMPAT_FSTREAM_H_
#include <fstream>
#include <iostream>
using namespace std;
#endif
`,

      'iomanip.h': `#ifndef _TURBO_COMPAT_IOMANIP_H_
#define _TURBO_COMPAT_IOMANIP_H_
#include <iomanip>
#include <iostream>
using namespace std;
#endif
`,

      'strstream.h': `#ifndef _TURBO_COMPAT_STRSTREAM_H_
#define _TURBO_COMPAT_STRSTREAM_H_
#include <strstream>
#include <sstream>
#include <iostream>
using namespace std;
#endif
`,

      'complex.h': `#ifndef _TURBO_COMPAT_COMPLEX_H_
#define _TURBO_COMPAT_COMPLEX_H_
#include <complex>
using namespace std;
#endif
`,

      // 10. STL Classic .h Headers
      'vector.h': `#ifndef _TURBO_COMPAT_VECTOR_H_\n#define _TURBO_COMPAT_VECTOR_H_\n#include <vector>\nusing namespace std;\n#endif\n`,
      'list.h': `#ifndef _TURBO_COMPAT_LIST_H_\n#define _TURBO_COMPAT_LIST_H_\n#include <list>\nusing namespace std;\n#endif\n`,
      'map.h': `#ifndef _TURBO_COMPAT_MAP_H_\n#define _TURBO_COMPAT_MAP_H_\n#include <map>\nusing namespace std;\n#endif\n`,
      'set.h': `#ifndef _TURBO_COMPAT_SET_H_\n#define _TURBO_COMPAT_SET_H_\n#include <set>\nusing namespace std;\n#endif\n`,
      'deque.h': `#ifndef _TURBO_COMPAT_DEQUE_H_\n#define _TURBO_COMPAT_DEQUE_H_\n#include <deque>\nusing namespace std;\n#endif\n`,
      'stack.h': `#ifndef _TURBO_COMPAT_STACK_H_\n#define _TURBO_COMPAT_STACK_H_\n#include <stack>\nusing namespace std;\n#endif\n`,
      'queue.h': `#ifndef _TURBO_COMPAT_QUEUE_H_\n#define _TURBO_COMPAT_QUEUE_H_\n#include <queue>\nusing namespace std;\n#endif\n`,
      'algorithm.h': `#ifndef _TURBO_COMPAT_ALGORITHM_H_\n#define _TURBO_COMPAT_ALGORITHM_H_\n#include <algorithm>\nusing namespace std;\n#endif\n`,
      'string.h': `#ifndef _TURBO_COMPAT_STRING_H_\n#define _TURBO_COMPAT_STRING_H_\n#include_next <string.h>\n#include <string>\n#include <cstring>\nusing namespace std;\n#endif\n`,
      'utility.h': `#ifndef _TURBO_COMPAT_UTILITY_H_\n#define _TURBO_COMPAT_UTILITY_H_\n#include <utility>\nusing namespace std;\n#endif\n`,
      'functional.h': `#ifndef _TURBO_COMPAT_FUNCTIONAL_H_\n#define _TURBO_COMPAT_FUNCTIONAL_H_\n#include <functional>\nusing namespace std;\n#endif\n`,
      'numeric.h': `#ifndef _TURBO_COMPAT_NUMERIC_H_\n#define _TURBO_COMPAT_NUMERIC_H_\n#include <numeric>\nusing namespace std;\n#endif\n`,
      'memory.h': `#ifndef _TURBO_COMPAT_MEMORY_H_\n#define _TURBO_COMPAT_MEMORY_H_\n#include_next <memory.h>\n#include <memory>\nusing namespace std;\n#endif\n`,
      'stdexcept.h': `#ifndef _TURBO_COMPAT_STDEXCEPT_H_\n#define _TURBO_COMPAT_STDEXCEPT_H_\n#include <stdexcept>\nusing namespace std;\n#endif\n`,
      'bitset.h': `#ifndef _TURBO_COMPAT_BITSET_H_\n#define _TURBO_COMPAT_BITSET_H_\n#include <bitset>\nusing namespace std;\n#endif\n`,
    };

    for (const [filename, content] of Object.entries(headers)) {
      const filePath = path.join(this.compatDir, filename);
      try {
        fs.writeFileSync(filePath, content, 'utf8');
      } catch (err) {
        console.error('Failed to write compat header:', filename, err);
      }
    }
  }

  /**
   * Transparent source code preprocessor for legacy Turbo C++ idioms.
   * Transforms 'void main(' and bare 'main(' into 'int main('
   * to satisfy modern C++ compilers without shifting line numbers.
   */
  private preprocessLegacySource(sourceCode: string): string {
    return sourceCode
      .replace(/\bvoid\s+main\s*\(/g, 'int main(')
      .replace(/(?:^|\n)\s*main\s*\(/g, '\nint main(');
  }

  /**
   * Parse GCC/Clang compiler stderr output into structured diagnostics.
   * Filters out auxiliary notes, macro expansion notifications, and internal shims.
   */
  public parseDiagnostics(rawOutput: string, fallbackFileName: string): DiagnosticItem[] {
    const diagnostics: DiagnosticItem[] = [];
    const lines = rawOutput.split('\n');

    // Regex for file:line:col: severity: message
    const diagRegex = /^(?:([a-zA-Z]:[\\\/][^:]+|[^:]+)):(\d+):(\d+):\s+(fatal error|error|warning|note):\s+(.*)$/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(diagRegex);
      if (match) {
        const [, matchedFile, lineNum, colNum, severityRaw, message] = match;
        const sevLower = severityRaw.toLowerCase();

        // Skip compiler informational notes, macro expansion traces, and compatibility headers
        if (sevLower.includes('note')) continue;
        if (message.toLowerCase().startsWith('in expansion of macro')) continue;
        if (matchedFile.includes('turbo_compat') || matchedFile.includes('msys64')) continue;

        let severity: 'error' | 'warning' | 'info' = 'info';
        if (sevLower.includes('error')) severity = 'error';
        else if (sevLower.includes('warning')) severity = 'warning';

        diagnostics.push({
          id: `diag_${Date.now()}_${i}`,
          fileName: path.basename(matchedFile) || fallbackFileName,
          line: parseInt(lineNum, 10),
          column: parseInt(colNum, 10),
          message: message.trim(),
          severity,
          source: 'gcc',
        });
      }
    }

    return diagnostics;
  }

  /**
   * Resolves the compiler binary path with smart precedence:
   * 1. User-specified custom compiler path (if valid)
   * 2. Embedded/Bundled toolchain inside the application package (resources/compiler/bin/g++.exe)
   * 3. Local project bundled compiler (compiler/bin/g++.exe)
   * 4. User AppData portable toolchain (%APPDATA%/Ocal++/compiler/bin/g++.exe)
   * 5. Standard MSYS2 / MinGW Windows directories (C:\msys64\ucrt64\bin, C:\msys64\mingw64\bin, etc.)
   * 6. System PATH executable
   */
  public resolveCompilerExecutable(cmdName: string = 'g++'): { commandPath: string; binDir?: string; isBundled: boolean } {
    if (cmdName && path.isAbsolute(cmdName) && fs.existsSync(cmdName)) {
      return { commandPath: cmdName, binDir: path.dirname(cmdName), isBundled: false };
    }

    const exeName = process.platform === 'win32' && !cmdName.endsWith('.exe') ? `${cmdName}.exe` : cmdName;
    const isPackaged = (process as any).resourcesPath !== undefined;

    const candidatePaths = [
      // 1. Packaged Electron resources directory (extraResources)
      isPackaged ? path.join((process as any).resourcesPath, 'compiler', 'bin', exeName) : null,
      isPackaged ? path.join((process as any).resourcesPath, 'bin', exeName) : null,

      // 2. Local development / project compiler directory
      path.join(process.cwd(), 'compiler', 'bin', exeName),
      path.join(process.cwd(), 'resources', 'compiler', 'bin', exeName),
      path.join(__dirname, '..', 'compiler', 'bin', exeName),
      path.join(__dirname, '..', 'resources', 'compiler', 'bin', exeName),

      // 3. User Roaming / Local AppData portable compiler
      path.join(os.homedir(), 'AppData', 'Local', 'Ocal++', 'compiler', 'bin', exeName),
      path.join(os.homedir(), 'AppData', 'Roaming', 'Ocal++', 'compiler', 'bin', exeName),

      // 4. Windows Standard MSYS2 & MinGW distributions
      `C:\\msys64\\ucrt64\\bin\\${exeName}`,
      `C:\\msys64\\mingw64\\bin\\${exeName}`,
      `C:\\msys64\\clang64\\bin\\${exeName}`,
      `C:\\TDM-GCC-64\\bin\\${exeName}`,
      `C:\\MinGW\\bin\\${exeName}`,
      `C:\\Program Files\\LLVM\\bin\\${exeName}`,
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return {
          commandPath: p,
          binDir: path.dirname(p),
          isBundled: p.includes('resources') || p.includes('Ocal++') || p.includes('compiler'),
        };
      }
    }

    return { commandPath: cmdName, isBundled: false };
  }

  /**
   * Automatically resolve Python executable across standard Windows installation paths
   */
  public resolvePythonExecutable(): string {
    const isWindows = process.platform === 'win32';
    if (!isWindows) return 'python3';

    const localApp = os.homedir() + '\\AppData\\Local';
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';

    const candidatePaths = [
      path.join(process.cwd(), 'compiler', 'python', 'python.exe'),
      path.join(localApp, 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(localApp, 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(localApp, 'Programs', 'Python', 'Python310', 'python.exe'),
      path.join(localApp, 'Programs', 'Python', 'Python39', 'python.exe'),
      path.join(programFiles, 'Python312', 'python.exe'),
      path.join(programFiles, 'Python311', 'python.exe'),
      path.join(programFiles, 'Python310', 'python.exe'),
      'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe',
      'C:\\Python310\\python.exe',
      'py.exe',
      'python.exe',
    ];

    for (const c of candidatePaths) {
      if (c.includes('\\') && fs.existsSync(c)) {
        return c;
      }
    }
    return 'python';
  }

  /**
   * Automatically resolve Java runtime and compiler across Windows standard paths
   */
  public resolveJavaExecutable(): { javaCmd: string; javacCmd: string } {
    const isWindows = process.platform === 'win32';
    if (!isWindows) return { javaCmd: 'java', javacCmd: 'javac' };

    const javaHome = process.env['JAVA_HOME'];
    if (javaHome && fs.existsSync(path.join(javaHome, 'bin', 'java.exe'))) {
      return {
        javaCmd: path.join(javaHome, 'bin', 'java.exe'),
        javacCmd: path.join(javaHome, 'bin', 'javac.exe'),
      };
    }

    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const candidateDirs = [
      path.join(programFiles, 'Java'),
      path.join(programFiles, 'Eclipse Adoptium'),
      path.join(programFiles, 'Microsoft'),
      path.join(programFiles, 'Zulu'),
      path.join(programFiles, 'Amazon Corretto'),
    ];

    for (const d of candidateDirs) {
      if (fs.existsSync(d)) {
        try {
          const subdirs = fs.readdirSync(d);
          for (const sub of subdirs) {
            const jPath = path.join(d, sub, 'bin', 'java.exe');
            if (fs.existsSync(jPath)) {
              return {
                javaCmd: jPath,
                javacCmd: path.join(d, sub, 'bin', 'javac.exe'),
              };
            }
          }
        } catch {}
      }
    }

    return { javaCmd: 'java', javacCmd: 'javac' };
  }

  /**
   * Helper to determine appropriate file extension for different language targets
   */
  public getExtensionForLanguage(lang: string, originalFileName: string = 'main'): string {
    switch (lang) {
      case 'html':
        return '.html';
      case 'css':
        return '.css';
      case 'python':
        return '.py';
      case 'java':
        return '.java';
      case 'javascript':
        return '.js';
      case 'typescript':
        return '.ts';
      case 'react':
      case 'nextjs':
        return originalFileName.endsWith('.jsx') ? '.jsx' : '.tsx';
      case 'c':
        return '.c';
      case 'cpp':
      default:
        return '.cpp';
    }
  }

  /**
   * Detect installed compilers & runtimes on the system (Bundled GCC, Python, Java, Node.js)
   */
  public async detectToolchains(): Promise<ToolchainInfo[]> {
    const candidates = [
      { name: 'g++ (C++)', command: 'g++' },
      { name: 'gcc (C)', command: 'gcc' },
      { name: 'python (Python 3)', command: 'python' },
      { name: 'java (Java Runtime)', command: 'java' },
      { name: 'node (JavaScript/TS)', command: 'node' },
    ];

    const results: ToolchainInfo[] = [];

    for (const c of candidates) {
      const resolved = this.resolveCompilerExecutable(c.command);
      try {
        const info = await this.checkToolchain(resolved.commandPath, resolved.binDir);
        results.push({
          name: resolved.isBundled ? `${c.name} (Bundled)` : c.name,
          path: resolved.commandPath,
          version: info.version || 'Available',
          detected: info.available,
          isDefault: c.command === 'g++',
        });
      } catch {
        results.push({
          name: c.name,
          path: resolved.commandPath,
          version: 'Not detected',
          detected: false,
          isDefault: false,
        });
      }
    }

    return results;
  }

  private checkToolchain(cmd: string, binDir?: string): Promise<{ available: boolean; version: string }> {
    return new Promise((resolve) => {
      const env = { ...process.env };
      if (binDir) {
        env.PATH = `${binDir}${path.delimiter}${env.PATH || ''}`;
      }

      const versionFlag = cmd.toLowerCase().includes('java') ? '-version' : '--version';
      const proc = spawn(cmd, [versionFlag], { shell: true, env });
      let output = '';

      proc.stdout.on('data', (d) => {
        output += d.toString();
      });
      proc.stderr.on('data', (d) => {
        output += d.toString();
      });

      proc.on('close', (code) => {
        if (code === 0 || (cmd.toLowerCase().includes('java') && output.length > 0)) {
          const firstLine = output.split('\n')[0].trim();
          resolve({ available: true, version: firstLine });
        } else {
          resolve({ available: false, version: '' });
        }
      });

      proc.on('error', () => {
        resolve({ available: false, version: '' });
      });
    });
  }

  /**
   * Run background syntax check (fast, no binary output)
   */
  public async checkSyntax(options: CompileOptions): Promise<DiagnosticItem[]> {
    const ext = this.getExtensionForLanguage(options.language, options.fileName);
    const tempFile = path.join(this.tempDir, `syntax_check_${Date.now()}${ext}`);
    const processedCode = options.language === 'cpp' || options.language === 'c'
      ? this.preprocessLegacySource(options.sourceCode)
      : options.sourceCode;
    await fs.promises.writeFile(tempFile, processedCode, 'utf8');

    // Handle C and C++ syntax checking via GCC
    if (options.language === 'c' || options.language === 'cpp') {
      const compilerReq = options.compilerPath || (options.language === 'c' ? 'gcc' : 'g++');
      const resolved = this.resolveCompilerExecutable(compilerReq);
      const stdFlag = options.standard ? `-std=${options.standard}` : (options.language === 'c' ? '-std=c11' : '-std=c++17');
      const args = [
        '-fsyntax-only',
        stdFlag,
        `-I${this.compatDir}`,
        '-fpermissive',
        '-Wno-main',
        '-Wno-deprecated',
        '-Wno-deprecated-declarations',
        '-Wno-attributes',
        '-Wall',
        '-Wextra',
        tempFile,
      ];

      const env = { ...process.env };
      if (resolved.binDir) {
        env.PATH = `${resolved.binDir}${path.delimiter}${env.PATH || ''}`;
      }

      return new Promise((resolve) => {
        let stderr = '';
        const proc = spawn(resolved.commandPath, args, { shell: true, env });

        proc.stderr.on('data', (d) => {
          stderr += d.toString();
        });

        proc.on('close', async () => {
          try {
            await fs.promises.unlink(tempFile);
          } catch {}
          const diags = this.parseDiagnostics(stderr, options.fileName);
          resolve(diags);
        });

        proc.on('error', async () => {
          try {
            await fs.promises.unlink(tempFile);
          } catch {}
          resolve([]);
        });
      });
    }

    // Python syntax validation
    if (options.language === 'python') {
      return new Promise((resolve) => {
        const proc = spawn('python', ['-m', 'py_compile', tempFile], { shell: true });
        let stderr = '';
        proc.stderr.on('data', (d) => { stderr += d.toString(); });
        proc.on('close', async (code) => {
          try { await fs.promises.unlink(tempFile); } catch {}
          if (code === 0) resolve([]);
          else {
            resolve([{
              id: `py_${Date.now()}`,
              fileName: options.fileName,
              line: 1,
              column: 1,
              message: stderr || 'Python syntax error',
              severity: 'error',
              source: 'python',
            }]);
          }
        });
        proc.on('error', async () => {
          try { await fs.promises.unlink(tempFile); } catch {}
          resolve([]);
        });
      });
    }

    // JavaScript / Node syntax check
    if (options.language === 'javascript') {
      return new Promise((resolve) => {
        const proc = spawn('node', ['--check', tempFile], { shell: true });
        let stderr = '';
        proc.stderr.on('data', (d) => { stderr += d.toString(); });
        proc.on('close', async (code) => {
          try { await fs.promises.unlink(tempFile); } catch {}
          if (code === 0) resolve([]);
          else {
            resolve([{
              id: `js_${Date.now()}`,
              fileName: options.fileName,
              line: 1,
              column: 1,
              message: stderr || 'JavaScript syntax error',
              severity: 'error',
              source: 'node',
            }]);
          }
        });
        proc.on('error', async () => {
          try { await fs.promises.unlink(tempFile); } catch {}
          resolve([]);
        });
      });
    }

    try {
      await fs.promises.unlink(tempFile);
    } catch {}
    return [];
  }

  /**
   * Compile or prepare source code to executable target
   */
  public async compile(options: CompileOptions): Promise<BuildResult> {
    const startTime = Date.now();
    const isWindows = process.platform === 'win32';
    const lang = options.language || 'cpp';

    // 1. Python Execution Pipeline
    if (lang === 'python') {
      const tempSource = path.join(this.tempDir, `${path.basename(options.fileName, '.py') || 'main'}_${Date.now()}.py`);
      await fs.promises.writeFile(tempSource, options.sourceCode, 'utf8');
      return {
        success: true,
        exitCode: 0,
        stdout: `Python script prepared: ${path.basename(tempSource)}\nReady to run with Python 3 runtime.\n`,
        stderr: '',
        outputPath: tempSource,
        durationMs: Date.now() - startTime,
        diagnostics: [],
      };
    }

    // 2. Java Compilation & Execution Pipeline
    if (lang === 'java') {
      const baseName = 'Main';
      const javaDir = path.join(this.tempDir, `java_${Date.now()}`);
      if (!fs.existsSync(javaDir)) {
        fs.mkdirSync(javaDir, { recursive: true });
      }
      const tempSource = path.join(javaDir, `${baseName}.java`);
      await fs.promises.writeFile(tempSource, options.sourceCode, 'utf8');

      return new Promise((resolve) => {
        const proc = spawn('javac', [tempSource], { shell: true, cwd: javaDir });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (d) => { stdout += d.toString(); });
        proc.stderr.on('data', (d) => { stderr += d.toString(); });

        proc.on('close', (code) => {
          // If javac succeeds or direct single-file Java is available
          const success = code === 0 || fs.existsSync(tempSource);
          resolve({
            success,
            exitCode: code,
            stdout: stdout || 'Java source prepared.\n',
            stderr,
            outputPath: tempSource,
            durationMs: Date.now() - startTime,
            diagnostics: code !== 0 ? [{
              id: `java_${Date.now()}`,
              fileName: options.fileName,
              line: 1,
              column: 1,
              message: stderr || 'Java build warning',
              severity: code === 0 ? 'warning' : 'error',
              source: 'javac',
            }] : [],
          });
        });

        proc.on('error', () => {
          resolve({
            success: true,
            exitCode: 0,
            stdout: 'Single-source Java ready for direct execution.\n',
            stderr: '',
            outputPath: tempSource,
            durationMs: Date.now() - startTime,
            diagnostics: [],
          });
        });
      });
    }

    // 3. JavaScript / TypeScript / React / Next.js Pipeline
    if (lang === 'javascript' || lang === 'typescript' || lang === 'react' || lang === 'nextjs') {
      const ext = this.getExtensionForLanguage(lang, options.fileName);
      const tempSource = path.join(this.tempDir, `${path.basename(options.fileName, ext) || 'index'}_${Date.now()}${ext}`);
      await fs.promises.writeFile(tempSource, options.sourceCode, 'utf8');

      return {
        success: true,
        exitCode: 0,
        stdout: `${lang.toUpperCase()} module prepared: ${path.basename(tempSource)}\nReady to run via Node.js runtime.\n`,
        stderr: '',
        outputPath: tempSource,
        durationMs: Date.now() - startTime,
        diagnostics: [],
      };
    }

    // 4. Native C and C++ Compilation Pipeline
    const ext = lang === 'c' ? '.c' : '.cpp';
    const exeExt = isWindows ? '.exe' : '.out';

    const baseName = path.basename(options.fileName, path.extname(options.fileName)) || 'main';
    const tempSource = path.join(this.tempDir, `${baseName}_${Date.now()}${ext}`);
    const tempOutput = path.join(this.tempDir, `${baseName}_${Date.now()}${exeExt}`);

    const processedCode = this.preprocessLegacySource(options.sourceCode);
    await fs.promises.writeFile(tempSource, processedCode, 'utf8');

    const compilerReq = options.compilerPath || (options.language === 'c' ? 'gcc' : 'g++');
    const resolved = this.resolveCompilerExecutable(compilerReq);
    const stdFlag = options.standard ? `-std=${options.standard}` : (options.language === 'c' ? '-std=c11' : '-std=c++17');
    const optFlag = options.optimization || '-O0';
    const warningFlags = options.warnings && options.warnings.length > 0 ? options.warnings : ['-Wall', '-Wextra'];

    const args = [
      stdFlag,
      optFlag,
      `-I${this.compatDir}`,
      '-fpermissive',
      '-Wno-main',
      '-Wno-deprecated',
      '-Wno-deprecated-declarations',
      '-Wno-attributes',
      ...warningFlags,
      ...(options.customFlags ? options.customFlags.split(' ').filter(Boolean) : []),
      tempSource,
      '-o',
      tempOutput,
    ];

    const env = { ...process.env };
    if (resolved.binDir) {
      env.PATH = `${resolved.binDir}${path.delimiter}${env.PATH || ''}`;
    }

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      const proc = spawn(resolved.commandPath, args, { shell: true, env });

      proc.stdout.on('data', (d) => {
        stdout += d.toString();
      });

      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      proc.on('close', (code) => {
        const durationMs = Date.now() - startTime;
        const success = code === 0 && fs.existsSync(tempOutput);
        const diags = this.parseDiagnostics(stderr, options.fileName);

        resolve({
          success,
          exitCode: code,
          stdout,
          stderr,
          outputPath: success ? tempOutput : undefined,
          durationMs,
          diagnostics: diags,
        });
      });

      proc.on('error', (err) => {
        const durationMs = Date.now() - startTime;
        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr: `Failed to launch compiler: ${err.message}`,
          durationMs,
          diagnostics: [],
        });
      });
    });
  }

  /**
   * Run compiled binary or script interactively in the terminal
   */
  public runExecutable(
    targetPath: string,
    onData: (data: string) => void,
    onExit: (code: number | null, signal: string | null) => void
  ): { success: boolean; pid?: number; error?: string } {
    if (this.activeRunningProcess) {
      this.killRunningProcess();
    }

    if (!fs.existsSync(targetPath)) {
      return { success: false, error: `Target file not found: ${targetPath}` };
    }

    try {
      const ext = path.extname(targetPath).toLowerCase();
      let spawnCmd = targetPath;
      let spawnArgs: string[] = [];

      if (ext === '.py') {
        spawnCmd = this.resolvePythonExecutable();
        spawnArgs = ['-u', targetPath]; // Unbuffered for live interactive I/O
      } else if (ext === '.java') {
        const { javaCmd } = this.resolveJavaExecutable();
        spawnCmd = javaCmd;
        spawnArgs = [targetPath]; // Java 11+ single source launcher
      } else if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
        spawnCmd = 'node';
        spawnArgs = [targetPath];
      } else if (ext === '.ts' || ext === '.tsx' || ext === '.jsx') {
        spawnCmd = 'node';
        spawnArgs = ['--experimental-strip-types', targetPath];
      }

      const proc = spawn(spawnCmd, spawnArgs, {
        cwd: path.dirname(targetPath),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      this.activeRunningProcess = proc;

      proc.stdout?.on('data', (data) => {
        onData(data.toString());
      });

      proc.stderr?.on('data', (data) => {
        onData(data.toString());
      });

      proc.on('exit', (code, signal) => {
        this.activeRunningProcess = null;
        onExit(code, signal);
      });

      proc.on('error', (err) => {
        this.activeRunningProcess = null;
        onData(`\r\n\x1b[31m[Runtime Error] ${err.message}\x1b[0m\r\n`);
        onExit(-1, null);
      });

      return { success: true, pid: proc.pid };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Send stdin input to currently running interactive process
   */
  public sendInputToProcess(input: string): boolean {
    if (this.activeRunningProcess && this.activeRunningProcess.stdin && !this.activeRunningProcess.stdin.destroyed) {
      this.activeRunningProcess.stdin.write(input);
      return true;
    }
    return false;
  }

  /**
   * Kill running process
   */
  public killRunningProcess(): boolean {
    if (this.activeRunningProcess) {
      const pid = this.activeRunningProcess.pid;
      try {
        if (process.platform === 'win32' && pid) {
          spawn('taskkill', ['/pid', pid.toString(), '/f', '/t']);
        } else {
          this.activeRunningProcess.kill('SIGKILL');
        }
      } catch {}
      this.activeRunningProcess = null;
      return true;
    }
    return false;
  }

  /**
   * Generate Assembly code (g++ -S)
   */
  public async generateAssembly(options: CompileOptions): Promise<{ success: boolean; assembly?: string; error?: string }> {
    const ext = options.language === 'c' ? '.c' : '.cpp';
    const tempSource = path.join(this.tempDir, `asm_src_${Date.now()}${ext}`);
    const tempAsm = path.join(this.tempDir, `asm_out_${Date.now()}.s`);

    const processedCode = this.preprocessLegacySource(options.sourceCode);
    await fs.promises.writeFile(tempSource, processedCode, 'utf8');
    const compilerReq = options.compilerPath || (options.language === 'c' ? 'gcc' : 'g++');
    const resolved = this.resolveCompilerExecutable(compilerReq);
    const stdFlag = options.standard ? `-std=${options.standard}` : (options.language === 'c' ? '-std=c11' : '-std=c++17');

    const args = [
      stdFlag,
      '-O2',
      `-I${this.compatDir}`,
      '-fpermissive',
      '-Wno-main',
      '-Wno-deprecated',
      '-Wno-deprecated-declarations',
      '-Wno-attributes',
      '-S',
      '-fverbose-asm',
      tempSource,
      '-o',
      tempAsm,
    ];

    const env = { ...process.env };
    if (resolved.binDir) {
      env.PATH = `${resolved.binDir}${path.delimiter}${env.PATH || ''}`;
    }

    return new Promise((resolve) => {
      let stderr = '';
      const proc = spawn(resolved.commandPath, args, { shell: true, env });

      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      proc.on('close', async (code) => {
        try {
          await fs.promises.unlink(tempSource);
        } catch {}

        if (code === 0 && fs.existsSync(tempAsm)) {
          const asm = await fs.promises.readFile(tempAsm, 'utf8');
          try {
            await fs.promises.unlink(tempAsm);
          } catch {}
          resolve({ success: true, assembly: asm });
        } else {
          resolve({ success: false, error: stderr || 'Assembly generation failed' });
        }
      });

      proc.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }
}

export const compilerManager = new CompilerManager();
