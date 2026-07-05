import { ProcessStringToken } from "./string";

export class TokenizeComments extends ProcessStringToken {

    processInlineComment() {

        this.advance()
        this.advance()

        while (this.source.charAt( this.span_end ) != '\n') {
            this.advance()
        }
    }

    processInplaceComment() {

        this.advance(); this.advance()

        while ( true ) {

            if ( this.span_end == this.source.length ) {
                return
            }

            if ( this.source.charAt(this.span_end) == '*' ) {
                if (this.peek() == '/') {

                    this.advance()
                    this.advance()
                    return

                }
            }

            this.advance()

        }

    }

}