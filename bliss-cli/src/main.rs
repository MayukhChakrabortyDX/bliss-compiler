use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process;
use std::time::{SystemTime, UNIX_EPOCH};

// ============================================================================
// GLOBAL CONFIGURATION
// ============================================================================
struct CliConfig {
    name: &'static str,
    version: &'static str,
    tagline: &'static str,
}

const CLI_CONFIG: CliConfig = CliConfig {
    name: "bliss",
    version: "1.0.0",
    tagline: "A systems language",
};

// ============================================================================
// THEME
// ============================================================================
const RESET: &str = "\x1b[0m";
const BOLD: &str = "\x1b[1m";
const DIM: &str = "\x1b[2m";
const MUTED: &str = "\x1b[38;5;244m";
const SUCCESS: &str = "\x1b[38;5;42m";
const ACCENT: [u8; 4] = [99, 105, 141, 183];

// ============================================================================
// LOG MODULE
// ============================================================================
#[derive(Debug)]
enum Log {
    Info,
    Warning,
    Error,
}

fn current_timestamp() -> String {
    // seconds since epoch → HH:MM:SS (UTC, no chrono dependency)
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let s = secs % 60;
    let m = (secs / 60) % 60;
    let h = (secs / 3600) % 24;
    format!("{:02}:{:02}:{:02}", h, m, s)
}

fn log(level: Log, stage: &str, message: &str, description: &str) {
    // Badge styles — matches TypeScript BG_* + label strings exactly
    let (label, accent) = match level {
        Log::Error   => (format!("\x1b[41m\x1b[37m ERROR {}", RESET), "\x1b[31m"),
        Log::Warning => (format!("\x1b[43m\x1b[30m WARN  {}", RESET), "\x1b[33m"),
        Log::Info    => (format!("\x1b[44m\x1b[37m INFO  {}", RESET), "\x1b[36m"),
    };

    let ts = current_timestamp();

    // [timestamp] BADGE [STAGE] message
    println!(
        "{}[{}]{} {} {}{}{}{} {}{}{}",
        DIM, ts, RESET,
        label,
        accent, BOLD, stage.to_uppercase(), RESET,
        BOLD, message, RESET,
    );

    if !description.is_empty() {
        println!("{}  └─ {}{}\n", DIM, description, RESET);
    }
}

// ============================================================================
// ANSI / LAYOUT HELPERS
// ============================================================================
fn strip_ansi(s: &str) -> String {
    let mut result = String::new();
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\x1b' {
            if chars.peek() == Some(&'[') {
                chars.next();
                while matches!(chars.peek(), Some('0'..='9') | Some(';')) {
                    chars.next();
                }
                if chars.peek() == Some(&'m') {
                    chars.next();
                }
            }
        } else {
            result.push(c);
        }
    }
    result
}

fn visible_length(s: &str) -> usize {
    strip_ansi(s).chars().count()
}

fn pad_visible(s: &str, width: usize) -> String {
    let vlen = visible_length(s);
    let padding = width.saturating_sub(vlen);
    format!("{}{}", s, " ".repeat(padding))
}

fn gradient_text(text: &str, ramp: &[u8]) -> String {
    let chars: Vec<char> = text.chars().collect();
    let last = (chars.len() as f64 - 1.0).max(1.0);
    let colored: String = chars
        .iter()
        .enumerate()
        .map(|(i, c)| {
            let idx = ((i as f64 / last) * (ramp.len() as f64 - 1.0)) as usize;
            format!("\x1b[38;5;{}m{}", ramp[idx], c)
        })
        .collect();
    format!("{}{}", colored, RESET)
}

fn box_render(lines: &[String]) -> String {
    let inner_width = lines.iter().map(|l| visible_length(l)).max().unwrap_or(0) + 2;
    let top    = format!("╭{}╮", "─".repeat(inner_width));
    let bottom = format!("╰{}╯", "─".repeat(inner_width));
    let body: Vec<String> = lines
        .iter()
        .map(|line| format!("│ {}│", pad_visible(line, inner_width - 1)))
        .collect();
    let mut parts = vec![top];
    parts.extend(body);
    parts.push(bottom);
    parts.join("\n")
}

// ============================================================================
// SCAFFOLD TEMPLATES
// ============================================================================
const PROJECT_HELLO: &str = r#"import std.io.println;

fx main(): i32 {
    println("Hello World");
    return 0;
}"#;

const LIBRARY_HELLO: &str = r#"pub fx add(i32 a, i32 b): i32 {
    return a + b;
}"#;

