import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({ selector: '[app-copy-clipboard]' })
export class CopyClipboardDirective {
  @Input('app-copy-clipboard')
  public payload: string;

  @Output()
  public copied: EventEmitter<string> = new EventEmitter<string>();

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    event.preventDefault();

    if (!this.payload) { return; }
    this.copyClipboard(this.payload);
    this.copied.emit(this.payload);
  }

  // workaround for safari/iphone https://bugs.webkit.org/show_bug.cgi?id=156529
  private copyClipboard(text: string) {
    const textArea = document.createElement('input') as HTMLInputElement;

    textArea.value = text;
    document.body.appendChild(textArea);

    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
  } else {
      textArea.select();
  }
  document.execCommand('copy');
  document.body.removeChild(textArea);
  }
}
