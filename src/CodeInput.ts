type CodeInputOptions = {
    length: number
}

interface renderable {
    html: string,
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
    'font-size': '2rem'
};

class CodeInput implements renderable {
    html: string;

    element: HTMLElement;
    options: CodeInputOptions = {
        length: 4
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

    render: () => void = () => {
        this.element.innerHTML = this.html;
    }
}