fn project_toml(name: &str) -> String {
    format!(
        "[project]\nname = \"{}\"\nversion = \"1.0.0\"\n\n[packages]\nstd = \"1.0.0\"",
        name
    )
}

fn library_toml(name: &str) -> String {
    format!("[library]\nname = \"{}\"\nversion = \"1.0.0\"\n\n[packages]", name)
}

// ============================================================================
// SCAFFOLD
// ============================================================================
#[derive(Debug, Clone, Copy, PartialEq)]
enum ScaffoldType {
    Project,
    Library,
}

impl std::fmt::Display for ScaffoldType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ScaffoldType::Project => write!(f, "project"),
            ScaffoldType::Library => write!(f, "library"),
        }
    }
}

fn create(what: ScaffoldType, name: &str) {
    let folder = PathBuf::from(name);
    if folder.exists() {
        log(
            Log::Error,
            "Scaffold",
            &format!("{} '{}' already exists", what, name),
            &format!("Remove or rename '{}' and try again.", name),
        );
        process::exit(1);
    }

    fs::create_dir_all(&folder).expect("Failed to create directory");
    match what {
        ScaffoldType::Project => {
            fs::write(folder.join("main.bx"), PROJECT_HELLO).expect("Failed to write main.bx");
            fs::write(folder.join("project.toml"), project_toml(name)).expect("Failed to write project.toml");
        }
        ScaffoldType::Library => {
            fs::write(folder.join("lib.bx"), LIBRARY_HELLO).expect("Failed to write lib.bx");
            fs::write(folder.join("library.toml"), library_toml(name)).expect("Failed to write library.toml");
        }
    }

    log(
        Log::Info,
        "Scaffold",
        &format!("{} '{}' created successfully", what, name),
        &format!("cd {} to get started.", name),
    );
}

// ============================================================================
// CLI CORE
// ============================================================================
struct CommandContext {
    args: Vec<String>,
    options: HashMap<String, bool>,
}

struct CommandConfig {
    name: &'static str,
    description: &'static str,
    usage: &'static str,
    category: &'static str,
    aliases: &'static [&'static str],
    action: fn(&CommandContext),
}

// ============================================================================
// COMMAND ACTIONS
// ============================================================================
fn action_help(_ctx: &CommandContext) { display_help(); }

fn action_new(ctx: &CommandContext) {
    let name = match ctx.args.first() {
        Some(n) if !n.is_empty() => n.as_str(),
        _ => {
            log(Log::Error, "CLI", "Argument Required",
                &format!("Provide a name: '{} new my-app'", CLI_CONFIG.name));
            return;
        }
    };
    let scaffold_type = if ctx.options.contains_key("--library") {
        ScaffoldType::Library
    } else {
        ScaffoldType::Project
    };
    create(scaffold_type, name);
}

fn action_run(_ctx: &CommandContext) {
    log(Log::Info, "Runner", "Starting local instance...", "Listening on http://localhost:3000");
}

fn action_build(_ctx: &CommandContext) {
    log(Log::Info, "Compiler", "Compiling assets...",
        "Minifying logic trees down to production-ready chunks.");
}

// ============================================================================
// COMMAND REGISTRY
// ============================================================================
fn make_commands() -> Vec<CommandConfig> {
    vec![
        CommandConfig {
            name: "help",
            description: "Displays the help manual, layout mappings, and current versions",
            usage: "bliss help",
            category: "General",
            aliases: &[],
            action: action_help,
        },
        CommandConfig {
            name: "new",
            description: "Initializes a structured template workspace or micro-library",
            usage: "bliss new <name> [--project | --library]",
            category: "Scaffolding",
            aliases: &[],
            action: action_new,
        },
        CommandConfig {
            name: "run",
            description: "Spins up local development server with full code hot-reloading",
            usage: "bliss run",
            category: "Development",
            aliases: &["dev"],
            action: action_run,
        },
        CommandConfig {
            name: "build",
            description: "Bundles, tree-shakes, and optimizes assets for production distribution",
            usage: "bliss build",
            category: "Development",
            aliases: &[],
            action: action_build,
        },
    ]
}

// ============================================================================
// HELP DISPLAY
// ============================================================================
fn format_command_usage(cmd: &CommandConfig) -> String {
    let parts: Vec<&str> = cmd.usage.split_whitespace().collect();
    let call = match parts.as_slice() {
        [a, b, ..] => format!("{} {}", a, b),
        [a] => a.to_string(),
        [] => String::new(),
    };
    let params = if parts.len() > 2 { parts[2..].join(" ") } else { String::new() };
    let alias_note = if cmd.aliases.is_empty() {
        String::new()
    } else {
        format!(" {}(alias: {}){}", DIM, cmd.aliases.join(", "), RESET)
    };
    format!("{}{}{} {}{}{}{}", SUCCESS, call, RESET, DIM, params, RESET, alias_note)
}

