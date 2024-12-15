type AllowedInput = 'numbers' | 'alphabets' | 'alphanumeric';

type CodeInputOptions = {
    length: number,
    allow?: AllowedInput
}

interface renderable {
    render(): void,
}

type Styles = {
    [key: string]: string
}

const containerStyles: Styles = {
    display: 'flex',
    gap: '0.5rem'
};

const boxStyles: Styles = {
    'width': '50px',
    'height': '50px',
    'border': '1px solid',
    'border-radius': '0.5rem',
    'display': 'inline-flex',
    'justify-content': 'center',
    'align-items': 'center',
    'font-size': '2rem',
    'caret-color': 'transparent'
};

class CodeInput implements renderable {
    private html: string;
    private inputBoxes: HTMLCollection;

    element: HTMLElement;
    options: CodeInputOptions = {
        length: 4,
        allow: 'numbers'
    };

    constructor(element: HTMLElement, options: CodeInputOptions) {
        this.element = element;
        this.options = {...this.options, ...options};

        this._generateHTMLContent();
    }

    private _styleToString: (styles: Styles) => string = (styles) => {
        let string = '';

        Object.keys(styles).forEach(key => {
            string+= key + ':' + styles[key] + ';';
        })

        return string;
    }

    private _generateHTMLContent: () => void = () => {
        this.html = `<div class="code-input" style="${this._styleToString(containerStyles)}">`;

        for (var i = 0; i < this.options.length; i++) {
            let editable = '';
            if (i == 0) {
                editable = 'contenteditable="plaintext-only"';
            }

            this.html += `<div class="code-input-letter" style="${this._styleToString(boxStyles)}" ${editable}></div>`;
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

    private _keyDownHandler: (e: KeyboardEvent) => void = (e) => {
        let thisInputBox = e.target as HTMLElement;

        // If it is back or delete key delete the entry
        if (e.key == 'Backspace' || e.key == 'Delete') {
            thisInputBox.innerText = '';

            // Move to previous box
            let prevInputBox = thisInputBox.previousElementSibling as HTMLInputElement;
            this._moveToBox(thisInputBox, prevInputBox);

            return;
        }

        if (this._ignoreKey(e.key)) {
            e.preventDefault();
            return;
        }

        if (thisInputBox.textContent.length) {
            // Allow only one input
            thisInputBox.innerText = '';
            return;
        }
    }

    private _keyUpHandler: (e: KeyboardEvent) => void = (e) => {
        if (this._ignoreKey(e.key)) {
            e.preventDefault();
            return;
        }

        let thisInputBox = e.target as HTMLElement;

        if (thisInputBox.textContent.length) {
            // Move to next box
            let nextInputBox = thisInputBox.nextElementSibling as HTMLInputElement;
            this._moveToBox(thisInputBox, nextInputBox);
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

        this.inputBoxes = this.element.querySelector('div').children;

        this._attachEventListeners();
    }
}