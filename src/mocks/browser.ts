import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";
import { exposeMockControls } from "./test-controls";

export const worker = setupWorker(...handlers);

exposeMockControls();
