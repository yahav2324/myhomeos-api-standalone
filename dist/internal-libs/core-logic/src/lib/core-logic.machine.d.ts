type Ctx = {
    percent: number;
};
type Events = {
    type: 'TELEMETRY';
    percent: number;
} | {
    type: 'RESET';
};
export declare const coreLogicMachine: import("xstate").StateMachine<Ctx, Events, Record<string, import("xstate").AnyActorRef>, import("xstate").ProvidedActor, import("xstate").ParameterizedObject, import("xstate").ParameterizedObject, string, import("xstate").StateValue, string, unknown, {}, import("xstate").EventObject, import("xstate").MetaObject, any>;
export {};
