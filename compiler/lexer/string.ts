// class to process string
import { ErrorHandling } from "./error";

export class ProcessStringToken extends ErrorHandling {

    processString(start: number) {

        let endSpan = start;
        // the task: return a final span value basically.
        // we have to handle escapes as well.
        enum StringState {
            Consume, Escape
        }

        let localState: StringState = StringState.Consume;

        while (true) {

            let char = this.source.charAt(endSpan);

            if (char == "") return endSpan;
            // we only care about special characters
            if (char == '\n') {
                this.logCharError(char, "String cannot contain newline characters");
                // logCharError already calls process.exit(1)
            }

            if (char == "\\") {

                if (localState == StringState.Consume) {
                    localState = StringState.Escape;
                    endSpan++;
                    continue;
                } else {
                    localState = StringState.Consume;
                    endSpan++;
                    continue;
                }

            }

            if (char == '"') {

                if (localState == StringState.Consume) {

                    return endSpan; // we are done

                } else {

                    endSpan++;
                    localState = StringState.Consume;
                    continue;

                }

            }

            if (localState == StringState.Escape) {
                localState = StringState.Consume;
            }

            endSpan++;

        }

    }
}