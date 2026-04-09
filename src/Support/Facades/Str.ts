class Str {
    /**
     * Return the remainder of a string after the first occurrence of a given value.
     */
    static after(subject: string, search: string): string {
        const position = subject.indexOf(search);
        return search === '' ? subject : (position !== -1 ? subject.substring(position + search.length) : subject);
    }

    /**
     * Return the remainder of a string after the last occurrence of a given value.
     */
    static afterLast(subject: string, search: string): string {
        const position = subject.lastIndexOf(search);
        return search === '' ? subject : (position !== -1 ? subject.substring(position + search.length) : subject);
    }

    /**
     * Get the portion of a string before the first occurrence of a given value.
     */
    static before(subject: string, search: string): string {
        const position = subject.indexOf(search);
        return search === '' ? subject : (position !== -1 ? subject.substring(0, position) : subject);
    }

    /**
     * Get the portion of a string before the last occurrence of a given value.
     */
    static beforeLast(subject: string, search: string): string {
        const position = subject.lastIndexOf(search);
        return search === '' ? subject : (position !== -1 ? subject.substring(0, position) : subject);
    }

    /**
     * Get the portion of a string between two given values.
     */
    static between(subject: string, from: string, to: string): string {
        if (from === '' || to === '') return subject;
        const fromPos = subject.indexOf(from);
        if (fromPos === -1) return subject;
        const start = fromPos + from.length;
        const toPos = subject.indexOf(to, start);
        return toPos !== -1 ? subject.substring(start, toPos) : subject;
    }

    /**
     * Convert a value to camel case.
     */
    static camel(value: string): string {
        return value.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
    }

    /**
     * Determine if a given string contains a given substring.
     */
    static contains(haystack: string, needles: string | string[]): boolean {
        const needleArray = Array.isArray(needles) ? needles : [needles];
        return needleArray.some(needle => haystack.includes(needle));
    }

    /**
     * Determine if a given string ends with a given substring.
     */
    static endsWith(haystack: string, needles: string | string[]): boolean {
        const needleArray = Array.isArray(needles) ? needles : [needles];
        return needleArray.some(needle => haystack.endsWith(needle));
    }

    /**
     * Cap a string with a single instance of a given value.
     */
    static finish(value: string, cap: string): string {
        return value.endsWith(cap) ? value : value + cap;
    }

    /**
     * Determine if a given string matches a given pattern.
     */
    static is(pattern: string | string[], value: string): boolean {
        const patterns = Array.isArray(pattern) ? pattern : [pattern];
        for (const p of patterns) {
            const regex = new RegExp('^' + p.replace(/\*/g, '.*') + '$');
            if (regex.test(value)) return true;
        }
        return false;
    }

    /**
     * Convert a string to kebab case.
     */
    static kebab(value: string): string {
        return this.snake(value, '-');
    }

    /**
     * Return the length of the given string.
     */
    static length(value: string): number {
        return value.length;
    }

    /**
     * Limit the number of characters in a string.
     */
    static limit(value: string, limit = 100, end = '...'): string {
        if (value.length <= limit) return value;
        return value.substring(0, limit) + end;
    }

    /**
     * Convert the given string to lower-case.
     */
    static lower(value: string): string {
        return value.toLowerCase();
    }

    /**
     * Convert the given string to upper-case.
     */
    static upper(value: string): string {
        return value.toUpperCase();
    }

    /**
     * Limit the number of words in a string.
     */
    static words(value: string, words = 100, end = '...'): string {
        const wordArray = value.match(/\S+/g) || [];
        if (wordArray.length <= words) return value;
        return wordArray.slice(0, words).join(' ') + end;
    }

    /**
     * Get the plural form of an English word.
     */
    static plural(value: string, count = 2): string {
        if (count === 1) return value;
        const rules: [RegExp, string][] = [
            [/(quiz)$/i, '$1zes'],
            [/^(ox)$/i, '$1en'],
            [/([m|l])ouse$/i, '$1ice'],
            [/(matr|vert|ind)ix|ex$/i, '$1ices'],
            [/(x|ch|ss|sh)$/i, '$1es'],
            [/([^aeiouy]|qu)y$/i, '$1ies'],
            [/(hive)$/i, '$1s'],
            [/(?:([^f])fe|([lr])f)$/i, '$1$2ves'],
            [/sis$/i, 'ses'],
            [/([ti])um$/i, '$1a'],
            [/(buffal|tomat)o$/i, '$1oes'],
            [/(bu)s$/i, '$1ses'],
            [/(alias|status)$/i, '$1es'],
            [/(octop|vir)us$/i, '$1i'],
            [/(ax|test)is$/i, '$1es'],
            [/s$/i, 's'],
            [/$/, 's']
        ];
        for (const [rule, replacement] of rules) {
            if (rule.test(value)) return value.replace(rule, replacement);
        }
        return value;
    }

    /**
     * Generate a more truly "random" alpha-numeric string.
     */
    static random(length = 16): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Replace a given value in the string.
     */
    static replace(search: string | string[], replace: string | string[], subject: string): string {
        const searches = Array.isArray(search) ? search : [search];
        const replaces = Array.isArray(replace) ? replace : [replace];
        let result = subject;
        searches.forEach((s, i) => {
            result = result.split(s).join(replaces[i] || replaces[0] || '');
        });
        return result;
    }

    /**
     * Replace the first occurrence of a given value in the string.
     */
    static replaceFirst(search: string, replace: string, subject: string): string {
        const position = subject.indexOf(search);
        return position !== -1 ? subject.substring(0, position) + replace + subject.substring(position + search.length) : subject;
    }

    /**
     * Replace the last occurrence of a given value in the string.
     */
    static replaceLast(search: string, replace: string, subject: string): string {
        const position = subject.lastIndexOf(search);
        return position !== -1 ? subject.substring(0, position) + replace + subject.substring(position + search.length) : subject;
    }

    /**
     * Begin a string with a single instance of a given value.
     */
    static start(value: string, prefix: string): string {
        return value.startsWith(prefix) ? value : prefix + value;
    }

    /**
     * Determine if a given string starts with a given substring.
     */
    static startsWith(haystack: string, needles: string | string[]): boolean {
        const needleArray = Array.isArray(needles) ? needles : [needles];
        return needleArray.some(needle => haystack.startsWith(needle));
    }

    /**
     * Convert a string to snake case.
     */
    static snake(value: string, delimiter = '_'): string {
        return value
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, delimiter);
    }

    /**
     * Convert a value to studly caps case.
     */
    static studly(value: string): string {
        return value
            .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
            .replace(/^(.)/, (char) => char.toUpperCase());
    }

    /**
     * Returns the portion of string specified by the start and length parameters.
     */
    static substr(string: string, start: number, length?: number): string {
        return length === undefined ? string.substring(start) : string.substring(start, start + length);
    }

    /**
     * Make a string's first character uppercase.
     */
    static ucfirst(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Convert the given string to title case.
     */
    static title(value: string): string {
        return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }

    /**
     * Get the singular form of an English word.
     */
    static singular(value: string): string {
        const rules: [RegExp, string][] = [
            [/(quiz)zes$/i, '$1'],
            [/(matr)ices$/i, '$1ix'],
            [/(vert|ind)ices$/i, '$1ex'],
            [/^(ox)en/i, '$1'],
            [/(alias|status)es$/i, '$1'],
            [/(octop|vir)i$/i, '$1us'],
            [/(cris|ax|test)es$/i, '$1is'],
            [/(shoe)s$/i, '$1'],
            [/(o)es$/i, '$1'],
            [/(bus)es$/i, '$1'],
            [/([m|l])ice$/i, '$1ouse'],
            [/(x|ch|ss|sh)es$/i, '$1'],
            [/(m)ovies$/i, '$1ovie'],
            [/(s)eries$/i, '$1eries'],
            [/([^aeiouy]|qu)ies$/i, '$1y'],
            [/([lr])ves$/i, '$1f'],
            [/(tive)s$/i, '$1'],
            [/(hive)s$/i, '$1'],
            [/([^f])ves$/i, '$1fe'],
            [/(^analy)ses$/i, '$1sis'],
            [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, '$1$2sis'],
            [/([ti])a$/i, '$1um'],
            [/(n)ews$/i, '$1ews'],
            [/s$/i, '']
        ];
        for (const [rule, replacement] of rules) {
            if (rule.test(value)) return value.replace(rule, replacement);
        }
        return value;
    }

    /**
     * Generate a URL friendly "slug" from a given string.
     */
    static slug(title: string, separator = '-'): string {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, separator)
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Get the plural studly form of a word.
     */
    static pluralStudly(value: string, count = 2): string {
        return this.studly(this.plural(value, count));
    }

}

export default Str;