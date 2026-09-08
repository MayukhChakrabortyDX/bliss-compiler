import { Tokenizer } from "../lexer/tokenizer";
import { tokenLogFilter } from "./filters/tokenLog.filter";
import { Log, LogType } from "./logger";


const program = `hello world`;
const tokenizer = new Tokenizer(program);
tokenizer.tokenize();

const tokens = tokenizer.tokens;

// Build once per source file — closes over the StringContainer.
const forSource = tokenLogFilter(tokenizer.sourceContainer);

// Human-readable mode
Log({
    type: LogType.Error,
    stage: "lexer",
    message: "Sample tokenization error message",
    description: "A strong description on what happened",
    //@ts-ignore
    filter: forSource(tokens[0]),
});

// LLM mode — same token filter, just flip useLLM
Log({
    type: LogType.Error,
    stage: "lexer",
    message: "Sample tokenization error message",
    description: "A strong description on what happened",
    useLLM: true,
    //@ts-ignore
    filter: forSource(tokens[0]),
});