type AllowedInput = 'numbers' | 'alphabets' | 'alphanumeric';

type CodeInputOptions = {
    length: number,
    allow?: AllowedInput,
    onComplete?: CallbackFunction
}

interface renderable {
    render(): void,
    isCorrect(): void,
    isNotCorrect(): void
}

type Styles = {
    [key: string]: string
}

interface CallbackFunction {
    (key?: string): void
}

class CodeInput implements renderable {
    private html: string;
    private inputContainer: HTMLElement;
    private inputBoxes: HTMLCollection;
    private value: string = '';

    element: HTMLElement;
    options: CodeInputOptions = {
        length: 4,
        allow: 'numbers',
        onComplete: null
    };

    constructor(element: HTMLElement, options: CodeInputOptions) {
        this.element = element;
        this.options = {...this.options, ...options};

        this._generateHTMLContent();
    }

    private _generateHTMLContent: () => void = () => {
        this.html = `<div class="code-input">`;

        for (var i = 0; i < this.options.length; i++) {
            let editable = '';
            if (i == 0) {
                editable = 'contenteditable="plaintext-only"';
            }

            this.html += `<div class="code-input-letter" ${editable}></div>`;
        }

        this.html += '</div>'
    }

    private _moveToBox: (fromBox: HTMLElement, toBox: HTMLElement) => void = (fromBox, toBox) => {
        if (toBox) {
            // Do we need to remove the contenteditable?
            fromBox.setAttribute('contenteditable', 'false');

            toBox.setAttribute('contenteditable', 'plaintext-only');

            toBox.focus();
        }
    }

    private _ignoreKey: (key: string) => boolean = (key) => {
        // Allow only printable characters
        // Allow only specified types
        if (key.length !== 1 || ! this._isAllowed(key)) {
            return true;
        }

        return false;
    }

    private _clearBox: (inputBox: HTMLElement) => void = (inputBox) => {
        inputBox.innerText = '';
        let inputBoxIndex = null;
        for (let index = 0; index < this.inputBoxes.length; index++) {
            if (inputBox === this.inputBoxes[index]) {
                inputBoxIndex = index;
                break;
            }
        }

        this.value = this.value.substring(0, inputBoxIndex);
        this.inputContainer.classList.remove(...['is-valid', 'is-invalid']);
    }

    private _keyDownHandler: (e: KeyboardEvent) => void = (e) => {
        let thisInputBox = e.target as HTMLElement;

        // If it is back or delete key delete the entry
        if (e.key == 'Backspace' || e.key == 'Delete') {
            let prevInputBox = thisInputBox.previousElementSibling as HTMLInputElement;

            if (prevInputBox === null) {
                return;
            }

            // Move to previous box.
            // If it is the last box, only clear the content. Do not move to previous box.
            // This means that the previous box will be focused only if it is empty.
            if (this.value.length < this.options.length) {
                this._moveToBox(thisInputBox, prevInputBox);
                thisInputBox = prevInputBox;
            }

            this._clearBox(thisInputBox);

            return;
        }

        if (this._ignoreKey(e.key)) {
            e.preventDefault();
            return;
        }

        if (thisInputBox.textContent.length) {
            // Allow only one input
            this._clearBox(thisInputBox);
            return;
        }
    }

    private _keyUpHandler: (e: KeyboardEvent) => void = (e) => {
        if (this._ignoreKey(e.key)) {
            e.preventDefault();
            return;
        }

        let thisInputBox = e.target as HTMLElement;

        if (! thisInputBox.textContent.length) {
            return;
        }

        // Move to next box
        let nextInputBox = thisInputBox.nextElementSibling as HTMLInputElement;
        this._moveToBox(thisInputBox, nextInputBox);

        this.value += e.key;

        if (this.value.length == this.options.length && this.options.onComplete !== null) {
            // validation?
            this.options.onComplete(this.value);
        }
    }

    private _attachEventListeners: () => void = () => {

        for (var i = 0; i < this.inputBoxes.length; i++) {
            this.inputBoxes[i].addEventListener('keydown', this._keyDownHandler, false);
            this.inputBoxes[i].addEventListener('keyup', this._keyUpHandler, false);
        }
    }

    private _isAllowed: (key: string) => boolean = (key) => {
        switch (this.options.allow) {
            case "numbers":
                return (/\d/).test(key);
                break;

            case "alphabets":
                return (/[a-zA-Z]/).test(key);
                break;

            case "alphanumeric":
                return (/[a-zA-Z\d]/).test(key);
                break;
        }

        return true;
    }

    render: () => void = () => {
        this.element.innerHTML = this.html;

        this.inputContainer = this.element.querySelector('div.code-input');
        this.inputBoxes = this.inputContainer.children;

        this._attachEventListeners();
    }

    isCorrect: () => void = () => {
        this.inputContainer.classList.remove('is-invalid');
        this.inputContainer.classList.add('is-valid');
    }

    isNotCorrect: () => void = () => {
        this.inputContainer.classList.remove('is-valid');
        this.inputContainer.classList.add('is-invalid');
    }

    // This method overrides the callback passed in the options
    onComplete: (callback: CallbackFunction) => void = (callback) => {
        this.options.onComplete = callback;
    }
}