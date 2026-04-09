import {trait} from "@traits-ts/core";

type Macro = (...args: any[]) => any

const Macroable = trait((base) => class extends base {
    protected static macros: Record<string, Macro> = {}

    public static macro(key: string, value: Macro) {
        this.macros[key] = value
    }

    public static hasMacro(key: string) {
        return Object.prototype.hasOwnProperty.call(this.macros, key)
    }

    public static getMacro(key: string) {
        return this.macros[key]
    }

    public static flushMacros() {
        this.macros = {}
    }

    public static mixin(source: Record<string, Macro>) {
        for (const [key, value] of Object.entries(source)) {
            this.macro(key, value)
        }
    }
})

export default Macroable