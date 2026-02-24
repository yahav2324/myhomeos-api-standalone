"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreLogicMachine = void 0;
const xstate_1 = require("xstate");
exports.coreLogicMachine = (0, xstate_1.createMachine)({
    id: 'coreLogic',
    initial: 'ok',
    context: { percent: 100 },
    types: {},
    states: {
        ok: {
            on: {
                TELEMETRY: {
                    actions: (0, xstate_1.assign)({ percent: ({ event }) => event.percent }),
                    target: '.',
                    reenter: true,
                },
                RESET: {
                    actions: (0, xstate_1.assign)({ percent: () => 100 }),
                    target: '.',
                    reenter: true,
                },
            },
            always: { guard: ({ context }) => context.percent <= 30, target: 'low' },
        },
        low: {
            on: {
                TELEMETRY: {
                    actions: (0, xstate_1.assign)({ percent: ({ event }) => event.percent }),
                    target: '.',
                    reenter: true,
                },
                RESET: {
                    actions: (0, xstate_1.assign)({ percent: () => 100 }),
                    target: 'ok',
                    reenter: true,
                },
            },
            always: { guard: ({ context }) => context.percent <= 5, target: 'empty' },
        },
        empty: {
            on: {
                TELEMETRY: {
                    actions: (0, xstate_1.assign)({ percent: ({ event }) => event.percent }),
                    target: 'ok',
                    reenter: true,
                },
                RESET: {
                    actions: (0, xstate_1.assign)({ percent: () => 100 }),
                    target: 'ok',
                    reenter: true,
                },
            },
        },
    },
});
//# sourceMappingURL=core-logic.machine.js.map