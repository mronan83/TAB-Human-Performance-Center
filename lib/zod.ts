import { z } from "zod";

/**
 * zod, set up for this site. Every file imports zod from here, never from "zod" directly (e2e/security.spec.ts checks).
 *
 * zod 4 compiles a faster parser for each object schema with `new Function`. The Content-Security-Policy (lib/csp.ts)
 * forbids that in the browser, where the Start and contact forms and the program editor validate, and even zod's
 * probe for it is reported as a violation. `jitless` turns both off, so no code is generated at run time anywhere.
 * zod reads the setting when a schema is built, not when it parses, so it has to run before any schema exists:
 * importing zod from this module guarantees that.
 */
z.config({ jitless: true });

export { z };
