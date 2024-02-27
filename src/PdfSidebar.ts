import { ItemView } from "obsidian";
import { PdfPreviewView } from "./PdfPreviewView";

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

            if (leaf?.view instanceof PdfPreviewView)
                this.viewChanged(leaf.view);
            
            if (leaf?.view === this)
                console.log(`we're focused baby!`);
        }));
    }

    viewChanged(view: PdfPreviewView) {
        console.log('got a PdfPreviewView!');

        this.pdfView = view;
    }
}