fn display_help() {
    let commands = make_commands();

    let title_line = format!(
        "{}{} {}{}  {}v{}{}",
        BOLD, "●", gradient_text(&CLI_CONFIG.name.to_uppercase(), &ACCENT),
        RESET, DIM, CLI_CONFIG.version, RESET
    );
    let tagline_line = format!("{}{}{}", MUTED, CLI_CONFIG.tagline, RESET);

    println!("\n{}\n", box_render(&[title_line, tagline_line]));
    println!("{}Usage{}", BOLD, RESET);
    println!("  {}${} {} <command> [arguments] [options]\n", DIM, RESET, CLI_CONFIG.name);

    let column_width = commands
        .iter()
        .map(|cmd| visible_length(&format_command_usage(cmd)))
        .max()
        .unwrap_or(0) + 3;

    // Group and print in fixed order
    let category_order = ["General", "Scaffolding", "Development"];
    for category in &category_order {
        let cmds: Vec<&CommandConfig> = commands.iter().filter(|c| c.category == *category).collect();
        if cmds.is_empty() { continue; }
        println!("{}{}{}{}", BOLD, MUTED, category, RESET);
        for cmd in cmds {
            let usage = pad_visible(&format_command_usage(cmd), column_width);
            println!("  {}{}", usage, cmd.description);
        }
        println!();
    }

    println!("{}Run any command to start. Use flags like --library to shift outputs.{}\n", DIM, RESET);
}

// ============================================================================
// SUGGESTION ENGINE (Levenshtein)
// ============================================================================
fn levenshtein(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let (la, lb) = (a.len(), b.len());
    let mut dp = vec![vec![0usize; lb + 1]; la + 1];
    for i in 0..=la { dp[i][0] = i; }
    for j in 0..=lb { dp[0][j] = j; }
    for i in 1..=la {
        for j in 1..=lb {
            dp[i][j] = if a[i-1] == b[j-1] {
                dp[i-1][j-1]
            } else {
                1 + dp[i-1][j].min(dp[i][j-1]).min(dp[i-1][j-1])
            };
        }
    }
    dp[la][lb]
}

fn closest_command<'a>(input: &str, commands: &'a [CommandConfig]) -> Option<&'a str> {
    commands
        .iter()
        .map(|cmd| (cmd.name, levenshtein(input, cmd.name)))
        .filter(|&(_, d)| d <= 2)
        .min_by_key(|&(_, d)| d)
        .map(|(name, _)| name)
}

// ============================================================================
// COMMAND RESOLUTION
// ============================================================================
fn resolve_command<'a>(name: &str, commands: &'a [CommandConfig]) -> Option<&'a CommandConfig> {
    commands.iter().find(|c| c.name == name || c.aliases.contains(&name))
}

// ============================================================================
// CLI PARSER
// ============================================================================
fn run_cli(raw_args: Vec<String>) {
    let commands = make_commands();
    let mut iter = raw_args.into_iter().skip(1);
    let command_name = iter.next().unwrap_or_else(|| "help".into());

    if command_name == "--version" || command_name == "-v" {
        println!("{} v{}", CLI_CONFIG.name, CLI_CONFIG.version);
        return;
    }

    match resolve_command(&command_name, &commands) {
        None => {
            let hint = match closest_command(&command_name, &commands) {
                Some(s) => format!("Did you mean '{}{}{}'? Or run '{} help'.", SUCCESS, s, RESET, CLI_CONFIG.name),
                None    => format!("Type '{} help' for routing details.", CLI_CONFIG.name),
            };
            log(Log::Error, "CLI", &format!("Command not found: '{}'", command_name), &hint);
        }
        Some(command) => {
            let (args, options): (Vec<String>, Vec<String>) =
                iter.partition(|t| !t.starts_with('-'));
            let ctx = CommandContext {
                args,
                options: options.into_iter().map(|o| (o, true)).collect(),
            };
            (command.action)(&ctx);
        }
    }
}

// ============================================================================
// ENTRY POINT
// ============================================================================
fn main() {
    let mut argv = vec![String::from("bliss")];
    argv.extend(std::env::args().skip(1));
    run_cli(argv);
}