import { ItemView, WorkspaceLeaf, EventRef } from "obsidian";
import { PdfPreviewView } from "./PdfPreviewView";
import { El, Icon } from "./util";

import "./PdfSidebar.css";

export default class PdfSidebar extends ItemView {
    static VIEW_TYPE = "pdf-preview-sidebar";

    pdfView?: PdfPreviewView | null = null;

    pageNumberEl: HTMLInputElement;
    maxPagesEl: HTMLElement;

    leafChangeRef: EventRef;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);

        this.registerEvent(this.leafChangeRef = this.app.workspace.on('active-leaf-change', leaf => {
            console.log('active-leaf-change', leaf);

            if (leaf?.view instanceof PdfPreviewView) {
                this.viewChanged(leaf.view);
                this.show();
            } else if (leaf?.view !== this) this.hide();
            else {
                this.pdfView?.containerEl.addClass("has-sidebar");
            }
        }));
    }

    getViewType(): string {
        return PdfSidebar.VIEW_TYPE;
    }

    getDisplayText(): string {
        return "PDF Preview Sidebar";
    }

    getIcon(): string {
        return "book-text";
    }

    async onOpen() {
        this.contentEl.addClass('pp-sidebar');

        El(this.containerEl, `div.if-invalid-view`, el => {
            El(el, `div.pane-empty`, { text: 'No PDF Preview focused' });
        });

        this.containerEl.insertBefore(El(null, `div.pp-sidebar.icons-container`, el => {
            Icon(el, 'refresh-cw', this.refreshPreview.bind(this));
            Icon(el, 'save', this.savePdf.bind(this));
        }), this.contentEl);

        this.containerEl.insertBefore(El(null, `div.pp-sidebar.icons-container`, el => {
            Icon(el, 'arrow-left', this.prevPage.bind(this));

            // todo: somehow don't copy this code from PdfPreviewView
            El(el, 'input.pdf-page-input', { attr: {
               type: "number" 
            }, cb: input => {
                this.pageNumberEl = input;
                input.addEventListener("change", ev => {
                    if (!this.pdfView) return;
                    if (!this.pdfView.setPageNumber(input.valueAsNumber)) {
                        ev.preventDefault();
                        input.value = this.pdfView.pageNumber.toString();
                    }
                })
            } });

            El(el, `span.pdf-page-numbers`, span => this.maxPagesEl = span);

            Icon(el, 'arrow-right', this.nextPage.bind(this));
        }), this.contentEl);
    }

    async onClose() {
        this.pdfView?.containerEl.removeClass("has-sidebar");
        this.pdfView = null;

        this.app.workspace.offref(this.leafChangeRef);
    }

    viewChanged(view: PdfPreviewView) {
        this.pdfView = view;
        // view.containerEl.addClass("has-sidebar");
    }

    show() {
        this.containerEl.removeClass('invalid-view');
    }

    hide() {
        this.containerEl.addClass('invalid-view');
        this.pdfView?.containerEl.removeClass("has-sidebar");
    }

    refreshPreview() {
        this.pdfView?.refresh();
        this.pdfView?.rerenderPage();
    }

    savePdf() {
        this.pdfView?.save();
    }

    // todo: somehow reduce the copying of code here too
    prevPage() {
        if (this.pdfView?.setPageNumber(this.pdfView.pageNumber - 1))
            this.pageNumberEl.value = this.pdfView.pageNumber.toString();
    }

    nextPage() {
        if (this.pdfView?.setPageNumber(this.pdfView.pageNumber + 1))
            this.pageNumberEl.value = this.pdfView.pageNumber.toString();
    }
}
