import { ItemView } from "obsidian";
import { PdfPreviewView } from "./PdfPreviewView";
import { El } from "./util";

import "./PdfSidebar.css";

export default class PdfSidebar extends ItemView {
    static VIEW_TYPE = "pdf-preview-sidebar";

    pdfView?: PdfPreviewView | null = null;

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
        this.registerEvent(this.app.workspace.on('active-leaf-change', leaf => {
            console.log('active-leaf-change', leaf);

            if (leaf?.view instanceof PdfPreviewView) {
                this.viewChanged(leaf.view);
                this.show();
            } else if (leaf?.view !== this) this.hide();
        }));

        this.contentEl.addClass('pp-sidebar');

        El(this.containerEl, `div.if-invalid-view`, el => {
            El(el, `div.pane-empty`, { text: 'No PDF Preview focused' });
        });
    }

    viewChanged(view: PdfPreviewView) {
        this.pdfView = view;
    }

    show() {
        this.contentEl.removeClass('invalid-view');
    }

    hide() {
        this.contentEl.addClass('invalid-view');
    }
}
