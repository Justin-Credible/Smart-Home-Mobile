module JustinCredible.SmartHomeMobile.Models {

    /**
     * A simple class that can be used to define a key/value pair of objects.
     */
    export class KeyValuePair<T, U> {
        public key: T;
        public value: U;

        constructor(key?: T, value?: U) {
            this.key = key;
            this.value = value;
        }
    }

    /**
     * A more descriptive shorthand for a "dictionary" which is simply an object with
     * string keys mapping to the given object type.
     */
    export interface Dictionary<V> {
        [id: string]: V;
    }

    /**
     * Describes an object that can be disposed of, having any resources it was using
     * be released and/or cleaned up.
     */
    export interface IDisposable {
        dispose(): void;
    }
}
