import { accountHandlers } from "./account";
import { checkoutHandlers } from "./checkout";

export const handlers = [...accountHandlers, ...checkoutHandlers];
