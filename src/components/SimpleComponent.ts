
export class SimpleComponent {

  constructor(private tag: string, private text: string, private id?: string, private className?: string) {
    // nothing
  }

  build(): HTMLElement {
    const element = document.createElement(this.tag);

    if (this.id) {
      element.setAttribute('id', this.id);
    }

    if (this.className) {
      element.classList.add(this.className);
    }

    element.textContent = this.text;

    return element;
  }


}
