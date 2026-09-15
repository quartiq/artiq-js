type Callback = () => void;
type Blocker = Promise<Callback | void>;
type Resolver = (value?: Callback) => void;

export type Lock = {
    locked: Blocker;
    unlock: Resolver;
}

export let lock = (): Lock => {
    let unlock: Resolver;
    return {
        locked: new Promise(r => unlock = r),
        unlock: unlock!,
    };
};