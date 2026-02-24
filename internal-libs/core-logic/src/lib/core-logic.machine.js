import { createMachine, assign } from 'xstate';
export const coreLogicMachine = createMachine({
    id: 'coreLogic',
    initial: 'ok',
    context: { percent: 100 },
    types: {},
    states: {
        ok: {
            on: {
                TELEMETRY: {
                    actions: assign({ percent: ({ event }) => event.percent }),
                    target: '.', // re-enter current state
                    reenter: true,
                },
                RESET: {
                    actions: assign({ percent: () => 100 }),
                    target: '.',
                    reenter: true,
                },
            },
            always: { guard: ({ context }) => context.percent <= 30, target: 'low' },
        },
        low: {
            on: {
                TELEMETRY: {
                    actions: assign({ percent: ({ event }) => event.percent }),
                    target: '.',
                    reenter: true,
                },
                RESET: {
                    actions: assign({ percent: () => 100 }),
                    target: 'ok', // reset תמיד חוזר ל-ok
                    reenter: true,
                },
            },
            always: { guard: ({ context }) => context.percent <= 5, target: 'empty' },
        },
        empty: {
            on: {
                TELEMETRY: {
                    actions: assign({ percent: ({ event }) => event.percent }),
                    // אם ממלאים (100) צריך לצאת מ-empty:
                    target: 'ok',
                    reenter: true,
                },
                RESET: {
                    actions: assign({ percent: () => 100 }),
                    target: 'ok',
                    reenter: true,
                },
            },
        },
    },
});
//# sourceMappingURL=core-logic.machine.js.map